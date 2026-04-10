import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "../shared/Container";
import { getAllBookings } from "../services/booking";
import { createTherapy, deleteTherapy, fetchTherapies, updateTherapy } from "../services/therapy";
import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  updateEmployee
} from "../services/employee";

import { fetchContactMessages } from "../services/contact";
import { BookingCard } from "../components/BookingCard";
import { Modal } from "../components/Modal";

import { EmployeeEditForm } from "../components/EmployeeEditForm";

export function AdminDashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsHasMore, setBookingsHasMore] = useState(false);
  const [bookingsSkip, setBookingsSkip] = useState(0);
  const [bookingFilter, setBookingFilter] = useState("all"); // ✅ NEW
  const [therapies, setTherapies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [toast, setToast] = useState({ type: "", text: "" });
  const toastTimerRef = useRef(0);

  const [therapyModal, setTherapyModal] = useState({ open: false, mode: "create", id: "" });
  const [therapyForm, setTherapyForm] = useState({
    therapyName: "",
    therapyprice: "",
    duration: "",
    category: "",
    therapyImageFile: null,
  });

  const [employeeModal, setEmployeeModal] = useState({ open: false, mode: "create", id: "" });
  const [employeeForm, setEmployeeForm] = useState({
    therapyId: "",
    empName: "",
    username: "",
    password: "",
    dob: "",
    email: "",
    phno: "",
    empImgFile: null,
  });

  useEffect(() => {
    loadBookings(true).catch(() => {});
    fetchTherapies().then(setTherapies).catch(() => {});
    fetchEmployees().then((res) => {
      if (res?.success === 1) {
        setEmployees(res.data || []);
      } else {
        setEmployees([]);
      }
    });
    fetchContactMessages().then((res) => setContacts(res?.data || [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBookings(reset = false) {
    const limit = 30;
    const nextSkip = reset ? 0 : bookingsSkip;
    setBookingsLoading(true);
    try {
      const res = await getAllBookings({ skip: nextSkip, limit });
      const page = res?.data || [];
      const meta = res?.meta || {};
      setBookingsHasMore(Boolean(meta.hasMore));
      setBookingsSkip(nextSkip + page.length);
      setBookings((prev) => (reset ? page : [...prev, ...page]));
    } catch (e) {
      showToast("err", e?.response?.data?.message || e?.message || "Failed to load bookings.");
    } finally {
      setBookingsLoading(false);
    }
  }

  function showToast(type, text) {
    setToast({ type, text });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast({ type: "", text: "" }), 3500);
  }

  function openCreateTherapy() {
    setTherapyForm({ therapyName: "", therapyprice: "", duration: "", category: "", therapyImageFile: null });
    setTherapyModal({ open: true, mode: "create", id: "" });
  }

  function openEditTherapy(t) {
    setTherapyForm({
      therapyName: t?.therapyName || "",
      therapyprice: t?.therapyprice ?? "",
      duration: t?.duration ?? "",
      category: t?.category || "",
      therapyImageFile: null,
    });
    setTherapyModal({ open: true, mode: "edit", id: t?._id });
  }

  async function submitTherapy(e) {
    e.preventDefault();
    try {
      if (therapyModal.mode === "create") {
        const created = await createTherapy({
          therapyName: therapyForm.therapyName,
          therapyprice: therapyForm.therapyprice,
          duration: therapyForm.duration,
          category: therapyForm.category,
          therapyImageFile: therapyForm.therapyImageFile,
        });
        setTherapies((prev) => [created, ...prev]);
        showToast("ok", "Therapy created.");
      } else {
        const updated = await updateTherapy(therapyModal.id, {
          therapyName: therapyForm.therapyName,
          therapyprice: Number(therapyForm.therapyprice),
          duration: Number(therapyForm.duration),
          category: therapyForm.category,
          therapyImageFile: therapyForm.therapyImageFile,
        });
        setTherapies((prev) => prev.map((t) => (t._id === therapyModal.id ? updated : t)));
        showToast("ok", "Therapy updated.");
      }
      setTherapyModal({ open: false, mode: "create", id: "" });
    } catch (err) {
      showToast("err", err?.response?.data?.message || err?.message || "Therapy action failed.");
    }
  }

  async function onDeleteTherapy(t) {
    if (!window.confirm(`Delete therapy "${t?.therapyName || ""}"?`)) return;
    try {
      await deleteTherapy(t._id);
      setTherapies((prev) => prev.filter((x) => x._id !== t._id));
      showToast("ok", "Therapy deleted.");
    } catch (err) {
      showToast("err", err?.response?.data?.message || err?.message || "Delete failed.");
    }
  }

  function openCreateEmployee() {
    setEmployeeForm({
      therapyId: "",
      empName: "",
      username: "",
      password: "",
      dob: "",
      email: "",
      phno: "",
      empImgFile: null,
    });
    setEmployeeModal({ open: true, mode: "create", id: "" });
  }

  function openEditEmployee(emp) {
    setEmployeeForm({
      therapyId: emp?.therapyId?._id || emp?.therapyId || "",
      empName: emp?.empName || "",
      username: "",
      password: "",
      dob: emp?.dob || "",
      phno: emp?.phno || "",
      empImgFile: null,
    });
    setEmployeeModal({ open: true, mode: "edit", id: emp?._id });
  }

  async function submitEmployee(e) {
    e.preventDefault();
    try {
      if (employeeModal.mode === "create") {
        const res = await createEmployee(employeeForm);
        if (res?.success !== 1) throw new Error(res?.message);
        const refreshed = await fetchEmployees();
        if (refreshed?.success === 1) setEmployees(refreshed.data || []);
        showToast("ok", "Employee created successfully");
      } else {
        const res = await updateEmployee(employeeModal.id, {
          therapyId: employeeForm.therapyId,
          empName: employeeForm.empName,
          dob: employeeForm.dob,
          phno: employeeForm.phno,
        });
        if (res?.success !== 1) throw new Error(res?.message);
        const refreshed = await fetchEmployees();
        setEmployees(refreshed?.data || []);
        showToast("ok", "Employee updated successfully");
      }
      setEmployeeModal({ open: false, mode: "create", id: "" });
    } catch (err) {
      showToast("err", err?.response?.data?.message || err?.message);
    }
  }

  async function onDeleteEmployee(emp) {
    if (!window.confirm(`Delete employee "${emp?.empName || ""}"?`)) return;
    try {
      const res = await deleteEmployee(emp._id);
      if (res?.success !== 1) throw new Error(res?.message || "Delete failed.");
      setEmployees((prev) => prev.filter((x) => x._id !== emp._id));
      showToast("ok", "Employee deleted.");
    } catch (err) {
      showToast("err", err?.response?.data?.message || err?.message || "Delete failed.");
    }
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">Monitor bookings and manage therapies/employees.</p>

      {toast.text ? (
        <div
          className={
            "mt-4 text-sm rounded-lg px-3 py-2 border " +
            (toast.type === "ok"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200")
          }
        >
          {toast.text}
        </div>
      ) : null}

      {/* // ✅ CORRECT — add nav and analytics button
const nav = useNavigate(); // ← add this line at top of component near other hooks */}

<div className="mt-6 flex flex-wrap gap-2">
  {[
    ["bookings", "Bookings"],
    ["therapies", "Therapies (manage)"],
    ["employees", "Employees (manage)"],
    ["contacts", "Contact messages"],
  ].map(([k, label]) => (
    <button
      key={k}
      onClick={() => setTab(k)}
      className={
        "px-3 py-2 rounded-md text-sm font-medium border " +
        (tab === k ? "bg-slate-900 text-white border-slate-900" : "bg-white")
      }
    >
      {label}
    </button>
  ))}

  {/* ✅ Revenue analytics button */}
  <button
    onClick={() => nav("/dashboard/admin/revenue")}
    className="px-3 py-2 rounded-md text-sm font-medium border bg-emerald-600 text-white hover:bg-emerald-700"
  >
    Revenue analytics
  </button>
</div>

      {tab === "bookings" ? (
        <section className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">All bookings</h2>
              <div className="text-sm text-slate-600">Loads fast with pagination.</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => loadBookings(true)}
                disabled={bookingsLoading}
                className="px-3 py-2 rounded-md border bg-white text-sm font-medium disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                onClick={() => loadBookings(false)}
                disabled={bookingsLoading || !bookingsHasMore}
                className="px-3 py-2 rounded-md bg-slate-900 text-white text-sm font-medium disabled:opacity-50"
              >
                {bookingsLoading ? "Loading..." : bookingsHasMore ? "Load more" : "No more"}
              </button>
            </div>
          </div>

          {/* ✅ Status filter pills */}
          <div className="flex gap-2 mt-4 mb-2 flex-wrap">
            {["all", "booked", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setBookingFilter(s)}
                className={
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " +
                  (bookingFilter === s
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 hover:bg-slate-50")
                }
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="ml-1 opacity-70">
                  ({s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length})
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 grid md:grid-cols-2 gap-4">
            {bookings
              .filter((b) => bookingFilter === "all" || b.status === bookingFilter)
              .map((b) => (
                <BookingCard key={b._id} booking={b} />
              ))}
            {!bookings.length && !bookingsLoading ? (
              <div className="text-sm text-slate-600">No bookings found.</div>
            ) : null}
          </div>

          {bookingsLoading && !bookings.length ? (
            <div className="mt-3 rounded-xl border bg-white p-6 text-sm text-slate-600">Loading bookings...</div>
          ) : null}
        </section>
      ) : null}

      {tab === "therapies" ? (
        <section className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Therapies</h2>
              <div className="text-sm text-slate-600">Create, edit, or delete therapies.</div>
            </div>
            <button
              onClick={openCreateTherapy}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              Add therapy
            </button>
          </div>
          <div className="mt-3 rounded-2xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Duration</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {therapies.map((t) => (
                  <tr key={t._id} className="border-t">
                    <td className="p-3 font-medium text-slate-900">{t.therapyName}</td>
                    <td className="p-3">{t.duration} min</td>
                    <td className="p-3">₹{t.therapyprice}</td>
                    <td className="p-3">{t.category || "-"}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditTherapy(t)}
                          className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteTherapy(t)}
                          className="px-3 py-1.5 rounded-md border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!therapies.length ? (
                  <tr className="border-t">
                    <td className="p-3 text-slate-600" colSpan={5}>
                      No therapies found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "employees" ? (
        <section className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Employees</h2>
              <div className="text-sm text-slate-600">Create, edit, or delete employees.</div>
            </div>
            <button
              onClick={openCreateEmployee}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              Add employee
            </button>
          </div>
          <div className="mt-3 rounded-2xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Therapy</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e._id} className="border-t">
                    <td className="p-3 font-medium text-slate-900">{e.empName}</td>
                    <td className="p-3">{e?.phno || e?.userId?.phno || e?.userId?.phoneNumber || "-"}</td>
                    <td className="p-3">{e.therapyId?.therapyName || "-"}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openEditEmployee(e)}
                          className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteEmployee(e)}
                          className="px-3 py-1.5 rounded-md border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!employees.length ? (
                  <tr className="border-t">
                    <td className="p-3 text-slate-600" colSpan={5}>
                      No employees found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "contacts" ? (
        <section className="mt-6">
          <h2 className="text-xl font-semibold text-slate-900">Contact messages</h2>
          <div className="mt-3 grid gap-3">
            {contacts.map((c) => (
              <div key={c._id} className="rounded-2xl border bg-white p-4">
                <div className="font-semibold text-slate-900">{c.subject}</div>
                <div className="text-sm text-slate-600">
                  {c.name} • {c.email}
                </div>
                <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{c.message}</div>
              </div>
            ))}
            {!contacts.length ? <div className="text-sm text-slate-600">No messages.</div> : null}
          </div>
        </section>
      ) : null}

      <Modal
        open={therapyModal.open}
        title={therapyModal.mode === "create" ? "Add therapy" : "Edit therapy"}
        onClose={() => setTherapyModal({ open: false, mode: "create", id: "" })}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setTherapyModal({ open: false, mode: "create", id: "" })}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              form="therapy-form"
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm font-medium"
            >
              Save
            </button>
          </div>
        }
      >
        <form id="therapy-form" onSubmit={submitTherapy} className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Therapy name</label>
              <input
                value={therapyForm.therapyName}
                onChange={(e) => setTherapyForm((p) => ({ ...p, therapyName: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Category</label>
              <input
                value={therapyForm.category}
                onChange={(e) => setTherapyForm((p) => ({ ...p, category: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                placeholder="e.g. Massage"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={therapyForm.duration}
                onChange={(e) => setTherapyForm((p) => ({ ...p, duration: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Price (₹)</label>
              <input
                type="number"
                min="0"
                value={therapyForm.therapyprice}
                onChange={(e) => setTherapyForm((p) => ({ ...p, therapyprice: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Therapy image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setTherapyForm((p) => ({ ...p, therapyImageFile: e.target.files?.[0] || null }))}
              className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
              required={therapyModal.mode === "create"}
            />
            <div className="mt-1 text-xs text-slate-500">
              {therapyModal.mode === "create"
                ? "Required for create therapy."
                : "Optional: Upload new image to replace current one."}
            </div>
          </div>
        </form>
      </Modal>

      {/* Create Employee Modal */}
      {employeeModal.mode === "create" && (
        <Modal
          open={employeeModal.open}
          title="Add employee"
          onClose={() => setEmployeeModal({ open: false, mode: "create", id: "" })}
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEmployeeModal({ open: false, mode: "create", id: "" })}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                form="employee-form"
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm font-medium"
              >
                Save
              </button>
            </div>
          }
        >
          <form id="employee-form" onSubmit={submitEmployee} className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Employee name</label>
                <input
                  value={employeeForm.empName}
                  onChange={(e) => setEmployeeForm((p) => ({ ...p, empName: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Login username</label>
                <input
                  value={employeeForm.username}
                  onChange={(e) => setEmployeeForm((p) => ({ ...p, username: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                  required
                  placeholder="e.g. riya_employee"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Login password</label>
                <input
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm((p) => ({ ...p, password: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                  required
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <input
                  value={employeeForm.phno}
                  onChange={(e) => setEmployeeForm((p) => ({ ...p, phno: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Date of birth</label>
                <input
                  type="date"
                  value={employeeForm.dob}
                  onChange={(e) => setEmployeeForm((p) => ({ ...p, dob: e.target.value }))}
                  className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Therapy</label>
              <select
                value={employeeForm.therapyId}
                onChange={(e) => setEmployeeForm((p) => ({ ...p, therapyId: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
                required
              >
                <option value="">Select therapy</option>
                {therapies.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.therapyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Employee photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEmployeeForm((p) => ({ ...p, empImgFile: e.target.files?.[0] || null }))}
                className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Employee Modal */}
      {employeeModal.mode === "edit" && (
        <Modal
          open={employeeModal.open}
          title="Edit employee"
          onClose={() => setEmployeeModal({ open: false, mode: "create", id: "" })}
          size="large"
        >
          <EmployeeEditForm
            employeeId={employeeModal.id}
            onSave={async () => {
              const res = await fetchEmployees();
              if (res?.success === 1) setEmployees(res.data || []);
            }}
            onCancel={() => setEmployeeModal({ open: false, mode: "create", id: "" })}
          />
        </Modal>
      )}
    </Container>
  );
}