var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var copyToClipboard = require('./copyToClipboard');

describe('copyToClipboard', function () {
  xit('should copy the specified text to the clipboard', function () {
    expect(typeof copyToClipboard === 'undefined' ? 'undefined' : _typeof(copyToClipboard)).toBe('function');
  });
});
//# sourceMappingURL=copyToClipboard.test.js.map