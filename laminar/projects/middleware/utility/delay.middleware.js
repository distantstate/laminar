
export const delayMiddleware = (ctrl) => (next) => async (directive) => {

  if (directive.delay && !directive.fn) {
    return await next({ ...directive, fn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('RESOLVE FN DELAY');
          resolve();
        }, directive.delay);
      })
    }})
  }

  const response =  next(directive);

  if (directive.delay && directive.fn) {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve(response);
        console.log('RESOLVE DELAY');
      }, directive.delay);
    })
  }

  return response;
};
