'use client';

import type { JSX } from 'react';
import { useCallback } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  /** textarea 높이 클래스 (기본 800px) */
  heightClass?: string; // 예: "h-[800px]"
  id?: string;
  placeholder?: string;
};

export default function InputBox(props: Props): JSX.Element {
  const {
    value,
    onChange,
    disabled = false,
    heightClass = 'h-[800px]',
    id = 'text-input',
    placeholder = '여기에 한국어 문장을 입력하세요…',
  } = props;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="w-full">
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={[
          // ✅ 보이는 박스는 이 textarea 하나뿐
          heightClass,
          'w-full rounded-xl border border-gray-200 bg-white p-4 text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-gray-600',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
          'resize-none overflow-auto',
        ].join(' ')}
        aria-label="텍스트 입력"
      />
    </div>
  );
}
