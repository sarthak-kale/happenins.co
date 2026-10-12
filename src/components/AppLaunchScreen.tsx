import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LogoIcon } from "./Logo";

interface AppLaunchScreenProps {
  isAppReady: boolean;
  onComplete: () => void;
}

export const AppLaunchScreen: React.FC<AppLaunchScreenProps> = ({
  isAppReady,
  onComplete,
}) => {
  const [shouldExit, setShouldExit] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [writingComplete, setWritingComplete] = useState(false);

  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener?.("change", handleMediaChange);

    // Apple "hello" handwriting sequence duration (~1.7s)
    const writeDuration = mediaQuery.matches ? 200 : 1700;
    const minHoldDuration = mediaQuery.matches ? 250 : 2000;
    const startTime = Date.now();

    const writeTimer = setTimeout(() => {
      setWritingComplete(true);
    }, writeDuration);

    let checkInterval: NodeJS.Timeout;
    let safetyTimeout: NodeJS.Timeout;

    // Periodically check if app is ready and handwriting animation has finished
    checkInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= minHoldDuration && isAppReady) {
        setShouldExit(true);
        clearInterval(checkInterval);
      }
    }, 50);

    // Safety fallback timeout (max 4.0s) to guarantee user never gets stuck
    safetyTimeout = setTimeout(() => {
      setShouldExit(true);
    }, 4000);

    return () => {
      clearTimeout(writeTimer);
      clearInterval(checkInterval);
      clearTimeout(safetyTimeout);
      mediaQuery.removeEventListener?.("change", handleMediaChange);
    };
  }, [isAppReady]);

  useEffect(() => {
    if (shouldExit) {
      const exitDelay = prefersReducedMotion ? 120 : 350;
      const timer = setTimeout(() => {
        onComplete();
      }, exitDelay);

      return () => clearTimeout(timer);
    }
  }, [shouldExit, prefersReducedMotion, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{
        opacity: shouldExit ? 0 : 1,
        scale: shouldExit && !prefersReducedMotion ? 1.02 : 1,
      }}
      transition={{
        duration: prefersReducedMotion ? 0.15 : 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#060608] text-white select-none overflow-hidden"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      {/* Deep obsidian atmosphere matching District theme */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Core Crimson Accent Glow */}
        <motion.div
          animate={!prefersReducedMotion ? {
            scale: [0.95, 1.15, 0.95],
            opacity: [0.25, 0.45, 0.25]
          } : undefined}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#e23744]/20 via-[#ff2a54]/10 to-transparent blur-[130px]"
        />
        {/* Ambient Subtle Center Glow */}
        <div className="absolute w-[350px] h-[350px] rounded-full bg-[#e23744]/10 blur-[100px]" />
      </div>

      {/* Main Apple "hello" style handwritten brand container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Brand Emblem - Subtle entrance above */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0.2 : 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mb-4 drop-shadow-[0_0_25px_rgba(226,55,68,0.4)]"
        >
          <LogoIcon size={68} animated={!prefersReducedMotion} variant="dark" />
        </motion.div>

        {/* Apple "hello" Cursive "happenins" Handwritten Animation */}
        <div className="relative flex items-center justify-center min-h-[110px]">
          <svg
            viewBox="0 0 520 140"
            className="w-[290px] sm:w-[420px] md:w-[500px] h-auto overflow-visible filter drop-shadow-[0_0_30px_rgba(226,55,68,0.35)]"
          >
            <defs>
              <linearGradient id="apple-happenins-dark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#ffffff" />
                <stop offset="75%" stopColor="#ff5c77" />
                <stop offset="100%" stopColor="#e23744" />
              </linearGradient>

              {/* Reveal clip path sliding left-to-right as if written live by hand */}
              <clipPath id="happenins-write-clip">
                <motion.rect
                  x="0"
                  y="0"
                  height="140"
                  initial={{ width: prefersReducedMotion ? "100%" : "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: prefersReducedMotion ? 0.2 : 1.7,
                    ease: [0.25, 0.1, 0.25, 1.0], // Apple custom smooth handwriting ease curve
                  }}
                />
              </clipPath>
            </defs>

            {/* Handwritten cursive text revealed letter by letter */}
            <g clipPath="url(#happenins-write-clip)">
              <text
                x="260"
                y="92"
                textAnchor="middle"
                style={{
                  fontFamily: "'Alex Brush', 'Dancing Script', 'Caveat', 'Sacramento', cursive",
                  fontSize: "96px",
                  fontWeight: "700",
                  letterSpacing: "0.01em",
                }}
                fill="url(#apple-happenins-dark-grad)"
              >
                happenins
              </text>
            </g>

            {/* Glowing Writing Pen Tip Dot guiding the stroke */}
            {!prefersReducedMotion && (
              <motion.circle
                cy="80"
                r="4"
                fill="#ff2a54"
                className="filter drop-shadow-[0_0_12px_#ff2a54]"
                initial={{ cx: 20, opacity: 0 }}
                animate={{
                  cx: [20, 490],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 1.7,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
              />
            )}
          </svg>
        </div>

        {/* Elegant Flourish Line underneath that gently fades in when writing completes */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{
            opacity: writingComplete || prefersReducedMotion ? 0.9 : 0,
            scaleX: writingComplete || prefersReducedMotion ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-28 h-[2px] bg-gradient-to-r from-transparent via-[#e23744] to-transparent rounded-full mt-2 shadow-[0_0_12px_rgba(226,55,68,0.8)]"
        />
      </div>
    </motion.div>
  );
};

