"use client";

import React, { useState, MouseEvent } from "react";

export default function InteractiveDotGrid() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: "oklch(0.141 0.005 285.823)" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base static dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(oklch(0.28 0.006 285) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Cyan-tinted spotlight layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(oklch(0.65 0.18 200 / 0.7) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 300ms ease",
          maskImage: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
        }}
      />

      {/* Radial vignette — darkens edges so content pops */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, oklch(0.141 0.005 285.823 / 0.7) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}