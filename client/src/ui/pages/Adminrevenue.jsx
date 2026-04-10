import React, { useEffect, useState } from "react";
import { Container } from "../shared/Container";
// import { getRevenueAnalytics } from "../../services/analytics";
import { getRevenueAnalytics } from "../services/analytic";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function AdminRevenueDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRevenueAnalytics()
      .then((res) => setData(res?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Container className="py-10"><div>Loading analytics...</div></Container>;
  if (!data) return <Container className="py-10"><div>No data available.</div></Container>;

  const statusMap = {};
  data.statusSummary.forEach((s) => { statusMap[s._id] = s.count; });

  const maxMonthly = Math.max(...data.monthlyRevenue.map((m) => m.revenue), 1);
  const maxTherapy = Math.max(...data.revenueByTherapy.map((t) => t.revenue), 1);
  const maxEmp = Math.max(...data.revenueByEmployee.map((e) => e.revenue), 1);

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Revenue Analytics</h1>
      <p className="mt-1 text-slate-500 text-sm">Overview of completed bookings and earnings.</p>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="text-2xl font-semibold text-emerald-600 mt-1">₹{data.totalRevenue}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{statusMap["completed"] || 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-semibold text-amber-600 mt-1">{statusMap["booked"] || 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-slate-500">Cancelled</p>
          <p className="text-2xl font-semibold text-rose-500 mt-1">{statusMap["cancelled"] || 0}</p>
        </div>
      </div>

      {/* Monthly revenue bar chart */}
      <div className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Monthly Revenue</h2>
        <div className="flex items-end gap-2 h-40">
          {data.monthlyRevenue.map((m) => (
            <div key={`${m._id.year}-${m._id.month}`} className="flex flex-col items-center flex-1">
              <span className="text-xs text-slate-500 mb-1">₹{m.revenue}</span>
              <div
                className="w-full bg-emerald-500 rounded-t"
                style={{ height: `${(m.revenue / maxMonthly) * 120}px` }}
              />
              <span className="text-xs text-slate-400 mt-1">{MONTHS[m._id.month - 1]}</span>
            </div>
          ))}
          {data.monthlyRevenue.length === 0 && (
            <p className="text-sm text-slate-400">No completed bookings yet.</p>
          )}
        </div>
      </div>

      {/* Revenue by therapy */}
      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue by Therapy</h2>
        <div className="grid gap-3">
          {data.revenueByTherapy.map((t) => (
            <div key={t._id}>
              <div className="flex justify-between text-sm text-slate-700 mb-1">
                <span>{t._id}</span>
                <span>₹{t.revenue} ({t.count} sessions)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(t.revenue / maxTherapy) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {data.revenueByTherapy.length === 0 && (
            <p className="text-sm text-slate-400">No data yet.</p>
          )}
        </div>
      </div>

      {/* Revenue by employee */}
      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue by Employee</h2>
        <div className="grid gap-3">
          {data.revenueByEmployee.map((e) => (
            <div key={e._id}>
              <div className="flex justify-between text-sm text-slate-700 mb-1">
                <span>{e._id}</span>
                <span>₹{e.revenue} ({e.count} sessions)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${(e.revenue / maxEmp) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {data.revenueByEmployee.length === 0 && (
            <p className="text-sm text-slate-400">No data yet.</p>
          )}
        </div>
      </div>
    </Container>
  );
}