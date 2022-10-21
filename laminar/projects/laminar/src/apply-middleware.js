export function applyMiddleware(fn, middleware) {
  return middleware.reduce((fn, middlewareFn) => middlewareFn(fn), fn);
}
