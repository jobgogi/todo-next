"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PomodoroState } from "@/types/pomodoro";

interface UsePomodoroOptions {
  workSeconds?: number;
  breakSeconds?: number;
  onComplete?: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function usePomodoro(options: UsePomodoroOptions = {}) {
  const { workSeconds = 25 * 60, breakSeconds = 5 * 60, onComplete } = options;

  const [state, setState] = useState<PomodoroState>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(workSeconds);
  const [completedCount, setCompletedCount] = useState(0);

  const workSecondsRef = useRef(workSeconds);
  const breakSecondsRef = useRef(breakSeconds);
  const onCompleteRef = useRef(onComplete);
  workSecondsRef.current = workSeconds;
  breakSecondsRef.current = breakSeconds;
  onCompleteRef.current = onComplete;

  // Timer ticks while running OR during break
  useEffect(() => {
    if (state !== "running" && state !== "break") return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [state]);

  // Session completion: triggered when remainingSeconds hits 0
  useEffect(() => {
    if (remainingSeconds !== 0) return;

    if (state === "running") {
      // Work session complete → switch to break
      setCompletedCount((c) => c + 1);
      onCompleteRef.current?.();
      setState("break");
      setRemainingSeconds(breakSecondsRef.current);
    } else if (state === "break") {
      // Break session complete → back to idle
      setState("idle");
      setRemainingSeconds(workSecondsRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds]);

  const start = useCallback(() => {
    setState((prev) => {
      if (prev === "idle" || prev === "paused") return "running";
      return prev;
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => {
      if (prev === "running") return "paused";
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setRemainingSeconds(workSecondsRef.current);
  }, []);

  return {
    state,
    remainingSeconds,
    completedCount,
    formattedTime: formatTime(remainingSeconds),
    isRunning: state === "running",
    isBreak: state === "break",
    isPaused: state === "paused",
    start,
    pause,
    reset,
  };
}
