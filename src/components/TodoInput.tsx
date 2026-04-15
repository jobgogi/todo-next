"use client";

import { useState, KeyboardEvent } from "react";
import { Priority } from "@/types/todo";

interface TodoInputProps {
  onAdd: (text: string, priority: Priority) => void;
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: "낮음", color: "text-blue-500" },
  medium: { label: "보통", color: "text-yellow-500" },
  high: { label: "높음", color: "text-red-500" },
};

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text, priority);
    setText("");
    setPriority("medium");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="새로운 할 일을 입력하세요..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition"
        >
          추가
        </button>
      </div>
      <div className="flex gap-2">
        {(Object.keys(priorityConfig) as Priority[]).map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium border-2 transition ${
              priority === p
                ? `border-current ${priorityConfig[p].color} bg-current/10`
                : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
            }`}
          >
            <span className={priority === p ? priorityConfig[p].color : ""}>
              {priorityConfig[p].label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
