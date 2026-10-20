"use client";

interface Props {
  rssi: number | undefined;
  variance: number;
  threshold: number;
  personCount: number;
  calibrating: boolean;
}

function SignalBar({ rssi }: { rssi?: number }) {
  const bars = 5;
  // rssi range: -90 (weak) to -30 (strong)
  const pct = rssi !== undefined ? Math.max(0, Math.min(1, (rssi + 90) / 60)) : 0;
  const filled = Math.round(pct * bars);

  return (
    <div className="flex items-end gap-0.5 h-5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: `${((i + 1) / bars) * 100}%`,
            background: i < filled ? "#22d3ee" : "rgba(34,211,238,0.15)",
            borderRadius: 1,
            transition: "background 0.4s",
          }}
        />
      ))}
    </div>
  );
}

export default function WifiSignalPanel({
  rssi,
  variance,
  threshold,
  personCount,
  calibrating,
}: Props) {
  return (
    <div className="panel p-3 w-52 space-y-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="panel-title">wifi signal</span>
        <SignalBar rssi={rssi} />
      </div>

      <Row label="RSSI" value={rssi !== undefined ? `${rssi} dBm` : "---"} color="#22d3ee" />
      <Row label="Variance" value={variance.toFixed(3)} color="#a78bfa" />
      <Row label="Threshold" value={threshold.toFixed(3)} color="#f59e0b" />

      <div className="border-t border-white/5 pt-2 space-y-2">
        <Row label="Motion" value={variance > threshold ? "DETECTED" : "NONE"} color={variance > threshold ? "#4ade80" : "#6b7280"} />
        <Row
          label="Persons"
          value={String(personCount)}
          color="#22d3ee"
          extra={
            <div className="flex gap-0.5 ml-1">
              {Array.from({ length: Math.max(0, personCount) }).map((_, i) => (
                <div key={i} className="w-1.5 h-3 rounded-sm" style={{ background: "#4ade80" }} />
              ))}
            </div>
          }
        />
      </div>

      <div className="border-t border-white/5 pt-2">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: calibrating ? "#f59e0b" : "#4ade80",
              boxShadow: `0 0 6px ${calibrating ? "#f59e0b" : "#4ade80"}`,
            }}
          />
          <span className="text-xs tracking-wider" style={{ color: calibrating ? "#f59e0b" : "#4ade80" }}>
            {calibrating ? "CALIBRATING..." : "CALIBRATED"}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  color,
  extra,
}: {
  label: string;
  value: string;
  color: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6rem" }}>
        {label}
      </span>
      <div className="flex items-center">
        <span className="text-xs font-mono font-semibold" style={{ color }}>
          {value}
        </span>
        {extra}
      </div>
    </div>
  );
}
