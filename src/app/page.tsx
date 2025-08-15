// src/app/page.tsx
'use client';

import type { JSX } from 'react';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import InputBox from './components/InputBox';
import DiffViewer from './components/DiffViewer';
import Loading from './components/Loading';
import { useSpellcheck } from '../hooks/useSpellcheck';

export default function Page(): JSX.Element {
  const { text, setText, run, result, error, clear, history } = useSpellcheck();

  // 전체 페이지 로딩 전환용 상태
  const [waiting, setWaiting] = useState<boolean>(false);

  // 입력 변경 시: 실행 안 하고 텍스트만 업데이트
  const onChangeInput = (v: string): void => {
    setText(v);
  };

  // 화살표 클릭 시에만 검사 실행 (중복 클릭 방지 + 30초 대기)
  const runningRef = useRef<boolean>(false);
  const onClickArrow = async (): Promise<void> => {
    if (runningRef.current || waiting) return;
    if (text.trim().length === 0) return;

    runningRef.current = true;
    setWaiting(true);
    try {
      // 30초 대기 (테스트용)
      await new Promise<void>((resolve): void => {
        window.setTimeout(resolve, 30_000);
      });
      await run();
    } finally {
      setWaiting(false);
      runningRef.current = false;
    }
  };

  const fillSample = (): void => {
    onChangeInput('안녕 하세오 오늘 날씨가좋습니다');
  };

  // ✅ 전체 페이지 로딩 뷰 (로딩/미니게임을 페이지 w,h에 맞게 확장)
  if (waiting) {
    return (
      <main className="w-screen h-dvh p-0">
        <Loading
          src="/lottie/loader.json"        // public/lottie/loader.json
          label="맞춤법 검사 중…"
          // Lottie 크기 (페이지 대비 크게)
          height={220}
          width={220}
          // 미니게임 높이: 뷰포트 대부분 차지
          showGame
          gameHeightClass="h-[60vh] md:h-[60vh]"
          // 컨테이너: 전체 페이지 꽉 채우기
          className="w-full h-full border-0 rounded-none flex flex-col items-center justify-center"
        />
      </main>
    );
  }

  // 평상시 화면
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fillSample}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            샘플 입력
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            초기화
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* 좌우 2분할 + 가운데 화살표 */}
      <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
        {/* Left: 입력 (높이 800px 고정) */}
        <InputBox
          value={text}
          onChange={onChangeInput}
          disabled={false}
          heightClass="h-[800px]"
        />

        {/* Center: 화살표 버튼 (검사 실행 트리거) */}
        <div className="hidden items-center justify-center md:flex">
          <button
            type="button"
            onClick={onClickArrow}
            disabled={text.trim().length === 0 || runningRef.current}
            className="outline-none"
            aria-label="검사 실행"
            title={text.trim().length === 0 ? '텍스트를 입력하세요' : '검사 실행'}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.18 }}
            >
              <ArrowRight
                size={36}
                strokeWidth={3}
                className={`${
                  text.trim().length === 0
                    ? 'text-gray-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
                aria-hidden
              />
            </motion.div>
          </button>
        </div>

        {/* Right: 결과 패널 */}
        <DiffViewer
          result={result}
          mode={null}               // 선택 prop이면 제거 가능
          error={error ?? ''}
          heightClass="h-[800px]"
        />
      </div>

      {/* 기록 */}
      {!!history.length && (
        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-2 font-semibold">최근 기록</div>
          <ul className="space-y-1 text-sm">
            {history.map((h, i) => (
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
