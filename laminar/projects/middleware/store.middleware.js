export const storeMiddleware = (store = {}) => {
  return function storeMiddleware(ctrl) {
    return next => async directive => {
      if (directive.store && typeof directive.store === 'string') {
        const response = await next(directive);

        Object.assign(store, { [directive.store]: response });

        return response;
      }

      if (directive.store && typeof directive.store === 'function') {
        const response = await next(directive);

        Object.assign(store, directive.store(response, store));

        return response;
      }

      if (typeof directive === 'function') {
        return next(directive(store));
      }

      return next(directive);
    };
  };
};
