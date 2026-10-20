"use client";

interface Props {
  occupied: boolean;
  personCount: number;
  vitalStatus: string;
  fps?: number;
}

const MODES = [
  { key: "wifi_signal", label: "WiFi Signal", active: true },
  { key: "vital_sign", label: "Vital Sign Monitoring", active: true },
  { key: "presence", label: "Presence Detection", active: true },
];

export default function BottomBar({ occupied, personCount, vitalStatus, fps = 0 }: Props) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2"
      style={{
        background: "linear-gradient(0deg, rgba(0,8,20,0.95) 0%, transparent 100%)",
        borderTop: "1px solid rgba(34,211,238,0.08)",
      }}
    >
      {/* Mode indicators */}
      <div className="flex items-center gap-4">
        {MODES.map((m) => (
          <div key={m.key} className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: m.active ? "#22d3ee" : "#374151",
                boxShadow: m.active ? "0 0 4px #22d3ee" : "none",
              }}
            />
            <span className="text-xs" style={{ color: m.active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)", fontSize: "0.6rem" }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Stat label="PERSONS" value={String(personCount)} color="#4ade80" />
        <Stat label="STATUS" value={vitalStatus} color={occupied ? "#22d3ee" : "#6b7280"} />
        <Stat label="ALGO" value="CSI·THRESHOLD" color="#a78bfa" />
        {fps > 0 && <Stat label="FPS" value={String(fps)} color="rgba(255,255,255,0.3)" />}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.55rem" }}>[{label}]</span>
      <span className="font-bold" style={{ color, fontSize: "0.6rem" }}>
        {value}
      </span>
    </div>
  );
}
