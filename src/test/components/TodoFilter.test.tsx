import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoFilter from "@/components/TodoFilter";

describe("TodoFilter", () => {
  const onFilterChange = vi.fn();
  const onClearCompleted = vi.fn();
  const user = userEvent.setup();

  const defaultProps = {
    filter: "all" as const,
    onFilterChange,
    activeCount: 3,
    completedCount: 2,
    onClearCompleted,
  };

  beforeEach(() => {
    onFilterChange.mockClear();
    onClearCompleted.mockClear();
  });

  describe("렌더링", () => {
    it("activeCount를 표시한다", () => {
      render(<TodoFilter {...defaultProps} />);
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("필터 버튼 3개(전체, 진행 중, 완료)를 표시한다", () => {
      render(<TodoFilter {...defaultProps} />);
      expect(screen.getByRole("button", { name: "전체" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "진행 중" })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "완료" })).toBeInTheDocument();
    });

    it("'완료 삭제' 버튼을 표시한다", () => {
      render(<TodoFilter {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "완료 삭제" })
      ).toBeInTheDocument();
    });
  });

  describe("활성 필터 스타일", () => {
    it("현재 필터('all')에 해당하는 '전체' 버튼에 active 클래스가 적용된다", () => {
      render(<TodoFilter {...defaultProps} filter="all" />);
      expect(screen.getByRole("button", { name: "전체" })).toHaveClass(
        "bg-indigo-600"
      );
    });

    it("현재 필터('active')에 해당하는 '진행 중' 버튼에 active 클래스가 적용된다", () => {
      render(<TodoFilter {...defaultProps} filter="active" />);
      expect(screen.getByRole("button", { name: "진행 중" })).toHaveClass(
        "bg-indigo-600"
      );
    });

    it("현재 필터('completed')에 해당하는 '완료' 버튼에 active 클래스가 적용된다", () => {
      render(<TodoFilter {...defaultProps} filter="completed" />);
      expect(screen.getByRole("button", { name: "완료" })).toHaveClass(
        "bg-indigo-600"
      );
    });

    it("비활성 필터 버튼에는 active 클래스가 없다", () => {
      render(<TodoFilter {...defaultProps} filter="all" />);
      expect(screen.getByRole("button", { name: "진행 중" })).not.toHaveClass(
        "bg-indigo-600"
      );
      expect(screen.getByRole("button", { name: "완료" })).not.toHaveClass(
        "bg-indigo-600"
      );
    });
  });

  describe("필터 변경", () => {
    it("'진행 중' 클릭 시 onFilterChange('active')가 호출된다", async () => {
      render(<TodoFilter {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: "진행 중" }));
      expect(onFilterChange).toHaveBeenCalledWith("active");
    });

    it("'완료' 클릭 시 onFilterChange('completed')가 호출된다", async () => {
      render(<TodoFilter {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: "완료" }));
      expect(onFilterChange).toHaveBeenCalledWith("completed");
    });

    it("'전체' 클릭 시 onFilterChange('all')가 호출된다", async () => {
      render(<TodoFilter {...defaultProps} filter="active" />);
      await user.click(screen.getByRole("button", { name: "전체" }));
      expect(onFilterChange).toHaveBeenCalledWith("all");
    });
  });

  describe("완료 삭제 버튼", () => {
    it("completedCount가 0이면 '완료 삭제' 버튼이 비활성화된다", () => {
      render(<TodoFilter {...defaultProps} completedCount={0} />);
      expect(
        screen.getByRole("button", { name: "완료 삭제" })
      ).toBeDisabled();
    });

    it("completedCount가 1 이상이면 '완료 삭제' 버튼이 활성화된다", () => {
      render(<TodoFilter {...defaultProps} completedCount={1} />);
      expect(
        screen.getByRole("button", { name: "완료 삭제" })
      ).toBeEnabled();
    });

    it("'완료 삭제' 클릭 시 onClearCompleted가 호출된다", async () => {
      render(<TodoFilter {...defaultProps} />);
      await user.click(screen.getByRole("button", { name: "완료 삭제" }));
      expect(onClearCompleted).toHaveBeenCalledTimes(1);
    });
  });
});
