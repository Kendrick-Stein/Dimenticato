/**
 * 社区词本管理器
 * 处理社区词本的上传、浏览、下载等功能
 */

const CommunityWordbooks = {
  currentFilters: {
    difficulty: 'all',
    tags: [],
    searchTerm: '',
    sortBy: 'download_count' // 'download_count', 'created_at', 'name'
  },
  
  allWordbooks: [], // 缓存所有词本数据
  
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
    
    // 清除所有标签选择
    document.querySelectorAll('.tag-checkbox').forEach(cb => {
      cb.checked = false;
    });
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
      alert('❌ 请选择 JSON 或 TXT 格式的文件');
      input.value = '';
      document.getElementById('uploadFileName').textContent = '未选择文件';
      return;
    }
    
    // 验证文件大小（5MB）
    if (file.size > STORAGE_CONFIG.maxFileSize) {
      alert('❌ 文件大小不能超过 5MB');
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
      
      // 获取选中的标签
      const selectedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked'))
        .map(cb => cb.value);
      
      // 验证必填字段
      if (!name) {
        alert('❌ 请输入词本名称');
        return;
      }
      
      if (!authorName) {
        alert('❌ 请输入作者名');
        return;
      }
      
      if (!file) {
        alert('❌ 请选择要上传的文件');
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
          const parseResult = WordbookManager.parseTxtWordbook(fileContent);
          parsedWords = parseResult.words;
          wordCount = parsedWords.length;
        }
      } catch (error) {
        alert('❌ 文件格式错误: ' + error.message);
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        return;
      }
      
      if (wordCount === 0) {
        alert('❌ 文件中没有找到有效的单词');
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        return;
      }
      
      // 3. 上传文件到 Supabase Storage
      const client = getSupabaseClient();
      if (!client) {
        alert('❌ Supabase 客户端未初始化');
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        return;
      }
      
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}_${randomStr}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await client.storage
        .from(STORAGE_CONFIG.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('文件上传失败:', uploadError);
        alert('❌ 文件上传失败: ' + uploadError.message);
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        return;
      }
      
      // 4. 获取公开访问 URL
      const { data: urlData } = client.storage
        .from(STORAGE_CONFIG.bucketName)
        .getPublicUrl(fileName);
      
      const fileUrl = urlData.publicUrl;
      
      // 5. 保存元数据到数据库
      const { data: insertData, error: insertError } = await client
        .from('community_wordbooks')
        .insert({
          name: name,
          description: description,
          author_name: authorName,
          language: 'Italian',
          difficulty: difficulty,
          tags: selectedTags,
          word_count: wordCount,
          download_count: 0,
          file_url: fileUrl
        })
        .select();
      
      if (insertError) {
        console.error('数据库插入失败:', insertError);
        alert('❌ 保存失败: ' + insertError.message);
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        return;
      }
      
      // 6. 上传成功
      alert(`✅ 上传成功！\n\n词本名称: ${name}\n单词数量: ${wordCount}\n感谢你的分享！`);
      
      // 重置按钮
      uploadBtn.disabled = false;
      uploadBtn.textContent = originalText;
      
      // 关闭对话框
      this.hideUploadDialog();
      
      // 如果当前在浏览页面，刷新列表
      const browseScreen = document.getElementById('communityBrowseScreen');
      if (browseScreen && !browseScreen.classList.contains('screen')) {
        this.fetchAndDisplayWordbooks();
      }
      
    } catch (error) {
      console.error('上传词本失败:', error);
      alert('❌ 上传失败: ' + error.message);
      
      const uploadBtn = document.getElementById('uploadWordbookBtn');
      uploadBtn.disabled = false;
      uploadBtn.textContent = '🚀 上传到社区';
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
  
  /**
   * 显示浏览社区词本页面
   */
  async showBrowseScreen() {
    showScreen('communityBrowseScreen');
    
    // 重置筛选条件
    this.currentFilters = {
      difficulty: 'all',
      tags: [],
      searchTerm: '',
      sortBy: 'download_count'
    };
    
    // 清空搜索框
    document.getElementById('communitySearchInput').value = '';
    
    // 获取并显示词本列表
    await this.fetchAndDisplayWordbooks();
  },
  
  /**
   * 从 Supabase 获取词本列表
   */
  async fetchAndDisplayWordbooks() {
    try {
      const container = document.getElementById('communityWordbookList');
      container.innerHTML = '<div class="loading-message">加载中...</div>';
      
      const client = getSupabaseClient();
      if (!client) {
        container.innerHTML = '<div class="error-message">❌ Supabase 客户端未初始化</div>';
        return;
      }
      
      // 构建查询
      let query = client
        .from('community_wordbooks')
        .select('*');
      
      // 应用难度筛选
      if (this.currentFilters.difficulty !== 'all') {
        query = query.eq('difficulty', this.currentFilters.difficulty);
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
      
      const { data, error } = await query;
      
      if (error) {
        console.error('获取词本列表失败:', error);
        container.innerHTML = '<div class="error-message">❌ 加载失败: ' + error.message + '</div>';
        return;
      }
      
      this.allWordbooks = data || [];
      this.renderWordbookList(this.allWordbooks);
      
    } catch (error) {
      console.error('获取词本列表失败:', error);
      const container = document.getElementById('communityWordbookList');
      container.innerHTML = '<div class="error-message">❌ 加载失败: ' + error.message + '</div>';
    }
  },
  
  /**
   * 渲染词本列表
   */
  renderWordbookList(wordbooks) {
    const container = document.getElementById('communityWordbookList');
    
    if (!wordbooks || wordbooks.length === 0) {
      container.innerHTML = `
        <div class="empty-message">
          <div class="empty-icon">📚</div>
          <p>还没有社区词本</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">成为第一个分享者吧！</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = wordbooks.map(wb => {
      const difficultyInfo = DIFFICULTY_LEVELS[wb.difficulty] || { label: wb.difficulty, icon: '📖' };
      const tagsHtml = wb.tags && wb.tags.length > 0
        ? wb.tags.map(tag => `<span class="wordbook-tag">${tag}</span>`).join('')
        : '';
      
      return `
        <div class="community-wordbook-card">
          <div class="wordbook-card-header">
            <h3 class="wordbook-card-title">${wb.name}</h3>
            <span class="wordbook-difficulty-badge">${difficultyInfo.icon} ${difficultyInfo.label}</span>
          </div>
          
          <div class="wordbook-card-meta">
            <span>👤 ${wb.author_name}</span>
            <span>📝 ${wb.word_count} 词</span>
            <span>⬇️ ${wb.download_count} 次下载</span>
          </div>
          
          ${tagsHtml ? `<div class="wordbook-card-tags">${tagsHtml}</div>` : ''}
          
          ${wb.description ? `<p class="wordbook-card-description">${wb.description}</p>` : ''}
          
          <div class="wordbook-card-actions">
            <button class="wordbook-action-btn preview" onclick="CommunityWordbooks.previewWordbook('${wb.id}')">
              👁️ 预览
            </button>
            <button class="wordbook-action-btn download" onclick="CommunityWordbooks.downloadWordbook('${wb.id}')">
              📥 导入学习
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
   */
  updateDifficultyFilter(difficulty) {
    this.currentFilters.difficulty = difficulty;
    this.applyFilters();
    
    // 更新按钮样式
    document.querySelectorAll('.filter-difficulty-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
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
   * 下载并导入词本
   */
  async downloadWordbook(wordbookId) {
    try {
      const client = getSupabaseClient();
      if (!client) {
        alert('❌ Supabase 客户端未初始化');
        return;
      }
      
      // 1. 获取词本元数据
      const { data: wordbook, error: fetchError } = await client
        .from('community_wordbooks')
        .select('*')
        .eq('id', wordbookId)
        .single();
      
      if (fetchError || !wordbook) {
        alert('❌ 获取词本信息失败');
        return;
      }
      
      // 2. 下载文件内容
      const response = await fetch(wordbook.file_url);
      if (!response.ok) {
        alert('❌ 下载文件失败');
        return;
      }
      
      const fileContent = await response.text();
      
      // 3. 解析文件内容
      let words = [];
      try {
        if (wordbook.file_url.endsWith('.json')) {
          const jsonData = JSON.parse(fileContent);
          words = jsonData.words || jsonData;
        } else if (wordbook.file_url.endsWith('.txt')) {
          const parseResult = WordbookManager.parseTxtWordbook(fileContent);
          words = parseResult.words;
        }
      } catch (error) {
        alert('❌ 解析文件失败: ' + error.message);
        return;
      }
      
      // 4. 创建本地单词本
      const localWordbook = {
        id: Date.now(),
        name: `${wordbook.name} (社区)`,
        description: `${wordbook.description || ''}\n\n来自社区 · 作者: ${wordbook.author_name}`,
        words: words,
        wordCount: words.length,
        createdAt: new Date().toISOString(),
        fromCommunity: true,
        communityId: wordbookId
      };
      
      // 5. 保存到本地
      AppState.customWordbooks.push(localWordbook);
      WordbookManager.saveWordbooks();
      
      // 6. 更新下载计数
      await client
        .from('community_wordbooks')
        .update({ download_count: wordbook.download_count + 1 })
        .eq('id', wordbookId);
      
      // 7. 成功提示
      alert(`✅ 导入成功！\n\n"${wordbook.name}" 已添加到你的单词本列表。\n\n返回主页即可开始学习！`);
      
      // 8. 刷新列表（更新下载次数）
      this.fetchAndDisplayWordbooks();
      
      // 9. 刷新本地单词本卡片
      WordbookManager.renderWordbookCards();
      
    } catch (error) {
      console.error('下载词本失败:', error);
      alert('❌ 下载失败: ' + error.message);
    }
  },
  
  /**
   * 预览词本
   */
  async previewWordbook(wordbookId) {
    try {
      const client = getSupabaseClient();
      if (!client) {
        alert('❌ Supabase 客户端未初始化');
        return;
      }
      
      // 1. 获取词本元数据
      const { data: wordbook, error: fetchError } = await client
        .from('community_wordbooks')
        .select('*')
        .eq('id', wordbookId)
        .single();
      
      if (fetchError || !wordbook) {
        alert('❌ 获取词本信息失败');
        return;
      }
      
      // 2. 下载文件内容
      const response = await fetch(wordbook.file_url);
      if (!response.ok) {
        alert('❌ 下载文件失败');
        return;
      }
      
      const fileContent = await response.text();
      
      // 3. 解析文件内容
      let words = [];
      try {
        if (wordbook.file_url.endsWith('.json')) {
          const jsonData = JSON.parse(fileContent);
          words = jsonData.words || jsonData;
        } else if (wordbook.file_url.endsWith('.txt')) {
          const parseResult = WordbookManager.parseTxtWordbook(fileContent);
          words = parseResult.words;
        }
      } catch (error) {
        alert('❌ 解析文件失败: ' + error.message);
        return;
      }
      
      // 4. 显示预览（前20个单词）
      this.showPreviewModal(wordbook, words.slice(0, 20));
      
    } catch (error) {
      console.error('预览词本失败:', error);
      alert('❌ 预览失败: ' + error.message);
    }
  },
  
  /**
   * 显示预览模态框
   */
  showPreviewModal(wordbook, words) {
    const modal = document.getElementById('communityPreviewModal');
    if (!modal) return;
    
    const difficultyInfo = DIFFICULTY_LEVELS[wordbook.difficulty] || { label: wordbook.difficulty, icon: '📖' };
    
    // 设置标题
    document.getElementById('previewWordbookTitle').textContent = wordbook.name;
    
    // 设置元信息
    const metaHtml = `
      <div class="preview-meta">
        <span>👤 作者: ${wordbook.author_name}</span>
        <span>${difficultyInfo.icon} ${difficultyInfo.label}</span>
        <span>📝 ${wordbook.word_count} 词</span>
        <span>⬇️ ${wordbook.download_count} 次下载</span>
      </div>
      ${wordbook.tags && wordbook.tags.length > 0 ? `
        <div class="preview-tags">
          ${wordbook.tags.map(tag => `<span class="wordbook-tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
      ${wordbook.description ? `<p class="preview-description">${wordbook.description}</p>` : ''}
    `;
    document.getElementById('previewWordbookMeta').innerHTML = metaHtml;
    
    // 渲染单词列表
    const wordsHtml = words.map(word => `
      <div class="preview-word-item">
        <div class="preview-word-italian">${word.italian}</div>
        <div class="preview-word-english">${word.english}</div>
        ${word.chinese ? `<div class="preview-word-chinese">${word.chinese}</div>` : ''}
      </div>
    `).join('');
    
    document.getElementById('previewWordList').innerHTML = wordsHtml + 
      `<p class="preview-note">仅显示前 20 个单词</p>`;
    
    // 设置下载按钮
    const downloadBtn = document.getElementById('previewDownloadBtn');
    downloadBtn.onclick = () => {
      this.hidePreviewModal();
      this.downloadWordbook(wordbook.id);
    };
    
    // 显示模态框
    modal.classList.remove('hidden');
  },
  
  /**
   * 隐藏预览模态框
   */
  hidePreviewModal() {
    const modal = document.getElementById('communityPreviewModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  },
  
  /**
   * 返回主页
   */
  backToWelcome() {
    showScreen('welcomeScreen');
  }
};
