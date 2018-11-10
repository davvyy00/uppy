var toArray = require('./toArray');

describe('toArray', function () {
  it('should convert a array-like object into an array', function () {
    var obj = {
      '0': 'zero',
      '1': 'one',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      length: 5
    };

    expect(toArray(obj)).toEqual(['zero', 'one', 'two', 'three', 'four']);
  });
});
//# sourceMappingURL=toArray.test.js.map