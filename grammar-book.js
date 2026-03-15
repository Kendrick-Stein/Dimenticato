/**
 * GrammarBook — 语法书阅读器
 * Fetches grammar_tree.json, builds sidebar nav, loads .md topic files via fetch,
 * renders with marked.js
 */
const GrammarBook = (() => {
  let tree = null;
  let initialized = false;
  let currentSlug = null;

  async function init() {
    if (initialized) return;
    initialized = true;
    try {
      const res = await fetch('data/grammar_tree.json');
      if (!res.ok) throw new Error('Failed to load grammar_tree.json');
      tree = await res.json();
      buildNavTree(tree);
    } catch (e) {
      document.getElementById('grammarNavTree').innerHTML =
        '<p class="grammar-nav-error">目录加载失败：' + e.message + '</p>';
    }

    document.getElementById('grammarSidebarToggle')
      ?.addEventListener('click', toggleSidebar);
  }

  function buildNavTree(tree) {
    const container = document.getElementById('grammarNavTree');
    if (!container) return;
    container.innerHTML = '';

    (tree.parts || []).forEach((part, pi) => {
      const partEl = document.createElement('div');
      partEl.className = 'grammar-part';

      const partHeading = document.createElement('div');
      partHeading.className = 'grammar-part-heading';
      partHeading.textContent = part.title;
      partEl.appendChild(partHeading);

      (part.chapters || []).forEach((ch, ci) => {
        const chapterEl = document.createElement('div');
        chapterEl.className = 'grammar-chapter';

        const chapterBtn = document.createElement('button');
        chapterBtn.className = 'grammar-chapter-btn';
        chapterBtn.innerHTML =
          '<span class="grammar-chapter-arrow">▶</span>' +
          '<span class="grammar-chapter-label">' + escapeHtml(ch.title) + '</span>';

        const topicList = document.createElement('div');
        topicList.className = 'grammar-topic-list collapsed';

        chapterBtn.addEventListener('click', () => {
          const isOpen = !topicList.classList.contains('collapsed');
          topicList.classList.toggle('collapsed', isOpen);
          chapterBtn.classList.toggle('open', !isOpen);
        });

        (ch.topics || []).forEach(topic => {
          const link = document.createElement('button');
          link.className = 'grammar-topic-link';
          link.dataset.slug = topic.slug;
          link.textContent = topic.title;
          link.addEventListener('click', () => {
            loadTopic(topic.slug, topic.title, part.title, ch.title);
          });
          topicList.appendChild(link);
        });

        chapterEl.appendChild(chapterBtn);
        chapterEl.appendChild(topicList);
        partEl.appendChild(chapterEl);
      });

      container.appendChild(partEl);
    });
  }

  async function loadTopic(slug, title, partTitle, chapterTitle) {
    currentSlug = slug;

    // Update breadcrumb
    const bc = document.getElementById('grammarContentBreadcrumb');
    if (bc) bc.textContent = (partTitle ? partTitle + ' › ' : '') +
                              (chapterTitle ? chapterTitle + ' › ' : '') + title;

    // Highlight active link
    document.querySelectorAll('.grammar-topic-link').forEach(el => {
      el.classList.toggle('active', el.dataset.slug === slug);
    });

    // Auto-expand parent chapter if collapsed
    const activeLink = document.querySelector(`.grammar-topic-link[data-slug="${CSS.escape(slug)}"]`);
    if (activeLink) {
      const list = activeLink.closest('.grammar-topic-list');
      if (list && list.classList.contains('collapsed')) {
        list.classList.remove('collapsed');
        list.previousElementSibling?.classList.add('open');
      }
      // Scroll sidebar to active link
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Show loading state
    const body = document.getElementById('grammarContentBody');
    if (body) body.innerHTML = '<div class="grammar-loading">加载中…</div>';

    try {
      const res = await fetch('data/grammar_content/' + slug + '.md');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      if (body) {
        body.innerHTML = '<div class="grammar-markdown">' + marked.parse(text) + '</div>';
        body.scrollTop = 0;
      }
    } catch (e) {
      if (body) body.innerHTML = '<div class="grammar-error">内容加载失败：' + e.message + '</div>';
    }

    // On mobile, close sidebar after selecting topic
    if (window.innerWidth < 768) {
      const layout = document.querySelector('.grammar-book-layout');
      layout?.classList.remove('sidebar-open');
    }
  }

  function toggleSidebar() {
    const layout = document.querySelector('.grammar-book-layout');
    if (!layout) return;
    if (window.innerWidth < 768) {
      layout.classList.toggle('sidebar-open');
    } else {
      layout.classList.toggle('sidebar-collapsed');
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return { init, loadTopic, toggleSidebar };
})();
