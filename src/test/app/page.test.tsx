import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

// 통계 텍스트는 숫자가 별도 span으로 분리되어 있으므로 textContent 전체로 매칭
function getStatsParagraph() {
  return screen.getByText((_, element) => {
    if (element?.tagName !== "P") return false;
    return /전체 \d+개 · 완료 \d+개/.test(element.textContent ?? "");
  });
}

// TodoItem 루트 div에서 토글 버튼(첫 번째 버튼) 반환
function getToggleButtonByText(text: string) {
  const textEl = screen.getByText(text);
  const itemRoot = textEl.closest(".group");
  return within(itemRoot as HTMLElement).getAllByRole("button")[0];
}

describe("Home (page.tsx)", () => {
  const user = userEvent.setup();

  describe("초기 렌더링", () => {
    it("'할 일 목록' 제목을 표시한다", () => {
      render(<Home />);
      expect(
        screen.getByRole("heading", { name: "할 일 목록" })
      ).toBeInTheDocument();
    });

    it("빈 상태 메시지 '할 일을 추가해보세요!'를 표시한다", () => {
      render(<Home />);
      expect(screen.getByText("할 일을 추가해보세요!")).toBeInTheDocument();
    });

    it("할 일이 없으면 TodoFilter가 표시되지 않는다", () => {
      render(<Home />);
      expect(screen.queryByText("전체")).not.toBeInTheDocument();
    });

    it("할 일이 없으면 통계 문구가 표시되지 않는다", () => {
      render(<Home />);
      expect(
        screen.queryByText((_, el) =>
          /전체 \d+개/.test(el?.textContent ?? "")
        )
      ).not.toBeInTheDocument();
    });
  });

  describe("할 일 추가", () => {
    it("할 일을 추가하면 목록에 표시된다", async () => {
      render(<Home />);
      await user.type(
        screen.getByPlaceholderText("새로운 할 일을 입력하세요..."),
        "운동하기"
      );
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(screen.getByText("운동하기")).toBeInTheDocument();
    });

    it("할 일을 추가하면 TodoFilter가 표시된다", async () => {
      render(<Home />);
      await user.type(
        screen.getByPlaceholderText("새로운 할 일을 입력하세요..."),
        "운동하기"
      );
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(screen.getByRole("button", { name: "전체" })).toBeInTheDocument();
    });

    it("할 일을 추가하면 통계 문구가 표시된다", async () => {
      render(<Home />);
      await user.type(
        screen.getByPlaceholderText("새로운 할 일을 입력하세요..."),
        "운동하기"
      );
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(getStatsParagraph().textContent).toMatch("전체 1개 · 완료 0개");
    });

    it("여러 할 일을 추가하면 모두 목록에 표시된다", async () => {
      render(<Home />);
      const input = screen.getByPlaceholderText("새로운 할 일을 입력하세요...");
      const addBtn = screen.getByRole("button", { name: "추가" });

      await user.type(input, "운동하기");
      await user.click(addBtn);
      await user.type(input, "독서하기");
      await user.click(addBtn);

      expect(screen.getByText("운동하기")).toBeInTheDocument();
      expect(screen.getByText("독서하기")).toBeInTheDocument();
    });

    it("빈 상태 메시지가 사라지고 할 일이 표시된다", async () => {
      render(<Home />);
      await user.type(
        screen.getByPlaceholderText("새로운 할 일을 입력하세요..."),
        "운동하기"
      );
      await user.click(screen.getByRole("button", { name: "추가" }));
      expect(
        screen.queryByText("할 일을 추가해보세요!")
      ).not.toBeInTheDocument();
    });
  });

  describe("할 일 토글", () => {
    it("토글 버튼 클릭 시 완료 통계가 갱신된다", async () => {
      render(<Home />);
      await user.type(
        screen.getByPlaceholderText("새로운 할 일을 입력하세요..."),
        "운동하기"
      );
      await user.click(screen.getByRole("button", { name: "추가" }));

      await user.click(getToggleButtonByText("운동하기"));

      expect(getStatsParagraph().textContent).toMatch("완료 1개");
    });
  });

  describe("필터링", () => {
    async function setupWithTodos() {
      render(<Home />);
      const input = screen.getByPlaceholderText("새로운 할 일을 입력하세요...");
      const addBtn = screen.getByRole("button", { name: "추가" });

      await user.type(input, "미완료 할 일");
      await user.click(addBtn);
      await user.type(input, "완료될 할 일");
      await user.click(addBtn);

      // "완료될 할 일"을 완료 상태로 전환 (최신 순이므로 맨 위에 있음)
      await user.click(getToggleButtonByText("완료될 할 일"));
    }

    it("'진행 중' 필터 클릭 시 미완료 항목만 표시된다", async () => {
      await setupWithTodos();
      await user.click(screen.getByRole("button", { name: "진행 중" }));
      expect(screen.getByText("미완료 할 일")).toBeInTheDocument();
      expect(screen.queryByText("완료될 할 일")).not.toBeInTheDocument();
    });

    it("'완료' 필터 클릭 시 완료 항목만 표시된다", async () => {
      await setupWithTodos();
      await user.click(screen.getByRole("button", { name: "완료" }));
      expect(screen.getByText("완료될 할 일")).toBeInTheDocument();
      expect(screen.queryByText("미완료 할 일")).not.toBeInTheDocument();
    });

    it("'전체' 필터로 돌아오면 모든 항목이 표시된다", async () => {
      await setupWithTodos();
      await user.click(screen.getByRole("button", { name: "진행 중" }));
      await user.click(screen.getByRole("button", { name: "전체" }));
      expect(screen.getByText("미완료 할 일")).toBeInTheDocument();
      expect(screen.getByText("완료될 할 일")).toBeInTheDocument();
    });
  });

  describe("완료 삭제", () => {
    it("'완료 삭제' 클릭 시 완료된 항목이 제거된다", async () => {
      render(<Home />);
      const input = screen.getByPlaceholderText("새로운 할 일을 입력하세요...");
      const addBtn = screen.getByRole("button", { name: "추가" });

      await user.type(input, "남길 할 일");
      await user.click(addBtn);
      await user.type(input, "지울 할 일");
      await user.click(addBtn);

      // "지울 할 일"을 완료 상태로 전환
      await user.click(getToggleButtonByText("지울 할 일"));

      await user.click(screen.getByRole("button", { name: "완료 삭제" }));

      expect(screen.queryByText("지울 할 일")).not.toBeInTheDocument();
      expect(screen.getByText("남길 할 일")).toBeInTheDocument();
    });
  });
});
