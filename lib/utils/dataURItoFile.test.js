var dataURItoFile = require('./dataURItoFile');
var sampleImageDataURI = require('./sampleImageDataURI');

describe('dataURItoFile', function () {
  it('should convert a data uri to a file', function () {
    var file = dataURItoFile(sampleImageDataURI, { name: 'foo.jpg' });
    expect(file instanceof File).toEqual(true);
    expect(file.size).toEqual(9348);
    expect(file.type).toEqual('image/jpeg');
    expect(file.name).toEqual('foo.jpg');
  });
});
//# sourceMappingURL=dataURItoFile.test.js.map