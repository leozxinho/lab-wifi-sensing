"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { useWifiData } from "../hooks/useWifiData";
import TopBar from "./TopBar";
import BottomBar from "./BottomBar";
import WifiSignalPanel from "./WifiSignalPanel";
import PresencePanel from "./PresencePanel";
import HistoryChart from "./HistoryChart";
import MovementMap from "./MovementMap";
import { isWebGLAvailable } from "./Scene3D";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

type View = "3d" | "map";

export default function Dashboard() {
  const { data, connected } = useWifiData();
  const [view, setView]         = useState<View>("3d");
  const [webgl, setWebgl]       = useState(true); // optimistic

  // Detect WebGL on first mount — switch to map if unavailable
  useEffect(() => {
    const ok = isWebGLAvailable();
    setWebgl(ok);
    if (!ok) setView("map");
  }, []);

  // Called if Three.js itself fails after the canvas mounts
  const handleWebGLFail = useCallback(() => {
    setWebgl(false);
    setView("map");
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: "#000814" }}>

      {/* Main view */}
      <div className="absolute inset-0">
        {view === "3d" ? (
          <Scene3D data={data} onUnavailable={handleWebGLFail} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#000814" }}>
            <MovementMap data={data} />
          </div>
        )}
      </div>

      {/* Top HUD */}
      <TopBar connected={connected} calibrating={data.calibrating} roomId={data.room_id} />

      {/* View toggle */}
      <div className="absolute top-9 left-1/2 -translate-x-1/2 z-20 flex gap-px">
        <ViewBtn
          active={view === "3d"}
          disabled={!webgl}
          onClick={() => webgl && setView("3d")}
          label="RADAR 3D"
          title={webgl ? undefined : "WebGL não disponível neste ambiente"}
        />
        <ViewBtn
          active={view === "map"}
          onClick={() => setView("map")}
          label="MAPA"
          icon="⊞"
        />
      </div>

      {/* Right panel */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
        <WifiSignalPanel
          rssi={data.rssi}
          variance={data.variance}
          threshold={data.threshold}
          personCount={data.person_count}
          calibrating={data.calibrating}
        />
        <PresencePanel
          occupied={data.occupied}
          confidence={data.confidence}
          personCount={data.person_count}
          timestamp={data.timestamp}
        />
        <HistoryChart />
      </div>

      {/* Bottom HUD */}
      <BottomBar occupied={data.occupied} personCount={data.person_count} vitalStatus={data.vital_status} />
    </div>
  );
}

function ViewBtn({
  active, disabled, onClick, label, icon, title,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  icon?: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "2px 10px",
        fontSize: "0.55rem",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: "bold",
        letterSpacing: "0.12em",
        border: "1px solid",
        borderColor: disabled
          ? "rgba(255,255,255,0.06)"
          : active
          ? "rgba(34,211,238,0.6)"
          : "rgba(255,255,255,0.1)",
        background: disabled
          ? "rgba(0,0,0,0.2)"
          : active
          ? "rgba(34,211,238,0.12)"
          : "rgba(0,0,0,0.4)",
        color: disabled
          ? "rgba(255,255,255,0.15)"
          : active
          ? "#22d3ee"
          : "rgba(255,255,255,0.3)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
    >
      {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
      {label}
      {disabled && (
        <span style={{ marginLeft: 4, fontSize: "0.45rem", opacity: 0.5 }}>✕</span>
      )}
    </button>
  );
}
