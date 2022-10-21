import { applyMiddleware } from './apply-middleware.js';

export function* flowGenerator(flow, args, middleware, fn) {
  for (const step of flow(args)) {
    yield applyMiddleware(fn, middleware)(step);
  }
}
