var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

var settle = require('./settle');

describe('settle', function () {
  it('should resolve even if all input promises reject', function () {
    return expect(settle([_Promise.reject(new Error('oops')), _Promise.reject(new Error('this went wrong'))])).resolves.toMatchObject({
      successful: [],
      failed: [new Error('oops'), new Error('this went wrong')]
    });
  });

  it('should resolve with an object if some input promises resolve', function () {
    return expect(settle([_Promise.reject(new Error('rejected')), _Promise.resolve('resolved'), _Promise.resolve('also-resolved')])).resolves.toMatchObject({
      successful: ['resolved', 'also-resolved'],
      failed: [new Error('rejected')]
    });
  });
});
//# sourceMappingURL=settle.test.js.map