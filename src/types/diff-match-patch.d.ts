// diff-match-patch 라이브러리를 위한 타입 선언
declare module 'diff-match-patch' {
  export const DIFF_DELETE: -1;
  export const DIFF_EQUAL: 0;
  export const DIFF_INSERT: 1;

  export type DiffOp = typeof DIFF_DELETE | typeof DIFF_EQUAL | typeof DIFF_INSERT;
  export type Diff = [DiffOp, string];

  export class diff_match_patch {
    diff_main(text1: string, text2: string): Diff[];
    diff_cleanupSemantic(diffs: Diff[]): void;
  }
}
