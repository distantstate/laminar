const testSummary = {
  failed: [],
  passed: 0,
  promise: null,
  resolve: null,
  reject: null,
};


const logResult = (passed, id, values) => {
  if (passed) {
    testSummary.passed += 1;
    console.log('%c ✓ Passed: %o', 'color: #B0D8A4', id);
  } else {
    testSummary.failed.push({ id, values });
    console.log('%c ✗ Failed: %o', 'color: #E84258', id);
  }
}

export const assertMiddleware = (ctrl) => (next) => async ({ assert, ...step }) => {

  if (assert) {

    if (assert.init) {
      return next({ fn: () => {
        testSummary.reject?.();
        testSummary.promise = new Promise((res, rej) => {
          testSummary.resolve = res;
          testSummary.reject = rej;
        });
        testSummary.failed = [];
        testSummary.passed = 0;
        console.log('%c Running assertions:', 'color: #FEE191; font-weight: bold; font-size: 14px; margin-top: 10px; margin-bottom: 10px;');
      }});
    }
    
    if (assert.log) {
      return next({ fn: () => {
        console.log('%c Summary:', 'color: #FEE191; font-weight: bold; font-size: 14px; margin-top: font-size: 14px; margin-top: 10px; margin-bottom: 10px;');
        console.log('%c Assertions Passed: %o', 'color: #B0D8A4; font-weight: bold; font-size: 14px; margin: 10px;', testSummary.passed);
        console.log('%c Assertions Failed: %o', 'color: #E84258; font-weight: bold; font-size: 14px; margin: 10px;', testSummary.failed.length);
        testSummary.resolve();
      }});
    }
  }

  const response = await next(step);

  if (assert) {

    if ('equal' in assert) {
      const equal = typeof assert.equal === 'function' ? assert.equal() : assert.equal;
      const pass = response === equal;

      logResult(pass, step.id, { response, equal });

      if (!pass) {
        testSummary.promise.then(() => {
          console.groupCollapsed('%c ✗ Failed: %o %o', 'color: #E84258', step.id, { response, equal });
            console.trace();
          console.groupEnd();
        });
      }
    }

    if ('deepEqual' in assert) {
      const deepEqual = typeof assert.deepEqual === 'function' ? assert.deepEqual() : assert.deepEqual
      const pass = JSON.stringify(response) === JSON.stringify(deepEqual);

      logResult(pass, step.id, { response, deepEqual });

      if (!pass) {
        testSummary.promise.then(() => {
          console.groupCollapsed('%c ✗ Failed: %o %o', 'color: #E84258', step.id, { response, deepEqual });
            console.trace();
          console.groupEnd();
        });
      }
    }

    if ('gt' in assert) {
      const gt = typeof assert.gt === 'function' ? assert.gt() : assert.gt;
      const pass = response > gt;

      logResult(pass, step.id, { response, gt });

      if (!pass) {
        testSummary.promise.then(() => {
          console.groupCollapsed('%c ✗ Failed: %o %o', 'color: #E84258', step.id, { response, gt });
            console.trace();
          console.groupEnd();
        });
      }
    }

    if ('lt' in assert) {
      const lt = typeof assert.lt === 'function' ? assert.lt() : assert.gt;
      const pass = response < lt;

      logResult(pass, step.id, { response, lt });

      if (!pass) {
        testSummary.promise.then(() => {
          console.groupCollapsed('%c ✗ Failed: %o %o', 'color: #E84258', step.id, { response, lt });
            console.trace();
          console.groupEnd();
        });
      }
    }
  }

  return response;
}
