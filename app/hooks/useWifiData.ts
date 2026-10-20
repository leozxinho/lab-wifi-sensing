"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const WS_URL = API_BASE.replace(/^http/, "ws") + "/api/v1/status/ws";
const ROOM_ID = "default";

export interface WifiData {
  room_id: string;
  detected: boolean;
  occupied: boolean;
  confidence: number;
  calibrating: boolean;
  variance: number;
  threshold: number;
  breathing_bpm: number;
  heartrate_bpm: number;
  person_count: number;
  vital_status: string;
  timestamp: string;
  // from REST
  rssi?: number;
  channel?: number;
  csi_amplitude?: number;
}

const INITIAL: WifiData = {
  room_id: ROOM_ID,
  detected: false,
  occupied: false,
  confidence: 0,
  calibrating: true,
  variance: 0,
  threshold: 0,
  breathing_bpm: 0,
  heartrate_bpm: 0,
  person_count: 0,
  vital_status: "IDLE",
  timestamp: new Date().toISOString(),
};

export function useWifiData() {
  const [data, setData] = useState<WifiData>(INITIAL);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;

    async function fetchRest() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/csi/recent?limit=1`);
        if (res.ok) {
          const rows = await res.json();
          if (rows.length > 0) {
            const row = rows[0];
            const amp = row.csi_data?.length
              ? Math.sqrt(
                  row.csi_data.reduce((s: number, v: number) => s + v * v, 0) /
                    row.csi_data.length
                )
              : 0;
            setData((prev) => ({
              ...prev,
              rssi: row.rssi,
              channel: row.channel,
              csi_amplitude: amp,
            }));
          }
        }
      } catch {
        // backend may not be running
      }
    }

    function connect() {
      if (!alive) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        fetchRest();
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          setData((prev) => ({ ...prev, ...msg }));
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (alive) {
          retryRef.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    // poll REST every 5s to keep rssi/channel fresh when ws has no new data
    const restInterval = setInterval(fetchRest, 5000);

    return () => {
      alive = false;
      if (retryRef.current) clearTimeout(retryRef.current);
      clearInterval(restInterval);
      wsRef.current?.close();
    };
  }, []);

  return { data, connected };
}
