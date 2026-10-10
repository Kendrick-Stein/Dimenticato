#!/usr/bin/env node
'use strict';
// Intake metadata is never input to build_reading_index.js or the public reader.
const fs = require('fs'), path = require('path');
const catalog = require('../lib/reading-catalog');
const LANGUAGES = ['it', 'fr', 'de', 'en'];
const text = value => typeof value === 'string' && !!value.trim();
const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
function https(value) {
  if (!text(value)) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url : null; } catch (_) { return null; }
}
function matchesPrefix(value, prefix) {
  const url = https(value), base = https(prefix);
  return !!(url && base && url.origin === base.origin && !base.search && !base.hash
    && (url.pathname === base.pathname || url.pathname.startsWith(base.pathname.endsWith('/') ? base.pathname : base.pathname + '/')));
}
function canonical(value) {
  const url = https(value); if (!url) return value; url.hash = '';
  for (const key of Array.from(url.searchParams.keys())) if (/^utm_/i.test(key) || /^(fbclid|gclid|mc_cid|mc_eid)$/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort(); return url.href;
}
const metadataFields = {
  verification: { workflowStage:'string', checkedAt:'string', editorialReviewComplete:'boolean', readyForPublication:'boolean', rejectionReason:'string', fullText:'object', originalDate:'object', nativeLanguage:'object', rights:'object', duplicateCheck:'object', freshness:'object', publisher:'object' },
  fullText: { accessible:'boolean', read:'boolean', url:'string', checkedAt:'string', notes:'string' },
  originalDate: { verified:'boolean', evidence:'string', evidenceUrl:'string' },
  nativeLanguage: { verified:'boolean', evidence:'string', evidenceUrl:'string', additionalEvidenceUrls:'strings', author:'string', basis:'string', caveat:'string' },
  rights: { verified:'boolean', adaptationAllowed:'boolean', publicRedistributionAllowed:'boolean', license:'string', licenseUrl:'string', evidence:'string', evidenceUrls:'strings', scope:'string', exclusions:'strings', attributionRequirements:'strings', basis:'string', caveat:'string', licenseRetrievalNote:'string', reviewBeforeConversionRequired:'boolean', shareAlikeRequired:'boolean' },
  duplicateCheck: { checkedAgainstArticleCount:'number', checkedAt:'string', sourceUrlAlreadyPublished:'boolean', titleAlreadyPublished:'boolean' },
  freshness: { asOf:'string', ageDays:'number', bucket:'string' },
  publisher: { verified:'boolean', names:'strings', evidenceUrl:'string', institutionUrl:'string' }
};
function validateMetadata(value, group, check) {
  if (!object(value)) { check(false, group + ' metadata must be an object'); return; }
  Object.keys(value).forEach(key => {
    const type = metadataFields[group][key], item = value[key];
    check(!!type, 'unexpected nested metadata field: ' + group + '.' + key);
    if (!type) return;
    if (type === 'object') validateMetadata(item, key, check);
    else check(type === 'strings' ? Array.isArray(item) && item.every(text) : type === 'string' ? text(item) : type === 'number' ? Number.isInteger(item) && item >= 0 : typeof item === type, group + '.' + key + ' metadata type');
  });
}
function validateSources(registry) {
  const errors = [], ids = new Set();
  if (!object(registry) || registry.schema !== 1 || !Array.isArray(registry.sources)) return ['source registry schema and sources required'];
  registry.sources.forEach(source => {
    if (!object(source)) { errors.push('source must be an object'); return; }
    const check = (ok, message) => { if (!ok) errors.push((source.id || '?') + ': ' + message); };
    check(text(source.id) && /^[a-z0-9-]+$/.test(source.id) && !ids.has(source.id), 'unique safe source id'); ids.add(source.id);
    check(text(source.name) && https(source.url), 'source name and HTTPS URL required');
    check(Array.isArray(source.languages) && source.languages.length > 0 && source.languages.every(lang => LANGUAGES.includes(lang)), 'supported source languages');
    check(source.articleReviewRequired === true, 'articleReviewRequired must remain true');
    check(https(source.rightsPolicyUrl) && text(source.conditions), 'rights policy and conditions required');
    check(Array.isArray(source.allowedUrlPrefixes) && source.allowedUrlPrefixes.length > 0
      && source.allowedUrlPrefixes.every(prefix => { const url = https(prefix); return url && !url.search && !url.hash; }), 'safe HTTPS discovery prefixes required');
    if (source.requiredPublisherNames !== undefined) check(Array.isArray(source.requiredPublisherNames) && source.requiredPublisherNames.length > 0 && source.requiredPublisherNames.every(text), 'required publisher names must be nonempty');
  });
  return errors;
}
function validateQueue(queue, registry, articles = []) {
  const errors = validateSources(registry);
  if (!object(queue) || queue.schemaVersion !== 1 || !Array.isArray(queue.candidates)) return errors.concat('candidate queue schemaVersion and candidates required');
  if (!catalog.validDate(queue.collectedAt)) errors.push('queue collection date required');
  const sources = new Map((registry && Array.isArray(registry.sources) ? registry.sources : []).filter(object).map(source => [source.id, source]));
  const ids = new Set(), urls = new Set();
  queue.candidates.forEach(candidate => {
    if (!object(candidate)) { errors.push('candidate must be an object'); return; }
    const c = candidate, check = (ok, message) => { if (!ok) errors.push((c.id || '?') + ': ' + message); };
    check(text(c.id) && /^[a-z0-9-]+$/.test(c.id) && !ids.has(c.id), 'unique safe candidate id'); ids.add(c.id);
    ['sourceTitle', 'sourceName', 'editorialNote', 'registrySourceId'].forEach(key => check(text(c[key]), key + ' required'));
    check(!!https(c.sourceUrl), 'source URL must be credential-free HTTPS');
    const url = canonical(c.sourceUrl); check(!urls.has(url), 'duplicate candidate source URL'); urls.add(url);
    check(LANGUAGES.includes(c.language), 'supported candidate language');
    check(catalog.categories.some(category => category[0] === c.category), 'supported category');
    check(Array.isArray(c.topics) && c.topics.length > 0 && c.topics.length <= 5 && c.topics.every(topic => text(topic) && topic.trim() === topic && topic.length <= 40) && new Set(c.topics).size === c.topics.length, '1–5 unique topic labels required');
    check(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(c.level), 'estimated CEFR level required');
    check(catalog.validDate(c.sourcePublishedAt) && catalog.validDate(c.collectedAt), 'exact original publication and collection dates required');
    check(c.sourcePublishedAt <= c.collectedAt && c.collectedAt <= queue.collectedAt, 'source date must not be replaced by collection date or lie in the future');
    check(['collected', 'verified', 'rejected'].includes(c.status), 'intake status only; published is forbidden');
    // Reject an accidentally pasted article or executable/publication payload.
    const metadataKeys = new Set(['id', 'language', 'sourceTitle', 'sourceUrl', 'sourceName', 'registrySourceId', 'sourcePublishedAt', 'collectedAt', 'category', 'topics', 'level', 'priority', 'status', 'editorialNote', 'verification', 'linkToArticleId']);
    Object.keys(c).forEach(key => check(metadataKeys.has(key), 'unexpected candidate field: ' + key + '; store intake metadata only'));
    if (c.priority !== undefined) check(Number.isInteger(c.priority) && c.priority > 0, 'positive integer priority');
    const source = sources.get(c.registrySourceId);
    check(!!source, 'source must be in reviewed registry');
    if (source) {
      check(Array.isArray(source.languages) && source.languages.includes(c.language), 'language must belong to registry source');
      check(Array.isArray(source.allowedUrlPrefixes) && source.allowedUrlPrefixes.some(prefix => matchesPrefix(c.sourceUrl, prefix)), 'URL outside registered discovery scope');
    }
    const v = c.verification;
    check(object(v), 'verification evidence object required');
    if (!object(v)) return;
    validateMetadata(v, 'verification', check);
    check(['discovered', 'rights_verified', 'editorial_review', 'ready'].includes(v.workflowStage), 'supported editorial stage; no published stage');
    check(v.readyForPublication === false, 'candidate metadata is never publishable');
    check(typeof v.editorialReviewComplete === 'boolean', 'explicit editorial review status required');
    if (v.workflowStage === 'ready') check(v.editorialReviewComplete === true && c.status === 'verified', 'ready stage requires completed review and verified evidence');
    if (c.status === 'rejected') check(text(v.rejectionReason), 'rejected candidate needs a reason');
    const requireEvidence = c.status === 'verified' || ['rights_verified', 'editorial_review', 'ready'].includes(v.workflowStage);
    if (requireEvidence) {
      check(c.status === 'verified', 'review stages require verified intake status');
      check(v.fullText && v.fullText.accessible === true && v.fullText.read === true && canonical(v.fullText.url) === canonical(c.sourceUrl), 'verified candidate requires inspected full text');
      ['originalDate', 'nativeLanguage'].forEach(key => check(v[key] && v[key].verified === true && text(v[key].evidence) && https(v[key].evidenceUrl), key + ' verification evidence required'));
      const rights = v.rights;
      check(rights && rights.verified === true && rights.adaptationAllowed === true && rights.publicRedistributionAllowed === true, 'adaptation and redistribution rights must be verified');
      if (rights) {
        check(text(rights.license) && https(rights.licenseUrl) && text(rights.evidence) && text(rights.scope), 'rights licence, evidence and exact scope required');
        check(Array.isArray(rights.evidenceUrls) && rights.evidenceUrls.length > 0 && rights.evidenceUrls.every(url => !!https(url)), 'rights evidence URLs required');
        check(Array.isArray(rights.exclusions) && rights.exclusions.length > 0 && rights.exclusions.every(text), 'rights exclusions required');
        check(Array.isArray(rights.attributionRequirements) && rights.attributionRequirements.length > 0 && rights.attributionRequirements.every(text), 'attribution requirements required');
      }
      if (source && Array.isArray(source.requiredPublisherNames)) {
        const publisher = v.publisher;
        check(publisher && publisher.verified === true && https(publisher.evidenceUrl) && Array.isArray(publisher.names) && source.requiredPublisherNames.some(name => publisher.names.includes(name)), 'page publisher must match registered institution');
      }
    }
    if (v.freshness) {
      const fresh = v.freshness;
      check(catalog.validDate(fresh.asOf) && fresh.asOf >= c.collectedAt, 'freshness asOf date required');
      const age = Math.round((Date.parse(fresh.asOf + 'T00:00:00Z') - Date.parse(c.sourcePublishedAt + 'T00:00:00Z')) / 86400000);
      check(Number.isFinite(age) && age >= 0 && age === fresh.ageDays, 'freshness age must derive from original date');
      check(fresh.bucket === (age <= 30 ? 'within_30_days' : age <= 90 ? 'within_90_days' : 'archive'), 'freshness bucket must match original age');
    }
    const sameSource = articles.filter(article => article.source && canonical(article.source.url) === url);
    if (c.linkToArticleId != null) check(text(c.linkToArticleId) && sameSource.some(article => article.id === c.linkToArticleId && article.lang === c.language), 'linkToArticleId must reference the separately published same-source edition');
    else check(sameSource.length === 0, 'already-published source needs linkToArticleId, never recycle as fresh');
    check(!articles.some(article => article.id === c.id), 'candidate ID must never appear as an article ID');
  });
  return errors;
}
function run() {
  const root = path.resolve(__dirname, '..');
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/reading/sources.json'), 'utf8'));
  const queue = JSON.parse(fs.readFileSync(path.join(root, 'editorial/reading/candidates.json'), 'utf8'));
  const articles = fs.readdirSync(path.join(root, 'data/reading/articles')).filter(file => file.endsWith('.json')).map(file => JSON.parse(fs.readFileSync(path.join(root, 'data/reading/articles', file), 'utf8')));
  const errors = validateQueue(queue, registry, articles);
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('Reading intake OK: ' + queue.candidates.length + ' metadata-only candidates; registry, evidence, dates and publication separation checked');
}
module.exports = { validateSources, validateQueue, matchesPrefix, metadataFields }; if (require.main === module) run();
