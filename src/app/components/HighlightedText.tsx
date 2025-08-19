'use client';

import { useMemo } from 'react';
import type { JSX } from 'react';
import Tooltip from './Tooltip';
import type { Correction } from '../../types/pipeline';

// 교정된 단어를 하이라이트하여 보여주는 컴포넌트

type Props = {
  text: string;
  corrections: ReadonlyArray<Correction>;
};

function styleFor(type: Correction['type']): string {
  // A simple style mapping based on correction type.
  // You can expand this with more specific types from your backend.
  if (type.includes('spelling') || type.includes('typo')) {
    return 'bg-red-100 dark:bg-red-300/30 underline decoration-red-500 decoration-wavy';
  }
  if (type.includes('spacing')) {
    return 'bg-yellow-100 dark:bg-yellow-300/30 underline decoration-dotted';
  }
  if (type.includes('grammar')) {
    return 'bg-blue-100 dark:bg-blue-300/30 underline decoration-blue-500';
  }
  return 'bg-emerald-100 dark:bg-emerald-300/30'; // Default for recommendations/etc.
}

export default function HighlightedText({ text, corrections }: Props): JSX.Element {
  const parts = useMemo<JSX.Element[]>(() => {
    if (!corrections || corrections.length === 0) {
      return [<span key="full-text">{text}</span>];
    }

    // Create a map of original words to their corrections for easier lookup.
    const correctionMap = new Map<string, Correction>();
    corrections.forEach(c => correctionMap.set(c.original, c));

    const out: JSX.Element[] = [];
    let lastIndex = 0;

    // Find all occurrences of the original words and create highlighted parts.
    // This is a simplified approach. For overlapping or complex cases, a more robust algorithm is needed.
    const regex = new RegExp(corrections.map(c => c.original).join('|'), 'g');
    let match;

    while ((match = regex.exec(text)) !== null) {
      const originalWord = match[0];
      const correction = correctionMap.get(originalWord);
      if (!correction) continue;

      // Add the text before the match
      if (match.index > lastIndex) {
        out.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
      }

      const tooltip = `제안: ${correction.corrected}`;

      // Add the highlighted part
      out.push(
        <Tooltip key={`corr-${match.index}`} content={tooltip} side="top">
          <mark
            title={tooltip}
            className={['rounded-[3px] px-0.5 cursor-help', styleFor(correction.type)].join(' ')}
          >
            {originalWord}
          </mark>
        </Tooltip>
      );
      lastIndex = regex.lastIndex;
    }

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
      out.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }

    return out;
  }, [text, corrections]);

  return (
    <div className="whitespace-pre-wrap leading-7">
      {parts}
    </div>
  );
}