import { logUnhandledError } from "./log-unhandled-error.js";
import { applyMiddleware } from "./apply-middleware.js";
import { flowGenerator } from "./flow-generator.js";

export function createController(...args) {
  const ctrl = {};

  const { mdw, opts } = args.reduce(
    (acc, arg, i) => {
      return i === args.length - 1 && typeof arg !== "function"
        ? { mdw: acc.mdw, opts: arg }
        : { mdw: [...acc.mdw, arg(ctrl)], opts: {} };
    },
    { mdw: [], opts: {} }
  );

  async function tryFn({ id, fn, args, onError: errorMiddleware = [], ...directives }) {
    try {
      return await fn(args);
    } catch (error) {
      return applyMiddleware(
        opts.errorHandler || logUnhandledError,
        errorMiddleware.map((mdw) => mdw(ctrl))
      )({ id, fn, args, directives, error, resolved: false });
    }
  }

  ctrl.push = async function (flow, args) {
    for (const step of flowGenerator(flow, args, mdw, tryFn)) {
      await step;
    }
  };

  return ctrl;
}
