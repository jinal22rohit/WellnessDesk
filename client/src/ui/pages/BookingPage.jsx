import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container } from "../shared/Container";
import { fetchTherapies } from "../services/therapy";
import { findEmployeesByTherapy } from "../services/employee";
import { createBooking, getSlots } from "../services/booking";
import { SlotSelector } from "../components/SlotSelector";
import { useAuth } from "../context/AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

function yyyyMmDd(d) {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function BookingPage() {
  const [params] = useSearchParams();
  const preselectedTherapyId = params.get("therapyId") || "";

  const { user } = useAuth();
  const nav = useNavigate();

  const [therapies, setTherapies] = useState([]);
  const [therapyId, setTherapyId] = useState(preselectedTherapyId);
  const [date, setDate] = useState(() => yyyyMmDd(new Date()));
  const [employees, setEmployees] = useState([]);
  const [empID, setEmpID] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchTherapies().then(setTherapies).catch(() => {});
  }, []);

  useEffect(() => {
    if (!therapyId) return;
    setLoadingEmployees(true);
    findEmployeesByTherapy(therapyId)
      .then((res) => setEmployees(res?.data || []))
      .catch(() => setEmployees([]))
      .finally(() => setLoadingEmployees(false));
  }, [therapyId]);

  useEffect(() => {
    setEmpID("");
    setTime("");
    setSlots([]);
  }, [therapyId]);

  // Auto-select first employee (user can still change it).
  useEffect(() => {
    if (!therapyId) return;
    if (empID) return;
    if (!employees.length) return;
    setEmpID(employees[0]._id);
  }, [therapyId, employees, empID]);

  useEffect(() => {
    if (!therapyId || !date || !empID) return;
    setLoadingSlots(true);
    getSlots({ therapyId, empID, date })
      .then((res) => {
        if (res?.success === 0) {
          setSlots([]);
          setTime("");
          setMsg({ type: "err", text: res?.message || "Could not load slots." });
          return;
        }
        setSlots(res?.slots || []);
      })
      .catch((err) => {
        setSlots([]);
        setTime("");
        setMsg({ type: "err", text: err?.response?.data?.message || err?.message || "Could not load slots." });
      })
      .finally(() => setLoadingSlots(false));
  }, [therapyId, date, empID]);

  const therapy = useMemo(() => therapies.find((t) => t._id === therapyId) || null, [therapies, therapyId]);
  const missingDuration = useMemo(() => Boolean(therapyId && therapy && !Number(therapy.duration)), [therapyId, therapy]);
  const minDate = useMemo(() => yyyyMmDd(new Date()), []);

  const isPastDate = useMemo(() => {
    if (!date) return false;
    const selected = new Date(date);
    const today = new Date();
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return selected < today;
  }, [date]);

  async function onBook() {
    setMsg({ type: "", text: "" });
    try {
      if (!therapyId) return setMsg({ type: "err", text: "Please select a therapy." });
      if (!date) return setMsg({ type: "err", text: "Please select a date." });
      if (isPastDate) return setMsg({ type: "err", text: "Past dates are not allowed. Please select today or future." });
      if (!empID) return setMsg({ type: "err", text: "Employee not selected." });
      if (!time) return setMsg({ type: "err", text: "Please select a slot." });

      setBooking(true);
     const res = await createBooking({
  
  empID,
  therapyId,
  date,
  time,
});
      

      if (res?.success === 1) {
  setMsg({ type: "ok", text: "Appointment booked successfully." });

  setTimeout(() => {
    nav("/dashboard/customer");
  }, 500);
} else {
        setMsg({ type: "err", text: res?.message || "Booking failed." });
      }
    } catch (err) {
      setMsg({ type: "err", text: err?.response?.data?.message || err?.message || "Booking failed." });
    } finally {
      setBooking(false);
    }
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Book an appointment</h1>
      <p className="mt-2 text-slate-600">Select therapy → employee auto-selects (you can change) → date → slot → confirm.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onBook();
        }}
        className="mt-6 rounded-2xl border bg-white p-6 grid gap-6"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Therapy</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
              value={therapyId}
              onChange={(e) => setTherapyId(e.target.value)}
              required
            >
              <option value="">Select therapy</option>
              {therapies.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.therapyName} ({t.duration}m) - ₹{t.therapyprice}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              required
            />
            {isPastDate ? <div className="mt-1 text-xs text-rose-600">Past dates are disabled.</div> : null}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Employee</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
              value={empID}
              onChange={(e) => setEmpID(e.target.value)}
              required
              disabled={!therapyId}
            >
              <option value="">{!therapyId ? "Select therapy first" : loadingEmployees ? "Loading employees..." : "Select employee"}</option>
                     {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                     {e.empName}
                      </option>
                    ))}
            </select>
            {therapyId && !loadingEmployees && !employees.length ? (
              <div className="mt-1 text-xs text-rose-600">No employees available for this therapy.</div>
            ) : null}
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-700">Selected</div>
            <div className="mt-1 text-sm text-slate-600">
              {therapy ? (
                <>
                  {therapy.therapyName} • {therapy.duration}m • ₹{therapy.therapyprice}
                </>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700">Time slot</div>
          <div className="mt-2">
            {therapyId && date && empID ? (
              loadingSlots ? (
                <div className="text-sm text-slate-600">Loading slots...</div>
              ) : (
                <>
                  {missingDuration ? (
                    <div className="text-sm text-rose-600">
                      This therapy has no duration set. Please fix it in Admin → Therapies.
                    </div>
                  ) : null}
                  <SlotSelector slots={slots} value={time} onChange={setTime} />
                </>
              )
            ) : (
              <div className="text-sm text-slate-600">Select therapy, date, and employee to load slots.</div>
            )}
          </div>
          {therapyId && date && empID && !loadingSlots && slots?.length ? (
            <div className="mt-2 text-xs text-slate-500">
              Available: {slots.filter((s) => s.available).length} • Unavailable: {slots.filter((s) => !s.available).length}
            </div>
          ) : null}
        </div>

        {msg.text ? (
          <div
            className={
              "text-sm rounded-lg px-3 py-2 " +
              (msg.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")
            }
          >
            {msg.text}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!therapyId || !date || !empID || !time || booking || isPastDate || loadingSlots}
          className="px-5 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {booking ? "Booking..." : "Confirm booking"}
        </button>

        {!therapyId || !date || !empID || !time ? (
          <div className="text-xs text-slate-500">
            To confirm: select therapy, date, employee, and a slot.
          </div>
        ) : null}
      </form>
    </Container>
  );
}

