var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

var runPromiseSequence = require('./runPromiseSequence');

describe('runPromiseSequence', function () {
  it('should run an array of promise-returning functions in sequence', function () {
    var promiseFn1 = jest.fn().mockReturnValue(_Promise.resolve);
    var promiseFn2 = jest.fn().mockReturnValue(_Promise.resolve);
    var promiseFn3 = jest.fn().mockReturnValue(_Promise.resolve);
    return runPromiseSequence([promiseFn1, promiseFn2, promiseFn3]).then(function () {
      expect(promiseFn1.mock.calls.length).toEqual(1);
      expect(promiseFn2.mock.calls.length).toEqual(1);
      expect(promiseFn3.mock.calls.length).toEqual(1);
    });
  });
});
//# sourceMappingURL=runPromiseSequence.test.js.map