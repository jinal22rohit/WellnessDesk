import React, { useState } from "react";
import { Container } from "../shared/Container";
import { submitContact } from "../services/contact";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", msg: "" });
    try {
      const res = await submitContact(form);
      if (res?.success === 1) {
        setStatus({ type: "ok", msg: "Message sent successfully." });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({ type: "err", msg: res?.message || "Failed to send message." });
      }
    } catch (err) {
      setStatus({ type: "err", msg: err?.message || "Failed to send message." });
    }
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Contact</h1>
      <p className="mt-2 text-slate-600">Send us a message and we’ll get back to you.</p>

      <form onSubmit={onSubmit} className="mt-6 max-w-2xl rounded-2xl border bg-white p-6 grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              required
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              required
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Subject</label>
          <input
            required
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Message</label>
          <textarea
            required
            rows={5}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
        </div>
        {status.msg ? (
          <div
            className={
              "text-sm rounded-lg px-3 py-2 " +
              (status.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")
            }
          >
            {status.msg}
          </div>
        ) : null}
        <button className="px-5 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800">
          Send message
        </button>
      </form>
    </Container>
  );
}

