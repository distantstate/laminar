export const asyncMiddleware = (ctrl) => (next) => (step) => {

  /**
   * Due to the fact thet we're passing an array instead of the usual step object,
   * asyncMiddleware muat always come last in the middleware stack when instantiating a controller.
   *                                                                    
   * const ctrl = createController(logMiddleware(true), pushMiddleware, asyncMiddleware);
   *                                                                    ^^^^^^^^^^^^^^^
   * 
   * This prevents other middleware from trying to handle the array as an object.
   */

  if (Array.isArray(step)) {
    return next({
      fn: () =>
        Promise.all(
          step.map((asyncSteps) => {
            return ctrl.push(() => [asyncSteps]);
          })
        ),
    });
  }

  return next(step);
}
