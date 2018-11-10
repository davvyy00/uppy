var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var h = require('react').createElement;

var _require = require('enzyme'),
    mount = _require.mount,
    configure = _require.configure;

var ReactAdapter = require('enzyme-adapter-react-16');
var Uppy = require('../core');

jest.mock('../plugins/Dashboard', function () {
  return require('./__mocks__/DashboardPlugin');
});

var DashboardModal = require('./DashboardModal');

beforeAll(function () {
  configure({ adapter: new ReactAdapter() });
});

beforeEach(function () {
  _extends(require('../plugins/Dashboard').prototype, {
    openModal: jest.fn(),
    closeModal: jest.fn()
  });
});

describe('react <DashboardModal />', function () {
  it('can be mounted and unmounted', function () {
    var oninstall = jest.fn();
    var onuninstall = jest.fn();
    var uppy = Uppy();
    var dash = mount(h(DashboardModal, {
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

  it('opens the modal using the `open={true}` prop', function () {
    var uppy = Uppy();
    var dash = mount(h(DashboardModal, {
      uppy: uppy,
      open: false
    }));

    var _dash$instance = dash.instance(),
        plugin = _dash$instance.plugin;

    expect(plugin.openModal).not.toHaveBeenCalled();

    dash.setProps({ open: true });

    expect(plugin.openModal).toHaveBeenCalled();

    dash.unmount();
  });

  it('closes the modal using the `open={false}` prop', function () {
    var uppy = Uppy();
    var dash = mount(h(DashboardModal, {
      uppy: uppy,
      open: true
    }));

    var _dash$instance2 = dash.instance(),
        plugin = _dash$instance2.plugin;

    expect(plugin.openModal).toHaveBeenCalled();
    expect(plugin.closeModal).not.toHaveBeenCalled();

    dash.setProps({ open: false });

    expect(plugin.closeModal).toHaveBeenCalled();

    dash.unmount();
  });
});
//# sourceMappingURL=DashboardModal.test.js.map