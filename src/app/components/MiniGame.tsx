// 간단한 클릭 챌린지 미니게임 컴포넌트
'use client';

import type { JSX } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type GameState = 'idle' | 'running' | 'finished';
type Pos = { x: number; y: number };

export type MiniGameProps = {
  durationSec?: number;     // 게임 시간(초)
  targetSize?: number;      // 타겟 지름(px)
  className?: string;       // 카드 외곽 클래스
  heightClass?: string;     // 게임 보드 높이 (예: "h-64")
  autoStart?: boolean;      // 마운트 시 자동 시작
  hideControls?: boolean;   // 시작/중지 버튼 숨김
  onFinish?: (score: number) => void; // 종료 콜백
};

const STORAGE_KEY_BEST = 'minigame_best_score';

export default function MiniGame(props: MiniGameProps): JSX.Element {
  const {
    durationSec = 30,
    targetSize = 56,
    className = '',
    heightClass = 'h-80',
    autoStart = false,
    hideControls = false,
    onFinish,
  } = props;

  const [state, setState] = useState<GameState>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(durationSec);
  const [score, setScore] = useState<number>(0);
  const [best, setBest] = useState<number>(0);
  const [pos, setPos] = useState<Pos>({ x: 40, y: 40 });

  const boxRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 최고 점수 로드
  useEffect((): void => {
    if (typeof window === 'undefined') return;
    const raw: string | null = window.localStorage.getItem(STORAGE_KEY_BEST);
    const parsed: number = raw ? Number(raw) : 0;
    setBest(Number.isFinite(parsed) ? parsed : 0);
  }, []);

  // 무작위 위치
  const randomizePosition = useCallback((): void => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - targetSize);
    const maxY = Math.max(0, rect.height - targetSize);
    const nextX = Math.floor(Math.random() * (maxX + 1));
    const nextY = Math.floor(Math.random() * (maxY + 1));
    setPos({ x: nextX, y: nextY });
  }, [targetSize]);

  // 타이머
  const startTimer = useCallback((): void => {
    if (intervalRef.current !== null) return;
    intervalRef.current = setInterval((): void => {
      setTimeLeft((prev: number): number => {
        const next = prev - 1;
        if (next <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setState('finished');
          setBest((b: number): number => {
            const updated = Math.max(b, score);
            try { window.localStorage.setItem(STORAGE_KEY_BEST, String(updated)); } catch {}
            return updated;
          });
          if (onFinish) onFinish(score);
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [onFinish, score]);

  const stopTimer = useCallback((): void => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect((): (() => void) => {
    return (): void => stopTimer();
  }, [stopTimer]);

  const start = useCallback((): void => {
    setScore(0);
    setTimeLeft(durationSec);
    setState('running');
    randomizePosition();
    startTimer();
  }, [durationSec, randomizePosition, startTimer]);

  const reset = (): void => {
    stopTimer();
    setState('idle');
    setTimeLeft(durationSec);
    setScore(0);
    setPos({ x: 40, y: 40 });
  };

  const onHit = (): void => {
    if (state !== 'running') return;
    setScore((s: number): number => s + 1);
    randomizePosition();
  };

  // autoStart 처리
  useEffect((): void => {
    if (autoStart && state === 'idle') {
      start();
    }
  }, [autoStart, state, start]);

  return (
    <div className={['rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900', className].join(' ')}>
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">미니게임 · 클릭 챌린지</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            남은 시간: <strong>{timeLeft}s</strong>
          </span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            점수: <strong>{score}</strong>
          </span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            최고: <strong>{best}</strong>
          </span>
        </div>
      </div>

      {/* 컨트롤 (숨김 가능) */}
      {!hideControls && (
        <div className="mb-3 flex gap-2">
          {state !== 'running' ? (
            <button type="button" onClick={start} className="rounded-lg bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black">
              시작
            </button>
          ) : (
            <button type="button" onClick={reset} className="rounded-lg border px-3 py-1.5 text-sm">
              중지
            </button>
          )}
          {state === 'finished' && (
            <button type="button" onClick={reset} className="rounded-lg border px-3 py-1.5 text-sm">
              재시작
            </button>
          )}
        </div>
      )}

      {/* 게임 보드 */}
      <div
        ref={boxRef}
        className={['relative w-full overflow-hidden rounded-lg border border-dashed border-gray-300 dark:border-gray-700', heightClass].join(' ')}
      >
        <button
          type="button"
          onClick={onHit}
          disabled={state !== 'running'}
          aria-label="타겟 클릭"
          className={[
            'absolute rounded-full',
            state === 'running' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-400',
            'transition-colors duration-150 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500',
          ].join(' ')}
          style={{
            width: `${targetSize}px`,
            height: `${targetSize}px`,
            left: `${pos.x}px`,
            top: `${pos.y}px`,
          }}
        />
        {state !== 'running' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-500">
            {state === 'idle' ? '시작을 눌러 게임을 시작하세요.' : '게임 종료!'}
          </div>
        )}
      </div>
    </div>
  );
}
