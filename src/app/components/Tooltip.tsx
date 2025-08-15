// src/app/components/Tooltip.tsx
import type { JSX, ReactNode } from 'react';

type TooltipProps = {
  content: string;
  side?: 'top' | 'bottom';
  children: ReactNode;
};

export default function Tooltip(props: TooltipProps): JSX.Element {
  const { content, side = 'top', children } = props;

  const pos: string =
    side === 'bottom'
      ? 'top-full mt-2 left-1/2 -translate-x-1/2'
      : 'bottom-full mb-2 left-1/2 -translate-x-1/2';

  return (
    <span className="group relative inline-block">
      {children}
      <span
        role="tooltip"
        className={[
          'pointer-events-none absolute z-20',
          'invisible opacity-0 transition-opacity duration-150',
          'group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100',
          'whitespace-pre-line rounded-md bg-black px-2 py-1 text-xs text-white shadow',
          pos,
        ].join(' ')}
      >
        {content}
      </span>
    </span>
  );
}
