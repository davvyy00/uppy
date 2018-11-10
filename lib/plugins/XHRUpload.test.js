var nock = require('nock');
var Core = require('../core');
var XHRUpload = require('./XHRUpload');

describe('XHRUpload', function () {
  describe('getResponseData', function () {
    it('has the XHRUpload options as its `this`', function () {
      nock('https://fake-endpoint.uppy.io').defaultReplyHeaders({
        'access-control-allow-method': 'POST',
        'access-control-allow-origin': '*'
      }).options('/').reply(200, {}).post('/').reply(200, {});

      var core = new Core({ autoProceed: false });
      var getResponseData = jest.fn(function () {
        expect(this.some).toEqual('option');
        return {};
      });
      core.use(XHRUpload, {
        id: 'XHRUpload',
        endpoint: 'https://fake-endpoint.uppy.io',
        some: 'option',
        getResponseData: getResponseData
      });
      core.addFile({
        name: 'test.jpg',
        data: new Blob([Buffer.alloc(8192)])
      });

      return core.upload().then(function () {
        expect(getResponseData).toHaveBeenCalled();
      });
    });
  });
});
//# sourceMappingURL=XHRUpload.test.js.map