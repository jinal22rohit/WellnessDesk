import React from "react";
import { Link } from "react-router-dom";
import { Container } from "../shared/Container";
const API_URL = import.meta.env.VITE_API_URL;


export function ResetPasswordPage() {
  return (
    <Container className="py-10">
      <div className="max-w-md mx-auto rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Reset Password</h1>
        <p className="mt-1 text-sm text-slate-600">
          This app now uses an OTP flow. Use the OTP reset flow instead:
        </p>

        <div className="mt-4 text-sm">
          <Link to="/forgot-password" className="font-medium text-slate-900 hover:underline">
            Go to Forgot Password (OTP)
          </Link>
        </div>
      </div>
    </Container>
  );
}

