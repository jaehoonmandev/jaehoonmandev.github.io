(function () {
  function openExternalLinksInNewTab() {
    var links = document.querySelectorAll('.page__content a[href]');

    links.forEach(function (link) {
      if (link.target) {
        return;
      }

      if (!/^https?:\/\//i.test(link.href)) {
        return;
      }

      if (link.hostname === window.location.hostname) {
        return;
      }

      link.target = '_blank';
      link.rel = link.rel ? link.rel + ' noopener noreferrer' : 'noopener noreferrer';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openExternalLinksInNewTab);
  } else {
    openExternalLinksInNewTab();
  }
})();
