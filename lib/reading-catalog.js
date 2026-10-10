/** Shared reading taxonomy and source-date ordering (browser + editorial tools). */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ReadingCatalog = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  var categories = [
    ['technology', '科技'], ['society', '社会生活'], ['culture', '文化'],
    ['environment', '环境'], ['education', '教育'], ['work-economy', '工作与经济'], ['health', '健康']
  ];
  function categoryLabel(id) {
    var category = categories.find(function (item) { return item[0] === id; });
    return category ? category[1] : '未分类';
  }
  // Partial source dates retain their actual precision. Never invent a day.
  function validDate(value, partial) {
    if (typeof value !== 'string' || !(partial ? /^\d{4}-\d{2}(?:-\d{2})?$/ : /^\d{4}-\d{2}-\d{2}$/).test(value)) return false;
    var full = value.length === 7 ? value + '-01' : value;
    var date = new Date(full + 'T00:00:00Z');
    return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === full;
  }
  function sourceDate(article) { return article.sourcePublishedAt || (article.source && article.source.publishedAt) || ''; }
  function compare(a, b) {
    return Number(b.contentType === 'native-adaptation') - Number(a.contentType === 'native-adaptation')
      || sourceDate(b).localeCompare(sourceDate(a)) || b.date.localeCompare(a.date) || a.id.localeCompare(b.id);
  }
  return { categories: categories, categoryLabel: categoryLabel, validDate: validDate, compare: compare };
});
