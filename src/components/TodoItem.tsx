"use client";

import { useState, KeyboardEvent } from "react";
import { Todo, Priority } from "@/types/todo";
import PomodoroTimer from "@/components/PomodoroTimer";
import { usePomodoro } from "@/hooks/usePomodoro";

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  initialPomodoroCount?: number;
}

const priorityBadge: Record<Priority, string> = {
  low: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
  medium: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400",
  high: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
};

const priorityLabel: Record<Priority, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};

export default function TodoItem({ todo, onToggle, onDelete, onEdit, dragHandleProps, isDragging, initialPomodoroCount = 0 }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(initialPomodoroCount);
  const pomodoro = usePomodoro({ onComplete: () => setPomodoroCount((c) => c + 1) });

  const handleEditSave = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText);
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleEditSave();
    if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group rounded-xl border transition ${
        isDragging
          ? "opacity-50 shadow-lg scale-[1.02] border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/30"
          : todo.completed
          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800"
      }`}
    >
    <div className="flex items-center gap-3 p-3.5">
      <button
        {...dragHandleProps}
        aria-label="드래그 핸들"
        className="flex-shrink-0 p-0.5 text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500 cursor-grab active:cursor-grabbing focus:outline-none transition"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </button>
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
          todo.completed
            ? "bg-indigo-500 border-indigo-500"
            : "border-gray-300 dark:border-gray-600 hover:border-indigo-400"
        }`}
      >
        {todo.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleEditKeyDown}
            className="w-full px-2 py-0.5 rounded-lg border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
        ) : (
          <span
            onDoubleClick={() => !todo.completed && setIsEditing(true)}
            className={`block truncate text-sm ${
              todo.completed
                ? "line-through text-gray-400 dark:text-gray-500"
                : "text-gray-800 dark:text-gray-100"
            }`}
          >
            {todo.text}
          </span>
        )}
      </div>

      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityBadge[todo.priority]}`}>
        {priorityLabel[todo.priority]}
      </span>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => setIsPomodoroOpen((o) => !o)}
          aria-label={`포모도로 타이머${isPomodoroOpen ? " 닫기" : " 열기"}`}
          className="p-1 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition relative"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {pomodoroCount > 0 && (
            <span className="absolute -top-1 -right-1 text-[10px] w-4 h-4 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold">
              {pomodoroCount}
            </span>
          )}
        </button>
        {!todo.completed && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
            title="편집"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(todo.id)}
          className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
          title="삭제"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    {isPomodoroOpen && (
      <div className="px-3.5 pb-3">
        <PomodoroTimer
          state={pomodoro.state}
          remainingSeconds={pomodoro.remainingSeconds}
          completedCount={pomodoro.completedCount}
          formattedTime={pomodoro.formattedTime}
          isRunning={pomodoro.isRunning}
          isBreak={pomodoro.isBreak}
          isPaused={pomodoro.isPaused}
          onStart={pomodoro.start}
          onPause={pomodoro.pause}
          onReset={pomodoro.reset}
        />
      </div>
    )}
    </div>
  );
}
