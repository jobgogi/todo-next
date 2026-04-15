import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableTodoItem from "@/components/SortableTodoItem";
import { Todo } from "@/types/todo";

const todo: Todo = {
  id: "sortable-id-1",
  text: "정렬 가능한 할 일",
  completed: false,
  priority: "medium",
  createdAt: new Date("2024-01-01"),
};

// SortableTodoItem은 DndContext + SortableContext 안에서만 동작
function renderSortable(t: Todo = todo) {
  return render(
    <DndContext>
      <SortableContext items={[t.id]} strategy={verticalListSortingStrategy}>
        <SortableTodoItem
          todo={t}
          onToggle={vi.fn()}
          onDelete={vi.fn()}
          onEdit={vi.fn()}
        />
      </SortableContext>
    </DndContext>
  );
}

describe("SortableTodoItem", () => {
  describe("렌더링", () => {
    it("TodoItem 콘텐츠를 정상적으로 렌더링한다", () => {
      renderSortable();
      expect(screen.getByText("정렬 가능한 할 일")).toBeInTheDocument();
    });

    it("드래그 핸들 버튼을 포함한다", () => {
      renderSortable();
      expect(
        screen.getByRole("button", { name: "드래그 핸들" })
      ).toBeInTheDocument();
    });

    it("우선순위 배지를 표시한다", () => {
      renderSortable();
      expect(screen.getByText("보통")).toBeInTheDocument();
    });

    it("완료 상태 항목을 렌더링한다", () => {
      renderSortable({ ...todo, completed: true });
      expect(screen.getByText("정렬 가능한 할 일")).toHaveClass("line-through");
    });
  });

  describe("콜백 연결", () => {
    it("토글 버튼 클릭 시 onToggle이 호출된다", async () => {
      const onToggle = vi.fn();
      const { getByRole } = render(
        <DndContext>
          <SortableContext items={[todo.id]} strategy={verticalListSortingStrategy}>
            <SortableTodoItem
              todo={todo}
              onToggle={onToggle}
              onDelete={vi.fn()}
              onEdit={vi.fn()}
            />
          </SortableContext>
        </DndContext>
      );
      // 드래그 핸들(index 0) 다음 버튼이 토글
      const buttons = screen.getAllByRole("button");
      const toggleBtn = buttons[1];
      await import("@testing-library/user-event").then(async ({ default: userEvent }) => {
        await userEvent.setup().click(toggleBtn);
      });
      expect(onToggle).toHaveBeenCalledWith("sortable-id-1");
    });

    it("삭제 버튼 클릭 시 onDelete가 호출된다", async () => {
      const onDelete = vi.fn();
      render(
        <DndContext>
          <SortableContext items={[todo.id]} strategy={verticalListSortingStrategy}>
            <SortableTodoItem
              todo={todo}
              onToggle={vi.fn()}
              onDelete={onDelete}
              onEdit={vi.fn()}
            />
          </SortableContext>
        </DndContext>
      );
      await import("@testing-library/user-event").then(async ({ default: userEvent }) => {
        await userEvent.setup().click(screen.getByTitle("삭제"));
      });
      expect(onDelete).toHaveBeenCalledWith("sortable-id-1");
    });
  });

  describe("접근성", () => {
    it("드래그 핸들에 aria-label이 있다", () => {
      renderSortable();
      const handle = screen.getByRole("button", { name: "드래그 핸들" });
      expect(handle).toHaveAttribute("aria-label", "드래그 핸들");
    });

    it("드래그 핸들에 dnd-kit이 주입한 aria 속성이 있다", () => {
      renderSortable();
      const handle = screen.getByRole("button", { name: "드래그 핸들" });
      // useSortable이 role="button"과 aria-roledescription 등을 주입
      expect(handle).toHaveAttribute("aria-roledescription");
    });
  });
});
