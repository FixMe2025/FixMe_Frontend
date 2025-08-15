// src/app/components/HighlightedText.tsx
'use client';

import { useMemo } from 'react';
import type { JSX } from 'react';
import Tooltip from './Tooltip';
import type { SpellError } from '../../types/spellcheck';

type Props = {
  text: string;
  errors: ReadonlyArray<SpellError> | null;
};

function styleFor(type: SpellError['type']): string {
  switch (type) {
    case 'spelling':
      return 'bg-red-100 dark:bg-red-300/30 underline decoration-red-500 decoration-wavy';
    case 'spacing':
      return 'bg-yellow-100 dark:bg-yellow-300/30 underline decoration-dotted';
    case 'grammar':
      return 'bg-blue-100 dark:bg-blue-300/30 underline decoration-blue-500';
    case 'recommendation':
      return 'bg-emerald-100 dark:bg-emerald-300/30';
    case 'etc':
    default:
      return 'bg-gray-200 dark:bg-gray-700';
  }
}

export default function HighlightedText({ text, errors }: Props): JSX.Element {
  const parts = useMemo<JSX.Element[]>(() => {
    const list: ReadonlyArray<SpellError> = Array.isArray(errors) ? errors : [];
    const len: number = text.length;

    // offset 기준 정렬
    const sorted: SpellError[] = [...list].sort((a, b) => a.offset - b.offset);

    const out: JSX.Element[] = [];
    let cursor = 0;

    for (let i = 0; i < sorted.length; i += 1) {
      const e = sorted[i];

      // 범위 보정/검증
      const start: number = Math.max(0, Math.min(len, e.offset));
      const end: number = Math.max(start, Math.min(len, e.offset + e.length));

      if (start >= end) continue;           // 빈 범위
      if (start < cursor) continue;         // 겹치면 스킵(중복 방지)

      // 정상 텍스트
      if (cursor < start) {
        out.push(
          <span key={`t-${cursor}-${start}`}>{text.slice(cursor, start)}</span>
        );
      }

      // 오류 구간 하이라이트 (+툴팁)
      const piece: string = text.slice(start, end);
      const tooltip: string =
        e.suggestion && e.suggestion.length > 0
          ? `제안: ${e.suggestion}\n${e.message}`
          : e.message;

      out.push(
        <Tooltip key={`e-${start}-${end}`} content={tooltip} side="top">
          <mark
            title={tooltip}
            className={[
              'rounded-[3px] px-0.5 cursor-help',
              styleFor(e.type),
            ].join(' ')}
          >
            {piece}
          </mark>
        </Tooltip>
      );

      cursor = end;
    }

    // 남은 꼬리
    if (cursor < len) {
      out.push(<span key={`t-${cursor}-end`}>{text.slice(cursor)}</span>);
    }

    return out;
  }, [text, errors]);

  return (
    <div className="whitespace-pre-wrap leading-7">
      {parts}
    </div>
  );
}
