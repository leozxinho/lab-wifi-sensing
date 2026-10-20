"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Event {
  detected: boolean;
  confidence: number;
  variance: number;
  person_count: number;
  timestamp: string;
}

const W = 176;
const H = 64;
const PAD = { t: 6, r: 4, b: 14, l: 28 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;

function sparkPath(vals: number[], min: number, max: number): string {
  if (vals.length < 2) return "";
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = PAD.l + (i / (vals.length - 1)) * IW;
    const y = PAD.t + IH - ((v - min) / range) * IH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return "M" + pts.join("L");
}

export default function HistoryChart() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetch_ = () =>
      fetch(`${API_BASE}/api/v1/history/default?limit=60`)
        .then((r) => r.json())
        .then((d: Event[]) => setEvents([...d].reverse()))
        .catch(() => {});

    fetch_();
    const id = setInterval(fetch_, 5000);
    return () => clearInterval(id);
  }, []);

  if (events.length < 2) return null;

  const variances = events.map((e) => e.variance);
  const counts    = events.map((e) => e.person_count);
  const minV = Math.min(...variances);
  const maxV = Math.max(...variances);
  const maxC = Math.max(...counts, 2);

  const vPath = sparkPath(variances, minV, maxV);
  const cPath = sparkPath(counts, 0, maxC);

  const yLabel = (v: number, min: number, max: number) => {
    const range = max - min || 1;
    return (PAD.t + IH - ((v - min) / range) * IH).toFixed(1);
  };

  return (
    <div className="panel p-3 w-44">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
        <span className="panel-title">histórico</span>
        <span className="panel-title ml-auto opacity-40">{events.length}pts</span>
      </div>

      <svg width={W} height={H} style={{ overflow: "visible" }}>
        {/* Grid */}
        {[0, 0.5, 1].map((t) => {
          const y = (PAD.t + IH * (1 - t)).toFixed(1);
          return (
            <line key={t} x1={PAD.l} x2={PAD.l + IW} y1={y} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
          );
        })}

        {/* Variance line */}
        <path d={vPath} fill="none" stroke="#a78bfa" strokeWidth={1.2} strokeLinejoin="round" />

        {/* Person count line */}
        <path d={cPath} fill="none" stroke="#4ade80" strokeWidth={1.2}
          strokeLinejoin="round" strokeDasharray="3 2" />

        {/* Y axis labels */}
        <text x={PAD.l - 2} y={yLabel(maxV, minV, maxV)} fill="#a78bfa"
          fontSize={4.5} textAnchor="end" dominantBaseline="middle">
          {maxV.toFixed(3)}
        </text>
        <text x={PAD.l - 2} y={PAD.t + IH} fill="#a78bfa"
          fontSize={4.5} textAnchor="end" dominantBaseline="middle">
          {minV.toFixed(3)}
        </text>

        {/* X axis */}
        <line x1={PAD.l} x2={PAD.l + IW} y1={PAD.t + IH} y2={PAD.t + IH}
          stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />

        {/* Legend */}
        <line x1={PAD.l} x2={PAD.l + 10} y1={H - 5} y2={H - 5}
          stroke="#a78bfa" strokeWidth={1.2} />
        <text x={PAD.l + 12} y={H - 4} fill="#a78bfa" fontSize={4.5}>variance</text>
        <line x1={PAD.l + 52} x2={PAD.l + 62} y1={H - 5} y2={H - 5}
          stroke="#4ade80" strokeWidth={1.2} strokeDasharray="3 2" />
        <text x={PAD.l + 64} y={H - 4} fill="#4ade80" fontSize={4.5}>pessoas</text>
      </svg>
    </div>
  );
}
