var getBytesRemaining = require('./getBytesRemaining');

describe('getBytesRemaining', function () {
  it('should calculate the bytes remaining given a fileProgress object', function () {
    var fileProgress = {
      bytesUploaded: 1024,
      bytesTotal: 3096
    };
    expect(getBytesRemaining(fileProgress)).toEqual(2072);
  });
});
//# sourceMappingURL=getBytesRemaining.test.js.map