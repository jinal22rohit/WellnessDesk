import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../shared/Container";
import { fetchTherapies } from "../services/therapy";
import { TherapyCard } from "../components/TherapyCard";

export function HomePage() {
  const [therapies, setTherapies] = useState([]);

  useEffect(() => {
    fetchTherapies().then((d) => setTherapies((d || []).slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-b from-white to-slate-50 border-b">
        <Container className="py-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
                Professional Spa Booking, made simple
              </h1>
              <p className="mt-4 text-slate-600">
                Discover therapies, pick a time slot, choose your preferred therapist, and book instantly.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/therapies"
                  className="px-5 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800"
                >
                  Explore Therapies
                </Link>
                <Link
                  to="/booking"
                  className="px-5 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
                >
                  Book Now
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="text-sm font-medium text-slate-600">Hours</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">9:00 AM – 6:00 PM</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="rounded-xl bg-slate-50 border p-4">
                  <div className="font-semibold">Instant slots</div>
                  <div className="text-slate-600">See availability live.</div>
                </div>
                <div className="rounded-xl bg-slate-50 border p-4">
                  <div className="font-semibold">Book again</div>
                  <div className="text-slate-600">Repeat favorites fast.</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Featured therapies</h2>
              <p className="text-slate-600">Handpicked experiences our customers love.</p>
            </div>
            <Link to="/therapies" className="text-sm font-medium text-slate-900 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {therapies.map((t) => (
              <TherapyCard key={t._id} therapy={t} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

