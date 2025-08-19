'use client';

import { useCallback, useMemo, useReducer } from 'react';
import { pipelineRun } from '../lib/api';
import type { PipelineRunResponse } from '../types/pipeline';

// 맞춤법 검사 API를 호출하고 상태를 관리하는 커스텀 훅

type State = {
  text: string;
  result: PipelineRunResponse | null;
  loading: boolean;
  error: string | null;
  history: ReadonlyArray<PipelineRunResponse>;
};

type Action =
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'START' }
  | { type: 'SUCCESS'; payload: PipelineRunResponse }
  | { type: 'FAIL'; payload: string }
  | { type: 'CLEAR' };

const initial: State = {
  text: '',
  result: null,
  loading: false,
  error: null,
  history: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TEXT': return { ...state, text: action.payload };
    case 'START': return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { ...state, loading: false, result: action.payload, history: [action.payload, ...state.history].slice(0, 20) };
    case 'FAIL': return { ...state, loading: false, error: action.payload };
    case 'CLEAR': return { ...state, text: '', result: null, error: null };
    default: return state;
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try { return JSON.stringify(err); } catch { return '알 수 없는 오류'; }
}

export function useSpellcheck(): {
  text: string;
  result: PipelineRunResponse | null;
  loading: boolean;
  error: string | null;
  history: ReadonlyArray<PipelineRunResponse>;
  setText: (v: string) => void;
  run: () => Promise<void>;
  clear: () => void;
} {
  const [state, dispatch] = useReducer(reducer, initial);

  const run = useCallback(async (): Promise<void> => {
    if (state.text.trim().length === 0) {
      dispatch({ type: 'FAIL', payload: '텍스트를 입력해 주세요.' });
      return;
    }
    dispatch({ type: 'START' });
    try {
      const data: PipelineRunResponse = await pipelineRun(state.text);
      dispatch({ type: 'SUCCESS', payload: data });
    } catch (e: unknown) {
      dispatch({ type: 'FAIL', payload: getErrorMessage(e) });
    }
  }, [state.text]);

  const setText = useCallback((v: string): void => { dispatch({ type: 'SET_TEXT', payload: v }); }, []);
  const clear = useCallback((): void => { dispatch({ type: 'CLEAR' }); }, []);

  return useMemo(() => ({
    text: state.text,
    result: state.result,
    loading: state.loading,
    error: state.error,
    history: state.history,
    setText, run, clear,
  }), [state, run, setText, clear]);
}
