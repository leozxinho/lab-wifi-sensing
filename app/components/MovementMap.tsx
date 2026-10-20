"use client";

import { useEffect, useRef } from "react";
import type { WifiData } from "../hooks/useWifiData";

const W = 680;
const H = 460;
const CX = W / 2;
const CY = H / 2;
const MAX_R = Math.min(W, H) * 0.43; // ~197px — outer radar ring

// ── Types ──────────────────────────────────────────────────────────────────────
interface Pulse { r: number; a: number }

interface Person {
  angle: number;
  radius: number;
  targetAngle: number;
  targetRadius: number;
  trail: Array<{ x: number; y: number; a: number }>;
  opacity: number;
  timer: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function mkPerson(idx: number, total: number): Person {
  const spread = (Math.PI * 2) / Math.max(total, 1);
  const angle  = spread * idx + (Math.random() - 0.5) * 0.6;
  const radius = MAX_R * (0.32 + Math.random() * 0.45);
  return { angle, radius, targetAngle: angle, targetRadius: radius, trail: [], opacity: 0, timer: 0 };
}

function cartesian(angle: number, radius: number) {
  return { x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius };
}

// ── Drawing ────────────────────────────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#000814";
  ctx.fillRect(0, 0, W, H);

  // Radial grid lines
  ctx.strokeStyle = "rgba(34,211,238,0.04)";
  ctx.lineWidth = 0.5;
  for (let deg = 0; deg < 360; deg += 15) {
    const r = (deg * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + Math.cos(r) * W, CY + Math.sin(r) * W);
    ctx.stroke();
  }

  // Static concentric reference rings
  for (let i = 1; i <= 4; i++) {
    const r = (MAX_R / 4) * i;
    ctx.beginPath();
    ctx.arc(CX, CY, r, 0, Math.PI * 2);
    ctx.strokeStyle = i === 4 ? "rgba(34,211,238,0.14)" : "rgba(34,211,238,0.07)";
    ctx.lineWidth = i === 4 ? 1 : 0.5;
    ctx.stroke();

    // Distance label
    ctx.fillStyle = "rgba(34,211,238,0.18)";
    ctx.font = "5.5px 'JetBrains Mono',monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${i * 25}%`, CX + r + 3, CY - 2);
  }
}

function drawPulses(ctx: CanvasRenderingContext2D, pulses: Pulse[], detected: boolean) {
  const rgb = detected ? "74,222,128" : "34,211,238";
  for (const p of pulses) {
    ctx.beginPath();
    ctx.arc(CX, CY, p.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},${p.a})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
}

function drawSensor(ctx: CanvasRenderingContext2D, t: number, detected: boolean, calibrating: boolean) {
  const colorHex  = calibrating ? "#f59e0b" : detected ? "#22d3ee" : "#1d4ed8";
  const colorRgb  = calibrating ? "245,158,11" : "34,211,238";
  const size      = 5.5 + Math.sin(t * 3.5) * 1.5;

  // Outer halo
  const grd = ctx.createRadialGradient(CX, CY, 0, CX, CY, 50);
  grd.addColorStop(0, `rgba(${colorRgb},0.35)`);
  grd.addColorStop(0.45, `rgba(${colorRgb},0.07)`);
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(CX, CY, 50, 0, Math.PI * 2); ctx.fill();

  // Inner ring
  ctx.beginPath(); ctx.arc(CX, CY, 14, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${colorRgb},0.3)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Core dot
  ctx.shadowColor = colorHex;
  ctx.shadowBlur  = 18;
  ctx.fillStyle   = colorHex;
  ctx.beginPath(); ctx.arc(CX, CY, size, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur  = 0;

  // Label
  ctx.fillStyle  = `rgba(${colorRgb},0.55)`;
  ctx.font       = "6px 'JetBrains Mono',monospace";
  ctx.textAlign  = "center";
  ctx.fillText("ESP32", CX, CY + size + 12);
}

function drawStickFigure(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#4ade80";
  ctx.fillStyle   = "#4ade80";
  ctx.shadowColor = "#4ade80";
  ctx.shadowBlur  = 10;
  ctx.lineWidth   = 1.5;
  ctx.lineCap     = "round";

  ctx.beginPath(); ctx.arc(x, y - 9, 3.5, 0, Math.PI * 2); ctx.fill();          // head
  ctx.beginPath(); ctx.moveTo(x, y - 5.5); ctx.lineTo(x, y + 6); ctx.stroke();  // torso
  ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.stroke();    // arms
  ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x - 4, y + 15); ctx.stroke(); // leg L
  ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x + 4, y + 15); ctx.stroke(); // leg R

  ctx.restore();
}

function drawPersons(ctx: CanvasRenderingContext2D, persons: Person[]) {
  for (const p of persons) {
    if (p.opacity < 0.01) continue;
    const { x, y } = cartesian(p.angle, p.radius);

    // Trail dots
    for (const t of p.trail) {
      if (t.a < 0.02) continue;
      ctx.beginPath(); ctx.arc(t.x, t.y, 2.2 * t.a, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74,222,128,${t.a * p.opacity * 0.45})`;
      ctx.fill();
    }

    // Glow halo
    const grd = ctx.createRadialGradient(x, y, 0, x, y, 22);
    grd.addColorStop(0, `rgba(74,222,128,${0.22 * p.opacity})`);
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();

    // Line from center to person (dashed, faint)
    ctx.save();
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = `rgba(74,222,128,${0.08 * p.opacity})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(x, y); ctx.stroke();
    ctx.restore();

    drawStickFigure(ctx, x, y - 4, p.opacity);
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, data: WifiData) {
  // Bottom strip
  ctx.fillStyle = "rgba(0,8,20,0.7)";
  ctx.fillRect(0, H - 22, W, 22);

  const items = [
    { l: "VARIANCE",  v: data.variance.toFixed(3),          c: "#a78bfa" },
    { l: "THRESHOLD", v: data.threshold.toFixed(3),         c: "#f59e0b" },
    { l: "PERSONS",   v: String(data.person_count),         c: "#4ade80" },
    { l: "STATUS",    v: data.occupied ? "ACTIVE" : "IDLE", c: data.occupied ? "#4ade80" : "#4b5563" },
    { l: "CONF",      v: `${Math.round(data.confidence * 100)}%`, c: "#22d3ee" },
  ];

  let ox = 10;
  ctx.textAlign = "left";
  for (const item of items) {
    ctx.font = "5.5px 'JetBrains Mono',monospace";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillText(`${item.l}:`, ox, H - 7);
    ox += ctx.measureText(`${item.l}:`).width + 2;
    ctx.fillStyle = item.c;
    ctx.font = "bold 6px 'JetBrains Mono',monospace";
    ctx.fillText(item.v, ox, H - 7);
    ox += ctx.measureText(item.v).width + 14;
  }

  // Top-left label
  ctx.fillStyle = "rgba(0,8,20,0.6)";
  ctx.fillRect(0, 0, 140, 18);
  ctx.fillStyle = "#22d3ee";
  ctx.font = "bold 7px 'JetBrains Mono',monospace";
  ctx.textAlign = "left";
  ctx.fillText("RADAR DE PRESENÇA", 6, 12);
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function MovementMap({ data }: { data: WifiData }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const dataRef    = useRef(data);
  const persons    = useRef<Person[]>([]);
  const pulses     = useRef<Pulse[]>([]);
  const pulseTimer = useRef(0);
  const rafRef     = useRef(0);

  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    let last = 0, elapsed = 0;

    function frame(ts: number) {
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts; elapsed += dt;
      const d  = dataRef.current;
      const ps = persons.current;

      // ── Sync persons ────────────────────────────────────────────────────
      const want = d.person_count > 0 ? d.person_count : 0;

      // Add new persons spread evenly
      if (ps.length < want) {
        for (let i = ps.length; i < want; i++) ps.push(mkPerson(i, want));
      }
      // Fade out excess
      for (let i = want; i < ps.length; i++) {
        ps[i].opacity = Math.max(0, ps[i].opacity - dt * 2);
      }
      while (ps.length > want && ps[ps.length - 1].opacity < 0.01) ps.pop();

      // ── Move persons ────────────────────────────────────────────────────
      const speed = d.detected ? 0.07 + Math.min(d.variance * 0.55, 0.38) : 0.015;

      for (const p of ps) {
        p.opacity = Math.min(1, p.opacity + dt * 2);

        p.timer -= dt;
        if (p.timer <= 0) {
          p.targetAngle  = p.angle + (Math.random() - 0.5) * 1.4;
          p.targetRadius = MAX_R * (0.28 + Math.random() * 0.5);
          p.timer = 2 + Math.random() * 3.5;
        }

        p.angle  += (p.targetAngle  - p.angle)  * dt * speed * 2.5;
        p.radius += (p.targetRadius - p.radius) * dt * speed * 7;

        const { x, y } = cartesian(p.angle, p.radius);
        p.trail.push({ x, y, a: 1 });
        if (p.trail.length > 32) p.trail.shift();
        for (const t of p.trail) t.a *= 0.935;
      }

      // ── Pulse rings ─────────────────────────────────────────────────────
      pulseTimer.current -= dt;
      if (pulseTimer.current <= 0) {
        pulses.current.push({ r: 4, a: 0.75 });
        pulseTimer.current = d.detected ? 1.1 : 2.4;
      }
      for (const p of pulses.current) { p.r += dt * 85; p.a -= dt * 0.48; }
      pulses.current = pulses.current.filter(p => p.a > 0.01 && p.r < MAX_R + 30);

      // ── Render ──────────────────────────────────────────────────────────
      drawBackground(ctx);
      drawPulses(ctx, pulses.current, d.detected);
      drawSensor(ctx, elapsed, d.detected, d.calibrating);
      drawPersons(ctx, ps);
      drawHUD(ctx, d);

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
    />
  );
}
