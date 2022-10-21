
export const styleMiddleware = (ctrl) => (next) => (directive) => {

  if (directive.addClass || directive.removeClass || directive.toggleClass || directive.display || directive.style) {
    return next({ ...directive, fn: () => {
      const element = document.querySelector(directive.select);
      if (directive.addClass) element.classList.add(directive.addClass);
      if (directive.removeClass)  element.classList.remove(directive.removeClass);
      if (directive.toggleClass) element.classList.toggle(directive.toggleClass);
      if (directive.display) element.style.display = directive.display;
      if (directive.style) element.style[directive.style] = directive.value;
    }})
  }

  return next(directive);
};
