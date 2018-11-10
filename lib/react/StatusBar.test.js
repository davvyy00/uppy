var h = require('react').createElement;

var _require = require('enzyme'),
    mount = _require.mount,
    configure = _require.configure;

var ReactAdapter = require('enzyme-adapter-react-16');
var Uppy = require('../core');

beforeAll(function () {
  configure({ adapter: new ReactAdapter() });
});

jest.mock('../plugins/StatusBar', function () {
  return require('./__mocks__/StatusBarPlugin');
});

var StatusBar = require('./StatusBar');

describe('react <StatusBar />', function () {
  it('can be mounted and unmounted', function () {
    var oninstall = jest.fn();
    var onuninstall = jest.fn();
    var uppy = Uppy();
    var dash = mount(h(StatusBar, {
      uppy: uppy,
      onInstall: oninstall,
      onUninstall: onuninstall
    }));

    expect(oninstall).toHaveBeenCalled();
    expect(onuninstall).not.toHaveBeenCalled();

    dash.unmount();

    expect(oninstall).toHaveBeenCalled();
    expect(onuninstall).toHaveBeenCalled();
  });
});
//# sourceMappingURL=StatusBar.test.js.map