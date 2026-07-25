/** Helper – tells TypeScript “only plain objects are processed” */
export const isObject = (v: any): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);