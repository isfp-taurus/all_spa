export type PageIdType = (typeof PageIdType)[keyof typeof PageIdType];
export const PageIdType = {
  LOGIN: 'M011',
} as const;
