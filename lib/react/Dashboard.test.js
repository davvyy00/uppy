var h = require('react').createElement;

var _require = require('enzyme'),
    mount = _require.mount,
    configure = _require.configure;

var ReactAdapter = require('enzyme-adapter-react-16');
var Uppy = require('../core');

beforeAll(function () {
  configure({ adapter: new ReactAdapter() });
});

jest.mock('../plugins/Dashboard', function () {
  return require('./__mocks__/DashboardPlugin');
});

var Dashboard = require('./Dashboard');

describe('react <Dashboard />', function () {
  it('can be mounted and unmounted', function () {
    var oninstall = jest.fn();
    var onuninstall = jest.fn();
    var uppy = Uppy();
    var dash = mount(h(Dashboard, {
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
//# sourceMappingURL=Dashboard.test.js.map