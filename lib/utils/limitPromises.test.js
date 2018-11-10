var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

var limitPromises = require('./limitPromises');

describe('limitPromises', function () {
  var pending = 0;
  function fn() {
    pending++;
    return new _Promise(function (resolve) {
      return setTimeout(resolve, 10);
    }).then(function () {
      return pending--;
    });
  }

  it('should run at most N promises at the same time', function () {
    var limit = limitPromises(4);
    var fn2 = limit(fn);

    var result = _Promise.all([fn2(), fn2(), fn2(), fn2(), fn2(), fn2(), fn2(), fn2(), fn2(), fn2()]);

    expect(pending).toBe(4);
    setTimeout(function () {
      expect(pending).toBe(4);
    }, 10);

    return result.then(function () {
      expect(pending).toBe(0);
    });
  });

  it('should accept Infinity as limit', function () {
    var limit = limitPromises(Infinity);
    var fn2 = limit(fn);

    var result = _Promise.all([fn2(), fn2(), fn2(), fn2(), fn2(), fn2(), fn2(), fn2(), fn2(), fn2()]);

    expect(pending).toBe(10);

    return result.then(function () {
      expect(pending).toBe(0);
    });
  });
});
//# sourceMappingURL=limitPromises.test.js.map