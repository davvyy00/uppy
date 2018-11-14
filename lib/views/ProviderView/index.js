var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

var _require = require('preact'),
    h = _require.h,
    Component = _require.Component;

var AuthView = require('./AuthView');
var Browser = require('./Browser');
var LoaderView = require('./Loader');
var generateFileID = require('../../utils/generateFileID');
var getFileType = require('../../utils/getFileType');
var isPreviewSupported = require('../../utils/isPreviewSupported');

/**
 * Array.prototype.findIndex ponyfill for old browsers.
 */
function findIndex(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i])) return i;
  }
  return -1;
}

var CloseWrapper = function (_Component) {
  _inherits(CloseWrapper, _Component);

  function CloseWrapper() {
    _classCallCheck(this, CloseWrapper);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  CloseWrapper.prototype.componentWillUnmount = function componentWillUnmount() {
    this.props.onUnmount();
  };

  CloseWrapper.prototype.render = function render() {
    return this.props.children[0];
  };

  return CloseWrapper;
}(Component);

/**
 * Class to easily generate generic views for plugins
 *
 *
 * This class expects the plugin instance using it to have the following
 * accessor methods.
 * Each method takes the item whose property is to be accessed
 * as a param
 *
 * isFolder
 *    @return {Boolean} for if the item is a folder or not
 * getItemData
 *    @return {Object} that is format ready for uppy upload/download
 * getItemIcon
 *    @return {Object} html instance of the item's icon
 * getItemSubList
 *    @return {Array} sub-items in the item. e.g a folder may contain sub-items
 * getItemName
 *    @return {String} display friendly name of the item
 * getMimeType
 *    @return {String} mime type of the item
 * getItemId
 *    @return {String} unique id of the item
 * getItemRequestPath
 *    @return {String} unique request path of the item when making calls to uppy server
 * getItemModifiedDate
 *    @return {object} or {String} date of when last the item was modified
 * getItemThumbnailUrl
 *    @return {String}
 */


module.exports = function () {
  /**
   * @param {object} instance of the plugin
   */
  function ProviderView(plugin, opts) {
    _classCallCheck(this, ProviderView);

    this.plugin = plugin;
    this.Provider = plugin[plugin.id];

    // set default options
    var defaultOptions = {
      viewType: 'list',
      showTitles: true,
      showFilter: true,
      showBreadcrumbs: true

      // merge default options with the ones set by user
    };this.opts = _extends({}, defaultOptions, opts);

    // Logic
    this.addFile = this.addFile.bind(this);
    this.filterItems = this.filterItems.bind(this);
    this.filterQuery = this.filterQuery.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.getFolder = this.getFolder.bind(this);
    this.getNextFolder = this.getNextFolder.bind(this);
    this.logout = this.logout.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
    this.handleAuth = this.handleAuth.bind(this);
    this.handleDemoAuth = this.handleDemoAuth.bind(this);
    this.sortByTitle = this.sortByTitle.bind(this);
    this.sortByDate = this.sortByDate.bind(this);
    this.isActiveRow = this.isActiveRow.bind(this);
    this.isChecked = this.isChecked.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.donePicking = this.donePicking.bind(this);
    this.cancelPicking = this.cancelPicking.bind(this);
    this.clearSelection = this.clearSelection.bind(this);

    // Visual
    this.render = this.render.bind(this);

    this.clearSelection();
  }

  ProviderView.prototype.tearDown = function tearDown() {
    // Nothing.
  };

  ProviderView.prototype._updateFilesAndFolders = function _updateFilesAndFolders(res, files, folders) {
    var _this2 = this;

    this.plugin.getItemSubList(res).forEach(function (item) {
      if (_this2.plugin.isFolder(item)) {
        folders.push(item);
      } else {
        files.push(item);
      }
    });

    this.plugin.setPluginState({ folders: folders, files: files });
  };

  ProviderView.prototype.checkAuth = function checkAuth() {
    var _this3 = this;

    this.plugin.setPluginState({ checkAuthInProgress: true });
    this.Provider.checkAuth().then(function (authenticated) {
      _this3.plugin.setPluginState({ checkAuthInProgress: false });
      _this3.plugin.onAuth(authenticated);
    }).catch(function (err) {
      _this3.plugin.setPluginState({ checkAuthInProgress: false });
      _this3.handleError(err);
    });
  };

  /**
   * Based on folder ID, fetch a new folder and update it to state
   * @param  {String} id Folder id
   * @return {Promise}   Folders/files in folder
   */


  ProviderView.prototype.getFolder = function getFolder(id, name) {
    var _this4 = this;

    return this._loaderWrapper(this.Provider.list(id), function (res) {
      var folders = [];
      var files = [];
      var updatedDirectories = void 0;

      var state = _this4.plugin.getPluginState();
      var index = findIndex(state.directories, function (dir) {
        return id === dir.id;
      });

      if (index !== -1) {
        updatedDirectories = state.directories.slice(0, index + 1);
      } else {
        updatedDirectories = state.directories.concat([{ id: id, title: name || _this4.plugin.getItemName(res) }]);
      }

      _this4.username = _this4.username ? _this4.username : _this4.plugin.getUsername(res);
      _this4._updateFilesAndFolders(res, files, folders);
      _this4.plugin.setPluginState({ directories: updatedDirectories });
    }, this.handleError);
  };

  /**
   * Fetches new folder
   * @param  {Object} Folder
   * @param  {String} title Folder title
   */


  ProviderView.prototype.getNextFolder = function getNextFolder(folder) {
    var id = this.plugin.getItemRequestPath(folder);
    this.getFolder(id, this.plugin.getItemName(folder));
    this.lastCheckbox = undefined;
  };

  ProviderView.prototype.addFile = function addFile(file) {
    var tagFile = {
      id: this.providerFileToId(file),
      source: this.plugin.id,
      data: this.plugin.getItemData(file),
      name: this.plugin.getItemName(file) || this.plugin.getItemId(file),
      type: this.plugin.getMimeType(file),
      isRemote: true,
      body: {
        fileId: this.plugin.getItemId(file)
      },
      remote: {
        serverUrl: this.plugin.opts.serverUrl,
        url: '' + this.Provider.fileUrl(this.plugin.getItemRequestPath(file)),
        body: {
          fileId: this.plugin.getItemId(file)
        },
        providerOptions: this.Provider.opts
      }
    };

    var fileType = getFileType(tagFile);
    // TODO Should we just always use the thumbnail URL if it exists?
    if (fileType && isPreviewSupported(fileType)) {
      tagFile.preview = this.plugin.getItemThumbnailUrl(file);
    }
    this.plugin.uppy.log('Adding remote file');
    try {
      this.plugin.uppy.addFile(tagFile);
    } catch (err) {
      // Nothing, restriction errors handled in Core
    }
  };

  ProviderView.prototype.removeFile = function removeFile(id) {
    var _plugin$getPluginStat = this.plugin.getPluginState(),
        currentSelection = _plugin$getPluginStat.currentSelection;

    this.plugin.setPluginState({
      currentSelection: currentSelection.filter(function (file) {
        return file.id !== id;
      })
    });
  };

  /**
   * Removes session token on client side.
   */


  ProviderView.prototype.logout = function logout() {
    var _this5 = this;

    this.Provider.logout(location.href).then(function (res) {
      if (res.ok) {
        var newState = {
          authenticated: false,
          files: [],
          folders: [],
          directories: []
        };
        _this5.plugin.setPluginState(newState);
      }
    }).catch(this.handleError);
  };

  ProviderView.prototype.filterQuery = function filterQuery(e) {
    var state = this.plugin.getPluginState();
    this.plugin.setPluginState(_extends({}, state, {
      filterInput: e ? e.target.value : ''
    }));
  };

  ProviderView.prototype.toggleSearch = function toggleSearch(inputEl) {
    var state = this.plugin.getPluginState();

    this.plugin.setPluginState({
      isSearchVisible: !state.isSearchVisible,
      filterInput: ''
    });
  };

  ProviderView.prototype.filterItems = function filterItems(items) {
    var _this6 = this;

    var state = this.plugin.getPluginState();
    if (state.filterInput === '') {
      return items;
    }
    return items.filter(function (folder) {
      return _this6.plugin.getItemName(folder).toLowerCase().indexOf(state.filterInput.toLowerCase()) !== -1;
    });
  };

  ProviderView.prototype.sortByTitle = function sortByTitle() {
    var _this7 = this;

    var state = _extends({}, this.plugin.getPluginState());
    var files = state.files,
        folders = state.folders,
        sorting = state.sorting;


    var sortedFiles = files.sort(function (fileA, fileB) {
      if (sorting === 'titleDescending') {
        return _this7.plugin.getItemName(fileB).localeCompare(_this7.plugin.getItemName(fileA));
      }
      return _this7.plugin.getItemName(fileA).localeCompare(_this7.plugin.getItemName(fileB));
    });

    var sortedFolders = folders.sort(function (folderA, folderB) {
      if (sorting === 'titleDescending') {
        return _this7.plugin.getItemName(folderB).localeCompare(_this7.plugin.getItemName(folderA));
      }
      return _this7.plugin.getItemName(folderA).localeCompare(_this7.plugin.getItemName(folderB));
    });

    this.plugin.setPluginState(_extends({}, state, {
      files: sortedFiles,
      folders: sortedFolders,
      sorting: sorting === 'titleDescending' ? 'titleAscending' : 'titleDescending'
    }));
  };

  ProviderView.prototype.sortByDate = function sortByDate() {
    var _this8 = this;

    var state = _extends({}, this.plugin.getPluginState());
    var files = state.files,
        folders = state.folders,
        sorting = state.sorting;


    var sortedFiles = files.sort(function (fileA, fileB) {
      var a = new Date(_this8.plugin.getItemModifiedDate(fileA));
      var b = new Date(_this8.plugin.getItemModifiedDate(fileB));

      if (sorting === 'dateDescending') {
        return a > b ? -1 : a < b ? 1 : 0;
      }
      return a > b ? 1 : a < b ? -1 : 0;
    });

    var sortedFolders = folders.sort(function (folderA, folderB) {
      var a = new Date(_this8.plugin.getItemModifiedDate(folderA));
      var b = new Date(_this8.plugin.getItemModifiedDate(folderB));

      if (sorting === 'dateDescending') {
        return a > b ? -1 : a < b ? 1 : 0;
      }

      return a > b ? 1 : a < b ? -1 : 0;
    });

    this.plugin.setPluginState(_extends({}, state, {
      files: sortedFiles,
      folders: sortedFolders,
      sorting: sorting === 'dateDescending' ? 'dateAscending' : 'dateDescending'
    }));
  };

  ProviderView.prototype.sortBySize = function sortBySize() {
    var _this9 = this;

    var state = _extends({}, this.plugin.getPluginState());
    var files = state.files,
        sorting = state.sorting;

    // check that plugin supports file sizes

    if (!files.length || !this.plugin.getItemData(files[0]).size) {
      return;
    }

    var sortedFiles = files.sort(function (fileA, fileB) {
      var a = _this9.plugin.getItemData(fileA).size;
      var b = _this9.plugin.getItemData(fileB).size;

      if (sorting === 'sizeDescending') {
        return a > b ? -1 : a < b ? 1 : 0;
      }
      return a > b ? 1 : a < b ? -1 : 0;
    });

    this.plugin.setPluginState(_extends({}, state, {
      files: sortedFiles,
      sorting: sorting === 'sizeDescending' ? 'sizeAscending' : 'sizeDescending'
    }));
  };

  ProviderView.prototype.isActiveRow = function isActiveRow(file) {
    return this.plugin.getPluginState().activeRow === this.plugin.getItemId(file);
  };

  ProviderView.prototype.isChecked = function isChecked(file) {
    var _plugin$getPluginStat2 = this.plugin.getPluginState(),
        currentSelection = _plugin$getPluginStat2.currentSelection;

    return currentSelection.some(function (item) {
      return item === file;
    });
  };

  /**
   * Adds all files found inside of specified folder.
   *
   * Uses separated state while folder contents are being fetched and
   * mantains list of selected folders, which are separated from files.
   */


  ProviderView.prototype.addFolder = function addFolder(folder) {
    var _this10 = this;

    var folderId = this.providerFileToId(folder);
    var state = this.plugin.getPluginState();
    var folders = state.selectedFolders || {};
    if (folderId in folders && folders[folderId].loading) {
      return;
    }
    folders[folderId] = { loading: true, files: [] };
    this.plugin.setPluginState({ selectedFolders: folders });
    return this.Provider.list(this.plugin.getItemRequestPath(folder)).then(function (res) {
      var files = [];
      _this10.plugin.getItemSubList(res).forEach(function (item) {
        if (!_this10.plugin.isFolder(item)) {
          _this10.addFile(item);
          files.push(_this10.providerFileToId(item));
        }
      });
      state = _this10.plugin.getPluginState();
      state.selectedFolders[folderId] = { loading: false, files: files };
      _this10.plugin.setPluginState({ selectedFolders: folders });
      var dashboard = _this10.plugin.uppy.getPlugin('Dashboard');
      var message = void 0;
      if (files.length) {
        message = dashboard.i18n('folderAdded', {
          smart_count: files.length, folder: _this10.plugin.getItemName(folder)
        });
      } else {
        message = dashboard.i18n('emptyFolderAdded');
      }
      _this10.plugin.uppy.info(message);
    }).catch(function (e) {
      state = _this10.plugin.getPluginState();
      delete state.selectedFolders[folderId];
      _this10.plugin.setPluginState({ selectedFolders: state.selectedFolders });
      _this10.handleError(e);
    });
  };

  /**
   * Toggles file/folder checkbox to on/off state while updating files list.
   *
   * Note that some extra complexity comes from supporting shift+click to
   * toggle multiple checkboxes at once, which is done by getting all files
   * in between last checked file and current one.
   */


  ProviderView.prototype.toggleCheckbox = function toggleCheckbox(e, file) {
    e.stopPropagation();
    e.preventDefault();

    var _plugin$getPluginStat3 = this.plugin.getPluginState(),
        folders = _plugin$getPluginStat3.folders,
        files = _plugin$getPluginStat3.files;

    var items = this.filterItems(folders.concat(files));

    // Shift-clicking selects a single consecutive list of items
    // starting at the previous click and deselects everything else.
    if (this.lastCheckbox && e.shiftKey) {
      var _currentSelection = void 0;
      var prevIndex = items.indexOf(this.lastCheckbox);
      var currentIndex = items.indexOf(file);
      if (prevIndex < currentIndex) {
        _currentSelection = items.slice(prevIndex, currentIndex + 1);
      } else {
        _currentSelection = items.slice(currentIndex, prevIndex + 1);
      }
      this.plugin.setPluginState({ currentSelection: _currentSelection });
      return;
    }

    this.lastCheckbox = file;

    var _plugin$getPluginStat4 = this.plugin.getPluginState(),
        currentSelection = _plugin$getPluginStat4.currentSelection;

    if (this.isChecked(file)) {
      this.plugin.setPluginState({
        currentSelection: currentSelection.filter(function (item) {
          return item !== file;
        })
      });
    } else {
      this.plugin.setPluginState({
        currentSelection: currentSelection.concat([file])
      });
    }
  };

  ProviderView.prototype.providerFileToId = function providerFileToId(file) {
    return generateFileID({
      data: this.plugin.getItemData(file),
      name: this.plugin.getItemName(file) || this.plugin.getItemId(file),
      type: this.plugin.getMimeType(file)
    });
  };

  ProviderView.prototype.handleDemoAuth = function handleDemoAuth() {
    var state = this.plugin.getPluginState();
    this.plugin.setPluginState({}, state, {
      authenticated: true
    });
  };

  ProviderView.prototype.handleAuth = function handleAuth() {
    var _this11 = this;

    var authState = btoa(JSON.stringify({ origin: location.origin }));
    var link = this.Provider.authUrl() + '?state=' + authState;

    var authWindow = window.open(link, '_blank');
    var noProtocol = function noProtocol(url) {
      return url.replace(/^(https?:|)\/\//, '');
    };
    var handleToken = function handleToken(e) {
      var allowedOrigin = new RegExp(noProtocol(_this11.plugin.opts.serverPattern));
      if (!allowedOrigin.test(noProtocol(e.origin)) || e.source !== authWindow) {
        _this11.plugin.uppy.log('rejecting event from ' + e.origin + ' vs allowed pattern ' + _this11.plugin.opts.serverPattern);
        return;
      }
      authWindow.close();
      window.removeEventListener('message', handleToken);
      _this11.Provider.setAuthToken(e.data.token);
      _this11._loaderWrapper(_this11.Provider.checkAuth(), _this11.plugin.onAuth, _this11.handleError);
    };
    window.addEventListener('message', handleToken);
  };

  ProviderView.prototype.handleError = function handleError(error) {
    var uppy = this.plugin.uppy;
    var message = uppy.i18n('uppyServerError');
    uppy.log(error.toString());
    uppy.info({ message: message, details: error.toString() }, 'error', 5000);
  };

  ProviderView.prototype.handleScroll = function handleScroll(e) {
    var _this12 = this;

    var scrollPos = e.target.scrollHeight - (e.target.scrollTop + e.target.offsetHeight);
    var path = this.plugin.getNextPagePath ? this.plugin.getNextPagePath() : null;

    if (scrollPos < 50 && path && !this._isHandlingScroll) {
      this.Provider.list(path).then(function (res) {
        var _plugin$getPluginStat5 = _this12.plugin.getPluginState(),
            files = _plugin$getPluginStat5.files,
            folders = _plugin$getPluginStat5.folders;

        _this12._updateFilesAndFolders(res, files, folders);
      }).catch(this.handleError).then(function () {
        _this12._isHandlingScroll = false;
      }); // always called

      this._isHandlingScroll = true;
    }
  };

  ProviderView.prototype.donePicking = function donePicking() {
    var _this13 = this;

    var _plugin$getPluginStat6 = this.plugin.getPluginState(),
        currentSelection = _plugin$getPluginStat6.currentSelection;

    var promises = currentSelection.map(function (file) {
      if (_this13.plugin.isFolder(file)) {
        return _this13.addFolder(file);
      } else {
        return _this13.addFile(file);
      }
    });

    this._loaderWrapper(_Promise.all(promises), function () {
      _this13.clearSelection();

      var dashboard = _this13.plugin.uppy.getPlugin('Dashboard');
      if (dashboard) dashboard.hideAllPanels();
    }, function () {});
  };

  ProviderView.prototype.cancelPicking = function cancelPicking() {
    this.clearSelection();

    var dashboard = this.plugin.uppy.getPlugin('Dashboard');
    if (dashboard) dashboard.hideAllPanels();
  };

  ProviderView.prototype.clearSelection = function clearSelection() {
    this.plugin.setPluginState({ currentSelection: [] });
  };

  // displays loader view while asynchronous request is being made.


  ProviderView.prototype._loaderWrapper = function _loaderWrapper(promise, then, catch_) {
    var _this14 = this;

    promise.then(then).catch(catch_).then(function () {
      return _this14.plugin.setPluginState({ loading: false });
    }); // always called.
    this.plugin.setPluginState({ loading: true });
  };

  ProviderView.prototype.render = function render(state) {
    var _plugin$getPluginStat7 = this.plugin.getPluginState(),
        authenticated = _plugin$getPluginStat7.authenticated,
        checkAuthInProgress = _plugin$getPluginStat7.checkAuthInProgress,
        loading = _plugin$getPluginStat7.loading;

    if (loading) {
      return h(
        CloseWrapper,
        { onUnmount: this.clearSelection },
        h(LoaderView, null)
      );
    }

    if (!authenticated) {
      return h(
        CloseWrapper,
        { onUnmount: this.clearSelection },
        h(AuthView, {
          pluginName: this.plugin.title,
          pluginIcon: this.plugin.icon,
          demo: this.plugin.opts.demo,
          checkAuth: this.checkAuth,
          handleAuth: this.handleAuth,
          handleDemoAuth: this.handleDemoAuth,
          checkAuthInProgress: checkAuthInProgress })
      );
    }

    var browserProps = _extends({}, this.plugin.getPluginState(), {
      username: this.username,
      getNextFolder: this.getNextFolder,
      getFolder: this.getFolder,
      filterItems: this.filterItems,
      filterQuery: this.filterQuery,
      toggleSearch: this.toggleSearch,
      sortByTitle: this.sortByTitle,
      sortByDate: this.sortByDate,
      logout: this.logout,
      demo: this.plugin.opts.demo,
      isActiveRow: this.isActiveRow,
      isChecked: this.isChecked,
      toggleCheckbox: this.toggleCheckbox,
      getItemId: this.plugin.getItemId,
      getItemName: this.plugin.getItemName,
      getItemIcon: this.plugin.getItemIcon,
      handleScroll: this.handleScroll,
      done: this.donePicking,
      cancel: this.cancelPicking,
      title: this.plugin.title,
      viewType: this.opts.viewType,
      showTitles: this.opts.showTitles,
      showFilter: this.opts.showFilter,
      showBreadcrumbs: this.opts.showBreadcrumbs,
      pluginIcon: this.plugin.icon,
      i18n: this.plugin.uppy.i18n
    });

    return h(
      CloseWrapper,
      { onUnmount: this.clearSelection },
      h(Browser, browserProps)
    );
  };

  return ProviderView;
}();
//# sourceMappingURL=index.js.map