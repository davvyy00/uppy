var truncateString = require('./truncateString');

describe('truncateString', function () {
  it('should truncate the string by the specified amount', function () {
    expect(truncateString('abcdefghijkl', 10)).toEqual('abcde...jkl');
    expect(truncateString('abcdefghijkl', 9)).toEqual('abcd...jkl');
    expect(truncateString('abcdefghijkl', 8)).toEqual('abcd...kl');
    expect(truncateString('abcdefghijkl', 7)).toEqual('abc...kl');
    expect(truncateString('abcdefghijkl', 6)).toEqual('abc...kl');
    expect(truncateString('abcdefghijkl', 5)).toEqual('ab...kl');
    expect(truncateString('abcdefghijkl', 4)).toEqual('ab...l');
    expect(truncateString('abcdefghijkl', 3)).toEqual('a...l');
    expect(truncateString('abcdefghijkl', 2)).toEqual('a...l');
    expect(truncateString('abcdefghijkl', 1)).toEqual('...l');
  });
});
//# sourceMappingURL=truncateString.test.js.map