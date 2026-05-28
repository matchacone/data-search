"use client";

import React, { useState, MouseEvent } from "react";

export default function InteractiveDotGrid() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    // Calculate mouse position relative to the container
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden bg-white dark:bg-zinc-950"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Base static grid (Subtle) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* 2. Interactive spotlight grid (Brighter) */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] dark:bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:24px_24px] transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          // This creates a circular cutout revealing the brighter dots beneath
          maskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
        }}
      />
    </div>
  );
}