var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getArrayBuffer = require('./getArrayBuffer');

describe('getArrayBuffer', function () {
  beforeEach(function () {
    global.FileReader = function () {
      function FileReader() {
        _classCallCheck(this, FileReader);
      }

      FileReader.prototype.addEventListener = function addEventListener(e, cb) {
        if (e === 'load') {
          this.loadCb = cb;
        }
        if (e === 'error') {
          this.errorCb = cb;
        }
      };

      FileReader.prototype.readAsArrayBuffer = function readAsArrayBuffer(chunk) {
        this.loadCb({ target: { result: new ArrayBuffer(8) } });
      };

      return FileReader;
    }();
  });

  afterEach(function () {
    global.FileReader = undefined;
  });

  it('should return a promise that resolves with the specified chunk', function () {
    return getArrayBuffer('abcde').then(function (buffer) {
      expect(typeof buffer === 'undefined' ? 'undefined' : _typeof(buffer)).toEqual('object');
      expect(buffer.byteLength).toEqual(8);
    });
  });
});
//# sourceMappingURL=getArrayBuffer.test.js.map