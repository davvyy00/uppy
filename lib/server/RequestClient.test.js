var RequestClient = require('./RequestClient');

describe('RequestClient', function () {
  it('has a hostname without trailing slash', function () {
    var mockCore = { getState: function getState() {
        return {};
      } };
    var a = new RequestClient(mockCore, { serverUrl: 'http://server.uppy.io' });
    var b = new RequestClient(mockCore, { serverUrl: 'http://server.uppy.io/' });

    expect(a.hostname).toBe('http://server.uppy.io');
    expect(b.hostname).toBe('http://server.uppy.io');
  });
});
//# sourceMappingURL=RequestClient.test.js.map