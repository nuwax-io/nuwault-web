(function () {
  if (window.location.protocol === 'file:') return;

  var hostname = window.location.hostname;
  var isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.indexOf('192.168.') === 0;
  if (isLocalhost || hostname !== 'nuwault.com') return;

  var path = window.location.pathname;
  if (
    path !== '/' &&
    path !== '/index.html' &&
    path !== '/robots.txt' &&
    path !== '/sitemap.xml'
  ) {
    var canonical = document.querySelector('link[rel="canonical"]');
    var base = canonical ? canonical.href.replace(/\/$/, '') : window.location.origin;
    var hash = window.location.hash;
    window.location.replace(hash ? base + hash : base + '/');
  }
})();
