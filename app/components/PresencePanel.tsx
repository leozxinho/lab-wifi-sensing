"use client";

interface Props {
  occupied: boolean;
  confidence: number;
  personCount: number;
  timestamp: string;
}

export default function PresencePanel({ occupied, confidence, personCount, timestamp }: Props) {
  const time = new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="panel p-3 w-44 space-y-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="panel-title">presence</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        {/* Status badge */}
        <div
          className="w-full text-center py-2 hex-border"
          style={{
            background: occupied ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${occupied ? "rgba(74,222,128,0.5)" : "rgba(239,68,68,0.3)"}`,
          }}
        >
          <span
            className="text-sm font-bold tracking-widest"
            style={{
              color: occupied ? "#4ade80" : "#ef4444",
              textShadow: `0 0 12px ${occupied ? "#4ade80" : "#ef4444"}`,
            }}
          >
            {occupied ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        {/* Person icons */}
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: Math.max(personCount, 3) }).map((_, i) => (
            <PersonIcon key={i} active={i < personCount} />
          ))}
        </div>

        <div className="w-full space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem" }}>
              CONFIDENCE
            </span>
            <span className="text-xs font-bold" style={{ color: "#a3e635" }}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
          <div className="bar-track h-1.5 w-full">
            <div
              className="bar-fill h-full"
              style={{
                width: `${confidence * 100}%`,
                background: `linear-gradient(90deg, #1a2e05, ${occupied ? "#4ade80" : "#ef4444"})`,
              }}
            />
          </div>
        </div>

        <div className="w-full flex justify-between items-center pt-1 border-t border-white/5">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem" }}>
            UPDATED
          </span>
          <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.6rem" }}>
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
      <circle cx="9" cy="4" r="3.5" fill={active ? "#4ade80" : "#1f2937"} />
      <path
        d="M3 10 C3 8 15 8 15 10 L15 20 L12 20 L12 28 L6 28 L6 20 L3 20 Z"
        fill={active ? "#4ade80" : "#1f2937"}
      />
      {active && (
        <rect x="3" y="10" width="12" height="10" rx="1" fill="#4ade80" opacity="0.3" />
      )}
    </svg>
  );
}
