var Core = require('../../src/core/index.js');
var russian = require('../../src/locales/ru_RU');
var english = require('../../src/locales/en_US');

describe('core/translator', function () {
  describe('translate', function () {
    it('should translate a string', function () {
      var core = new Core({ locale: russian });
      expect(core.translator.translate('chooseFile')).toEqual('Выберите файл');
    });

    it('should translate a string with non-string elements', function () {
      var core = new Core({
        locale: {
          strings: {
            test: 'Hello %{who}!',
            test2: 'Hello %{who}'
          }
        }
      });

      var who = Symbol('who');
      expect(core.translator.translateArray('test', { who: who })).toEqual(['Hello ', who, '!']);
      // No empty string at the end.
      expect(core.translator.translateArray('test2', { who: who })).toEqual(['Hello ', who]);
    });
  });

  describe('interpolation', function () {
    it('should interpolate a string', function () {
      var core = new Core({ locale: english });
      expect(core.translator.translate('youHaveChosen', { fileName: 'img.jpg' })).toEqual('You have chosen: img.jpg');
    });
  });

  describe('pluralization', function () {
    it('should translate a string', function () {
      var core = new Core({ locale: russian });
      expect(core.translator.translate('filesChosen', { smart_count: 18 })).toEqual('Выбрано 18 файлов');

      expect(core.translator.translate('filesChosen', { smart_count: 1 })).toEqual('Выбран 1 файл');

      expect(core.translator.translate('filesChosen', { smart_count: 0 })).toEqual('Выбрано 0 файлов');
    });
  });
});
//# sourceMappingURL=Translator.test.js.map