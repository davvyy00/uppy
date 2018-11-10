var getFileType = require('./getFileType');

describe('getFileType', function () {
  it('should trust the filetype if the file comes from a remote source', function () {
    var file = {
      isRemote: true,
      type: 'audio/webm',
      name: 'foo.webm'
    };
    expect(getFileType(file)).toEqual('audio/webm');
  });

  it('should determine the filetype from the mimetype', function () {
    var file = {
      type: 'audio/webm',
      name: 'foo.webm',
      data: 'sdfsdfhq9efbicw'
    };
    expect(getFileType(file)).toEqual('audio/webm');
  });

  it('should determine the filetype from the extension', function () {
    var fileMP3 = {
      name: 'foo.mp3',
      data: 'sdfsfhfh329fhwihs'
    };
    var fileYAML = {
      name: 'bar.yaml',
      data: 'sdfsfhfh329fhwihs'
    };
    var fileMKV = {
      name: 'bar.mkv',
      data: 'sdfsfhfh329fhwihs'
    };
    expect(getFileType(fileMP3)).toEqual('audio/mp3');
    expect(getFileType(fileYAML)).toEqual('text/yaml');
    expect(getFileType(fileMKV)).toEqual('video/x-matroska');
  });

  it('should fail gracefully if unable to detect', function () {
    var file = {
      name: 'foobar',
      data: 'sdfsfhfh329fhwihs'
    };
    expect(getFileType(file)).toEqual(null);
  });
});
//# sourceMappingURL=getFileType.test.js.map