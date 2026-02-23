/**
 * Dimenticato - 增强功能模块
 * 包含：创建单词本、单词编辑、间隔重复算法、统计增强
 */

// ==================== 间隔重复算法 (SM-2) ====================

const SpacedRepetition = {
  // SM-2 算法默认参数
  DEFAULT_EASINESS: 2.5,
  MIN_EASINESS: 1.3,
  
  // 初始化单词的 SR 数据
  initWordSRData(word) {
    if (!word.srData) {
      word.srData = {
        easiness: this.DEFAULT_EASINESS,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date().toISOString().split('T')[0],
        lastReviewDate: null,
        reviewHistory: []
      };
    }
    return word;
  },
  
  // 计算下次复习间隔
  // quality: 0-5 (0=完全忘记, 5=完美记忆)
  calculateNextReview(word, quality) {
    this.initWordSRData(word);
    const sr = word.srData;
    
    // 记录复习历史
    sr.reviewHistory.push({
      date: new Date().toISOString(),
      quality: quality,
      interval: sr.interval
    });
    
    // 只保留最近 20 次记录
    if (sr.reviewHistory.length > 20) {
      sr.reviewHistory = sr.reviewHistory.slice(-20);
    }
    
    // 更新 easiness factor
    sr.easiness = Math.max(
      this.MIN_EASINESS,
      sr.easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
    
    // 如果回答质量 < 3，重置进度
    if (quality < 3) {
      sr.repetitions = 0;
      sr.interval = 0;
    } else {
      // 计算新的间隔
      if (sr.repetitions === 0) {
        sr.interval = 1;
      } else if (sr.repetitions === 1) {
        sr.interval = 6;
      } else {
        sr.interval = Math.round(sr.interval * sr.easiness);
      }
      sr.repetitions++;
    }
    
    // 计算下次复习日期
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + sr.interval);
    sr.nextReviewDate = nextDate.toISOString().split('T')[0];
    sr.lastReviewDate = new Date().toISOString().split('T')[0];
    
    return word;
  },
  
  // 获取需要复习的单词
  getDueWords(words) {
    const today = new Date().toISOString().split('T')[0];
    return words.filter(word => {
      this.initWordSRData(word);
      return word.srData.nextReviewDate <= today;
    });
  },
  
  // 获取单词的复习状态
  getWordStatus(word) {
    this.initWordSRData(word);
    const sr = word.srData;
    
    if (sr.repetitions === 0) {
      return { status: 'new', label: '新词', color: '#3498db' };
    } else if (sr.repetitions < 3) {
      return { status: 'learning', label: '学习中', color: '#f39c12' };
    } else {
      return { status: 'mastered', label: '熟练', color: '#2ecc71' };
    }
  },
  
  // 将答对/答错转换为质量分数
  convertCorrectToQuality(isCorrect, timeSpent = null) {
    if (isCorrect) {
      // 如果有时间数据，可以根据速度调整质量
      if (timeSpent && timeSpent < 3000) { // 3秒内
        return 5; // 完美
      }
      return 4; // 正确
    } else {
      return 2; // 困难但记得
    }
  }
};

// ==================== 每日统计管理 ====================

const StatsManager = {
  STORAGE_KEY: 'dimenticato_daily_stats',
  
  // 获取今天的日期字符串
  getTodayString() {
    return new Date().toISOString().split('T')[0];
  },
  
  // 加载每日统计数据
  loadDailyStats() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('加载每日统计失败:', e);
      return {};
    }
  },
  
  // 保存每日统计数据
  saveDailyStats(stats) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('保存每日统计失败:', e);
    }
  },
  
  // 获取今天的统计数据
  getTodayStats() {
    const allStats = this.loadDailyStats();
    const today = this.getTodayString();
    
    if (!allStats[today]) {
      allStats[today] = {
        date: today,
        duration: 0, // 学习时长（秒）
        wordsLearned: new Set(),
        correctCount: 0,
        totalCount: 0,
        reviewCount: 0,
        sessionStart: new Date().toISOString()
      };
    }
    
    // 转换 Set 为数组（因为 localStorage 不能直接存储 Set）
    if (Array.isArray(allStats[today].wordsLearned)) {
      allStats[today].wordsLearned = new Set(allStats[today].wordsLearned);
    }
    
    return allStats[today];
  },
  
  // 记录学习活动
  recordActivity(word, isCorrect, isReview = false) {
    const allStats = this.loadDailyStats();
    const today = this.getTodayString();
    const todayStats = this.getTodayStats();
    
    // 更新统计
    todayStats.wordsLearned.add(word.italian);
    todayStats.totalCount++;
    if (isCorrect) {
      todayStats.correctCount++;
    }
    if (isReview) {
      todayStats.reviewCount++;
    }
    
    // 转换 Set 为数组以便存储
    allStats[today] = {
      ...todayStats,
      wordsLearned: Array.from(todayStats.wordsLearned)
    };
    
    this.saveDailyStats(allStats);
  },
  
  // 更新学习时长
  updateDuration(seconds) {
    const allStats = this.loadDailyStats();
    const today = this.getTodayString();
    const todayStats = this.getTodayStats();
    
    todayStats.duration += seconds;
    
    allStats[today] = {
      ...todayStats,
      wordsLearned: Array.from(todayStats.wordsLearned)
    };
    
    this.saveDailyStats(allStats);
  },
  
  // 获取最近 N 天的统计
  getRecentStats(days = 7) {
    const allStats = this.loadDailyStats();
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (allStats[dateStr]) {
        result.push({
          ...allStats[dateStr],
          wordsLearned: allStats[dateStr].wordsLearned.length
        });
      } else {
        result.push({
          date: dateStr,
          duration: 0,
          wordsLearned: 0,
          correctCount: 0,
          totalCount: 0,
          reviewCount: 0
        });
      }
    }
    
    return result;
  },
  
  // 获取总计统计
  getTotalStats() {
    const allStats = this.loadDailyStats();
    const allWords = new Set();
    let totalDuration = 0;
    let totalCorrect = 0;
    let totalAttempts = 0;
    let totalReviews = 0;
    
    Object.values(allStats).forEach(dayStat => {
      const words = Array.isArray(dayStat.wordsLearned) 
        ? dayStat.wordsLearned 
        : [];
      words.forEach(w => allWords.add(w));
      totalDuration += dayStat.duration || 0;
      totalCorrect += dayStat.correctCount || 0;
      totalAttempts += dayStat.totalCount || 0;
      totalReviews += dayStat.reviewCount || 0;
    });
    
    return {
      totalWords: allWords.size,
      totalDuration,
      totalCorrect,
      totalAttempts,
      totalReviews,
      averageAccuracy: totalAttempts > 0 ? (totalCorrect / totalAttempts * 100).toFixed(1) : 0
    };
  }
};

// ==================== 单词本编辑器 ====================

const WordbookEditor = {
  currentEditingWordbook: null,
  currentEditingWord: null,
  selectedWords: new Set(),
  
  // 创建新单词本
  createNewWordbook() {
    const name = prompt('请输入单词本名称：');
    if (!name || !name.trim()) {
      return null;
    }
    
    const description = prompt('请输入单词本描述（可选）：', '');
    
    const wordbook = {
      id: Date.now(),
      name: name.trim(),
      description: description ? description.trim() : '',
      words: [],
      wordCount: 0,
      createdAt: new Date().toISOString()
    };
    
    AppState.customWordbooks.push(wordbook);
    WordbookManager.saveWordbooks();
    WordbookManager.renderWordbookCards();
    
    return wordbook;
  },
  
  // 打开单词本编辑器
  openEditor(wordbookId) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === wordbookId);
    if (!wordbook) {
      alert('单词本不存在');
      return;
    }
    
    this.currentEditingWordbook = wordbook;
    this.selectedWords.clear();
    
    // 显示编辑器模态框
    this.showEditorModal();
  },
  
  // 显示编辑器模态框
  showEditorModal() {
    const modal = document.getElementById('wordbookEditorModal');
    if (!modal) {
      console.error('编辑器模态框不存在');
      return;
    }
    
    // 更新标题
    document.getElementById('editorWordbookName').textContent = this.currentEditingWordbook.name;
    
    // 渲染单词列表
    this.renderEditorWordList();
    
    // 显示模态框
    modal.classList.remove('hidden');
  },
  
  // 隐藏编辑器模态框
  hideEditorModal() {
    const modal = document.getElementById('wordbookEditorModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    this.currentEditingWordbook = null;
    this.selectedWords.clear();
  },
  
  // 渲染编辑器中的单词列表
  renderEditorWordList() {
    const container = document.getElementById('editorWordList');
    if (!container || !this.currentEditingWordbook) return;
    
    const words = this.currentEditingWordbook.words;
    
    if (words.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">此单词本还没有单词</p>';
      return;
    }
    
    container.innerHTML = words.map((word, index) => `
      <div class="editor-word-item">
        <input type="checkbox" class="word-checkbox" data-index="${index}" 
          ${this.selectedWords.has(index) ? 'checked' : ''}>
        <div class="editor-word-content">
          <div class="editor-word-main">
            <span class="editor-word-italian">${word.italian}</span>
            <span class="editor-word-english">${word.english}</span>
          </div>
          ${word.chinese ? `<div class="editor-word-chinese">${word.chinese}</div>` : ''}
          ${word.notes ? `<div class="editor-word-notes">${word.notes}</div>` : ''}
        </div>
        <div class="editor-word-actions">
          <button class="editor-action-btn edit" onclick="WordbookEditor.editWord(${index})" title="编辑">
            ✏️
          </button>
          <button class="editor-action-btn delete" onclick="WordbookEditor.deleteWord(${index})" title="删除">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
    
    // 绑定复选框事件
    container.querySelectorAll('.word-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        if (e.target.checked) {
          this.selectedWords.add(index);
        } else {
          this.selectedWords.delete(index);
        }
        this.updateBatchActionsVisibility();
      });
    });
  },
  
  // 更新批量操作按钮的可见性
  updateBatchActionsVisibility() {
    const batchActions = document.querySelector('.editor-batch-actions');
    if (batchActions) {
      batchActions.style.display = this.selectedWords.size > 0 ? 'flex' : 'none';
    }
  },
  
  // 添加新单词
  addNewWord() {
    if (!this.currentEditingWordbook) return;
    
    this.showWordEditDialog(null);
  },
  
  // 编辑单词
  editWord(index) {
    if (!this.currentEditingWordbook) return;
    
    const word = this.currentEditingWordbook.words[index];
    this.currentEditingWord = { word, index };
    this.showWordEditDialog(word);
  },
  
  // 显示单词编辑对话框
  showWordEditDialog(word) {
    const dialog = document.getElementById('wordEditDialog');
    if (!dialog) return;
    
    // 填充表单
    if (word) {
      document.getElementById('editWordItalian').value = word.italian || '';
      document.getElementById('editWordEnglish').value = word.english || '';
      document.getElementById('editWordChinese').value = word.chinese || '';
      document.getElementById('editWordNotes').value = word.notes || '';
      document.getElementById('wordEditDialogTitle').textContent = '编辑单词';
    } else {
      document.getElementById('editWordItalian').value = '';
      document.getElementById('editWordEnglish').value = '';
      document.getElementById('editWordChinese').value = '';
      document.getElementById('editWordNotes').value = '';
      document.getElementById('wordEditDialogTitle').textContent = '添加新单词';
    }
    
    dialog.classList.remove('hidden');
  },
  
  // 隐藏单词编辑对话框
  hideWordEditDialog() {
    const dialog = document.getElementById('wordEditDialog');
    if (dialog) {
      dialog.classList.add('hidden');
    }
    this.currentEditingWord = null;
  },
  
  // 保存单词编辑
  saveWordEdit() {
    if (!this.currentEditingWordbook) return;
    
    const italian = document.getElementById('editWordItalian').value.trim();
    const english = document.getElementById('editWordEnglish').value.trim();
    const chinese = document.getElementById('editWordChinese').value.trim();
    const notes = document.getElementById('editWordNotes').value.trim();
    
    if (!italian || !english) {
      alert('意大利语和英语翻译不能为空！');
      return;
    }
    
    const wordData = {
      italian,
      english,
      chinese,
      notes
    };
    
    if (this.currentEditingWord) {
      // 编辑现有单词
      this.currentEditingWordbook.words[this.currentEditingWord.index] = wordData;
    } else {
      // 添加新单词
      this.currentEditingWordbook.words.push(wordData);
    }
    
    // 更新单词数量
    this.currentEditingWordbook.wordCount = this.currentEditingWordbook.words.length;
    
    // 保存到 localStorage
    WordbookManager.saveWordbooks();
    
    // 刷新显示
    this.renderEditorWordList();
    this.hideWordEditDialog();
    
    // 如果当前正在学习这个单词本，更新显示
    if (AppState.currentWordbook && AppState.currentWordbook.id === this.currentEditingWordbook.id) {
      AppState.currentWordbook = this.currentEditingWordbook;
      AppState.currentWords = this.currentEditingWordbook.words.map(w => ({
        ...w,
        rank: 999999
      }));
      updateHeaderStats();
    }
  },
  
  // 删除单词
  deleteWord(index) {
    if (!this.currentEditingWordbook) return;
    
    if (confirm('确定要删除这个单词吗？')) {
      this.currentEditingWordbook.words.splice(index, 1);
      this.currentEditingWordbook.wordCount = this.currentEditingWordbook.words.length;
      WordbookManager.saveWordbooks();
      this.renderEditorWordList();
      
      // 更新当前学习状态
      if (AppState.currentWordbook && AppState.currentWordbook.id === this.currentEditingWordbook.id) {
        AppState.currentWordbook = this.currentEditingWordbook;
        AppState.currentWords = this.currentEditingWordbook.words.map(w => ({
          ...w,
          rank: 999999
        }));
        updateHeaderStats();
      }
    }
  },
  
  // 批量删除
  batchDelete() {
    if (!this.currentEditingWordbook || this.selectedWords.size === 0) return;
    
    if (confirm(`确定要删除选中的 ${this.selectedWords.size} 个单词吗？`)) {
      // 从大到小排序索引，避免删除时索引错位
      const indices = Array.from(this.selectedWords).sort((a, b) => b - a);
      indices.forEach(index => {
        this.currentEditingWordbook.words.splice(index, 1);
      });
      
      this.currentEditingWordbook.wordCount = this.currentEditingWordbook.words.length;
      this.selectedWords.clear();
      WordbookManager.saveWordbooks();
      this.renderEditorWordList();
      this.updateBatchActionsVisibility();
    }
  },
  
  // 导出单词本为 JSON
  exportWordbookAsJSON(wordbookId) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === wordbookId);
    if (!wordbook) {
      alert('单词本不存在');
      return;
    }
    
    // 创建导出数据
    const exportData = {
      name: wordbook.name,
      description: wordbook.description || '',
      words: wordbook.words,
      exportDate: new Date().toISOString(),
      exportedFrom: 'Dimenticato'
    };
    
    // 转换为 JSON 字符串
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // 创建 Blob 并下载
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wordbook.name}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`✅ 已导出"${wordbook.name}"为 JSON 格式！`);
  },
  
  // 导出单词本为 TXT
  exportWordbookAsTXT(wordbookId) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === wordbookId);
    if (!wordbook) {
      alert('单词本不存在');
      return;
    }
    
    // 创建 TXT 内容
    let txtContent = '';
    
    wordbook.words.forEach((word, index) => {
      // 添加意大利语
      txtContent += word.italian + '\n';
      // 添加英语
      txtContent += word.english + '\n';
      // 添加中文（如果有）
      txtContent += (word.chinese || '') + '\n';
      // 添加笔记（如果有）
      if (word.notes) {
        txtContent += word.notes + '\n';
      }
      
      // 单词之间用空行分隔（最后一个单词除外）
      if (index < wordbook.words.length - 1) {
        txtContent += '\n';
      }
    });
    
    // 创建 Blob 并下载
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wordbook.name}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`✅ 已导出"${wordbook.name}"为 TXT 格式！`);
  },
  
  // 显示导出选项对话框
  showExportDialog(wordbookId) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === wordbookId);
    if (!wordbook) return;
    
    const format = prompt(
      `📤 导出单词本"${wordbook.name}"\n\n` +
      `请选择导出格式：\n` +
      `1 - JSON 格式（可重新导入）\n` +
      `2 - TXT 格式（易于编辑）\n\n` +
      `请输入 1 或 2：`
    );
    
    if (format === '1') {
      this.exportWordbookAsJSON(wordbookId);
    } else if (format === '2') {
      this.exportWordbookAsTXT(wordbookId);
    }
  },
  
  // 批量导入新单词到当前编辑的单词本
  batchImportWords() {
    if (!this.currentEditingWordbook) {
      alert('请先打开一个单词本');
      return;
    }
    
    const fileInput = document.getElementById('editorBatchImportInput');
    if (!fileInput) {
      alert('文件输入元素不存在');
      return;
    }
    
    // 绑定文件选择事件
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleBatchImport(file);
      }
      // 清空 input，允许重复选择同一文件
      fileInput.value = '';
    };
    
    // 触发文件选择
    fileInput.click();
  },
  
  // 处理批量导入文件
  async handleBatchImport(file) {
    if (!this.currentEditingWordbook) return;
    
    // 只支持 TXT 格式
    if (!file.name.toLowerCase().endsWith('.txt')) {
      alert('批量导入仅支持 TXT 格式文件！');
      return;
    }
    
    try {
      const text = await file.text();
      
      // 使用 WordbookManager 的 parseTxtWordbook 方法解析
      const result = WordbookManager.parseTxtWordbook(text);
      
      if (!result || !result.words || result.words.length === 0) {
        alert('文件中没有找到有效的单词！');
        return;
      }
      
      // 过滤重复单词（不区分大小写）
      const existingWordsLower = new Set(
        this.currentEditingWordbook.words.map(w => w.italian.toLowerCase())
      );
      
      const newWords = [];
      const duplicates = [];
      
      result.words.forEach(word => {
        if (existingWordsLower.has(word.italian.toLowerCase())) {
          duplicates.push(word.italian);
        } else {
          newWords.push(word);
          existingWordsLower.add(word.italian.toLowerCase());
        }
      });
      
      // 如果没有新单词
      if (newWords.length === 0) {
        alert(`所有单词都已存在于"${this.currentEditingWordbook.name}"中！\n重复单词: ${duplicates.length} 个`);
        return;
      }
      
      // 添加新单词到单词本
      this.currentEditingWordbook.words.push(...newWords);
      this.currentEditingWordbook.wordCount = this.currentEditingWordbook.words.length;
      
      // 保存到 localStorage
      WordbookManager.saveWordbooks();
      
      // 刷新编辑器显示
      this.renderEditorWordList();
      
      // 如果当前正在学习这个单词本，更新显示
      if (AppState.currentWordbook && AppState.currentWordbook.id === this.currentEditingWordbook.id) {
        AppState.currentWordbook = this.currentEditingWordbook;
        AppState.currentWords = this.currentEditingWordbook.words.map(w => ({
          ...w,
          rank: 999999
        }));
        updateHeaderStats();
      }
      
      // 显示导入结果
      let message = `✅ 批量导入完成！\n\n`;
      message += `📥 成功添加: ${newWords.length} 个新单词\n`;
      
      if (duplicates.length > 0) {
        message += `⚠️ 跳过重复: ${duplicates.length} 个\n`;
      }
      
      if (result.autoMatchedCount > 0) {
        message += `\n🎯 自动匹配翻译: ${result.autoMatchedCount} 个\n`;
      }
      
      if (result.needManualCount > 0) {
        message += `📝 未找到翻译: ${result.needManualCount} 个\n`;
      }
      
      message += `\n当前单词本总数: ${this.currentEditingWordbook.wordCount} 个`;
      
      alert(message);
      
    } catch (error) {
      console.error('批量导入失败:', error);
      alert('导入失败: ' + error.message);
    }
  },
  
  // 添加单词到单词本（从浏览模式）
  addWordToWordbook(word) {
    // 如果没有自定义单词本，提示创建
    if (AppState.customWordbooks.length === 0) {
      if (confirm('还没有自定义单词本。是否创建一个新的单词本？')) {
        const newWordbook = this.createNewWordbook();
        if (newWordbook) {
          this.addWordToSpecificWordbook(word, newWordbook.id);
        }
      }
      return;
    }
    
    // 显示单词本选择对话框
    this.showWordbookSelectDialog(word);
  },
  
  // 显示单词本选择对话框
  showWordbookSelectDialog(word) {
    const dialog = document.getElementById('wordbookSelectDialog');
    if (!dialog) return;
    
    const list = document.getElementById('wordbookSelectList');
    list.innerHTML = AppState.customWordbooks.map(wb => `
      <div class="wordbook-select-item" onclick="WordbookEditor.addWordToSpecificWordbook(WordbookEditor.currentWordToAdd, ${wb.id})">
        <span class="wordbook-select-icon">📖</span>
        <div class="wordbook-select-info">
          <div class="wordbook-select-name">${wb.name}</div>
          <div class="wordbook-select-count">${wb.wordCount} 词</div>
        </div>
      </div>
    `).join('');
    
    // 保存当前单词
    this.currentWordToAdd = word;
    
    dialog.classList.remove('hidden');
  },
  
  // 隐藏单词本选择对话框
  hideWordbookSelectDialog() {
    const dialog = document.getElementById('wordbookSelectDialog');
    if (dialog) {
      dialog.classList.add('hidden');
    }
    this.currentWordToAdd = null;
  },
  
  // 添加单词到指定单词本
  addWordToSpecificWordbook(word, wordbookId) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === wordbookId);
    if (!wordbook) return;
    
    // 检查是否已存在
    const exists = wordbook.words.some(w => w.italian === word.italian);
    if (exists) {
      alert(`单词"${word.italian}"已经在单词本"${wordbook.name}"中了！`);
      this.hideWordbookSelectDialog();
      return;
    }
    
    // 添加单词
    wordbook.words.push({
      italian: word.italian,
      english: word.english,
      chinese: word.chinese || '',
      notes: word.notes || ''
    });
    
    wordbook.wordCount = wordbook.words.length;
    WordbookManager.saveWordbooks();
    
    alert(`✅ 已添加到单词本"${wordbook.name}"！`);
    this.hideWordbookSelectDialog();
  }
};

// ==================== 扩展现有模块 ====================

// 扩展浏览模式，添加收藏按钮
const BrowseEnhanced = {
  render(searchTerm = '') {
    let words = [...AppState.currentWords];
    
    // 应用过滤器
    if (Browse.currentFilter === 'mastered') {
      words = words.filter(w => AppState.masteredWords.has(w.italian));
    } else if (Browse.currentFilter === 'unmastered') {
      words = words.filter(w => !AppState.masteredWords.has(w.italian));
    }
    
    // 应用搜索
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      words = words.filter(w => 
        w.italian.toLowerCase().includes(term) || 
        w.english.toLowerCase().includes(term)
      );
    }
    
    // 渲染列表
    const container = document.getElementById('wordList');
    
    if (words.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">没有找到单词</p>';
      return;
    }
    
    container.innerHTML = words.map((word, index) => {
      const isMastered = AppState.masteredWords.has(word.italian);
      const rankText = word.rank < 999999 ? `#${word.rank}` : '无排名';
      const srStatus = SpacedRepetition.getWordStatus(word);
      
      // 判断是否是自定义单词本
      const isCustomWordbook = AppState.selectedSourceType === 'custom';
      
      return `
        <div class="word-item ${isMastered ? 'mastered' : ''}" data-word-index="${index}" data-italian="${word.italian}">
          <div class="word-item-left">
            <div class="editor-word-main">
              <span class="word-italian">🔊 ${word.italian}</span>
              <span class="word-english">${word.english}</span>
            </div>
            ${word.chinese ? `<div class="word-chinese">${word.chinese}</div>` : ''}
            ${word.notes ? `<div class="word-notes">${word.notes}</div>` : ''}
            <div class="word-sr-status" style="color: ${srStatus.color}; font-size: 0.85rem; margin-top: 0.3rem;">
              ${srStatus.label}
            </div>
          </div>
          <div class="word-item-right">
            <span class="word-rank">${rankText}</span>
            ${isMastered ? '<span class="mastered-badge">已掌握</span>' : ''}
            <div class="word-actions">
              ${!isCustomWordbook ? `
                <button class="word-action-btn bookmark-btn" title="收藏到单词本">
                  📌
                </button>
              ` : `
                <button class="word-action-btn edit-btn" title="编辑">
                  ✏️
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // 绑定事件（使用事件委托）
    container.querySelectorAll('.word-item').forEach((item, index) => {
      const word = words[index];
      
      // 添加点击朗读功能
      item.style.cursor = 'pointer';
      item.addEventListener('click', (e) => {
        // 如果点击的是按钮，不触发朗读
        if (e.target.classList.contains('word-action-btn') || 
            e.target.closest('.word-action-btn')) {
          return;
        }
        const italian = item.dataset.italian;
        if (italian) {
          italianSpeaker.speak(italian);
        }
      });
      
      // 收藏按钮
      const bookmarkBtn = item.querySelector('.bookmark-btn');
      if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          WordbookEditor.addWordToWordbook(word);
        });
      }
      
      // 编辑按钮
      const editBtn = item.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const wordIndex = AppState.currentWords.indexOf(word);
          if (wordIndex !== -1) {
            WordbookEditor.editWord(wordIndex);
          }
        });
      }
    });
  }
};

// 覆盖原始的 Browse.render
Browse.render = BrowseEnhanced.render;
