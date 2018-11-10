var isPreviewSupported = require('./isPreviewSupported');

describe('isPreviewSupported', function () {
  it('should return true for any filetypes that browsers can preview', function () {
    var supported = ['image/jpeg', 'image/gif', 'image/png', 'image/svg', 'image/svg+xml', 'image/bmp'];
    supported.forEach(function (ext) {
      expect(isPreviewSupported(ext)).toEqual(true);
    });
    expect(isPreviewSupported('foo')).toEqual(false);
  });
});
//# sourceMappingURL=isPreviewSupported.test.js.map