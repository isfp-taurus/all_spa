export type FunctionIdType = (typeof FunctionIdType)[keyof typeof FunctionIdType];
export const FunctionIdType = {
  LOGIN: 'S01',
} as const;
