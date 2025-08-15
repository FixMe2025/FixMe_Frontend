// src/app/components/DiffViewer.tsx
'use client';

import type { JSX } from 'react';
import CopyButton from './CopyButton';
import HighlightedText from './HighlightedText';
import type { SpellResponse } from '../../types/spellcheck';

type Props = {
  /** 검사 결과 (없으면 플레이스홀더 출력) */
  result: SpellResponse | null;
  /** 'loading'일 때는 로딩 안내 화면 표시 */
  mode: 'loading' | null;
  /** 에러 메시지 (선택) */
  error?: string | null;
  /** 패널 높이 클래스 (기본 800px) */
  heightClass?: string; // 예: "h-[800px]"
};

export default function DiffViewer(props: Props): JSX.Element {
  const {
    result,
    mode,
    error = null,
    heightClass = 'h-[800px]',
  } = props;

  return (
    <div
      className={[
        heightClass,
        'flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-4',
        'dark:border-gray-700 dark:bg-gray-900',
      ].join(' ')}
    >
      {/* 헤더 */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{mode === 'loading' ? '로딩 페이지' : '교정 결과'}</h3>
        {result && mode !== 'loading' ? <CopyButton text={result.corrected_text} /> : null}
      </div>

      {/* 에러 라인 (로딩 UI는 요구대로 제거) */}
      <div className="h-5 text-sm text-red-600">{error ?? ''}</div>

      {/* 콘텐츠 */}
      <div className="mt-2 flex-1 overflow-auto">
        {mode === 'loading' ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            가운데 화살표를 클릭하면 검사를 실행합니다.
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* 1) 오류 하이라이트(원문 기준) */}
            <section>
              <div className="mb-1 text-sm text-gray-500">오류 하이라이트(원문)</div>
              <HighlightedText text={result.original_text} errors={result.errors ?? []} />
            </section>

            {/* 2) 교정문 */}
            <section>
              <div className="mb-1 text-sm text-gray-500">교정문</div>
              <div className="whitespace-pre-wrap leading-7">{result.corrected_text}</div>
            </section>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            결과가 여기에 표시됩니다. 왼쪽에 문장을 입력한 뒤, 가운데 화살표를 클릭하세요.
          </div>
        )}
      </div>
    </div>
  );
}
