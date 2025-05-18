import { writable } from 'svelte/store';

export const pipeline = writable([
  { id: 'internal-generate-ast', operator: 'generateAST' }
]);
