"use client";

import { FilterType } from "@/types/todo";

interface TodoFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
}

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행 중" },
  { value: "completed", label: "완료" },
];

export default function TodoFilter({
  filter,
  onFilterChange,
  activeCount,
  completedCount,
  onClearCompleted,
}: TodoFilterProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
        남은 할 일{" "}
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
          {activeCount}
        </span>
        개
      </span>

      <div className="flex gap-1">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              filter === value
                ? "bg-indigo-600 text-white"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={onClearCompleted}
        disabled={completedCount === 0}
        className="text-sm text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition flex-shrink-0"
      >
        완료 삭제
      </button>
    </div>
  );
}
