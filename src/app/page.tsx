// src/app/page.tsx
'use client';

import type { JSX } from 'react';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import ThemeToggle from './components/ThemeToggle';
import InputBox from './components/InputBox';
import DiffViewer from './components/DiffViewer';
import Loading from './components/Loading';

import { pipelineRun, comprehensive } from '@/lib/api';
import type { PipelineRunResponse } from '@/types/pipeline';

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

type LastAction = 'pipeline' | 'comprehensive' | null;

export default function Page(): JSX.Element {
  // 입력 텍스트
  const [text, setText] = useState<string>('');
  // API 결과
  const [result, setResult] = useState<PipelineRunResponse | null>(null);
  // 에러 메시지
  const [error, setError] = useState<string>('');
  // 기록
  const [history, setHistory] = useState<PipelineRunResponse[]>([]);
  // 로딩 및 시간
  const [waiting, setWaiting] = useState<boolean>(false);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [lastAction, setLastAction] = useState<LastAction>(null);

  // 경과시간 표시에 사용할 타이머 (라벨만 사용)
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const tickRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);

  useEffect(() => {
    if (waiting) {
      startRef.current = Date.now();
      setElapsedMs(0);
      tickRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startRef.current);
      }, 100);
      return () => {
        if (tickRef.current !== null) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
      };
    }
    return;
  }, [waiting]);

  const onChangeInput = (v: string): void => setText(v);

  const fillSample = (): void => {
    setText('안녕 하세오 오늘 날씨가좋습니다 오늘도 날씨가좋습니다');
  };

  const resetAll = (): void => {
    setText('');
    setResult(null);
    setError('');
    setDurationMs(null);
    setLastAction(null);
  };

  async function runWith(
    action: 'pipeline' | 'comprehensive',
    fn: (txt: string) => Promise<PipelineRunResponse>
  ): Promise<void> {
    if (runningRef.current || waiting) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    runningRef.current = true;
    setError('');
    setResult(null);
    setDurationMs(null);
    setLastAction(action);
    setWaiting(true);

    try {
      const t0 = Date.now();
      const data = await fn(trimmed);
      const t1 = Date.now();

      setDurationMs(t1 - t0);
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 20));
    } catch (e) {
      const msg: string =
        e instanceof Error ? e.message : '요청 중 알 수 없는 오류가 발생했습니다.';
      setError(msg);
    } finally {
      setWaiting(false);
      if (tickRef.current !== null) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      runningRef.current = false;
    }
  }

  const onClickPipeline = (): Promise<void> =>
    runWith('pipeline', (txt) => pipelineRun(txt));

  const onClickComprehensive = (): Promise<void> =>
    runWith('comprehensive', (txt) => comprehensive(txt));

  // 로딩 화면 (미니게임 + 경과 시간 라벨)
  if (waiting) {
    return (
      <main className="w-screen h-dvh p-0">
        <Loading
          src="/lottie/loader.json"
          label={`교정 중… ${formatMs(elapsedMs)}`}
          height={220}
          width={220}
          showGame
          gameHeightClass="h-[60vh] md:h-[60vh]"
          className="w-full h-full border-0 rounded-none flex flex-col items-center justify-center"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          한국어 맞춤법 · 띄어쓰기 검사기
        </motion.h1>
        <div className="flex items-center gap-2">
          {durationMs !== null && (
            <span className="rounded-lg border px-2 py-1 text-xs text-gray-700 dark:text-gray-200 dark:border-gray-700">
              {lastAction === 'pipeline' ? '파이프라인' : '종합 교정'} 소요 시간: {formatMs(durationMs)}
            </span>
          )}
          <button
            type="button"
            onClick={fillSample}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            샘플 입력
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            초기화
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* 좌우 2분할 + 가운데 버튼들 */}
      <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
        {/* Left: 입력 */}
        <InputBox
          value={text}
          onChange={onChangeInput}
          disabled={false}
          heightClass="h-[800px]"
        />

        {/* Center: 실행 버튼 2종 */}
        <div className="hidden md:flex flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClickPipeline}
            disabled={text.trim().length === 0 || runningRef.current}
            className="outline-none"
            aria-label="파이프라인 실행"
            title={text.trim().length === 0 ? '텍스트를 입력하세요' : '파이프라인 실행'}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
            >
              <ArrowRight size={20} strokeWidth={3} className="text-gray-700 dark:text-gray-200" />
              <span className="text-sm">파이프라인 실행</span>
            </motion.div>
          </button>

          <button
            type="button"
            onClick={onClickComprehensive}
            disabled={text.trim().length === 0 || runningRef.current}
            className="outline-none"
            aria-label="종합 교정 실행"
            title={text.trim().length === 0 ? '텍스트를 입력하세요' : '종합 교정 실행'}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 rounded-lg border px-3 py-2"
            >
              <ArrowRight size={20} strokeWidth={3} className="text-gray-700 dark:text-gray-200" />
              <span className="text-sm">종합 교정 실행</span>
            </motion.div>
          </button>
        </div>

        {/* Right: 결과 */}
        <DiffViewer
          result={result}
          mode={null}
          error={error}
          heightClass="h-[800px]"
        />
      </div>

      {/* 기록 */}
      {history.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-2 font-semibold">최근 기록</div>
          <ul className="space-y-1 text-sm">
            {history.map((h: PipelineRunResponse, i: number) => (
              <li key={i} className="truncate text-gray-600 dark:text-gray-300">
                <span className="mr-2 text-xs text-gray-400">원문</span>
                {h.original_text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
