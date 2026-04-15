"use client";

import { PomodoroState } from "@/types/pomodoro";

interface PomodoroTimerProps {
  state: PomodoroState;
  completedCount: number;
  formattedTime: string;
  isBreak: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function PomodoroTimer({
  state,
  completedCount,
  formattedTime,
  isBreak,
  onStart,
  onPause,
  onReset,
}: PomodoroTimerProps) {
  const isIdle = state === "idle";
  const isRunning = state === "running";
  const isPaused = state === "paused";

  return (
    <div
      data-testid="pomodoro-timer"
      className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-mono font-semibold text-gray-800 dark:text-gray-100">
          {formattedTime}
        </span>

        {isBreak && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            휴식 중
          </span>
        )}

        {completedCount > 0 && (
          <span
            data-testid="pomodoro-count"
            className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 font-medium"
          >
            {completedCount}
          </span>
        )}

        <div className="flex gap-1 ml-auto">
          {(isIdle || isPaused) && (
            <button
              onClick={onStart}
              aria-label={isPaused ? "재개" : "시작"}
              className="px-2 py-1 text-xs rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition"
            >
              {isPaused ? "재개" : "시작"}
            </button>
          )}

          {isRunning && (
            <button
              onClick={onPause}
              aria-label="일시정지"
              className="px-2 py-1 text-xs rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition"
            >
              일시정지
            </button>
          )}

          <button
            onClick={onReset}
            aria-label="리셋"
            disabled={isIdle}
            className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            리셋
          </button>
        </div>
      </div>
    </div>
  );
}
