export const pushFlowMiddleware = (ctrl) => (next) => ({ push: flow, ...step }) => {

  if (flow) return next({ ...step, fn: (args) => ctrl.push(flow, args) });

  return next(step);
}
