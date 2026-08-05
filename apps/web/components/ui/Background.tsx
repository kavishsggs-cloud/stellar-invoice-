"use client";

import React from "react";
import { motion } from "framer-motion";

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#06121F] overflow-hidden -z-50 pointer-events-none">
      {/* Dynamic Ambient Glowing Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#08B5E5]/10 blur-[130px]"
      />

      <motion.div
        animate={{
          x: [0, -60, 30, 0],
          y: [0, 40, -40, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-[#14D9C4]/8 blur-[140px]"
      />

      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, 60, 20, 0],
          scale: [1, 1.1, 0.8, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#7C5CFC]/8 blur-[120px]"
      />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Fine noise overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
    </div>
  );
};
