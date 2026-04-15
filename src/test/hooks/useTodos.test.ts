import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTodos } from "@/hooks/useTodos";

describe("useTodos", () => {
  describe("초기 상태", () => {
    it("빈 목록과 'all' 필터로 초기화된다", () => {
      const { result } = renderHook(() => useTodos());

      expect(result.current.todos).toEqual([]);
      expect(result.current.filter).toBe("all");
      expect(result.current.totalCount).toBe(0);
      expect(result.current.activeCount).toBe(0);
      expect(result.current.completedCount).toBe(0);
    });
  });

  describe("addTodo", () => {
    it("새 할 일을 목록 맨 앞에 추가한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("첫 번째 할 일", "medium");
      });
      act(() => {
        result.current.addTodo("두 번째 할 일", "high");
      });

      expect(result.current.todos).toHaveLength(2);
      expect(result.current.todos[0].text).toBe("두 번째 할 일");
      expect(result.current.todos[1].text).toBe("첫 번째 할 일");
    });

    it("추가된 할 일은 completed: false 상태이다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("테스트 할 일", "low");
      });

      expect(result.current.todos[0].completed).toBe(false);
    });

    it("추가된 할 일에 지정한 우선순위가 설정된다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("높은 우선순위", "high");
      });

      expect(result.current.todos[0].priority).toBe("high");
    });

    it("앞뒤 공백을 제거하여 추가한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("  공백 포함  ", "medium");
      });

      expect(result.current.todos[0].text).toBe("공백 포함");
    });

    it("할 일 추가 시 totalCount와 activeCount가 증가한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("할 일 1", "medium");
        result.current.addTodo("할 일 2", "low");
      });

      expect(result.current.totalCount).toBe(2);
      expect(result.current.activeCount).toBe(2);
    });
  });

  describe("toggleTodo", () => {
    it("미완료 할 일을 완료로 전환한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("할 일", "medium");
      });
      const id = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(id);
      });

      expect(result.current.todos[0].completed).toBe(true);
    });

    it("완료된 할 일을 미완료로 전환한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("할 일", "medium");
      });
      const id = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(id);
      });
      act(() => {
        result.current.toggleTodo(id);
      });

      expect(result.current.todos[0].completed).toBe(false);
    });

    it("토글 후 activeCount와 completedCount가 갱신된다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("할 일", "medium");
      });
      const id = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(id);
      });

      expect(result.current.activeCount).toBe(0);
      expect(result.current.completedCount).toBe(1);
    });
  });

  describe("deleteTodo", () => {
    it("지정한 id의 할 일을 삭제한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("삭제할 할 일", "medium");
        result.current.addTodo("남길 할 일", "low");
      });
      const idToDelete = result.current.todos[0].id;

      act(() => {
        result.current.deleteTodo(idToDelete);
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe("삭제할 할 일");
    });

    it("삭제 후 totalCount가 감소한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("할 일", "medium");
      });
      const id = result.current.todos[0].id;

      act(() => {
        result.current.deleteTodo(id);
      });

      expect(result.current.totalCount).toBe(0);
    });
  });

  describe("editTodo", () => {
    it("지정한 id의 텍스트를 변경한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("원본 텍스트", "medium");
      });
      const id = result.current.todos[0].id;

      act(() => {
        result.current.editTodo(id, "수정된 텍스트");
      });

      expect(result.current.todos[0].text).toBe("수정된 텍스트");
    });

    it("수정 텍스트의 앞뒤 공백을 제거한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("원본", "medium");
      });
      const id = result.current.todos[0].id;

      act(() => {
        result.current.editTodo(id, "  수정  ");
      });

      expect(result.current.todos[0].text).toBe("수정");
    });
  });

  describe("clearCompleted", () => {
    it("완료된 할 일을 모두 삭제한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("완료 항목 1", "medium");
        result.current.addTodo("완료 항목 2", "high");
        result.current.addTodo("미완료 항목", "low");
      });

      // 최신 항목이 앞에 오므로: [미완료 항목(0), 완료 항목 2(1), 완료 항목 1(2)]
      const [id1, id2] = [
        result.current.todos[1].id, // 완료 항목 2
        result.current.todos[2].id, // 완료 항목 1
      ];

      act(() => {
        result.current.toggleTodo(id1);
        result.current.toggleTodo(id2);
      });
      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.totalCount).toBe(1);
      expect(result.current.todos[0].text).toBe("미완료 항목");
    });
  });

  describe("필터링", () => {
    beforeEach(() => {});

    it("'active' 필터는 미완료 항목만 반환한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("미완료 1", "medium");
        result.current.addTodo("완료될 항목", "high");
      });
      const idToComplete = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(idToComplete);
        result.current.setFilter("active");
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe("미완료 1");
    });

    it("'completed' 필터는 완료된 항목만 반환한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("미완료", "medium");
        result.current.addTodo("완료될 항목", "high");
      });
      const idToComplete = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(idToComplete);
        result.current.setFilter("completed");
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe("완료될 항목");
    });

    it("'all' 필터는 모든 항목을 반환한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("미완료", "medium");
        result.current.addTodo("완료될 항목", "high");
      });
      const idToComplete = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(idToComplete);
        result.current.setFilter("completed");
      });
      act(() => {
        result.current.setFilter("all");
      });

      expect(result.current.todos).toHaveLength(2);
    });

    it("필터 전환 시 totalCount는 변하지 않는다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("할 일 1", "medium");
        result.current.addTodo("할 일 2", "high");
      });

      act(() => {
        result.current.setFilter("active");
      });

      expect(result.current.totalCount).toBe(2);
    });
  });

  describe("reorderTodos", () => {
    it("activeId를 overId 위치로 이동한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("A", "low");
        result.current.addTodo("B", "medium");
        result.current.addTodo("C", "high");
      });
      // 최신순: [C(0), B(1), A(2)]
      const [idC, idB, idA] = result.current.todos.map((t) => t.id);

      // C를 A 위치로 이동 → [B, A, C]
      act(() => {
        result.current.reorderTodos(idC, idA);
      });

      expect(result.current.todos.map((t) => t.text)).toEqual(["B", "A", "C"]);
    });

    it("첫 번째 항목을 마지막으로 이동한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("A", "low");
        result.current.addTodo("B", "medium");
        result.current.addTodo("C", "high");
      });
      // [C(0), B(1), A(2)]
      const [idC, , idA] = result.current.todos.map((t) => t.id);

      // C(0)를 A(2) 위치로 → [B, A, C]
      act(() => {
        result.current.reorderTodos(idC, idA);
      });

      const texts = result.current.todos.map((t) => t.text);
      expect(texts[texts.length - 1]).toBe("C");
    });

    it("마지막 항목을 첫 번째로 이동한다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("A", "low");
        result.current.addTodo("B", "medium");
        result.current.addTodo("C", "high");
      });
      // [C(0), B(1), A(2)]
      const [idC, , idA] = result.current.todos.map((t) => t.id);

      // A(2)를 C(0) 위치로 → [A, C, B]
      act(() => {
        result.current.reorderTodos(idA, idC);
      });

      expect(result.current.todos[0].text).toBe("A");
    });

    it("activeId와 overId가 같으면 순서가 바뀌지 않는다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("A", "low");
        result.current.addTodo("B", "medium");
      });
      const before = result.current.todos.map((t) => t.text);
      const id = result.current.todos[0].id;

      act(() => {
        result.current.reorderTodos(id, id);
      });

      expect(result.current.todos.map((t) => t.text)).toEqual(before);
    });

    it("존재하지 않는 id로 호출하면 순서가 바뀌지 않는다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("A", "low");
        result.current.addTodo("B", "medium");
      });
      const before = result.current.todos.map((t) => t.text);

      act(() => {
        result.current.reorderTodos("없는-id", result.current.todos[0].id);
      });

      expect(result.current.todos.map((t) => t.text)).toEqual(before);
    });

    it("reorder 후 totalCount가 변하지 않는다", () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo("A", "low");
        result.current.addTodo("B", "medium");
        result.current.addTodo("C", "high");
      });
      const [idC, , idA] = result.current.todos.map((t) => t.id);

      act(() => {
        result.current.reorderTodos(idC, idA);
      });

      expect(result.current.totalCount).toBe(3);
    });
  });
});
