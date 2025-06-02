export const OPERATORS = {
  'generateAST': () => import('@himamynampaty/operator-generate-ast').then(m => m.run),
  'filter':      () => import('@himamynampaty/operator-filter').then(m => m.run),
  'count':       () => import('@himamynampaty/operator-count').then(m => m.run),
  'threshold':   () => import('@himamynampaty/operator-threshold').then(m => m.run),
  'isPresent':   () => import('@himamynampaty/operator-ispresent').then(m => m.run),
  'regexMatch': () => import('@himamynampaty/operator-regexmatch').then(m => m.run),
  'sage':        () => import('@himamynampaty/operator-sage').then(m => m.run),
  'compare': () => import('@himamynampaty/operator-compare').then(m => m.run),
  'length': () => import('@himamynampaty/operator-length').then(m => m.run),
  'search': () => import('@himamynampaty/operator-search').then(m => m.run),
};
