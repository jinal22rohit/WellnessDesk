import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "../shared/Container";
import { resetPassword, sendOtp, verifyOtp } from "../services/auth";

export function ForgotPasswordPage() {
  // Step 1: Send OTP
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  // Step 2: Verify OTP
  const [otp, setOtp] = useState("");
  // Step 3: Reset Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [identifier, setIdentifier] = useState({ email: "", phoneNumber: "" });

  const nav = useNavigate();

  const canSubmitIdentifier = Boolean((email || "").trim() || (phoneNumber || "").trim());

  async function onSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErrMsg("");
    try {
      const usedEmail = (email || "").trim() || null;
      const usedPhone = (phoneNumber || "").trim() || null;
      const res = await sendOtp({ email: usedEmail, phoneNumber: usedPhone });
      setMsg(res?.message || "OTP sent.");
      setIdentifier({ email: usedEmail || "", phoneNumber: usedPhone || "" });
      setOtp("");
      setStep(2);
    } catch (err) {
      setErrMsg(err?.response?.data?.message || err?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErrMsg("");
    try {
      const usedIdentifier = {
        email: identifier.email || null,
        phoneNumber: identifier.phoneNumber || null,
        otp: otp.trim(),
      };
      const res = await verifyOtp(usedIdentifier);
      setMsg(res?.message || "OTP verified.");
      setStep(3);
    } catch (err) {
      setErrMsg(err?.response?.data?.message || err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErrMsg("");
    try {
      if (!otp || otp.trim().length === 0) {
        return setErrMsg("OTP is required.");
      }
      if (newPassword.length < 8) {
        return setErrMsg("Password must be at least 8 characters.");
      }
      if (newPassword !== confirmPassword) {
        return setErrMsg("Passwords do not match.");
      }

      const res = await resetPassword({
        email: identifier.email || null,
        phoneNumber: identifier.phoneNumber || null,
        otp: otp.trim(),
        newPassword,
      });

      setMsg(res?.message || "Password reset successful.");
      nav("/login");
    } catch (err) {
      setErrMsg(err?.response?.data?.message || err?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-10">
      <div className="max-w-md mx-auto rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Step {step}: {step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Choose new password"}
        </p>

        {errMsg ? <div className="mt-4 text-sm rounded-lg bg-rose-50 text-rose-800 px-3 py-2">{errMsg}</div> : null}
        {msg ? <div className="mt-3 text-sm rounded-lg bg-emerald-50 text-emerald-800 px-3 py-2">{msg}</div> : null}

        {step === 1 ? (
          <form onSubmit={onSendOtp} className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. therapist@spa.com"
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone (optional)</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>

            <button
              disabled={loading || !canSubmitIdentifier}
              className="px-5 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <div className="text-xs text-slate-500">
              OTP is sent via Email/SMS flow (console log in current dev setup).
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <form onSubmit={onVerifyOtp} className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                OTP {identifier.email ? `(sent to ${identifier.email})` : identifier.phoneNumber ? `(sent to ${identifier.phoneNumber})` : ""}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                required
              />
            </div>

            <button
              disabled={loading || otp.trim().length !== 6}
              className="px-5 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep(1);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="px-5 py-3 rounded-lg border bg-white text-slate-900 font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Back
            </button>
          </form>
        ) : null}

        {step === 3 ? (
          <form onSubmit={onResetPassword} className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">OTP</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                required
              />
            </div>

            <button
              disabled={loading || otp.trim().length !== 6}
              className="px-5 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        ) : null}

        <div className="mt-4 text-sm text-slate-600">
          Back to{" "}
          <button
            onClick={() => nav("/login")}
            className="underline font-medium"
            disabled={loading}
          >
            Login
          </button>
        </div>
      </div>
    </Container>
  );
}

