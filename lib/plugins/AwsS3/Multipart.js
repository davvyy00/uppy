var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

var Plugin = require('../../core/Plugin');
var RequestClient = require('../../server/RequestClient');
var UppySocket = require('../../core/UppySocket');
var emitSocketProgress = require('../../utils/emitSocketProgress');
var getSocketHost = require('../../utils/getSocketHost');
var limitPromises = require('../../utils/limitPromises');
var Uploader = require('./MultipartUploader');

/**
 * Create a wrapper around an event emitter with a `remove` method to remove
 * all events that were added using the wrapped emitter.
 */
function createEventTracker(emitter) {
  var events = [];
  return {
    on: function on(event, fn) {
      events.push([event, fn]);
      return emitter.on(event, fn);
    },
    remove: function remove() {
      events.forEach(function (_ref) {
        var event = _ref[0],
            fn = _ref[1];

        emitter.off(event, fn);
      });
    }
  };
}

function assertServerError(res) {
  if (res && res.error) {
    var error = new Error(res.message);
    _extends(error, res.error);
    throw error;
  }
  return res;
}

module.exports = function (_Plugin) {
  _inherits(AwsS3Multipart, _Plugin);

  function AwsS3Multipart(uppy, opts) {
    _classCallCheck(this, AwsS3Multipart);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.type = 'uploader';
    _this.id = 'AwsS3Multipart';
    _this.title = 'AWS S3 Multipart';
    _this.client = new RequestClient(uppy, opts);

    var defaultOptions = {
      timeout: 30 * 1000,
      limit: 0,
      createMultipartUpload: _this.createMultipartUpload.bind(_this),
      listParts: _this.listParts.bind(_this),
      prepareUploadPart: _this.prepareUploadPart.bind(_this),
      abortMultipartUpload: _this.abortMultipartUpload.bind(_this),
      completeMultipartUpload: _this.completeMultipartUpload.bind(_this)
    };

    _this.opts = _extends({}, defaultOptions, opts);

    _this.upload = _this.upload.bind(_this);

    if (typeof _this.opts.limit === 'number' && _this.opts.limit !== 0) {
      _this.limitRequests = limitPromises(_this.opts.limit);
    } else {
      _this.limitRequests = function (fn) {
        return fn;
      };
    }

    _this.uploaders = Object.create(null);
    _this.uploaderEvents = Object.create(null);
    _this.uploaderSockets = Object.create(null);
    return _this;
  }

  /**
   * Clean up all references for a file's upload: the MultipartUploader instance,
   * any events related to the file, and the uppy-server WebSocket connection.
   */


  AwsS3Multipart.prototype.resetUploaderReferences = function resetUploaderReferences(fileID) {
    if (this.uploaders[fileID]) {
      this.uploaders[fileID].abort();
      this.uploaders[fileID] = null;
    }
    if (this.uploaderEvents[fileID]) {
      this.uploaderEvents[fileID].remove();
      this.uploaderEvents[fileID] = null;
    }
    if (this.uploaderSockets[fileID]) {
      this.uploaderSockets[fileID].close();
      this.uploaderSockets[fileID] = null;
    }
  };

  AwsS3Multipart.prototype.assertHost = function assertHost() {
    if (!this.opts.serverUrl) {
      throw new Error('Expected a `serverUrl` option containing an uppy-server address.');
    }
  };

  AwsS3Multipart.prototype.createMultipartUpload = function createMultipartUpload(file) {
    this.assertHost();

    return this.client.post('s3/multipart', {
      filename: file.name,
      type: file.type
    }).then(assertServerError);
  };

  AwsS3Multipart.prototype.listParts = function listParts(file, _ref2) {
    var key = _ref2.key,
        uploadId = _ref2.uploadId;

    this.assertHost();

    var filename = encodeURIComponent(key);
    return this.client.get('s3/multipart/' + uploadId + '?key=' + filename).then(assertServerError);
  };

  AwsS3Multipart.prototype.prepareUploadPart = function prepareUploadPart(file, _ref3) {
    var key = _ref3.key,
        uploadId = _ref3.uploadId,
        number = _ref3.number;

    this.assertHost();

    var filename = encodeURIComponent(key);
    return this.client.get('s3/multipart/' + uploadId + '/' + number + '?key=' + filename).then(assertServerError);
  };

  AwsS3Multipart.prototype.completeMultipartUpload = function completeMultipartUpload(file, _ref4) {
    var key = _ref4.key,
        uploadId = _ref4.uploadId,
        parts = _ref4.parts;

    this.assertHost();

    var filename = encodeURIComponent(key);
    var uploadIdEnc = encodeURIComponent(uploadId);
    return this.client.post('s3/multipart/' + uploadIdEnc + '/complete?key=' + filename, { parts: parts }).then(assertServerError);
  };

  AwsS3Multipart.prototype.abortMultipartUpload = function abortMultipartUpload(file, _ref5) {
    var key = _ref5.key,
        uploadId = _ref5.uploadId;

    this.assertHost();

    var filename = encodeURIComponent(key);
    var uploadIdEnc = encodeURIComponent(uploadId);
    return this.client.delete('s3/multipart/' + uploadIdEnc + '?key=' + filename).then(assertServerError);
  };

  AwsS3Multipart.prototype.uploadFile = function uploadFile(file) {
    var _this2 = this;

    return new _Promise(function (resolve, reject) {
      var upload = new Uploader(file.data, _extends({
        // .bind to pass the file object to each handler.
        createMultipartUpload: _this2.limitRequests(_this2.opts.createMultipartUpload.bind(_this2, file)),
        listParts: _this2.limitRequests(_this2.opts.listParts.bind(_this2, file)),
        prepareUploadPart: _this2.opts.prepareUploadPart.bind(_this2, file),
        completeMultipartUpload: _this2.limitRequests(_this2.opts.completeMultipartUpload.bind(_this2, file)),
        abortMultipartUpload: _this2.limitRequests(_this2.opts.abortMultipartUpload.bind(_this2, file)),

        limit: _this2.opts.limit || 5,
        onStart: function onStart(data) {
          var cFile = _this2.uppy.getFile(file.id);
          _this2.uppy.setFileState(file.id, {
            s3Multipart: _extends({}, cFile.s3Multipart, {
              key: data.key,
              uploadId: data.uploadId,
              parts: []
            })
          });
        },
        onProgress: function onProgress(bytesUploaded, bytesTotal) {
          _this2.uppy.emit('upload-progress', file, {
            uploader: _this2,
            bytesUploaded: bytesUploaded,
            bytesTotal: bytesTotal
          });
        },
        onError: function onError(err) {
          _this2.uppy.log(err);
          _this2.uppy.emit('upload-error', file, err);
          err.message = 'Failed because: ' + err.message;

          _this2.resetUploaderReferences(file.id);
          reject(err);
        },
        onSuccess: function onSuccess(result) {
          _this2.uppy.emit('upload-success', file, upload, result.location);

          if (result.location) {
            _this2.uppy.log('Download ' + upload.file.name + ' from ' + result.location);
          }

          _this2.resetUploaderReferences(file.id);
          resolve(upload);
        },
        onPartComplete: function onPartComplete(part) {
          // Store completed parts in state.
          var cFile = _this2.uppy.getFile(file.id);
          _this2.uppy.setFileState(file.id, {
            s3Multipart: _extends({}, cFile.s3Multipart, {
              parts: [].concat(cFile.s3Multipart.parts, [part])
            })
          });

          _this2.uppy.emit('s3-multipart:part-uploaded', cFile, part);
        }
      }, file.s3Multipart));

      _this2.uploaders[file.id] = upload;
      _this2.uploaderEvents[file.id] = createEventTracker(_this2.uppy);

      _this2.onFileRemove(file.id, function (removed) {
        _this2.resetUploaderReferences(file.id);
        resolve('upload ' + removed.id + ' was removed');
      });

      _this2.onFilePause(file.id, function (isPaused) {
        if (isPaused) {
          upload.pause();
        } else {
          upload.start();
        }
      });

      _this2.onPauseAll(file.id, function () {
        upload.pause();
      });

      _this2.onCancelAll(file.id, function () {
        upload.abort({ really: true });
      });

      _this2.onResumeAll(file.id, function () {
        upload.start();
      });

      if (!file.isPaused) {
        upload.start();
      }

      if (!file.isRestored) {
        _this2.uppy.emit('upload-started', file, upload);
      }
    });
  };

  AwsS3Multipart.prototype.uploadRemote = function uploadRemote(file) {
    var _this3 = this;

    this.resetUploaderReferences(file.id);

    return new _Promise(function (resolve, reject) {
      if (file.serverToken) {
        return _this3.connectToServerSocket(file).then(function () {
          return resolve();
        }).catch(reject);
      }

      _this3.uppy.emit('upload-started', file);

      fetch(file.remote.url, {
        method: 'post',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_extends({}, file.remote.body, {
          protocol: 's3-multipart',
          size: file.data.size,
          metadata: file.meta
        }))
      }).then(function (res) {
        if (res.status < 200 || res.status > 300) {
          return reject(res.statusText);
        }

        return res.json().then(function (data) {
          _this3.uppy.setFileState(file.id, { serverToken: data.token });
          return _this3.uppy.getFile(file.id);
        });
      }).then(function (file) {
        return _this3.connectToServerSocket(file);
      }).then(function () {
        resolve();
      }).catch(function (err) {
        reject(new Error(err));
      });
    });
  };

  AwsS3Multipart.prototype.connectToServerSocket = function connectToServerSocket(file) {
    var _this4 = this;

    return new _Promise(function (resolve, reject) {
      var token = file.serverToken;
      var host = getSocketHost(file.remote.serverUrl);
      var socket = new UppySocket({ target: host + '/api/' + token });
      _this4.uploaderSockets[socket] = socket;
      _this4.uploaderEvents[file.id] = createEventTracker(_this4.uppy);

      _this4.onFileRemove(file.id, function (removed) {
        socket.send('pause', {});
        resolve('upload ' + file.id + ' was removed');
      });

      _this4.onFilePause(file.id, function (isPaused) {
        socket.send(isPaused ? 'pause' : 'resume', {});
      });

      _this4.onPauseAll(file.id, function () {
        return socket.send('pause', {});
      });

      _this4.onCancelAll(file.id, function () {
        return socket.send('pause', {});
      });

      _this4.onResumeAll(file.id, function () {
        if (file.error) {
          socket.send('pause', {});
        }
        socket.send('resume', {});
      });

      _this4.onRetry(file.id, function () {
        socket.send('pause', {});
        socket.send('resume', {});
      });

      _this4.onRetryAll(file.id, function () {
        socket.send('pause', {});
        socket.send('resume', {});
      });

      if (file.isPaused) {
        socket.send('pause', {});
      }

      socket.on('progress', function (progressData) {
        return emitSocketProgress(_this4, progressData, file);
      });

      socket.on('error', function (errData) {
        _this4.uppy.emit('upload-error', file, new Error(errData.error));
        reject(new Error(errData.error));
      });

      socket.on('success', function (data) {
        _this4.uppy.emit('upload-success', file, data, data.url);
        resolve();
      });
    });
  };

  AwsS3Multipart.prototype.upload = function upload(fileIDs) {
    var _this5 = this;

    if (fileIDs.length === 0) return _Promise.resolve();

    var promises = fileIDs.map(function (id) {
      var file = _this5.uppy.getFile(id);
      if (file.isRemote) {
        return _this5.uploadRemote(file);
      }
      return _this5.uploadFile(file);
    });

    return _Promise.all(promises);
  };

  AwsS3Multipart.prototype.onFileRemove = function onFileRemove(fileID, cb) {
    this.uploaderEvents[fileID].on('file-removed', function (file) {
      if (fileID === file.id) cb(file.id);
    });
  };

  AwsS3Multipart.prototype.onFilePause = function onFilePause(fileID, cb) {
    this.uploaderEvents[fileID].on('upload-pause', function (targetFileID, isPaused) {
      if (fileID === targetFileID) {
        // const isPaused = this.uppy.pauseResume(fileID)
        cb(isPaused);
      }
    });
  };

  AwsS3Multipart.prototype.onRetry = function onRetry(fileID, cb) {
    this.uploaderEvents[fileID].on('upload-retry', function (targetFileID) {
      if (fileID === targetFileID) {
        cb();
      }
    });
  };

  AwsS3Multipart.prototype.onRetryAll = function onRetryAll(fileID, cb) {
    var _this6 = this;

    this.uploaderEvents[fileID].on('retry-all', function (filesToRetry) {
      if (!_this6.uppy.getFile(fileID)) return;
      cb();
    });
  };

  AwsS3Multipart.prototype.onPauseAll = function onPauseAll(fileID, cb) {
    var _this7 = this;

    this.uploaderEvents[fileID].on('pause-all', function () {
      if (!_this7.uppy.getFile(fileID)) return;
      cb();
    });
  };

  AwsS3Multipart.prototype.onCancelAll = function onCancelAll(fileID, cb) {
    var _this8 = this;

    this.uploaderEvents[fileID].on('cancel-all', function () {
      if (!_this8.uppy.getFile(fileID)) return;
      cb();
    });
  };

  AwsS3Multipart.prototype.onResumeAll = function onResumeAll(fileID, cb) {
    var _this9 = this;

    this.uploaderEvents[fileID].on('resume-all', function () {
      if (!_this9.uppy.getFile(fileID)) return;
      cb();
    });
  };

  AwsS3Multipart.prototype.install = function install() {
    this.uppy.setState({
      capabilities: _extends({}, this.uppy.getState().capabilities, {
        resumableUploads: true
      })
    });
    this.uppy.addUploader(this.upload);
  };

  AwsS3Multipart.prototype.uninstall = function uninstall() {
    this.uppy.setState({
      capabilities: _extends({}, this.uppy.getState().capabilities, {
        resumableUploads: false
      })
    });
    this.uppy.removeUploader(this.upload);
  };

  return AwsS3Multipart;
}(Plugin);
//# sourceMappingURL=Multipart.js.map