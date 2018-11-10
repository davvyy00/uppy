var getFileNameAndExtension = require('./getFileNameAndExtension');

describe('getFileNameAndExtension', function () {
  it('should return the filename and extension as an array', function () {
    expect(getFileNameAndExtension('fsdfjodsuf23rfw.jpg')).toEqual({
      name: 'fsdfjodsuf23rfw',
      extension: 'jpg'
    });
  });

  it('should handle invalid filenames', function () {
    expect(getFileNameAndExtension('fsdfjodsuf23rfw')).toEqual({
      name: 'fsdfjodsuf23rfw',
      extension: undefined
    });
  });
});
//# sourceMappingURL=getFileNameAndExtension.test.js.map