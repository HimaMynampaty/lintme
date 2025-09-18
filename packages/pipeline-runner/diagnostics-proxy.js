import { isLineSuppressed } from './suppressions.js';

export function createDiagnosticsProxy(ctx) {
  const arr = [];

  const filterItems = (items) =>
    items.filter((d) => {
      const ln = Number(d?.line) || 1;
      return !isLineSuppressed(ctx, ln);
    });

  return new Proxy(arr, {
    get(target, prop, receiver) {
      if (prop === 'push') {
        return (...items) => Array.prototype.push.apply(target, filterItems(items));
      }
      if (prop === 'unshift') {
        return (...items) => Array.prototype.unshift.apply(target, filterItems(items));
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value) {
      if (!isNaN(prop)) {
        const ln = Number(value?.line) || 1;
        if (isLineSuppressed(ctx, ln)) return true;
      }
      target[prop] = value;
      return true;
    },
  });
}
