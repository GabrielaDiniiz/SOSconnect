import { useState, useEffect } from "react";
import { STATUS, SEVERITY } from "./utils.js";

// ── Badge ──────────────────────────────────────────────────────
export function Badge({ value, map = STATUS }) {
  const cfg = map[value] || { label: value, color: "#5a5d6e", bg: "rgba(90,93,110,0.1)", border: "rgba(90,93,110,0.2)" };
  return (
    <span className="badge" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

// ── Modal ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────────
export function Field({ label, full, children }) {
  return (
    <div className={`field${full ? " full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

// ── Toast container ────────────────────────────────────────────
export function Toasts({ items }) {
  return (
    <div className="toasts">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === "ok" ? "✅" : "❌"} {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── FilterBar ──────────────────────────────────────────────────
export function FilterBar({ options, active, onChange }) {
  return (
    <div className="filters">
      {options.map((o) => (
        <button key={o.value} className={`filter${active === o.value ? " active" : ""}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Empty ──────────────────────────────────────────────────────
export function Empty({ icon, title, desc }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────
export function StatCard({ accent, num, label, sub }) {
  return (
    <div className="stat" style={{ "--accent": accent }}>
      <div className="stat-num">{num ?? "—"}</div>
      <div className="stat-lbl">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ── SVG Icons ──────────────────────────────────────────────────
const iconPaths = {
  dashboard: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  alert:     "M12 2L2 19h20L12 2zm0 5v6m0 2v2",
  sos:       "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4m0 2v2",
  shelter:   "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  hand:      "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3m4-3v3m4-3v3",
  plus:      "M12 5v14M5 12h14",
  menu:      "M3 6h18M3 12h18M3 18h18",
  pin:       "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a3 3 0 100-6 3 3 0 000 6z",
  phone:     "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14v3z",
  clock:     "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2",
  people:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
};

export function Icon({ name, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  );
}
