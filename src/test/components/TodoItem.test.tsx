import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoItem from "@/components/TodoItem";
import { Todo } from "@/types/todo";

const baseTodo: Todo = {
  id: "test-id-1",
  text: "테스트 할 일",
  completed: false,
  priority: "medium",
  createdAt: new Date("2024-01-01"),
};

// 드래그 핸들이 index 0, 토글 버튼이 index 1
function getToggleButton() {
  return screen.getAllByRole("button")[1];
}

describe("TodoItem", () => {
  const onToggle = vi.fn();
  const onDelete = vi.fn();
  const onEdit = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    onToggle.mockClear();
    onDelete.mockClear();
    onEdit.mockClear();
  });

  describe("렌더링", () => {
    it("할 일 텍스트를 표시한다", () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      expect(screen.getByText("테스트 할 일")).toBeInTheDocument();
    });

    it("우선순위 배지를 표시한다 — medium은 '보통'", () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      expect(screen.getByText("보통")).toBeInTheDocument();
    });

    it("우선순위 low는 '낮음' 배지를 표시한다", () => {
      render(
        <TodoItem
          todo={{ ...baseTodo, priority: "low" }}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      expect(screen.getByText("낮음")).toBeInTheDocument();
    });

    it("우선순위 high는 '높음' 배지를 표시한다", () => {
      render(
        <TodoItem
          todo={{ ...baseTodo, priority: "high" }}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      expect(screen.getByText("높음")).toBeInTheDocument();
    });

    it("미완료 항목에는 취소선이 없다", () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      expect(screen.getByText("테스트 할 일")).not.toHaveClass("line-through");
    });

    it("완료 항목에는 취소선 스타일이 적용된다", () => {
      render(
        <TodoItem
          todo={{ ...baseTodo, completed: true }}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      expect(screen.getByText("테스트 할 일")).toHaveClass("line-through");
    });
  });

  describe("드래그 핸들", () => {
    it("드래그 핸들 버튼을 렌더링한다", () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      expect(
        screen.getByRole("button", { name: "드래그 핸들" })
      ).toBeInTheDocument();
    });

    it("dragHandleProps가 드래그 핸들 버튼에 전달된다", () => {
      const dragHandleProps = { "data-testid": "drag-handle", tabIndex: 0 };
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          dragHandleProps={dragHandleProps as React.HTMLAttributes<HTMLButtonElement>}
        />
      );
      expect(screen.getByTestId("drag-handle")).toBeInTheDocument();
    });

    it("isDragging=true 이면 컨테이너에 opacity-50 클래스가 적용된다", () => {
      const { container } = render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          isDragging
        />
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("opacity-50");
    });

    it("isDragging=false 이면 opacity-50 클래스가 없다", () => {
      const { container } = render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          isDragging={false}
        />
      );
      const root = container.firstChild as HTMLElement;
      expect(root).not.toHaveClass("opacity-50");
    });
  });

  describe("토글", () => {
    it("완료 버튼 클릭 시 onToggle이 id와 함께 호출된다", async () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      await user.click(getToggleButton());
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledWith("test-id-1");
    });
  });

  describe("삭제", () => {
    it("삭제 버튼 클릭 시 onDelete가 id와 함께 호출된다", async () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      await user.click(screen.getByTitle("삭제"));
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith("test-id-1");
    });

    it("완료 상태에서도 삭제 버튼이 동작한다", async () => {
      render(
        <TodoItem
          todo={{ ...baseTodo, completed: true }}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      await user.click(screen.getByTitle("삭제"));
      expect(onDelete).toHaveBeenCalledWith("test-id-1");
    });
  });

  describe("편집", () => {
    it("텍스트 더블클릭 시 편집 인풋으로 전환된다", async () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      await user.dblClick(screen.getByText("테스트 할 일"));
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue("테스트 할 일");
    });

    it("편집 버튼 클릭 시 편집 모드로 전환된다", async () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      await user.click(screen.getByTitle("편집"));
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("편집 후 Enter 키 입력 시 onEdit이 호출된다", async () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      await user.dblClick(screen.getByText("테스트 할 일"));
      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "수정된 할 일{Enter}");
      expect(onEdit).toHaveBeenCalledWith("test-id-1", "수정된 할 일");
    });

    it("편집 후 blur 시 onEdit이 호출된다", async () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      await user.dblClick(screen.getByText("테스트 할 일"));
      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "수정된 할 일");
      await user.tab();
      expect(onEdit).toHaveBeenCalledWith("test-id-1", "수정된 할 일");
    });

    it("Escape 키 입력 시 편집이 취소되고 원본 텍스트가 복원된다", async () => {
      render(
        <TodoItem
          todo={baseTodo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      await user.dblClick(screen.getByText("테스트 할 일"));
      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "수정 중인 텍스트{Escape}");
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.getByText("테스트 할 일")).toBeInTheDocument();
    });

    it("완료 항목은 더블클릭으로 편집 모드가 활성화되지 않는다", async () => {
      render(
        <TodoItem
          todo={{ ...baseTodo, completed: true }}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      await user.dblClick(screen.getByText("테스트 할 일"));
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("완료 항목에는 편집 버튼이 표시되지 않는다", () => {
      render(
        <TodoItem
          todo={{ ...baseTodo, completed: true }}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      );
      expect(screen.queryByTitle("편집")).not.toBeInTheDocument();
    });
  });
});
