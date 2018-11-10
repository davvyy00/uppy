var isTouchDevice = require('./isTouchDevice');

describe('isTouchDevice', function () {
  var RealTouchStart = global.window.ontouchstart;
  var RealMaxTouchPoints = global.navigator.maxTouchPoints;

  beforeEach(function () {
    global.window.ontouchstart = true;
    global.navigator.maxTouchPoints = 1;
  });

  afterEach(function () {
    global.navigator.maxTouchPoints = RealMaxTouchPoints;
    global.window.ontouchstart = RealTouchStart;
  });

  xit("should return true if it's a touch device", function () {
    expect(isTouchDevice()).toEqual(true);
    delete global.window.ontouchstart;
    global.navigator.maxTouchPoints = false;
    expect(isTouchDevice()).toEqual(false);
  });
});
//# sourceMappingURL=isTouchDevice.test.js.map