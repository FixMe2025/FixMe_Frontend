// src/lib/api.ts
import type { PipelineRunResponse } from "@/types/pipeline";

const BASE: string = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const USE_MOCK: boolean =
  process.env.NEXT_PUBLIC_USE_MOCK === "1" || BASE.trim() === "";

/**
 * /api/v1/pipeline/run 호출
 */
export async function pipelineRun(text: string): Promise<PipelineRunResponse> {
  console.log("🟢 [프론트] 파이프라인 실행 시작");
  if (USE_MOCK) {
    console.log("⚠️ [프론트] MOCK 모드 활성화됨");
    await new Promise((res) => setTimeout(res, 300));
    return {
      original_text: text,
      corrected_text: text.replace(/하세오/g, "하세요"),
      corrections: [
        { type: "spelling", original: "하세오", corrected: "하세요" },
      ],
    };
  }

  console.log("🌐 [프론트] 서버로 요청 전송:", `${BASE}/api/v1/pipeline/run`);
  const res = await fetch(`${BASE}/api/v1/pipeline/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ original_text: text }),
  });

  console.log("📥 [프론트] 응답 수신 상태:", res.status);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: unknown = await res.json();
  console.log("✅ [프론트] 응답 JSON:", data);

  return data as PipelineRunResponse;
}

/**
 * /api/v1/comprehensive/comprehensive 호출
 */
export async function comprehensive(
  text: string
): Promise<PipelineRunResponse> {
  console.log("🟢 [프론트] 종합 교정 실행 시작");
  if (USE_MOCK) {
    console.log("⚠️ [프론트] MOCK 모드 활성화됨");
    await new Promise((res) => setTimeout(res, 300));
    return {
      original_text: text,
      corrected_text: text.replace(/굿이에요/g, "좋아요"),
      corrections: [
        { type: "expression", original: "굿이에요", corrected: "좋아요" },
      ],
    };
  }

  console.log(
    "🌐 [프론트] 서버로 요청 전송:",
    `${BASE}/api/v1/comprehensive/comprehensive`
  );
  const res = await fetch(`${BASE}/api/v1/comprehensive/comprehensive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      include_improvement: true, // 필요 시
      style: "formal", // 'formal' | 'casual' | 'academic' | 'business'
    }),
  });

  console.log("📥 [프론트] 응답 수신 상태:", res.status);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: unknown = await res.json();
  console.log("✅ [프론트] 응답 JSON:", data);

  return data as PipelineRunResponse;
}
