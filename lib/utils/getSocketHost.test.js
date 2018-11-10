var getSocketHost = require('./getSocketHost');

describe('getSocketHost', function () {
  it('should get the host from the specified url', function () {
    expect(getSocketHost('https://foo.bar/a/b/cd?e=fghi&l=k&m=n')).toEqual('ws://foo.bar/a/b/cd?e=fghi&l=k&m=n');
  });
});
//# sourceMappingURL=getSocketHost.test.js.map