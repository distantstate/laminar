
export const bindMiddleware = (ctrl) => (next) => (directive) => {
  if (directive.bind) {
    return next({ ...directive, fn: () => {
      const element = document.querySelector(directive.bind);
      if (directive.onClick) element.addEventListener('click', directive.onClick);
    }})
  }

  return next(directive);
};
