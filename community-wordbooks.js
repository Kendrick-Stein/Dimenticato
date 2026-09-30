/**
 * 社区词本管理器
 * 处理社区词本的上传、浏览、下载等功能
 *
 * 安全约定：
 * - 社区数据全部来自匿名可写的 Supabase 表，任何字段进入 innerHTML 前必须经过
 *   esc()/escAttr()（转发到 lib/utils.js 的 escapeHtml / escapeAttribute）。
 * - 卡片按钮不再使用内联 onclick，改为 data-* + 容器事件委托（见 init）。
 * - 词本文件只允许从 Supabase Storage 或本站同源地址下载（见 isTrustedFileUrl）。
 */

const CommunityWordbooks = {
  currentFilters: {
    difficulty: 'all',
    language: 'italian', // 语言 key，'all' 表示不限语言
    tags: [],
    searchTerm: '',
    sortBy: 'download_count' // 'download_count', 'created_at', 'name'
  },

  allWordbooks: [], // 缓存所有词本数据（未按语言过滤）

  activeLanguage: 'italian', // 打开社区页面时所处的语言入口
  returnScreen: 'vocabScreen', // 返回目标
  bound: false, // 事件是否已绑定（init 幂等）
  serverLanguageFilter: true, // 服务端 language 过滤是否可用（老库可能没有该列）

  // ==================== 基础工具 ====================

  /** HTML 转义（运行时通过 window 解析，避免依赖脚本加载顺序） */
  esc(value) {
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(value);
    return (value == null ? '' : String(value))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /** HTML 属性转义 */
  escAttr(value) {
    if (typeof window.escapeAttribute === 'function') return window.escapeAttribute(value);
    return this.esc(value).replace(/`/g, '&#96;');
  },

  /** 数字字段兜底（远端数据可能是 null 或字符串） */
  toCount(value) {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  },

  /** 给 thenable（PostgREST query builder / Promise）加超时，避免离线时一直转圈 */
  withTimeout(thenable, ms = 15000) {
    return Promise.race([
      Promise.resolve(thenable),
      new Promise((_, reject) => setTimeout(() => reject(new Error('请求超时')), ms))
    ]);
  },

  // ==================== 语言上下文 ====================

  /** 语言配置表（来自 supabase-config.js，运行时解析） */
  languageOptions() {
    return window.COMMUNITY_LANGUAGES || [{ key: 'italian', db: 'Italian', label: '意大利语' }];
  },

  /** 把任意写法（'Italian' / 'italian' / 空）归一化为语言 key；空值按意大利语处理（兼容历史数据） */
  normalizeLanguage(value) {
    const raw = (value == null ? '' : String(value)).trim().toLowerCase();
    if (!raw) return 'italian';
    const hit = this.languageOptions().find(opt => opt.key === raw || opt.db.toLowerCase() === raw);
    return hit ? hit.key : 'italian';
  },

  /** 语言 key → 数据库取值 */
  languageDbValue(key) {
    const hit = this.languageOptions().find(opt => opt.key === key);
    return hit ? hit.db : 'Italian';
  },

  /** 语言 key → 中文名 */
  languageLabel(key) {
    const hit = this.languageOptions().find(opt => opt.key === key);
    return hit ? hit.label : key;
  },

  /** 当前所处的语言入口 */
  resolveActiveLanguage() {
    if (typeof window.getActiveLanguage === 'function') {
      return this.normalizeLanguage(window.getActiveLanguage());
    }
    return this.normalizeLanguage(document.body.getAttribute('data-language'));
  },

  /** 返回目标：统一的词汇页（四门语言共用一套屏幕）。 */
  resolveReturnScreen() {
    return 'vocabScreen';
  },

  // ==================== 生命周期 ====================

  /**
   * 绑定模块自己的事件（幂等）。
   * 词本卡片是动态渲染的，用容器事件委托代替内联 onclick，
   * 这样词本 id / 名称都不会进入 HTML 属性上下文。
   */
  init() {
    if (this.bound) return;

    const container = document.getElementById('communityWordbookList');
    if (!container) return; // 页面结构未就绪，下次 showBrowseScreen 时再绑定

    this.onListClick = (event) => {
      const target = event.target.closest('[data-community-action]');
      if (!target || !container.contains(target)) return;
      const action = target.dataset.communityAction;
      const id = target.dataset.communityId;
      if (action === 'preview') this.previewWordbook(id);
      else if (action === 'download') this.downloadWordbook(id);
      else if (action === 'retry') this.fetchAndDisplayWordbooks();
      else if (action === 'show-all-languages') this.updateLanguageFilter('all');
    };
    container.addEventListener('click', this.onListClick);

    // 断网后恢复：如果用户仍停留在社区页面，自动重试
    this.onOnline = () => {
      const screen = document.getElementById('communityBrowseScreen');
      if (screen && screen.classList.contains('active')) this.fetchAndDisplayWordbooks();
    };
    window.addEventListener('online', this.onOnline);

    this.bound = true;
  },

  /** 解绑（供测试或热重载使用） */
  destroy() {
    const container = document.getElementById('communityWordbookList');
    if (container && this.onListClick) container.removeEventListener('click', this.onListClick);
    if (this.onOnline) window.removeEventListener('online', this.onOnline);
    this.bound = false;
  },

  // ==================== 上传词本 ====================

  /**
   * 显示上传词本对话框
   */
  showUploadDialog() {
    const modal = document.getElementById('communityUploadModal');
    if (!modal) {
      console.error('上传对话框未找到');
      return;
    }

    this.activeLanguage = this.resolveActiveLanguage();

    // 重置表单
    this.resetUploadForm();

    // 显示模态框
    modal.classList.remove('hidden');
  },

  /**
   * 隐藏上传对话框
   */
  hideUploadDialog() {
    const modal = document.getElementById('communityUploadModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  },

  /**
   * 重置上传表单
   */
  resetUploadForm() {
    document.getElementById('uploadWordbookName').value = '';
    document.getElementById('uploadAuthorName').value = '';
    document.getElementById('uploadDescription').value = '';
    document.getElementById('uploadDifficulty').value = 'Beginner';
    document.getElementById('uploadFileInput').value = '';
    document.getElementById('uploadFileName').textContent = '未选择文件';

    // 语言选择器（运行时注入，默认选中当前语言入口）
    this.ensureUploadLanguageField();
    const languageSelect = document.getElementById('uploadLanguage');
    if (languageSelect) languageSelect.value = this.activeLanguage;

    // 清除所有标签选择
    document.querySelectorAll('.tag-checkbox').forEach(cb => {
      cb.checked = false;
    });
  },

  /**
   * 在上传表单中注入“语言”选择项（index.html 里没有这一项）
   */
  ensureUploadLanguageField() {
    if (document.getElementById('uploadLanguage')) return;
    const form = document.getElementById('communityUploadForm');
    const difficultyLabel = document.querySelector('label[for="uploadDifficulty"]');
    if (!form || !difficultyLabel) return;

    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `
      <label for="uploadLanguage">词本语言 *</label>
      <select id="uploadLanguage" class="form-input" required>
        ${this.languageOptions().map(opt => `<option value="${this.escAttr(opt.key)}">${this.esc(opt.label)}</option>`).join('')}
      </select>
    `;
    form.insertBefore(group, difficultyLabel.parentElement);
  },

  /**
   * 选择文件
   */
  selectFile() {
    const input = document.getElementById('uploadFileInput');
    const file = input.files[0];

    if (!file) {
      document.getElementById('uploadFileName').textContent = '未选择文件';
      return;
    }

    // 验证文件类型
    const validTypes = ['.json', '.txt'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(fileExt)) {
      alert('请选择 JSON 或 TXT 格式的文件');
      input.value = '';
      document.getElementById('uploadFileName').textContent = '未选择文件';
      return;
    }

    // 验证文件大小（5MB）
    const maxFileSize = (window.STORAGE_CONFIG && window.STORAGE_CONFIG.maxFileSize) || 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      alert('文件大小不能超过 5MB');
      input.value = '';
      document.getElementById('uploadFileName').textContent = '未选择文件';
      return;
    }

    document.getElementById('uploadFileName').textContent = file.name;
  },

  /**
   * 上传词本到 Supabase
   */
  async uploadWordbook() {
    try {
      // 1. 验证表单
      const name = document.getElementById('uploadWordbookName').value.trim();
      const authorName = document.getElementById('uploadAuthorName').value.trim();
      const description = document.getElementById('uploadDescription').value.trim();
      const difficulty = document.getElementById('uploadDifficulty').value;
      const fileInput = document.getElementById('uploadFileInput');
      const file = fileInput.files[0];

      // 上传语言：优先取表单选择，其次取当前语言入口
      const languageSelect = document.getElementById('uploadLanguage');
      const language = this.normalizeLanguage(
        (languageSelect && languageSelect.value) || this.activeLanguage || this.resolveActiveLanguage()
      );

      // 获取选中的标签
      const selectedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked'))
        .map(cb => cb.value);

      // 验证必填字段
      if (!name) {
        alert('请输入词本名称');
        return;
      }

      if (!authorName) {
        alert('请输入作者名');
        return;
      }

      if (!file) {
        alert('请选择要上传的文件');
        return;
      }

      // 长度限制与数据库 CHECK 约束保持一致，避免提交后被拒绝
      const limits = window.COMMUNITY_FIELD_LIMITS || { name: 80, authorName: 40, description: 500 };
      if (name.length > limits.name) {
        alert(`词本名称不能超过 ${limits.name} 个字符`);
        return;
      }
      if (authorName.length > limits.authorName) {
        alert(`作者名不能超过 ${limits.authorName} 个字符`);
        return;
      }
      if (description.length > limits.description) {
        alert(`描述不能超过 ${limits.description} 个字符`);
        return;
      }

      // 显示上传中状态
      const uploadBtn = document.getElementById('uploadWordbookBtn');
      const originalText = uploadBtn.textContent;
      uploadBtn.disabled = true;
      uploadBtn.textContent = '上传中...';

      // 2. 解析文件内容并统计单词数
      const fileContent = await this.readFileContent(file);
      let wordCount = 0;
      let parsedWords = null;

      try {
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(fileContent);
          parsedWords = jsonData.words || jsonData;
          wordCount = Array.isArray(parsedWords) ? parsedWords.length : 0;
        } else if (file.name.endsWith('.txt')) {
          const parseResult = window.Wordbooks.parseTxt(fileContent, language);
          parsedWords = parseResult.words;
          wordCount = parsedWords.length;
        }
      } catch (error) {
        alert('文件格式错误: ' + error.message);
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        return;
      }

      if (wordCount === 0) {
        alert('文件中没有找到有效的单词');
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        return;
      }

      // 3. 上传文件到 Supabase Storage
      const client = this.getClient();
      if (!client) {
        alert(this.unavailableMessage());
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        return;
      }

      const bucketName = (window.STORAGE_CONFIG && window.STORAGE_CONFIG.bucketName) || 'wordbook-files';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}_${randomStr}_${file.name}`;

      const { data: uploadData, error: uploadError } = await client.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('文件上传失败:', uploadError);
        alert('文件上传失败: ' + uploadError.message);
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        return;
      }

      // 4. 获取公开访问 URL
      const { data: urlData } = client.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const fileUrl = urlData.publicUrl;

      // 5. 保存元数据到数据库
      const { data: insertData, error: insertError } = await client
        .from('community_wordbooks')
        .insert({
          name: name,
          description: description,
          author_name: authorName,
          language: this.languageDbValue(language),
          difficulty: difficulty,
          tags: selectedTags,
          word_count: wordCount,
          download_count: 0,
          file_url: fileUrl
        })
        .select();

      if (insertError) {
        console.error('数据库插入失败:', insertError);
        alert('保存失败: ' + insertError.message);
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        return;
      }

      // 6. 上传成功
      alert(`上传成功\n\n词本名称: ${name}\n词本语言: ${this.languageLabel(language)}\n单词数量: ${wordCount}\n感谢你的分享。`);

      // 重置按钮
      uploadBtn.disabled = false;
      uploadBtn.textContent = originalText;

      // 关闭对话框
      this.hideUploadDialog();

      // 如果当前在浏览页面，刷新列表
      const browseScreen = document.getElementById('communityBrowseScreen');
      if (browseScreen && browseScreen.classList.contains('active')) {
        this.fetchAndDisplayWordbooks();
      }

    } catch (error) {
      console.error('上传词本失败:', error);
      alert('上传失败: ' + error.message);

      const uploadBtn = document.getElementById('uploadWordbookBtn');
      if (uploadBtn) {
        uploadBtn.disabled = false;
        uploadBtn.textContent = '上传到社区';
      }
    }
  },

  /**
   * 读取文件内容
   */
  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  },

  // ==================== 浏览词本 ====================

  /** 运行时获取 Supabase 客户端（SDK 可能被网络环境拦截） */
  getClient() {
    if (typeof window.getSupabaseClient !== 'function') return null;
    try {
      return window.getSupabaseClient();
    } catch (error) {
      console.error('Supabase 客户端初始化失败:', error);
      return null;
    }
  },

  /** 社区功能不可用时的统一提示 */
  unavailableMessage() {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return '当前处于离线状态，社区功能需要联网才能使用。';
    }
    return '社区功能暂时不可用（Supabase SDK 未能加载）。请检查网络后重试。';
  },

  /**
   * 显示浏览社区词本页面
   * @param {{language?: string, returnScreen?: string}} [options]
   */
  async showBrowseScreen(options) {
    const opts = options || {};
    this.activeLanguage = opts.language ? this.normalizeLanguage(opts.language) : this.resolveActiveLanguage();
    this.returnScreen = opts.returnScreen || this.resolveReturnScreen(this.activeLanguage);

    if (typeof window.showScreen === 'function') {
      window.showScreen('communityBrowseScreen');
    }

    // 绑定事件（此时页面结构一定已存在）
    this.init();

    // 重置筛选条件：默认只看当前语言的词本
    this.currentFilters = {
      difficulty: 'all',
      language: this.activeLanguage,
      tags: [],
      searchTerm: '',
      sortBy: 'download_count'
    };

    // 清空搜索框
    const searchInput = document.getElementById('communitySearchInput');
    if (searchInput) searchInput.value = '';

    // 重置难度下拉
    const difficultySelect = document.querySelector('#communityBrowseScreen .browse-controls select.filter-select:not(#communityLanguageFilter)');
    if (difficultySelect) difficultySelect.value = 'all';

    // 注入并同步语言筛选下拉
    this.ensureLanguageFilter();

    // 获取并显示词本列表
    await this.fetchAndDisplayWordbooks();
  },

  /**
   * 在浏览页面注入“语言筛选”下拉（index.html 中只有难度筛选）
   */
  ensureLanguageFilter() {
    const controls = document.querySelector('#communityBrowseScreen .browse-controls');
    if (!controls) return;

    let select = document.getElementById('communityLanguageFilter');
    if (!select) {
      select = document.createElement('select');
      select.id = 'communityLanguageFilter';
      select.className = 'filter-select';
      select.setAttribute('aria-label', '按语言筛选');
      select.innerHTML = this.languageOptions()
        .map(opt => `<option value="${this.escAttr(opt.key)}">${this.esc(opt.label)}</option>`)
        .join('') + '<option value="all">全部语言</option>';
      select.addEventListener('change', () => this.updateLanguageFilter(select.value));
      controls.appendChild(select);
    }
    select.value = this.currentFilters.language || this.activeLanguage;
  },

  /**
   * 从 Supabase 获取词本列表
   */
  async fetchAndDisplayWordbooks() {
    const container = document.getElementById('communityWordbookList');
    if (!container) return;

    container.innerHTML = '<div class="loading-message">加载中...</div>';

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.renderStatus('cloud_off', '当前处于离线状态', '社区词本需要联网加载，恢复网络后可重试。', true);
      return;
    }

    const client = this.getClient();
    if (!client) {
      this.renderStatus('cloud_off', '社区功能暂时不可用', this.unavailableMessage(), true);
      return;
    }

    try {
      const { data, error } = await this.runListQuery(client);

      if (error) {
        console.error('获取词本列表失败:', error);
        this.renderStatus('error', '加载失败', error.message || '无法连接社区服务器。', true);
        return;
      }

      this.allWordbooks = data || [];
      this.renderWordbookList(this.filterByLanguage(this.allWordbooks));

    } catch (error) {
      console.error('获取词本列表失败:', error);
      this.renderStatus('error', '加载失败', (error && error.message) || '无法连接社区服务器。', true);
    }
  },

  /**
   * 构建并执行列表查询。
   * language 过滤优先走服务端；老部署可能没有 language 列，出错时降级为纯客户端过滤。
   */
  async runListQuery(client, skipLanguageFilter) {
    const buildQuery = (withLanguage) => {
      let query = client
        .from('community_wordbooks')
        .select('*');

      // 应用难度筛选
      if (this.currentFilters.difficulty !== 'all') {
        query = query.eq('difficulty', this.currentFilters.difficulty);
      }

      // 应用语言筛选（兼容历史行：language 为空视为意大利语）
      if (withLanguage && this.currentFilters.language && this.currentFilters.language !== 'all') {
        const key = this.currentFilters.language;
        const dbValue = this.languageDbValue(key);
        const clauses = [`language.eq.${dbValue}`, `language.eq.${key}`];
        if (key === 'italian') clauses.push('language.is.null');
        query = query.or(clauses.join(','));
      }

      // 应用标签筛选
      if (this.currentFilters.tags.length > 0) {
        query = query.contains('tags', this.currentFilters.tags);
      }

      // 应用搜索
      if (this.currentFilters.searchTerm) {
        query = query.ilike('name', `%${this.currentFilters.searchTerm}%`);
      }

      // 排序
      if (this.currentFilters.sortBy === 'download_count') {
        query = query.order('download_count', { ascending: false });
      } else if (this.currentFilters.sortBy === 'created_at') {
        query = query.order('created_at', { ascending: false });
      } else if (this.currentFilters.sortBy === 'name') {
        query = query.order('name', { ascending: true });
      }

      return query.limit(500);
    };

    const useLanguage = this.serverLanguageFilter && !skipLanguageFilter;
    const result = await this.withTimeout(buildQuery(useLanguage));

    if (result && result.error && useLanguage && /language/i.test(result.error.message || '')) {
      // 服务端没有 language 列：关闭服务端过滤，改由客户端过滤
      this.serverLanguageFilter = false;
      return this.runListQuery(client, true);
    }

    return result;
  },

  /** 客户端语言过滤（服务端过滤失败时的兜底，也顺带修正大小写不一致的历史数据） */
  filterByLanguage(wordbooks) {
    const key = this.currentFilters.language;
    if (!key || key === 'all') return wordbooks;
    return wordbooks.filter(wb => this.normalizeLanguage(wb.language) === key);
  },

  /**
   * 渲染状态占位（加载失败 / 离线 / 空列表）
   */
  renderStatus(icon, title, detail, retryable, extraActionHtml) {
    const container = document.getElementById('communityWordbookList');
    if (!container) return;

    const retryHtml = retryable
      ? '<button type="button" class="pill-btn" data-community-action="retry"><span class="msr">refresh</span>重试</button>'
      : '';

    container.innerHTML = `
      <div class="empty-message">
        <div class="empty-icon"><span class="msr">${this.esc(icon)}</span></div>
        <p>${this.esc(title)}</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">${this.esc(detail)}</p>
        <div style="margin-top: 1rem; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          ${retryHtml}
          ${extraActionHtml || ''}
        </div>
      </div>
    `;
  },

  /**
   * 渲染词本列表
   */
  renderWordbookList(wordbooks) {
    const container = document.getElementById('communityWordbookList');
    if (!container) return;

    if (!wordbooks || wordbooks.length === 0) {
      const filtered = this.currentFilters.language && this.currentFilters.language !== 'all';
      if (filtered && this.allWordbooks.length > 0) {
        this.renderStatus(
          'groups',
          `还没有${this.languageLabel(this.currentFilters.language)}词本`,
          '换个语言看看，或者成为第一个分享者。',
          false,
          '<button type="button" class="pill-btn" data-community-action="show-all-languages"><span class="msr">translate</span>查看全部语言</button>'
        );
        return;
      }
      this.renderStatus('groups', '还没有社区词本', '成为第一个分享者吧！', false);
      return;
    }

    const difficultyLevels = window.DIFFICULTY_LEVELS || {};

    container.innerHTML = wordbooks.map(wb => {
      const difficultyInfo = difficultyLevels[wb.difficulty] || { label: wb.difficulty || '未分级' };
      const language = this.normalizeLanguage(wb.language);
      const tagsHtml = Array.isArray(wb.tags) && wb.tags.length > 0
        ? wb.tags.map(tag => `<span class="wordbook-tag">${this.esc(tag)}</span>`).join('')
        : '';

      return `
        <div class="community-wordbook-card">
          <div class="wordbook-card-header">
            <h3 class="wordbook-card-title">${this.esc(wb.name)}</h3>
            <span class="wordbook-difficulty-badge">${this.esc(difficultyInfo.label)}</span>
          </div>

          <div class="wordbook-card-meta">
            <span><span class="msr">translate</span> ${this.esc(this.languageLabel(language))}</span>
            <span><span class="msr">person</span> ${this.esc(wb.author_name)}</span>
            <span><span class="msr">menu_book</span> ${this.toCount(wb.word_count)} 词</span>
            <span><span class="msr">download</span> ${this.toCount(wb.download_count)} 次下载</span>
          </div>

          ${tagsHtml ? `<div class="wordbook-card-tags">${tagsHtml}</div>` : ''}

          ${wb.description ? `<p class="wordbook-card-description">${this.esc(wb.description)}</p>` : ''}

          <div class="wordbook-card-actions">
            <button type="button" class="wordbook-action-btn preview" data-community-action="preview" data-community-id="${this.escAttr(wb.id)}">
              <span class="msr">visibility</span> 预览
            </button>
            <button type="button" class="wordbook-action-btn download" data-community-action="download" data-community-id="${this.escAttr(wb.id)}">
              <span class="msr">download</span> 导入学习
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * 应用筛选条件
   */
  applyFilters() {
    this.fetchAndDisplayWordbooks();
  },

  /**
   * 更新难度筛选
   * @param {string} difficulty
   * @param {Event} [evt] 可选：内联 onclick 传入的事件对象（不再依赖隐式全局 event）
   */
  updateDifficultyFilter(difficulty, evt) {
    this.currentFilters.difficulty = difficulty;
    this.applyFilters();

    // 更新按钮样式（老的按钮组布局）
    const buttons = document.querySelectorAll('.filter-difficulty-btn');
    if (buttons.length) {
      buttons.forEach(btn => btn.classList.remove('active'));
      const target = (evt && evt.target && evt.target.closest && evt.target.closest('.filter-difficulty-btn'))
        || document.querySelector(`.filter-difficulty-btn[data-difficulty="${CSS.escape(String(difficulty))}"]`);
      if (target) target.classList.add('active');
    }
  },

  /**
   * 更新语言筛选
   */
  updateLanguageFilter(language) {
    this.currentFilters.language = language === 'all' ? 'all' : this.normalizeLanguage(language);
    const select = document.getElementById('communityLanguageFilter');
    if (select && select.value !== this.currentFilters.language) select.value = this.currentFilters.language;
    this.applyFilters();
  },

  /**
   * 更新排序方式
   */
  updateSortBy(sortBy) {
    this.currentFilters.sortBy = sortBy;
    this.applyFilters();
  },

  /**
   * 搜索词本
   */
  searchWordbooks(searchTerm) {
    this.currentFilters.searchTerm = searchTerm.trim();
    this.applyFilters();
  },

  // ==================== 下载和预览 ====================

  /**
   * 词本文件只允许来自 Supabase Storage 或本站同源地址。
   * 表是匿名可写的，file_url 属于不可信输入。
   */
  isTrustedFileUrl(url) {
    if (typeof url !== 'string' || !url) return false;
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.origin === window.location.origin) return true; // 仓库内的示例文件
      const base = window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url;
      if (!base) return false;
      const allowedOrigin = new URL(base).origin;
      return parsed.protocol === 'https:'
        && parsed.origin === allowedOrigin
        && parsed.pathname.startsWith('/storage/v1/object/public/');
    } catch (error) {
      return false;
    }
  },

  /**
   * 拉取并解析远端词本文件
   */
  async fetchWordbookFile(wordbook, language) {
    if (!this.isTrustedFileUrl(wordbook.file_url)) {
      alert('该词本的文件地址不在受信任的来源内，已阻止下载。');
      return null;
    }

    let response;
    try {
      response = await this.withTimeout(fetch(wordbook.file_url), 20000);
    } catch (error) {
      alert('下载文件失败：' + ((error && error.message) || '网络错误'));
      return null;
    }

    if (!response.ok) {
      alert('下载文件失败');
      return null;
    }

    const fileContent = await response.text();

    try {
      if (wordbook.file_url.endsWith('.json')) {
        const jsonData = JSON.parse(fileContent);
        const words = jsonData.words || jsonData;
        return Array.isArray(words) ? words : [];
      }
      if (wordbook.file_url.endsWith('.txt')) {
        return window.Wordbooks.parseTxt(fileContent, language).words;
      }
    } catch (error) {
      alert('解析文件失败: ' + error.message);
      return null;
    }

    alert('不支持的文件格式');
    return null;
  },

  /**
   * 下载并导入词本
   */
  async downloadWordbook(wordbookId) {
    try {
      const client = this.getClient();
      if (!client) {
        alert(this.unavailableMessage());
        return;
      }

      // 1. 获取词本元数据
      const { data: wordbook, error: fetchError } = await this.withTimeout(client
        .from('community_wordbooks')
        .select('*')
        .eq('id', wordbookId)
        .single());

      if (fetchError || !wordbook) {
        alert('获取词本信息失败');
        return;
      }

      // 2/3. 下载并解析文件（语言决定 TXT 的解析分支）
      const language = this.normalizeLanguage(wordbook.language);
      const words = await this.fetchWordbookFile(wordbook, language);
      if (!words) return;

      if (words.length === 0) {
        alert('该词本文件中没有有效的单词');
        return;
      }

      if (!window.Wordbooks) {
        alert('单词本模块未加载，无法导入');
        return;
      }

      // 4. 创建本地单词本（带上语言，否则会被当作意大利语词本）
      const localWordbook = {
        id: Date.now(),
        name: `${wordbook.name} (社区)`,
        description: `${wordbook.description || ''}\n\n来自社区 · 作者: ${wordbook.author_name}`,
        language: language,
        words: words,
        wordCount: words.length,
        createdAt: new Date().toISOString(),
        fromCommunity: true,
        communityId: wordbookId
      };

      // 5. 保存到本地
      window.Wordbooks.add(localWordbook);

      // 6. 更新下载计数
      await this.incrementDownloadCount(client, wordbookId, wordbook.download_count);

      // 7. 成功提示
      alert(`导入成功\n\n"${wordbook.name}" 已添加到你的${this.languageLabel(language)}词本列表。\n\n返回上一页即可开始学习。`);

      // 8. 刷新列表（更新下载次数）
      this.fetchAndDisplayWordbooks();


    } catch (error) {
      console.error('下载词本失败:', error);
      alert('下载失败: ' + error.message);
    }
  },

  /**
   * 增加下载计数。
   * 优先调用 SECURITY DEFINER RPC（见 supabase-setup.sql），
   * 老部署没有该函数时回落到直接 UPDATE，保证行为兼容。
   */
  async incrementDownloadCount(client, wordbookId, currentCount) {
    try {
      if (typeof client.rpc === 'function') {
        const { error } = await this.withTimeout(client.rpc('increment_download_count', { wordbook_id: wordbookId }));
        if (!error) return;
      }
      await this.withTimeout(client
        .from('community_wordbooks')
        .update({ download_count: this.toCount(currentCount) + 1 })
        .eq('id', wordbookId));
    } catch (error) {
      // 下载计数失败不影响导入结果
      console.warn('更新下载计数失败:', error);
    }
  },

  /**
   * 预览词本（前 20 个单词）
   */
  async previewWordbook(wordbookId) {
    try {
      const client = this.getClient();
      if (!client) {
        alert(this.unavailableMessage());
        return;
      }

      const { data: wordbook, error: fetchError } = await this.withTimeout(client
        .from('community_wordbooks')
        .select('*')
        .eq('id', wordbookId)
        .single());

      if (fetchError || !wordbook) {
        alert('获取词本信息失败');
        return;
      }

      const language = this.normalizeLanguage(wordbook.language);
      const words = await this.fetchWordbookFile(wordbook, language);
      if (!words) return;

      // 社区文件可能是任意历史格式，统一成 { word, zh, en } 再展示
      const book = window.Wordbooks.normalizeBook({ language, words: words.slice(0, 20) });
      this.showPreviewModal(wordbook, book ? book.words : [], language);
    } catch (error) {
      console.error('预览词本失败:', error);
      alert('预览失败: ' + error.message);
    }
  },

  showPreviewModal(wordbook, words, language) {
    const modal = document.getElementById('communityPreviewModal');
    if (!modal) return;

    const difficultyLevels = window.DIFFICULTY_LEVELS || {};
    const difficultyInfo = difficultyLevels[wordbook.difficulty] || { label: wordbook.difficulty || '未分级' };
    const languageKey = language || this.normalizeLanguage(wordbook.language);

    document.getElementById('previewWordbookTitle').textContent = wordbook.name || '';

    const metaHtml = `
      <div class="preview-meta">
        <span><span class="msr">translate</span> ${this.esc(this.languageLabel(languageKey))}</span>
        <span><span class="msr">person</span> 作者: ${this.esc(wordbook.author_name)}</span>
        <span><span class="msr">signal_cellular_alt</span> ${this.esc(difficultyInfo.label)}</span>
        <span><span class="msr">menu_book</span> ${this.toCount(wordbook.word_count)} 词</span>
        <span><span class="msr">download</span> ${this.toCount(wordbook.download_count)} 次下载</span>
      </div>
      ${Array.isArray(wordbook.tags) && wordbook.tags.length > 0 ? `
        <div class="preview-tags">
          ${wordbook.tags.map(tag => `<span class="wordbook-tag">${this.esc(tag)}</span>`).join('')}
        </div>
      ` : ''}
      ${wordbook.description ? `<p class="preview-description">${this.esc(wordbook.description)}</p>` : ''}
    `;
    document.getElementById('previewWordbookMeta').innerHTML = metaHtml;

    const wordsHtml = words.map(word => `
      <div class="preview-word-item">
        <div class="preview-word-italian">${this.esc(word.word)}</div>
        <div class="preview-word-english">${this.esc(word.zh)}</div>
        ${word.en ? `<div class="preview-word-chinese">${this.esc(word.en)}</div>` : ''}
      </div>
    `).join('');

    document.getElementById('previewWordList').innerHTML = wordsHtml +
      `<p class="preview-note">仅显示前 20 个单词</p>`;

    const downloadBtn = document.getElementById('previewDownloadBtn');
    downloadBtn.onclick = () => {
      this.hidePreviewModal();
      this.downloadWordbook(wordbook.id);
    };

    modal.classList.remove('hidden');
  },

  hidePreviewModal() {
    const modal = document.getElementById('communityPreviewModal');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * 返回来源页面
   */
  backToWelcome() {
    const returnScreen = this.returnScreen || this.resolveReturnScreen();
    if (typeof window.showScreen === 'function') window.showScreen(returnScreen);
  }
};

window.CommunityWordbooks = CommunityWordbooks;

// 显式绑定生命周期：DOM 就绪后完成一次事件委托绑定（init 幂等）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CommunityWordbooks.init(), { once: true });
} else {
  CommunityWordbooks.init();
}
