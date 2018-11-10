var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

var dataURItoBlob = require('./dataURItoBlob');

/**
 * Save a <canvas> element's content to a Blob object.
 *
 * @param {HTMLCanvasElement} canvas
 * @return {Promise}
 */
module.exports = function canvasToBlob(canvas, type, quality) {
  if (canvas.toBlob) {
    return new _Promise(function (resolve) {
      canvas.toBlob(resolve, type, quality);
    });
  }
  return _Promise.resolve().then(function () {
    return dataURItoBlob(canvas.toDataURL(type, quality), {});
  });
};
//# sourceMappingURL=canvasToBlob.js.map