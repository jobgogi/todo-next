import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePomodoro } from "@/hooks/usePomodoro";

const WORK_SEC = 25 * 60; // 1500
const BREAK_SEC = 5 * 60; // 300

describe("usePomodoro", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─────────────────────────────────────────
  // 초기 상태
  // ─────────────────────────────────────────
  describe("초기 상태", () => {
    it("state가 'idle'로 시작한다", () => {
      const { result } = renderHook(() => usePomodoro());
      expect(result.current.state).toBe("idle");
    });

    it("remainingSeconds가 작업 시간(25분)으로 초기화된다", () => {
      const { result } = renderHook(() => usePomodoro());
      expect(result.current.remainingSeconds).toBe(WORK_SEC);
    });

    it("completedCount가 0으로 시작한다", () => {
      const { result } = renderHook(() => usePomodoro());
      expect(result.current.completedCount).toBe(0);
    });

    it("formattedTime이 '25:00'으로 표시된다", () => {
      const { result } = renderHook(() => usePomodoro());
      expect(result.current.formattedTime).toBe("25:00");
    });

    it("isRunning이 false다", () => {
      const { result } = renderHook(() => usePomodoro());
      expect(result.current.isRunning).toBe(false);
    });

    it("isBreak가 false다", () => {
      const { result } = renderHook(() => usePomodoro());
      expect(result.current.isBreak).toBe(false);
    });

    it("isPaused가 false다", () => {
      const { result } = renderHook(() => usePomodoro());
      expect(result.current.isPaused).toBe(false);
    });
  });

  // ─────────────────────────────────────────
  // start
  // ─────────────────────────────────────────
  describe("start()", () => {
    it("idle 상태에서 start() 호출 시 running 상태가 된다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      expect(result.current.state).toBe("running");
    });

    it("paused 상태에서 start() 호출 시 running 상태로 재개된다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => result.current.pause());
      act(() => result.current.start());
      expect(result.current.state).toBe("running");
    });

    it("running 상태에서 start()를 다시 호출해도 상태가 변하지 않는다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => result.current.start());
      expect(result.current.state).toBe("running");
    });

    it("start() 후 isRunning이 true가 된다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      expect(result.current.isRunning).toBe(true);
    });
  });

  // ─────────────────────────────────────────
  // pause
  // ─────────────────────────────────────────
  describe("pause()", () => {
    it("running 상태에서 pause() 호출 시 paused 상태가 된다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => result.current.pause());
      expect(result.current.state).toBe("paused");
    });

    it("pause() 후 isPaused가 true가 된다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => result.current.pause());
      expect(result.current.isPaused).toBe(true);
    });

    it("idle 상태에서 pause()를 호출해도 상태가 변하지 않는다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.pause());
      expect(result.current.state).toBe("idle");
    });

    it("paused 상태에서는 타이머가 멈춘다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(5000)); // 5초 경과
      act(() => result.current.pause());
      const snapshots = result.current.remainingSeconds;
      act(() => vi.advanceTimersByTime(5000)); // 추가 5초
      expect(result.current.remainingSeconds).toBe(snapshots); // 변화 없음
    });
  });

  // ─────────────────────────────────────────
  // reset
  // ─────────────────────────────────────────
  describe("reset()", () => {
    it("running 상태에서 reset() 호출 시 idle 상태로 돌아간다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => result.current.reset());
      expect(result.current.state).toBe("idle");
    });

    it("reset() 후 remainingSeconds가 작업 시간으로 초기화된다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(10000));
      act(() => result.current.reset());
      expect(result.current.remainingSeconds).toBe(WORK_SEC);
    });

    it("reset() 후 completedCount는 유지된다", () => {
      const { result } = renderHook(() => usePomodoro());
      // 작업 세션 완료
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(WORK_SEC * 1000));
      const countBefore = result.current.completedCount;
      act(() => result.current.reset());
      expect(result.current.completedCount).toBe(countBefore);
    });

    it("paused 상태에서도 reset()이 동작한다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => result.current.pause());
      act(() => result.current.reset());
      expect(result.current.state).toBe("idle");
    });
  });

  // ─────────────────────────────────────────
  // 타이머 진행
  // ─────────────────────────────────────────
  describe("타이머 진행", () => {
    it("running 상태에서 1초마다 remainingSeconds가 1씩 감소한다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(1000));
      expect(result.current.remainingSeconds).toBe(WORK_SEC - 1);
    });

    it("3초 경과 후 remainingSeconds가 3 감소한다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(3000));
      expect(result.current.remainingSeconds).toBe(WORK_SEC - 3);
    });

    it("idle 상태에서는 시간이 흘러도 remainingSeconds가 변하지 않는다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => vi.advanceTimersByTime(5000));
      expect(result.current.remainingSeconds).toBe(WORK_SEC);
    });

    it("paused 상태에서는 시간이 흘러도 remainingSeconds가 변하지 않는다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(3000));
      act(() => result.current.pause());
      const snapshot = result.current.remainingSeconds;
      act(() => vi.advanceTimersByTime(5000));
      expect(result.current.remainingSeconds).toBe(snapshot);
    });
  });

  // ─────────────────────────────────────────
  // 작업 세션 완료
  // ─────────────────────────────────────────
  describe("작업 세션 완료", () => {
    it("작업 시간이 소진되면 state가 'break'가 된다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(WORK_SEC * 1000));
      expect(result.current.state).toBe("break");
    });

    it("작업 세션 완료 시 completedCount가 1 증가한다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(WORK_SEC * 1000));
      expect(result.current.completedCount).toBe(1);
    });

    it("작업 세션 완료 시 remainingSeconds가 휴식 시간으로 재설정된다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(WORK_SEC * 1000));
      expect(result.current.remainingSeconds).toBe(BREAK_SEC);
    });

    it("작업 세션 완료 시 isBreak가 true가 된다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(WORK_SEC * 1000));
      expect(result.current.isBreak).toBe(true);
    });

    it("작업 세션 완료 시 onComplete 콜백이 호출된다", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => usePomodoro({ onComplete }));
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(WORK_SEC * 1000));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("2회 완료 시 completedCount가 2가 된다", () => {
      const { result } = renderHook(() => usePomodoro());
      // 1번째 작업 세션
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(WORK_SEC * 1000));
      // 휴식 세션 → idle
      act(() => vi.advanceTimersByTime(BREAK_SEC * 1000));
      // 2번째 작업 세션
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(WORK_SEC * 1000));
      expect(result.current.completedCount).toBe(2);
    });
  });

  // ─────────────────────────────────────────
  // 휴식 세션 완료
  // ─────────────────────────────────────────
  describe("휴식 세션 완료", () => {
    function runWorkSession(result: ReturnType<typeof renderHook<ReturnType<typeof usePomodoro>, unknown>>["result"]) {
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(WORK_SEC * 1000));
    }

    it("휴식 시간이 소진되면 state가 'idle'이 된다", () => {
      const { result } = renderHook(() => usePomodoro());
      runWorkSession(result);
      act(() => vi.advanceTimersByTime(BREAK_SEC * 1000));
      expect(result.current.state).toBe("idle");
    });

    it("휴식 세션 완료 후 remainingSeconds가 작업 시간으로 재설정된다", () => {
      const { result } = renderHook(() => usePomodoro());
      runWorkSession(result);
      act(() => vi.advanceTimersByTime(BREAK_SEC * 1000));
      expect(result.current.remainingSeconds).toBe(WORK_SEC);
    });

    it("휴식 세션 완료 후 completedCount는 유지된다", () => {
      const { result } = renderHook(() => usePomodoro());
      runWorkSession(result);
      act(() => vi.advanceTimersByTime(BREAK_SEC * 1000));
      expect(result.current.completedCount).toBe(1);
    });
  });

  // ─────────────────────────────────────────
  // 커스텀 시간 설정
  // ─────────────────────────────────────────
  describe("커스텀 시간 설정", () => {
    it("workSeconds 옵션으로 작업 시간을 변경할 수 있다", () => {
      const { result } = renderHook(() => usePomodoro({ workSeconds: 60 }));
      expect(result.current.remainingSeconds).toBe(60);
    });

    it("breakSeconds 옵션으로 휴식 시간을 변경할 수 있다", () => {
      const { result } = renderHook(() => usePomodoro({ workSeconds: 60, breakSeconds: 10 }));
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(60 * 1000));
      expect(result.current.remainingSeconds).toBe(10);
    });

    it("커스텀 시간이 적용된 후 formattedTime이 올바르게 표시된다", () => {
      const { result } = renderHook(() => usePomodoro({ workSeconds: 90 }));
      expect(result.current.formattedTime).toBe("01:30");
    });
  });

  // ─────────────────────────────────────────
  // formattedTime
  // ─────────────────────────────────────────
  describe("formattedTime", () => {
    it("남은 시간을 MM:SS 형식으로 반환한다", () => {
      const { result } = renderHook(() => usePomodoro());
      expect(result.current.formattedTime).toBe("25:00");
    });

    it("59초 남았을 때 '00:59'를 반환한다", () => {
      const { result } = renderHook(() => usePomodoro({ workSeconds: 59 }));
      expect(result.current.formattedTime).toBe("00:59");
    });

    it("9초 남았을 때 '00:09'를 반환한다", () => {
      const { result } = renderHook(() => usePomodoro({ workSeconds: 9 }));
      expect(result.current.formattedTime).toBe("00:09");
    });

    it("타이머 진행 중 포맷이 올바르게 갱신된다", () => {
      const { result } = renderHook(() => usePomodoro());
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(61 * 1000)); // 61초 경과
      expect(result.current.formattedTime).toBe("23:59");
    });
  });
});
