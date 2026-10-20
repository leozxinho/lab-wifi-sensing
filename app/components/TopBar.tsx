"use client";

import { useEffect, useState } from "react";

interface Props {
  connected: boolean;
  calibrating: boolean;
  roomId: string;
}

export default function TopBar({ connected, calibrating, roomId }: Props) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2"
      style={{
        background: "linear-gradient(180deg, rgba(0,8,20,0.95) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(34,211,238,0.1)",
      }}
    >
      {/* Left: logo */}
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.4)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="5" stroke="#22d3ee" strokeWidth="1" fill="none" />
            <circle cx="6" cy="6" r="2" fill="#22d3ee" opacity="0.8" />
          </svg>
        </div>
        <span className="text-xs font-bold tracking-widest" style={{ color: "#22d3ee" }}>
          WiFi·SENSE
        </span>
      </div>

      {/* Center: status tags */}
      <div className="flex items-center gap-3">
        <Tag
          label="SYS_MONITOR"
          value={calibrating ? "CALIBRATING" : "ACTIVE"}
          color={calibrating ? "#f59e0b" : "#4ade80"}
        />
        <Tag label="ROOM" value={roomId.toUpperCase()} color="#22d3ee" />
        <Tag label="MODE" value="CSI·PASSIVE" color="#a78bfa" />
      </div>

      {/* Right: ws status + clock */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: connected ? "#4ade80" : "#ef4444",
              boxShadow: `0 0 6px ${connected ? "#4ade80" : "#ef4444"}`,
            }}
          />
          <span className="text-xs tracking-wider" style={{ color: connected ? "#4ade80" : "#ef4444", fontSize: "0.6rem" }}>
            {connected ? "LIVE" : "OFFLINE"}
          </span>
        </div>
        <span className="text-xs font-mono" suppressHydrationWarning style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem" }}>
          {time}
        </span>
      </div>
    </div>
  );
}

function Tag({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.55rem" }}>
        {label}:
      </span>
      <span className="text-xs font-bold" style={{ color, fontSize: "0.6rem" }}>
        {value}
      </span>
    </div>
  );
}
