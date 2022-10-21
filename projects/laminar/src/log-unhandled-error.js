export function logUnhandledError({ id, fn, args, directives, error, resolved = false }) {
  if (resolved) return;

  console.log(`%c - LAMINAR ERROR - `, `color: #dd7b78; font-size: 18px; font-weight: bold;`);
  console.log(`%c Unhandled ${error.name}: %c ${error.message}`, `color: #ed1a3d`, `color: #dd7b78; font-weight: normal; letter-spacing: 1px; font-family: sans-serif;`);
  console.log('%c Step ID: %o', `color: #ed1a3d`, id);
  console.log('%c Args: %o', `color: #ed1a3d`, args);
  console.log('%c Directives: %o', `color: #ed1a3d`, directives);
  console.groupCollapsed('%c Function:', `color: #ed1a3d`)
    console.log(fn.toString());
  console.groupEnd();
  console.error(error);
}
