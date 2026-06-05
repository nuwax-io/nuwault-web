(function () {
  if (window.location.protocol === 'file:') return;

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.indexOf('192.168.') === 0;
  if (isLocalhost || hostname !== 'nuwault.com') return;

  const path = window.location.pathname;
  if (
    path !== '/' &&
    path !== '/index.html' &&
    path !== '/robots.txt' &&
    path !== '/sitemap.xml'
  ) {
    const canonical = document.querySelector('link[rel="canonical"]');
    const base = canonical ? canonical.href.replace(/\/$/, '') : window.location.origin;
    const hash = window.location.hash;
    window.location.replace(hash ? base + hash : base + '/');
  }
})();
