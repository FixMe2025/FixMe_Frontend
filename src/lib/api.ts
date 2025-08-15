// import type { SpellResponse } from '../types/spellcheck';

// const BASE: string = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// export async function spellcheck(text: string): Promise<SpellResponse> {
//   const res: Response = await fetch(`${BASE}/spellcheck`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ original_text: text }),
//   });
//   if (!res.ok) throw new Error(`HTTP ${res.status}`);
//   const data: unknown = await res.json();
//   // 간단한 런타임 가드
//   const valid = (v: unknown): v is SpellResponse =>
//     typeof (v as SpellResponse)?.original_text === 'string' &&
//     typeof (v as SpellResponse)?.corrected_text === 'string';
//   if (!valid(data)) throw new Error('Invalid API response');
//   return data;
// }


// src/lib/api.ts
import type { SpellResponse, SpellError } from '../types/spellcheck';

const BASE: string = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const USE_MOCK: boolean = process.env.NEXT_PUBLIC_USE_MOCK === '1' || BASE.trim() === '';

type Rule = {
  pattern: RegExp;
  suggestion: string;
  type: SpellError['type'];
  message: string;
};

/** 아주 간단한 테스트 규칙들 */
const RULES: ReadonlyArray<Rule> = [
  {
    pattern: /하세오/g,                 // 예: "안녕 하세오" → "안녕하세요"
    suggestion: '하세요',
    type: 'spelling',
    message: '‘하세요’가 바른 표기예요.',
  },
  {
    pattern: /날씨가\s*좋습니다/g,      // 예: "날씨가좋습니다" → "날씨가 좋습니다"
    suggestion: '날씨가 좋습니다',
    type: 'spacing',
    message: '띄어쓰기를 교정했어요.',
  },
];

function buildMock(text: string): SpellResponse {
  // corrected_text 만들기
  let corrected: string = text;
  for (const r of RULES) {
    corrected = corrected.replace(r.pattern, r.suggestion);
  }

  // original_text 기준으로 오류 위치 수집
  const errors: SpellError[] = [];
  for (const r of RULES) {
    const regex: RegExp = new RegExp(r.pattern.source, r.pattern.flags); // lastIndex 보호
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const matched: string = m[0];
      const offset: number = m.index;
      const length: number = matched.length;
      errors.push({
        type: r.type,
        offset,
        length,
        message: r.message,
        suggestion: r.suggestion,
      });
    }
  }

  return {
    original_text: text,
    corrected_text: corrected,
    errors: errors.length > 0 ? errors : [],
  };
}

export async function spellcheck(text: string): Promise<SpellResponse> {
  if (USE_MOCK) {
    // 네트워크 대기 느낌만 300ms 넣기
    await new Promise<void>((res): void => { window.setTimeout(res, 300); });
    return buildMock(text);
  }

  // ← 여기부터는 실서버 연동
  const res: Response = await fetch(`${BASE}/spellcheck`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ original_text: text }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();

  // 간단한 런타임 가드
  const isValid = (v: unknown): v is SpellResponse =>
    typeof (v as SpellResponse)?.original_text === 'string' &&
    typeof (v as SpellResponse)?.corrected_text === 'string';

  if (!isValid(data)) throw new Error('Invalid API response');
  return data;
}
