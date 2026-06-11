// Single source of truth lives in the repository-root types.ts. This module
// re-exports it so existing `src/...` imports (./types, ../types) keep working
// without maintaining a second, drifting copy.
export * from '../types';
