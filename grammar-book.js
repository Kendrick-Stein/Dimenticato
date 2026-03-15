/**
 * GrammarBook — 语法书阅读器
 * Uses embedded GRAMMAR_DATA (from data/grammar-data.js) instead of fetch()
 * to avoid GitHub Pages issues with Chinese-character filenames.
 */
const GrammarBook = (() => {
  let initialized = false;
  let currentSlug = null;

  function init() {
    if (initialized) return;
    initialized = true;

    if (typeof GRAMMAR_DATA === 'undefined' || !GRAMMAR_DATA.tree) {
      document.getElementById('grammarNavTree').innerHTML =
        '<p class="grammar-nav-error">数据加载失败：GRAMMAR_DATA 未定义</p>';
      return;
    }

    buildNavTree(GRAMMAR_DATA.tree);

    document.getElementById('grammarSidebarToggle')
      ?.addEventListener('click', toggleSidebar);
  }

  function buildNavTree(tree) {
    const container = document.getElementById('grammarNavTree');
    if (!container) return;
    container.innerHTML = '';

    (tree.parts || []).forEach(part => {
      const partEl = document.createElement('div');
      partEl.className = 'grammar-part';

      const partHeading = document.createElement('div');
      partHeading.className = 'grammar-part-heading';
      partHeading.textContent = part.title;
      partEl.appendChild(partHeading);

      (part.chapters || []).forEach(ch => {
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

  function loadTopic(slug, title, partTitle, chapterTitle) {
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
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    const body = document.getElementById('grammarContentBody');
    if (!body) return;

    const text = GRAMMAR_DATA.content[slug];
    if (text === undefined) {
      body.innerHTML = '<div class="grammar-error">内容未找到：' + escapeHtml(slug) + '</div>';
      return;
    }

    body.innerHTML = '<div class="grammar-markdown">' + marked.parse(text) + '</div>';
    body.scrollTop = 0;

    // On mobile, close sidebar after selecting topic
    if (window.innerWidth < 768) {
      document.querySelector('.grammar-book-layout')?.classList.remove('sidebar-open');
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
