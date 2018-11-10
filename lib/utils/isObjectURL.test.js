var isObjectURL = require('./isObjectURL');

describe('isObjectURL', function () {
  it('should return true if the specified url is an object url', function () {
    expect(isObjectURL('blob:abc123')).toEqual(true);
    expect(isObjectURL('kblob:abc123')).toEqual(false);
    expect(isObjectURL('blob-abc123')).toEqual(false);
    expect(isObjectURL('abc123')).toEqual(false);
  });
});
//# sourceMappingURL=isObjectURL.test.js.map