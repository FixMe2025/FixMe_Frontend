// 요청 타입
export interface PipelineRunRequest {
  text: string;
}

// 교정 항목
export interface Correction {
  original: string;
  corrected: string;
  type: string; // "타이포/띄어쓰기" | "문법/자연스러움" 등
}

// 응답 타입
export interface PipelineRunResponse {
  original_text: string;
  corrected_text: string;
  corrections: Correction[];
  stage_texts?: {
    step1?: string;
    final?: string;
  };
}
