var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

/**
 * Runs an array of promise-returning functions in sequence.
 */
module.exports = function runPromiseSequence(functions) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var promise = _Promise.resolve();
  functions.forEach(function (func) {
    promise = promise.then(function () {
      return func.apply(undefined, args);
    });
  });
  return promise;
};
//# sourceMappingURL=runPromiseSequence.js.map