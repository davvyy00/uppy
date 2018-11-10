var getSpeed = require('./getSpeed');

describe('getSpeed', function () {
  it('should calculate the speed given a fileProgress object', function () {
    var dateNow = new Date();
    var date5SecondsAgo = new Date(dateNow.getTime() - 5 * 1000);
    var fileProgress = {
      bytesUploaded: 1024,
      uploadStarted: date5SecondsAgo
    };
    expect(Math.round(getSpeed(fileProgress))).toEqual(Math.round(205));
  });
});
//# sourceMappingURL=getSpeed.test.js.map