import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PomodoroTimer from "@/components/PomodoroTimer";
import { PomodoroState } from "@/types/pomodoro";

// 기본 props 헬퍼
function makeProps(overrides: Partial<{
  state: PomodoroState;
  remainingSeconds: number;
  completedCount: number;
  formattedTime: string;
  isRunning: boolean;
  isBreak: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}> = {}) {
  return {
    state: "idle" as PomodoroState,
    remainingSeconds: 25 * 60,
    completedCount: 0,
    formattedTime: "25:00",
    isRunning: false,
    isBreak: false,
    isPaused: false,
    onStart: vi.fn(),
    onPause: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  };
}

describe("PomodoroTimer", () => {
  const user = userEvent.setup();

  // ─────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────
  describe("렌더링", () => {
    it("남은 시간을 표시한다", () => {
      render(<PomodoroTimer {...makeProps()} />);
      expect(screen.getByText("25:00")).toBeInTheDocument();
    });

    it("커스텀 formattedTime을 표시한다", () => {
      render(<PomodoroTimer {...makeProps({ formattedTime: "13:37" })} />);
      expect(screen.getByText("13:37")).toBeInTheDocument();
    });

    it("completedCount가 1 이상이면 완료 횟수를 표시한다", () => {
      render(<PomodoroTimer {...makeProps({ completedCount: 3 })} />);
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it("completedCount가 0이면 완료 횟수를 표시하지 않는다", () => {
      render(<PomodoroTimer {...makeProps({ completedCount: 0 })} />);
      // 횟수 표시 영역이 없거나 비어있어야 함
      expect(screen.queryByTestId("pomodoro-count")).not.toBeInTheDocument();
    });

    it("리셋 버튼을 렌더링한다", () => {
      render(<PomodoroTimer {...makeProps()} />);
      expect(screen.getByRole("button", { name: /리셋/ })).toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────
  // idle / paused 상태 — 시작 버튼
  // ─────────────────────────────────────────
  describe("시작 버튼 (idle / paused)", () => {
    it("idle 상태에서 시작 버튼을 표시한다", () => {
      render(<PomodoroTimer {...makeProps({ state: "idle" })} />);
      expect(screen.getByRole("button", { name: /시작/ })).toBeInTheDocument();
    });

    it("paused 상태에서 시작(재개) 버튼을 표시한다", () => {
      render(<PomodoroTimer {...makeProps({ state: "paused", isPaused: true })} />);
      expect(screen.getByRole("button", { name: /재개|시작/ })).toBeInTheDocument();
    });

    it("break 상태에서는 시작 버튼을 표시하지 않는다", () => {
      render(<PomodoroTimer {...makeProps({ state: "break", isBreak: true })} />);
      expect(screen.queryByRole("button", { name: /^시작$/ })).not.toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────
  // running 상태 — 일시정지 버튼
  // ─────────────────────────────────────────
  describe("일시정지 버튼 (running)", () => {
    it("running 상태에서 일시정지 버튼을 표시한다", () => {
      render(<PomodoroTimer {...makeProps({ state: "running", isRunning: true })} />);
      expect(screen.getByRole("button", { name: /일시정지/ })).toBeInTheDocument();
    });

    it("idle 상태에서는 일시정지 버튼을 표시하지 않는다", () => {
      render(<PomodoroTimer {...makeProps({ state: "idle" })} />);
      expect(screen.queryByRole("button", { name: /일시정지/ })).not.toBeInTheDocument();
    });
  });

  // ─────────────────────────────────────────
  // 버튼 클릭 → 콜백 호출
  // ─────────────────────────────────────────
  describe("인터랙션", () => {
    it("시작 버튼 클릭 시 onStart가 호출된다", async () => {
      const props = makeProps();
      render(<PomodoroTimer {...props} />);
      await user.click(screen.getByRole("button", { name: /시작/ }));
      expect(props.onStart).toHaveBeenCalledTimes(1);
    });

    it("일시정지 버튼 클릭 시 onPause가 호출된다", async () => {
      const props = makeProps({ state: "running", isRunning: true });
      render(<PomodoroTimer {...props} />);
      await user.click(screen.getByRole("button", { name: /일시정지/ }));
      expect(props.onPause).toHaveBeenCalledTimes(1);
    });

    it("리셋 버튼 클릭 시 onReset이 호출된다", async () => {
      const props = makeProps();
      render(<PomodoroTimer {...props} />);
      await user.click(screen.getByRole("button", { name: /리셋/ }));
      expect(props.onReset).toHaveBeenCalledTimes(1);
    });

    it("paused 상태에서 재개 버튼 클릭 시 onStart가 호출된다", async () => {
      const props = makeProps({ state: "paused", isPaused: true });
      render(<PomodoroTimer {...props} />);
      await user.click(screen.getByRole("button", { name: /재개|시작/ }));
      expect(props.onStart).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────
  // 상태별 시각적 구분
  // ─────────────────────────────────────────
  describe("상태별 표시", () => {
    it("break 상태에서 휴식 중임을 나타내는 텍스트를 표시한다", () => {
      render(<PomodoroTimer {...makeProps({ state: "break", isBreak: true })} />);
      expect(screen.getByText(/휴식/)).toBeInTheDocument();
    });

    it("running 상태에서 작업 중임을 나타내는 표시가 있다", () => {
      render(<PomodoroTimer {...makeProps({ state: "running", isRunning: true })} />);
      expect(screen.getByTestId("pomodoro-timer")).toBeInTheDocument();
    });

    it("idle 상태에서 리셋 버튼이 비활성화된다", () => {
      render(<PomodoroTimer {...makeProps({ state: "idle", remainingSeconds: 25 * 60 })} />);
      expect(screen.getByRole("button", { name: /리셋/ })).toBeDisabled();
    });

    it("running 상태에서 리셋 버튼이 활성화된다", () => {
      render(<PomodoroTimer {...makeProps({ state: "running", isRunning: true })} />);
      expect(screen.getByRole("button", { name: /리셋/ })).toBeEnabled();
    });

    it("paused 상태에서 리셋 버튼이 활성화된다", () => {
      render(<PomodoroTimer {...makeProps({ state: "paused", isPaused: true })} />);
      expect(screen.getByRole("button", { name: /리셋/ })).toBeEnabled();
    });
  });
});
