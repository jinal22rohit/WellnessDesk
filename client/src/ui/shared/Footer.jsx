import React from "react";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-semibold text-slate-900">Ultron Spa</div>
          <div className="text-sm text-slate-600">Relax. Restore. Renew.</div>
        </div>
        <div className="text-sm text-slate-600">
          © {new Date().getFullYear()} Ultron Technologies
        </div>
      </div>
    </footer>
  );
}

