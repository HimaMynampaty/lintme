import { writable } from 'svelte/store';

export const pipeline = writable([
  { id: 'internal-generate-ast', operator: 'generateAST' }
]);

export const INTERNAL_AST_STEP = { id: 'internal-generate-ast', operator: 'generateAST' };