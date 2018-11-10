var getETA = require('./getETA');

describe('getETA', function () {
  it('should get the ETA remaining based on a fileProgress object', function () {
    var dateNow = new Date();
    var date5SecondsAgo = new Date(dateNow.getTime() - 5 * 1000);
    var fileProgress = {
      bytesUploaded: 1024,
      bytesTotal: 3096,
      uploadStarted: date5SecondsAgo
    };
    expect(getETA(fileProgress)).toEqual(10.1);
  });
});
//# sourceMappingURL=getETA.test.js.map