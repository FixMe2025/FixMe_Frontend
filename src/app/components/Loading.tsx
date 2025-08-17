// src/app/components/Loading.tsx
'use client';

import { useEffect, useMemo, useRef, useState, type JSX, type CSSProperties } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import MiniGame from './MiniGame';

type LoadingProps = {
  /** 상단 라벨 텍스트 */
  label?: string;
  /** /public 아래 Lottie JSON 경로. 예) "/lottie/loader.json" */
  src?: string;
  /** JSON 객체 직접 전달 시 사용 */
  animationData?: Record<string, unknown>;
  /** 반복 재생 여부 */
  loop?: boolean;
  /** 재생 속도 (1=기본) */
  speed?: number;
  /** Lottie 렌더 크기(px) */
  height?: number;
  width?: number;
  /** 미니게임 표시 여부 */
  showGame?: boolean;
  /** 미니게임 높이 */
  gameHeightClass?: string; // 예: "h-64"
  className?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export default function Loading(props: LoadingProps): JSX.Element {
  const {
    label = '처리 중…',
    src,
    animationData,
    loop = true,
    speed = 1,
    height = 120,
    width = 120,
    showGame = true,
    gameHeightClass = 'h-64',
    className = '',
  } = props;

  const [json, setJson] = useState<Record<string, unknown> | null>(animationData ?? null);
  const [err, setErr] = useState<string | null>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // /public 경로에서 Lottie JSON 로드 (src 사용 시)
  useEffect(() => {
    if (animationData || !src) return;
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      try {
        const res = await fetch(src, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        if (isRecord(data)) setJson(data);
        else setErr('잘못된 Lottie JSON');
      } catch (e: unknown) {
        if ((e as { name?: string }).name === 'AbortError') return;
        setErr(e instanceof Error ? e.message : '로딩 실패');
      }
    })();

    return () => controller.abort();
  }, [src, animationData]);

  // 재생 속도 적용
  useEffect(() => {
    try {
      lottieRef.current?.setSpeed(speed);
    } catch {
      // ignore
    }
  }, [speed]);

  const style = useMemo<CSSProperties>(() => ({ height, width }), [height, width]);

  return (
    <div className={['rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900', className].join(' ')}>
      {/* 상단: Lottie + 라벨 */}
      <div className="flex flex-col items-center">
        {json ? (
          <Lottie lottieRef={lottieRef} animationData={json} loop={loop} autoplay style={style} />
        ) : err ? (
          <div className="text-sm text-red-600">로딩 실패: {err}</div>
        ) : (
          <div className="text-sm text-gray-500">애니메이션 불러오는 중…</div>
        )}
        {label ? (
          <div
            className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            role="status"
            aria-live="polite"
          >
            {label}
          </div>
        ) : null}
      </div>

      {/* 하단: 미니게임 */}
      {showGame && (
        <div className="mt-6">
          <MiniGame
            durationSec={30}
            targetSize={48}
            heightClass={gameHeightClass}
            className="p-3"
            autoStart
            hideControls
          />
        </div>
      )}
    </div>
  );
}
