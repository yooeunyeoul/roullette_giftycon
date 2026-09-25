/* FAQ 검색 — 고객센터 페이지 공통. 점진적 향상:
   검색창은 마크업에서 hidden 이고 이 스크립트가 켠다. JS 가 없으면 FAQ 전체가 그대로 보인다. */
(function () {
  var tools = document.getElementById('faq-tools');
  if (!tools) return;
  var input = document.getElementById('faq-q');
  var count = document.getElementById('faq-count');
  var empty = document.getElementById('faq-empty');
  var items = Array.prototype.slice.call(document.querySelectorAll('.faq details'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-faq-group]'));
  if (!input || !items.length) return;
  tools.hidden = false;

  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var hits = 0;
    items.forEach(function (d) {
      var hit = !q || d.textContent.toLowerCase().indexOf(q) !== -1;
      d.hidden = !hit;
      if (hit) { hits++; if (q) d.open = true; }
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector('.faq details:not([hidden])'); });
    if (empty) empty.hidden = !(q && hits === 0);
    count.textContent = q ? '“' + input.value.trim() + '” 검색 결과 ' + hits + '개' : '';
  });
})();
