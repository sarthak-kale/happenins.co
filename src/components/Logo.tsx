import React from "react";
import { motion } from "motion/react";

interface LogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
  variant?: "dark" | "light";
}

export const LogoIcon: React.FC<LogoProps> = ({
  className = "",
  size = 40,
  animated = true,
  variant = "dark",
}) => {
  const isLight = variant === "light";

  return (
    <motion.div
      className={`relative select-none flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      whileHover={animated ? { scale: 1.06, filter: "brightness(1.12)" } : undefined}
      whileTap={animated ? { scale: 0.96 } : undefined}
      initial={animated ? { opacity: 0, scale: 0.9 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={animated ? { type: "spring", stiffness: 260, damping: 20 } : undefined}
    >
      {/* Luxury Nightlife Ambient Glow */}
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#e23744] via-[#ff2a54] to-transparent opacity-30 blur-lg pointer-events-none"
      />

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_4px_16px_rgba(226,55,68,0.35)]"
      >
        <defs>
          {/* Outer Squircle Rim Gradient */}
          <linearGradient id={`happenins-rim-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.28)" />
            <stop offset="45%" stopColor="rgba(255, 255, 255, 0.06)" />
            <stop offset="100%" stopColor="rgba(226, 55, 68, 0.45)" />
          </linearGradient>

          {/* Obsidian Container Base Fill */}
          <linearGradient id={`happenins-base-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLight ? "#f4f4f7" : "#14141c"} />
            <stop offset="100%" stopColor={isLight ? "#e4e4e9" : "#09090e"} />
          </linearGradient>

          {/* Platinum Left Pillar Gradient */}
          <linearGradient id={`happenins-pillar-left-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e2e4ea" />
            <stop offset="100%" stopColor="#989ca8" />
          </linearGradient>

          {/* Platinum Right Pillar Gradient with Crimson Bounce */}
          <linearGradient id={`happenins-pillar-right-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#e2e4ea" />
            <stop offset="100%" stopColor="#ff4b60" />
          </linearGradient>

          {/* Electric Crimson Core Bridge Gradient */}
          <linearGradient id={`happenins-bridge-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff2a54" />
            <stop offset="50%" stopColor="#e23744" />
            <stop offset="100%" stopColor="#c51624" />
          </linearGradient>
        </defs>

        {/* 1. Precision Obsidian Glass Squircle Shield */}
        <rect
          x="7"
          y="7"
          width="86"
          height="86"
          rx="22"
          fill={`url(#happenins-base-${variant})`}
          stroke={`url(#happenins-rim-${variant})`}
          strokeWidth="1.5"
        />

        {/* 2. Inner Subtle Shading Line */}
        <rect
          x="9"
          y="9"
          width="82"
          height="82"
          rx="20"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1"
        />

        {/* 3. Luxury Prismatic "H" Monogram */}
        <g id="h-monogram">
          {/* Left Architectural Pillar with Angled Crown */}
          <motion.path
            d="M 28 73 L 28 32 C 28 29.5 29.5 27 32 25 L 39 20 C 40.5 19 43 20 43 22 L 43 73 C 43 75.8 40.8 78 38 78 L 33 78 C 30.2 78 28 75.8 28 73 Z"
            fill={`url(#happenins-pillar-left-${variant})`}
            initial={animated ? { scaleY: 0, originY: 1 } : undefined}
            animate={animated ? { scaleY: 1 } : undefined}
            transition={animated ? { duration: 0.45, ease: [0.16, 1, 0.3, 1] } : undefined}
          />

          {/* Left Pillar Specular Bevel Highlight */}
          <path
            d="M 38 20.8 L 42 22 L 42 73 C 42 75.2 40.5 77 38 77 L 37.5 77 L 37.5 24 Z"
            fill="rgba(255, 255, 255, 0.22)"
          />

          {/* Right Architectural Pillar with Angled Foundation */}
          <motion.path
            d="M 57 27 C 57 24.2 59.2 22 62 22 L 67 22 C 69.8 22 72 24.2 72 27 L 72 68 C 72 70.5 70.5 73 68 75 L 61 80 C 59.5 81 57 80 57 78 Z"
            fill={`url(#happenins-pillar-right-${variant})`}
            initial={animated ? { scaleY: 0, originY: 0 } : undefined}
            animate={animated ? { scaleY: 1 } : undefined}
            transition={animated ? { duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] } : undefined}
          />

          {/* Right Pillar Specular Highlight */}
          <path
            d="M 57 27 L 61 27 L 61 76.5 L 57 78 Z"
            fill="rgba(255, 255, 255, 0.16)"
          />

          {/* Electric Nightlife Core Bridge */}
          <motion.path
            d="M 37 45.5 L 63 45.5 C 65.2 45.5 67 47.3 67 49.5 L 67 52.5 C 67 54.7 65.2 56.5 63 56.5 L 37 56.5 C 34.8 56.5 33 54.7 33 52.5 L 33 49.5 C 33 47.3 34.8 45.5 37 45.5 Z"
            fill={`url(#happenins-bridge-${variant})`}
            initial={animated ? { scaleX: 0, originX: 0.5 } : undefined}
            animate={animated ? { scaleX: 1 } : undefined}
            transition={animated ? { duration: 0.35, delay: 0.16, ease: "easeOut" } : undefined}
          />

          {/* Bridge Top Specular Edge */}
          <line
            x1="37"
            y1="46"
            x2="63"
            y2="46"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Center 4-Point Celestial Live Event Spark */}
          <motion.path
            d="M 50 41.5 L 52.2 48.2 L 58.5 50.5 L 52.2 52.8 L 50 59.5 L 47.8 52.8 L 41.5 50.5 L 47.8 48.2 Z"
            fill="#ffffff"
            className="filter drop-shadow-[0_0_5px_#ffffff]"
            initial={animated ? { scale: 0, rotate: -45 } : undefined}
            animate={animated ? { scale: 1, rotate: 0 } : undefined}
            transition={animated ? { duration: 0.35, delay: 0.24, type: "spring", stiffness: 300 } : undefined}
          />
        </g>
      </svg>
    </motion.div>
  );
};

export const LogoFull: React.FC<LogoProps & { textClassName?: string }> = ({
  className = "",
  size = 36,
  animated = true,
  variant = "dark",
  textClassName = "",
}) => {
  const isLight = variant === "light";

  return (
    <motion.div 
      className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}
      initial={animated ? { opacity: 0, x: -6 } : undefined}
      animate={animated ? { opacity: 1, x: 0 } : undefined}
      transition={animated ? { duration: 0.35, ease: "easeOut" } : undefined}
    >
      <LogoIcon size={size} animated={animated} variant={variant} />
      <div className="flex flex-col justify-center">
        <span className={`text-lg sm:text-xl font-display font-black tracking-tight flex items-center leading-none ${
          isLight ? "text-slate-900" : "text-white"
        } ${textClassName}`}>
          <span className="tracking-tight">HAPPEN</span>
          <span className="text-[#e23744] ml-[1.5px] tracking-tight">INS</span>
        </span>
      </div>
    </motion.div>
  );
};
