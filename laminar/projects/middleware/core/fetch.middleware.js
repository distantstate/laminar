export const fetchMiddleware = ({ get, put, post, del }) => {
  return function fetchMiddleware(ctrl) {
    return next => directive => {
      if (directive.get) {
        return next({ fn: get, args: directive.get, ...directive });
      }

      if (directive.put) {
        return next({ fn: put, args: directive.put, ...directive });
      }

      if (directive.post) {
        return next({ fn: post, args: directive.post, ...directive });
      }

      if (directive.delete) {
        return next({ fn: del, args: directive.delete, ...directive });
      }

      return next(directive);
    };
  };
};
