'use client';

import type { JSX } from 'react';

// 텍스트를 클립보드에 복사하는 버튼 컴포넌트
type Props = { text: string; onCopied?: () => void };

export default function CopyButton(props: Props): JSX.Element {
  const { text, onCopied } = props;

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      onCopied?.();
    } catch {
      alert('복사 실패');
    }
  };

  return (
    <button onClick={copy} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
      복사
    </button>
  );
}
