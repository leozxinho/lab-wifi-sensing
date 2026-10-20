"use client";

interface Props {
  heartrate: number;
  breathing: number;
  confidence: number;
  vitalStatus: string;
}

export default function VitalSignsPanel({ heartrate, breathing, confidence, vitalStatus }: Props) {
  const confPct = Math.round(confidence * 100);

  return (
    <div className="panel p-3 w-44 space-y-3">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" />
        <span className="panel-title">vital signs</span>
      </div>

      {/* Heart rate */}
      <div className="space-y-0.5">
        <div className="panel-title" style={{ color: "#ef4444", opacity: 0.8 }}>
          ♥ heart rate
        </div>
        <div className="flex items-end gap-1">
          <span className="value-lg glow-red" style={{ color: "#f87171" }}>
            {heartrate > 0 ? Math.round(heartrate) : "--"}
          </span>
          <span className="value-unit mb-1">BPM</span>
        </div>
        <div className="bar-track h-1 w-full">
          <div
            className="bar-fill"
            style={{
              width: `${Math.min((heartrate / 120) * 100, 100)}%`,
              background: "linear-gradient(90deg, #7f1d1d, #ef4444)",
            }}
          />
        </div>
      </div>

      {/* Breathing */}
      <div className="space-y-0.5">
        <div className="panel-title" style={{ color: "#22d3ee", opacity: 0.8 }}>
          ~ respiration
        </div>
        <div className="flex items-end gap-1">
          <span className="value-lg glow-cyan" style={{ color: "#67e8f9" }}>
            {breathing > 0 ? breathing.toFixed(1) : "--"}
          </span>
          <span className="value-unit mb-1">BPM</span>
        </div>
        <div className="bar-track h-1 w-full">
          <div
            className="bar-fill"
            style={{
              width: `${Math.min((breathing / 30) * 100, 100)}%`,
              background: "linear-gradient(90deg, #164e63, #22d3ee)",
            }}
          />
        </div>
      </div>

      {/* Confidence */}
      <div className="space-y-0.5">
        <div className="panel-title">confidence</div>
        <div className="flex items-end gap-1">
          <span className="value-lg" style={{ fontSize: "1.5rem", color: "#a3e635" }}>
            {confPct}
          </span>
          <span className="value-unit mb-1" style={{ color: "#a3e635" }}>%</span>
        </div>
        <div className="bar-track h-1 w-full">
          <div
            className="bar-fill"
            style={{
              width: `${confPct}%`,
              background: "linear-gradient(90deg, #1a2e05, #a3e635)",
            }}
          />
        </div>
      </div>

      {/* Vital status badge */}
      <div
        className="hex-border text-center py-1"
        style={{
          background: vitalStatus === "ACTIVE" ? "rgba(34,211,238,0.1)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${vitalStatus === "ACTIVE" ? "rgba(34,211,238,0.4)" : "rgba(255,255,255,0.1)"}`,
        }}
      >
        <span
          className="text-xs font-bold tracking-widest"
          style={{ color: vitalStatus === "ACTIVE" ? "#22d3ee" : "#4b5563" }}
        >
          {vitalStatus || "IDLE"}
        </span>
      </div>
    </div>
  );
}
