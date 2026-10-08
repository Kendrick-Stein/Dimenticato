/**
 * Dimenticato 离线缓存（注册见 lib/boot.js）。
 *
 * 策略：
 *   - 页面 / HTML / JS / CSS：网络优先，失败（离线）才回落到缓存 —— 部署后第一时间拿到新代码。
 *   - data/*.js（词库与模块数据，体积大、变动少）：stale-while-revalidate ——
 *     有缓存先给缓存，同时后台拉新版写回，下次打开生效。
 *   - 跨域请求（Google Fonts、CDN、Supabase）一律不拦截，交给浏览器。
 *
 * 不做预缓存：install 阶段不下载任何东西，首次访问和没有 SW 时完全一样，
 * SW 出任何问题都只会退化成「直接走网络」，不会挡住首屏。
 * 所有路径相对 SW 自己的 scope，GitHub Pages 子路径（/Dimenticato/）下同样成立。
 *
 * 改了缓存策略或要强制清空旧缓存时，把 VERSION 加一；activate 会删掉旧版本的缓存。
 */
'use strict';

const VERSION = 'v1';
const PREFIX = 'dimenticato-';
const CACHE = PREFIX + VERSION;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith(PREFIX) && name !== CACHE)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

function scopePath() {
  return new URL(self.registration.scope).pathname; // 例如 /Dimenticato/
}

function isDataFile(url) {
  const rel = url.pathname.slice(scopePath().length);
  return rel.startsWith('data/') && rel.endsWith('.js');
}

function cacheable(response) {
  return response && response.ok && response.type === 'basic';
}

async function put(request, response) {
  try {
    const cache = await caches.open(CACHE);
    await cache.put(request, response);
  } catch (err) { /* 配额满等情况：缓存失败不影响本次响应 */ }
}

async function networkFirst(request, isNavigation) {
  try {
    const response = await fetch(request);
    if (cacheable(response)) put(request, response.clone());
    return response;
  } catch (err) {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(request, { ignoreSearch: isNavigation });
    if (hit) return hit;
    if (isNavigation) {
      const shell = (await cache.match(new URL('index.html', self.registration.scope).href))
        || (await cache.match(self.registration.scope));
      if (shell) return shell;
    }
    throw err;
  }
}

async function staleWhileRevalidate(event) {
  const request = event.request;
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const refresh = fetch(request).then((response) => {
    if (cacheable(response)) return put(request, response.clone()).then(() => response);
    return response;
  });
  if (hit) {
    event.waitUntil(refresh.catch(() => {}));
    return hit;
  }
  return refresh;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(scopePath())) return;

  if (isDataFile(url)) {
    event.respondWith(staleWhileRevalidate(event));
    return;
  }
  event.respondWith(networkFirst(request, request.mode === 'navigate'));
});
