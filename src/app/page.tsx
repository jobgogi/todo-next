"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTodos } from "@/hooks/useTodos";
import TodoInput from "@/components/TodoInput";
import TodoFilter from "@/components/TodoFilter";
import SortableTodoItem from "@/components/SortableTodoItem";

export default function Home() {
  const {
    todos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    reorderTodos,
    activeCount,
    completedCount,
    totalCount,
  } = useTodos();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTodos(String(active.id), String(over.id));
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-start justify-center pt-16 pb-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            할 일 목록
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            오늘도 하나씩 해내봐요
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-5">
          <TodoInput onAdd={addTodo} />

          {totalCount > 0 && (
            <TodoFilter
              filter={filter}
              onFilterChange={setFilter}
              activeCount={activeCount}
              completedCount={completedCount}
              onClearCompleted={clearCompleted}
            />
          )}

          <div className="flex flex-col gap-2">
            {todos.length === 0 ? (
              <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                <svg
                  className="w-10 h-10 mx-auto mb-3 opacity-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm">
                  {totalCount === 0
                    ? "할 일을 추가해보세요!"
                    : "해당 항목이 없습니다."}
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={todos.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {todos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                      onEdit={editTodo}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {totalCount > 0 && (
            <p className="text-center text-xs text-gray-300 dark:text-gray-700">
              전체 {totalCount}개 · 완료 {completedCount}개
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
