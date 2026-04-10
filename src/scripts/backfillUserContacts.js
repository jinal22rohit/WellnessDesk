require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/usermodel");
const Employee = require("../models/employee_model");

function normEmail(v) {
  return String(v || "").toLowerCase().trim();
}

function normPhone(v) {
  return String(v || "").trim();
}

async function run() {
  const shouldApply = process.argv.includes("--apply");
  const uri = process.env.CONNECTION_STRING;
  if (!uri) {
    throw new Error("CONNECTION_STRING is missing in environment.");
  }

  await mongoose.connect(uri);
  console.log(`[migration] connected. mode=${shouldApply ? "APPLY" : "DRY_RUN"}`);

  const [users, employees] = await Promise.all([
    User.find({}).select("_id username role employeeId email phoneNumber").lean(),
    Employee.find({}).select("_id email phno").lean(),
  ]);

  const employeeById = new Map();
  for (const e of employees) {
    employeeById.set(String(e._id), {
      email: normEmail(e.email),
      phoneNumber: normPhone(e.phno),
    });
  }

  const emailOwner = new Map();
  const phoneOwner = new Map();

  for (const u of users) {
    const userId = String(u._id);
    const email = normEmail(u.email);
    const phone = normPhone(u.phoneNumber);

    if (email) emailOwner.set(email, userId);
    if (phone) phoneOwner.set(phone, userId);
  }

  const updates = [];
  const skipped = [];
  const conflicts = [];

  for (const u of users) {
    const userId = String(u._id);
    const currentEmail = normEmail(u.email);
    const currentPhone = normPhone(u.phoneNumber);
    const missingEmail = !currentEmail;
    const missingPhone = !currentPhone;

    if (!missingEmail && !missingPhone) continue;

    const empId = u.employeeId ? String(u.employeeId) : "";
    const emp = employeeById.get(empId);
    if (!emp) {
      skipped.push({
        userId,
        username: u.username,
        reason: "no linked employee to backfill from",
      });
      continue;
    }

    const nextEmail = missingEmail ? normEmail(emp.email) : currentEmail;
    const nextPhone = missingPhone ? normPhone(emp.phoneNumber) : currentPhone;

    if (!nextEmail || !nextPhone) {
      skipped.push({
        userId,
        username: u.username,
        reason: "linked employee missing email/phno",
      });
      continue;
    }

    const emailTakenBy = emailOwner.get(nextEmail);
    if (emailTakenBy && emailTakenBy !== userId) {
      conflicts.push({
        userId,
        username: u.username,
        conflict: "email",
        value: nextEmail,
        takenBy: emailTakenBy,
      });
      continue;
    }

    const phoneTakenBy = phoneOwner.get(nextPhone);
    if (phoneTakenBy && phoneTakenBy !== userId) {
      conflicts.push({
        userId,
        username: u.username,
        conflict: "phoneNumber",
        value: nextPhone,
        takenBy: phoneTakenBy,
      });
      continue;
    }

    updates.push({
      userId,
      username: u.username,
      set: {
        ...(missingEmail ? { email: nextEmail } : {}),
        ...(missingPhone ? { phoneNumber: nextPhone } : {}),
      },
    });

    // Reserve values for later rows in same run.
    emailOwner.set(nextEmail, userId);
    phoneOwner.set(nextPhone, userId);
  }

  console.log(`[migration] users total: ${users.length}`);
  console.log(`[migration] candidate updates: ${updates.length}`);
  console.log(`[migration] skipped: ${skipped.length}`);
  console.log(`[migration] conflicts: ${conflicts.length}`);

  if (skipped.length) {
    console.log("[migration] skipped details:");
    for (const s of skipped) {
      console.log(`  - ${s.userId} (${s.username || "no-username"}): ${s.reason}`);
    }
  }

  if (conflicts.length) {
    console.log("[migration] conflict details:");
    for (const c of conflicts) {
      console.log(
        `  - ${c.userId} (${c.username || "no-username"}): ${c.conflict} "${c.value}" already used by ${c.takenBy}`
      );
    }
  }

  if (!shouldApply) {
    console.log("[migration] dry run complete. Re-run with --apply to write changes.");
    await mongoose.disconnect();
    return;
  }

  for (const u of updates) {
    await User.updateOne({ _id: u.userId }, { $set: u.set }, { runValidators: true });
  }

  console.log(`[migration] applied updates: ${updates.length}`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("[migration] failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

