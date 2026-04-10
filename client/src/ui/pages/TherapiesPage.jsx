import React, { useEffect, useMemo, useState } from "react";
import { Container } from "../shared/Container";
import { fetchTherapies } from "../services/therapy";
import { TherapyCard } from "../components/TherapyCard";

export function TherapiesPage() {
  const [therapies, setTherapies] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchTherapies().then(setTherapies).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return therapies;
    return therapies.filter((t) => (t.therapyName || "").toLowerCase().includes(s));
  }, [therapies, q]);

  return (
    <Container className="py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Therapies</h1>
          <p className="text-slate-600">Browse our full therapy catalog.</p>
        </div>
        <div className="w-full md:w-80">
          <label className="text-sm font-medium text-slate-700">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. massage"
            className="mt-1 w-full rounded-lg border px-3 py-2 bg-white"
          />
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <TherapyCard key={t._id} therapy={t} />
        ))}
      </div>
    </Container>
  );
}

