export const logMiddleware = logAll => {
  return function logMiddleware(ctrl) {
    return next => async ({ log, ...directive }) => {
      const response = await next(directive);

      if (log || logAll) console.log(directive, { response });

      return response;
    };
  };
};
