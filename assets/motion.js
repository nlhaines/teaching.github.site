/* M3 motion. Progressive enhancement, no library.
   Loaded synchronously in <head> so the `m3` class exists before first paint.
   All hidden start states in site.css require html.m3 AND
   (prefers-reduced-motion: no-preference) AND screen. If this file fails to load,
   or reduced motion is on, nothing is ever hidden. */
(function () {
  var d = document.documentElement;
  if (!window.matchMedia || !('IntersectionObserver' in window)) return;
  var rm = matchMedia('(prefers-reduced-motion: reduce)');
  if (rm.matches) return;
  d.classList.add('m3');

  // Fail safe: if setup never completes, drop the class so content shows statically.
  var ready = false;
  setTimeout(function () { if (!ready) d.classList.remove('m3'); }, 3000);
  if (rm.addEventListener) rm.addEventListener('change', function (e) { if (e.matches) d.classList.remove('m3'); });

  // Everything that reveals on entering the viewport.
  var SEL = '.stance-grid,.facet,.sec-head,.pair,.card,.ss-copy,.kit-item,.ss-plot,.more,' +
            '.prose h2,.figure,.photo-row img,.doc-links';
  var STAGGER_MAX = 4;

  function reveal(el) { el.classList.add('in'); }

  function init() {
    var els = [].slice.call(document.querySelectorAll(SEL));
    var io = new IntersectionObserver(function (entries) {
      // Items arriving in the same frame get a short, capped stagger (left to right, top to bottom).
      var hits = entries.filter(function (e) { return e.isIntersecting; })
        .map(function (e) { return e.target; })
        .sort(function (a, b) {
          var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          return (ra.top - rb.top) || (ra.left - rb.left);
        });
      var n = 0;
      hits.forEach(function (el) {
        var sib = el.matches('.facet,.card,.kit-item,.photo-row img');
        el.style.setProperty('--d', sib ? Math.min(n++, STAGGER_MAX) : 0);
        reveal(el);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    els.forEach(function (el) { io.observe(el); });

    // Keyboard focus never lands on hidden or moving content: reveal the focused element's
    // blocks at once, with their animations switched off ('in-now' in site.css), so the
    // focused element is fully visible and already in place.
    document.addEventListener('focusin', function (e) {
      var n = e.target;
      while (n && n !== document.body) {
        if (n.matches && n.matches(SEL)) { reveal(n); n.classList.add('in-now'); }
        n = n.parentNode;
      }
    });
    // Printing shows everything. Find-in-page and anchor jumps scroll their target into
    // view, and the observer above reveals it as it arrives.
    window.addEventListener('beforeprint', function () { els.forEach(reveal); });
    ready = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
