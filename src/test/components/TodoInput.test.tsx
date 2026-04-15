import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoInput from "@/components/TodoInput";

describe("TodoInput", () => {
  const onAdd = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    onAdd.mockClear();
  });

  describe("렌더링", () => {
    it("텍스트 입력창을 표시한다", () => {
      render(<TodoInput onAdd={onAdd} />);
      expect(
        screen.getByPlaceholderText("새로운 할 일을 입력하세요...")
      ).toBeInTheDocument();
    });

    it("추가 버튼을 표시한다", () => {
      render(<TodoInput onAdd={onAdd} />);
      expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
    });

    it("우선순위 버튼 3개(낮음, 보통, 높음)를 표시한다", () => {
      render(<TodoInput onAdd={onAdd} />);
      expect(screen.getByRole("button", { name: "낮음" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "보통" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "높음" })).toBeInTheDocument();
    });
  });

  describe("추가 버튼 활성화/비활성화", () => {
    it("입력값이 없으면 추가 버튼이 비활성화된다", () => {
      render(<TodoInput onAdd={onAdd} />);
      expect(screen.getByRole("button", { name: "추가" })).toBeDisabled();
    });

    it("텍스트를 입력하면 추가 버튼이 활성화된다", async () => {
      render(<TodoInput onAdd={onAdd} />);
      await user.type(screen.getByRole("textbox"), "할 일");
      expect(screen.getByRole("button", { name: "추가" })).toBeEnabled();
    });

    it("공백만 입력하면 추가 버튼이 비활성화 상태를 유지한다", async () => {
      render(<TodoInput onAdd={onAdd} />);
      await user.type(screen.getByRole("textbox"), "   ");
      expect(screen.getByRole("button", { name: "추가" })).toBeDisabled();
    });
  });

  describe("할 일 추가", () => {
    it("추가 버튼 클릭 시 onAdd가 호출된다", async () => {
      render(<TodoInput onAdd={onAdd} />);
      await user.type(screen.getByRole("textbox"), "새 할 일");
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(onAdd).toHaveBeenCalledTimes(1);
      expect(onAdd).toHaveBeenCalledWith("새 할 일", "medium");
    });

    it("Enter 키 입력 시 onAdd가 호출된다", async () => {
      render(<TodoInput onAdd={onAdd} />);
      await user.type(screen.getByRole("textbox"), "새 할 일{Enter}");
      expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it("추가 후 입력창이 초기화된다", async () => {
      render(<TodoInput onAdd={onAdd} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "새 할 일");
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(input).toHaveValue("");
    });

    it("공백만 입력 시 onAdd가 호출되지 않는다", async () => {
      render(<TodoInput onAdd={onAdd} />);
      await user.type(screen.getByRole("textbox"), "   ");
      // 공백만 있으면 버튼이 disabled이므로 클릭이 무시됨
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(onAdd).not.toHaveBeenCalled();
    });

    it("추가 후 우선순위가 '보통'으로 초기화된다", async () => {
      render(<TodoInput onAdd={onAdd} />);
      await user.click(screen.getByRole("button", { name: "높음" }));
      await user.type(screen.getByRole("textbox"), "새 할 일");
      await user.click(screen.getByRole("button", { name: "추가" }));

      // 다음 추가 시 기본 우선순위 'medium'으로 되어야 함
      await user.type(screen.getByRole("textbox"), "다음 할 일");
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(onAdd).toHaveBeenLastCalledWith("다음 할 일", "medium");
    });
  });

  describe("우선순위 선택", () => {
    it("기본 우선순위는 '보통'이다", async () => {
      render(<TodoInput onAdd={onAdd} />);
      await user.type(screen.getByRole("textbox"), "할 일");
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(onAdd).toHaveBeenCalledWith("할 일", "medium");
    });

    it("'낮음' 버튼 클릭 시 우선순위가 low로 설정된다", async () => {
      render(<TodoInput onAdd={onAdd} />);
      await user.click(screen.getByRole("button", { name: "낮음" }));
      await user.type(screen.getByRole("textbox"), "할 일");
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(onAdd).toHaveBeenCalledWith("할 일", "low");
    });

    it("'높음' 버튼 클릭 시 우선순위가 high로 설정된다", async () => {
      render(<TodoInput onAdd={onAdd} />);
      await user.click(screen.getByRole("button", { name: "높음" }));
      await user.type(screen.getByRole("textbox"), "할 일");
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(onAdd).toHaveBeenCalledWith("할 일", "high");
    });
  });
});
