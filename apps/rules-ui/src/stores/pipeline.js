import { writable } from 'svelte/store';

export const pipeline = writable([
  { operator: 'generateAST' }
]);
