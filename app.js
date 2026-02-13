/**
 * Dimenticato - 意大利语背单词应用
 * 主应用逻辑
 */

// ==================== 全局状态 ====================

const AppState = {
  vocabulary: [],           // 完整词汇表
  currentWords: [],         // 当前难度级别的词汇
  selectedLevel: 1000,      // 选择的难度级别
  masteredWords: new Set(), // 已掌握的单词
  currentMode: null,        // 当前学习模式
  
  // 自定义单词本
  customWordbooks: [],      // 已导入的单词本列表
  currentWordbook: null,    // 当前正在学习的单词本
  
  // 选择状态
  selectedSource: null,     // 'system' 或 wordbook id
  selectedSourceType: null, // 'system' 或 'custom'
  
  // 测验状态
  quizIndex: 0,
  quizCorrect: 0,
  quizTotal: 0,
  currentWord: null,
  
  // 统计数据
  stats: {
    mcAttempts: 0,
    mcCorrect: 0,
    spAttempts: 0,
    spCorrect: 0,
    totalLearned: 0
  }
};

// ==================== 本地存储 ====================

const Storage = {
  KEYS: {
    MASTERED: 'dimenticato_mastered',
    STATS: 'dimenticato_stats',
    LEVEL: 'dimenticato_level',
    THEME: 'dimenticato_theme',
    CUSTOM_WORDBOOKS: 'dimenticato_custom_wordbooks'
  },
  
  save() {
    try {
      // 如果当前在学习自定义单词本，保存到对应的 key
      if (AppState.currentWordbook) {
        const key = `dimenticato_progress_wb_${AppState.currentWordbook.id}`;
        localStorage.setItem(key, JSON.stringify([...AppState.masteredWords]));
      } else {
        // 否则保存到系统词汇的 key
        localStorage.setItem(this.KEYS.MASTERED, JSON.stringify([...AppState.masteredWords]));
      }
      
      localStorage.setItem(this.KEYS.STATS, JSON.stringify(AppState.stats));
      localStorage.setItem(this.KEYS.LEVEL, AppState.selectedLevel.toString());
    } catch (e) {
      console.error('保存数据失败:', e);
    }
  },
  
  load() {
    try {
      const mastered = localStorage.getItem(this.KEYS.MASTERED);
      if (mastered) {
        AppState.masteredWords = new Set(JSON.parse(mastered));
      }
      
      const stats = localStorage.getItem(this.KEYS.STATS);
      if (stats) {
        AppState.stats = JSON.parse(stats);
      }
      
      const level = localStorage.getItem(this.KEYS.LEVEL);
      if (level) {
        AppState.selectedLevel = level === 'all' ? 'all' : parseInt(level);
      }
      
      const theme = localStorage.getItem(this.KEYS.THEME);
      if (theme) {
        document.body.setAttribute('data-theme', theme);
      }
      
      const wordbooks = localStorage.getItem(this.KEYS.CUSTOM_WORDBOOKS);
      if (wordbooks) {
        AppState.customWordbooks = JSON.parse(wordbooks);
      }
    } catch (e) {
      console.error('加载数据失败:', e);
    }
  },
  
  reset() {
    if (confirm('确定要重置所有学习进度吗？此操作不可恢复。')) {
      localStorage.clear();
      AppState.masteredWords.clear();
      AppState.stats = {
        mcAttempts: 0,
        mcCorrect: 0,
        spAttempts: 0,
        spCorrect: 0,
        totalLearned: 0
      };
      this.save();
      updateHeaderStats();
      alert('进度已重置！');
    }
  },
  
  toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem(this.KEYS.THEME, newTheme);
  }
};

// ==================== 数据加载 ====================

function loadVocabulary() {
  try {
    // 直接使用内嵌的词汇数据（从 vocabulary.js 加载）
    if (typeof VOCABULARY_DATA === 'undefined') {
      throw new Error('词汇数据未加载');
    }
    
    AppState.vocabulary = VOCABULARY_DATA;
    console.log(`✅ 成功加载 ${AppState.vocabulary.length} 个单词`);
    
    // 加载本地存储的数据
    Storage.load();
    
    // 初始化当前词汇列表
    updateCurrentWords();
    
    // 隐藏加载动画，显示应用
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    
    // 更新头部统计
    updateHeaderStats();
    
    // 高亮选中的难度级别
    highlightSelectedLevel();
    
  } catch (error) {
    console.error('❌ 加载失败:', error);
    alert('加载词汇数据失败，请确保 vocabulary.js 文件存在。');
  }
}

// 更新当前难度级别的单词列表
function updateCurrentWords() {
  if (AppState.selectedLevel === 'all') {
    AppState.currentWords = [...AppState.vocabulary];
  } else {
    AppState.currentWords = AppState.vocabulary.slice(0, AppState.selectedLevel);
  }
}

// ==================== UI 更新 ====================

function updateHeaderStats() {
  const totalWords = AppState.currentWords.length;
  const masteredCount = [...AppState.masteredWords].filter(word => 
    AppState.currentWords.some(w => w.italian === word)
  ).length;
  const progress = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
  
  document.getElementById('totalWords').textContent = totalWords.toLocaleString();
  document.getElementById('masteredWords').textContent = masteredCount.toLocaleString();
  document.getElementById('progressPercent').textContent = progress + '%';
}

function highlightSelectedLevel() {
  // 清除所有选中状态
  document.querySelectorAll('.vocab-source-btn, .wordbook-card').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // 根据选择类型高亮
  if (AppState.selectedSourceType === 'system') {
    document.querySelectorAll('.vocab-source-btn').forEach(btn => {
      const level = btn.dataset.level;
      if ((level === 'all' && AppState.selectedLevel === 'all') ||
          (level !== 'all' && parseInt(level) === AppState.selectedLevel)) {
        btn.classList.add('selected');
      }
    });
  } else if (AppState.selectedSourceType === 'custom' && AppState.selectedSource) {
    const card = document.querySelector(`.wordbook-card[data-wordbook-id="${AppState.selectedSource}"]`);
    if (card) {
      card.classList.add('selected');
    }
  }
  
  // 更新模式按钮状态
  updateModeButtons();
}

function updateModeButtons() {
  const modeButtons = [
    document.getElementById('multipleChoiceBtn'),
    document.getElementById('spellingBtn'),
    document.getElementById('browseBtn')
  ];
  
  const hasSelection = AppState.selectedSourceType !== null;
  modeButtons.forEach(btn => {
    btn.disabled = !hasSelection;
  });
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// ==================== 选择题模式 ====================

const MultipleChoice = {
  start() {
    AppState.currentMode = 'mc';
    AppState.quizIndex = 0;
    AppState.quizCorrect = 0;
    AppState.quizTotal = 0;
    
    // 随机打乱单词顺序
    AppState.currentWords = shuffleArray([...AppState.currentWords]);
    
    showScreen('multipleChoiceScreen');
    this.loadQuestion();
  },
  
  loadQuestion() {
    if (AppState.quizIndex >= AppState.currentWords.length) {
      this.showCompletion();
      return;
    }
    
    AppState.currentWord = AppState.currentWords[AppState.quizIndex];
    
    // 更新进度
    document.getElementById('mcCurrentWord').textContent = AppState.quizIndex + 1;
    document.getElementById('mcTotalWords').textContent = AppState.currentWords.length;
    
    // 更新正确率
    const accuracy = AppState.quizTotal > 0 
      ? Math.round((AppState.quizCorrect / AppState.quizTotal) * 100) 
      : 0;
    document.getElementById('mcAccuracy').textContent = accuracy + '%';
    
    // 显示意大利语单词
    document.getElementById('mcItalianWord').textContent = AppState.currentWord.italian;
    
    // 显示中文提示（如果存在）
    const chineseHint = document.getElementById('mcChineseHint');
    if (AppState.currentWord.chinese) {
      chineseHint.textContent = `中文: ${AppState.currentWord.chinese}`;
      chineseHint.classList.remove('hidden');
    } else {
      chineseHint.classList.add('hidden');
    }
    
    // 显示 notes（如果存在）
    this.displayNotes();
    
    // 生成选项
    this.generateOptions();
    
    // 隐藏反馈
    document.getElementById('mcFeedback').classList.add('hidden');
  },
  
  displayNotes() {
    // 查找或创建 notes 显示区域
    let notesContainer = document.querySelector('#multipleChoiceScreen .quiz-notes');
    if (!notesContainer) {
      const questionSection = document.querySelector('#multipleChoiceScreen .question-section');
      notesContainer = document.createElement('div');
      notesContainer.className = 'quiz-notes';
      questionSection.appendChild(notesContainer);
    }
    
    if (AppState.currentWord.notes) {
      notesContainer.innerHTML = `<strong>📝 笔记：</strong>${AppState.currentWord.notes}`;
      notesContainer.style.display = 'block';
    } else {
      notesContainer.style.display = 'none';
    }
  },
  
  generateOptions() {
    const correctAnswer = AppState.currentWord.english;
    const options = [correctAnswer];
    
    // 生成3个干扰选项（相似的翻译）
    const otherWords = AppState.vocabulary.filter(w => 
      w.italian !== AppState.currentWord.italian && 
      w.english !== correctAnswer
    );
    
    // 随机选择干扰项
    const shuffled = shuffleArray(otherWords);
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      options.push(shuffled[i].english);
    }
    
    // 打乱选项顺序
    const shuffledOptions = shuffleArray(options);
    
    // 渲染选项
    const container = document.getElementById('mcOptions');
    container.innerHTML = shuffledOptions.map(option => 
      `<button class="option-btn" data-answer="${option}">${option}</button>`
    ).join('');
    
    // 绑定点击事件
    container.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => this.checkAnswer(btn));
    });
  },
  
  checkAnswer(button) {
    const selectedAnswer = button.dataset.answer;
    const correctAnswer = AppState.currentWord.english;
    const isCorrect = selectedAnswer === correctAnswer;
    
    AppState.quizTotal++;
    if (isCorrect) {
      AppState.quizCorrect++;
      AppState.stats.mcCorrect++;
      AppState.masteredWords.add(AppState.currentWord.italian);
    }
    AppState.stats.mcAttempts++;
    
    // 禁用所有选项
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.answer === correctAnswer) {
        btn.classList.add('correct');
      } else if (btn === button && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });
    
    // 显示反馈
    const feedback = document.getElementById('mcFeedback');
    const feedbackText = feedback.querySelector('.feedback-text');
    
    if (isCorrect) {
      feedbackText.textContent = '✅ 正确！';
      feedback.classList.remove('incorrect');
      feedback.classList.add('correct');
    } else {
      feedbackText.textContent = `❌ 错误！正确答案是：${correctAnswer}`;
      feedback.classList.remove('correct');
      feedback.classList.add('incorrect');
    }
    
    feedback.classList.remove('hidden');
    
    // 保存进度
    Storage.save();
    updateHeaderStats();
  },
  
  nextQuestion() {
    AppState.quizIndex++;
    this.loadQuestion();
  },
  
  showCompletion() {
    const accuracy = Math.round((AppState.quizCorrect / AppState.quizTotal) * 100);
    alert(`🎉 完成！\n\n正确: ${AppState.quizCorrect}/${AppState.quizTotal}\n正确率: ${accuracy}%`);
    showScreen('welcomeScreen');
  }
};

// ==================== 拼写模式 ====================

const Spelling = {
  start() {
    AppState.currentMode = 'sp';
    AppState.quizIndex = 0;
    AppState.quizCorrect = 0;
    AppState.quizTotal = 0;
    
    // 随机打乱单词顺序
    AppState.currentWords = shuffleArray([...AppState.currentWords]);
    
    showScreen('spellingScreen');
    this.loadQuestion();
  },
  
  loadQuestion() {
    if (AppState.quizIndex >= AppState.currentWords.length) {
      this.showCompletion();
      return;
    }
    
    AppState.currentWord = AppState.currentWords[AppState.quizIndex];
    
    // 更新进度
    document.getElementById('spCurrentWord').textContent = AppState.quizIndex + 1;
    document.getElementById('spTotalWords').textContent = AppState.currentWords.length;
    
    // 更新正确率
    const accuracy = AppState.quizTotal > 0 
      ? Math.round((AppState.quizCorrect / AppState.quizTotal) * 100) 
      : 0;
    document.getElementById('spAccuracy').textContent = accuracy + '%';
    
    // 显示英语翻译
    document.getElementById('spEnglishWord').textContent = AppState.currentWord.english;
    
    // 显示中文翻译（如果存在）
    const chineseHint = document.getElementById('spChineseHint');
    if (AppState.currentWord.chinese) {
      chineseHint.textContent = `中文: ${AppState.currentWord.chinese}`;
      chineseHint.classList.remove('hidden');
    } else {
      chineseHint.classList.add('hidden');
    }
    
    // 显示 notes（如果存在）
    this.displayNotes();
    
    // 清空输入框
    const input = document.getElementById('spInput');
    input.value = '';
    input.disabled = false;
    input.focus();
    
    // 启用检查按钮
    document.getElementById('spCheckBtn').disabled = false;
    
    // 隐藏反馈
    document.getElementById('spFeedback').classList.add('hidden');
  },
  
  checkAnswer() {
    const input = document.getElementById('spInput');
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = AppState.currentWord.italian.toLowerCase();
    
    // 检查答案（忽略大小写和重音符号）
    const isCorrect = this.normalizeString(userAnswer) === this.normalizeString(correctAnswer);
    
    AppState.quizTotal++;
    if (isCorrect) {
      AppState.quizCorrect++;
      AppState.stats.spCorrect++;
      AppState.masteredWords.add(AppState.currentWord.italian);
    }
    AppState.stats.spAttempts++;
    
    // 禁用输入
    input.disabled = true;
    document.getElementById('spCheckBtn').disabled = true;
    
    // 显示反馈
    const feedback = document.getElementById('spFeedback');
    const feedbackText = feedback.querySelector('.feedback-text');
    
    if (isCorrect) {
      feedbackText.textContent = '✅ 正确！';
      feedback.classList.remove('incorrect');
      feedback.classList.add('correct');
    } else {
      feedbackText.textContent = `❌ 错误！正确答案是：${AppState.currentWord.italian}`;
      feedback.classList.remove('correct');
      feedback.classList.add('incorrect');
    }
    
    feedback.classList.remove('hidden');
    
    // 保存进度
    Storage.save();
    updateHeaderStats();
  },
  
  displayNotes() {
    // 查找或创建 notes 显示区域
    let notesContainer = document.querySelector('#spellingScreen .quiz-notes');
    if (!notesContainer) {
      const questionSection = document.querySelector('#spellingScreen .question-section');
      notesContainer = document.createElement('div');
      notesContainer.className = 'quiz-notes';
      questionSection.appendChild(notesContainer);
    }
    
    if (AppState.currentWord.notes) {
      notesContainer.innerHTML = `<strong>📝 笔记：</strong>${AppState.currentWord.notes}`;
      notesContainer.style.display = 'block';
    } else {
      notesContainer.style.display = 'none';
    }
  },
  
  normalizeString(str) {
    // 移除重音符号并转换为小写
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  },
  
  nextQuestion() {
    AppState.quizIndex++;
    this.loadQuestion();
  },
  
  showCompletion() {
    const accuracy = Math.round((AppState.quizCorrect / AppState.quizTotal) * 100);
    alert(`🎉 完成！\n\n正确: ${AppState.quizCorrect}/${AppState.quizTotal}\n正确率: ${accuracy}%`);
    showScreen('welcomeScreen');
  }
};

// ==================== 浏览模式 ====================

const Browse = {
  currentFilter: 'all', // all, mastered, unmastered
  
  start() {
    AppState.currentMode = 'browse';
    showScreen('browseScreen');
    this.render();
    
    // 清空搜索框
    document.getElementById('searchInput').value = '';
  },
  
  render(searchTerm = '') {
    let words = [...AppState.currentWords];
    
    // 应用过滤器
    if (this.currentFilter === 'mastered') {
      words = words.filter(w => AppState.masteredWords.has(w.italian));
    } else if (this.currentFilter === 'unmastered') {
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
    
    container.innerHTML = words.map(word => {
      const isMastered = AppState.masteredWords.has(word.italian);
      const rankText = word.rank < 999999 ? `#${word.rank}` : '无排名';
      
      return `
        <div class="word-item ${isMastered ? 'mastered' : ''}">
          <div class="word-item-left">
            <div class="word-italian">${word.italian}</div>
            <div class="word-english">${word.english}</div>
            ${word.chinese ? `<div class="word-chinese">${word.chinese}</div>` : ''}
            ${word.notes ? `<div class="word-notes">${word.notes}</div>` : ''}
          </div>
          <div class="word-item-right">
            <span class="word-rank">${rankText}</span>
            ${isMastered ? '<span class="mastered-badge">已掌握</span>' : ''}
          </div>
        </div>
      `;
    }).join('');
  },
  
  toggleFilter() {
    const filters = ['all', 'mastered', 'unmastered'];
    const currentIndex = filters.indexOf(this.currentFilter);
    this.currentFilter = filters[(currentIndex + 1) % filters.length];
    
    const filterText = {
      'all': '全部',
      'mastered': '已掌握',
      'unmastered': '未掌握'
    };
    
    document.getElementById('filterText').textContent = filterText[this.currentFilter];
    
    const searchTerm = document.getElementById('searchInput').value;
    this.render(searchTerm);
  }
};

// ==================== 自定义单词本管理 ====================

const WordbookManager = {
  // 验证 JSON 格式
  validateWordbook(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '无效的 JSON 格式' };
    }
    
    if (!data.name || typeof data.name !== 'string') {
      return { valid: false, error: '缺少 name 字段或格式不正确' };
    }
    
    if (!Array.isArray(data.words) || data.words.length === 0) {
      return { valid: false, error: 'words 字段必须是非空数组' };
    }
    
    // 验证每个单词
    for (let i = 0; i < data.words.length; i++) {
      const word = data.words[i];
      if (!word.italian || !word.english) {
        return { valid: false, error: `第 ${i + 1} 个单词缺少 italian 或 english 字段` };
      }
    }
    
    return { valid: true };
  },
  
  // 解析 TXT 格式单词本
  parseTxtWordbook(text) {
    // 移除文件开头的空行
    text = text.trim();
    
    // 按双换行符（空行）分割成单词块
    const blocks = text.split(/\n\s*\n+/);
    
    const words = [];
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i].trim();
      if (!block) continue;
      
      const lines = block.split('\n').map(line => line.trim());
      
      // 至少需要3行（意大利语、英语、中文）
      if (lines.length < 3) {
        throw new Error(`第 ${i + 1} 个单词块格式不正确，至少需要3行（意大利语、英语、中文）`);
      }
      
      const word = {
        italian: lines[0],
        english: lines[1],
        chinese: lines[2] || ''
      };
      
      // 如果有第4行，作为 notes
      if (lines.length >= 4 && lines[3]) {
        word.notes = lines[3];
      }
      
      // 验证必填字段
      if (!word.italian || !word.english) {
        throw new Error(`第 ${i + 1} 个单词块缺少意大利语或英语翻译`);
      }
      
      words.push(word);
    }
    
    if (words.length === 0) {
      throw new Error('文件中没有找到有效的单词');
    }
    
    return words;
  },
  
  // 导入单词本
  importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const isTxtFile = file.name.toLowerCase().endsWith('.txt');
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let data;
          
          if (isTxtFile) {
            // 解析 TXT 格式
            const words = this.parseTxtWordbook(content);
            
            // 从文件名生成单词本名称（去掉扩展名）
            const fileName = file.name.replace(/\.txt$/i, '');
            
            data = {
              name: fileName,
              description: `从 TXT 文件导入（${new Date().toLocaleDateString()}）`,
              words: words
            };
          } else {
            // 解析 JSON 格式
            data = JSON.parse(content);
            const validation = this.validateWordbook(data);
            
            if (!validation.valid) {
              reject(validation.error);
              return;
            }
          }
          
          // 创建单词本对象
          const wordbook = {
            id: Date.now(), // 使用时间戳作为唯一 ID
            name: data.name,
            description: data.description || '',
            words: data.words,
            wordCount: data.words.length,
            createdAt: new Date().toISOString()
          };
          
          // 添加到列表
          AppState.customWordbooks.push(wordbook);
          
          // 保存到 LocalStorage
          this.saveWordbooks();
          
          resolve(wordbook);
        } catch (error) {
          if (isTxtFile) {
            reject('TXT 解析失败: ' + error.message);
          } else {
            reject('JSON 解析失败: ' + error.message);
          }
        }
      };
      
      reader.onerror = () => {
        reject('文件读取失败');
      };
      
      reader.readAsText(file);
    });
  },
  
  // 删除单词本
  deleteWordbook(id) {
    const index = AppState.customWordbooks.findIndex(wb => wb.id === id);
    if (index !== -1) {
      const wordbook = AppState.customWordbooks[index];
      if (confirm(`确定要删除单词本"${wordbook.name}"吗？`)) {
        AppState.customWordbooks.splice(index, 1);
        this.saveWordbooks();
        this.renderWordbookCards();
        
        // 同时删除该单词本的学习进度
        localStorage.removeItem(`dimenticato_progress_wb_${id}`);
        
        // 如果删除的是当前选中的单词本，清除选择状态
        if (AppState.selectedSource === id) {
          AppState.selectedSource = null;
          AppState.selectedSourceType = null;
          AppState.currentWordbook = null;
          updateModeButtons();
        }
      }
    }
  },
  
  // 保存单词本列表到 LocalStorage
  saveWordbooks() {
    try {
      localStorage.setItem(Storage.KEYS.CUSTOM_WORDBOOKS, JSON.stringify(AppState.customWordbooks));
    } catch (e) {
      console.error('保存单词本失败:', e);
      alert('保存失败，可能是存储空间不足');
    }
  },
  
  // 开始学习指定单词本
  startLearning(id, mode) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === id);
    if (!wordbook) {
      alert('单词本不存在');
      return;
    }
    
    // 设置当前单词本和单词列表
    AppState.currentWordbook = wordbook;
    AppState.currentWords = wordbook.words.map(w => ({
      ...w,
      rank: 999999 // 自定义单词本没有排名
    }));
    
    // 加载该单词本的学习进度
    this.loadWordbookProgress(id);
    
    // 更新头部统计
    updateHeaderStats();
    
    // 启动对应的学习模式
    if (mode === 'mc') {
      MultipleChoice.start();
    } else if (mode === 'spelling') {
      Spelling.start();
    } else if (mode === 'browse') {
      Browse.start();
    }
  },
  
  // 加载单词本的学习进度
  loadWordbookProgress(id) {
    try {
      const key = `dimenticato_progress_wb_${id}`;
      const progress = localStorage.getItem(key);
      if (progress) {
        const mastered = JSON.parse(progress);
        AppState.masteredWords = new Set(mastered);
      } else {
        AppState.masteredWords = new Set();
      }
    } catch (e) {
      console.error('加载单词本进度失败:', e);
      AppState.masteredWords = new Set();
    }
  },
  
  // 渲染单词本卡片（在欢迎页面）
  renderWordbookCards() {
    const container = document.getElementById('wordbookCards');
    
    if (AppState.customWordbooks.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 1rem;">还没有导入任何单词本</p>';
      return;
    }
    
    container.innerHTML = AppState.customWordbooks.map(wb => `
      <div class="wordbook-card" data-wordbook-id="${wb.id}">
        <button class="wordbook-delete-btn" onclick="event.stopPropagation(); WordbookManager.deleteWordbook(${wb.id})" title="删除">×</button>
        <span class="wordbook-card-icon">📖</span>
        <span class="wordbook-card-name">${wb.name}</span>
        <span class="wordbook-card-count">${wb.wordCount} 词</span>
        <span class="wordbook-card-date">${new Date(wb.createdAt).toLocaleDateString()}</span>
      </div>
    `).join('');
    
    // 绑定点击事件
    container.querySelectorAll('.wordbook-card').forEach(card => {
      card.addEventListener('click', () => {
        const wordbookId = parseInt(card.dataset.wordbookId);
        this.selectWordbook(wordbookId);
      });
    });
  },
  
  // 选择单词本
  selectWordbook(id) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === id);
    if (!wordbook) return;
    
    // 设置选择状态
    AppState.selectedSource = id;
    AppState.selectedSourceType = 'custom';
    AppState.currentWordbook = wordbook;
    
    // 设置当前单词列表
    AppState.currentWords = wordbook.words.map(w => ({
      ...w,
      rank: 999999
    }));
    
    // 加载该单词本的学习进度
    this.loadWordbookProgress(id);
    
    // 更新UI
    updateHeaderStats();
    highlightSelectedLevel();
  },
  
  // 渲染单词本列表（旧的，保留作为备份）
  renderWordbookList() {
    const container = document.getElementById('wordbookList');
    
    if (AppState.customWordbooks.length === 0) {
      container.innerHTML = `
        <div class="wordbook-empty">
          <div class="wordbook-empty-icon">📚</div>
          <p>还没有导入任何单词本</p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">点击上方按钮导入 JSON 文件</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = AppState.customWordbooks.map(wb => `
      <div class="wordbook-item">
        <div class="wordbook-info">
          <div class="wordbook-name">${wb.name}</div>
          ${wb.description ? `<div class="wordbook-description">${wb.description}</div>` : ''}
          <div class="wordbook-meta">
            <span>📝 ${wb.wordCount} 个单词</span>
            <span>📅 ${new Date(wb.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="wordbook-actions">
          <button class="wordbook-action-btn learn" onclick="WordbookManager.showModeSelection(${wb.id})">
            开始学习
          </button>
          <button class="wordbook-action-btn delete" onclick="WordbookManager.deleteWordbook(${wb.id})">
            删除
          </button>
        </div>
      </div>
    `).join('');
  },
  
  // 显示模式选择对话框
  showModeSelection(id) {
    const wordbook = AppState.customWordbooks.find(wb => wb.id === id);
    if (!wordbook) return;
    
    const mode = prompt(
      `请选择学习模式：\n\n` +
      `1 - 选择题模式（看意大利语选英语翻译）\n` +
      `2 - 拼写模式（看英语拼写意大利语）\n` +
      `3 - 浏览模式（查看所有单词）\n\n` +
      `请输入 1、2 或 3：`
    );
    
    if (mode === '1') {
      this.startLearning(id, 'mc');
    } else if (mode === '2') {
      this.startLearning(id, 'spelling');
    } else if (mode === '3') {
      this.startLearning(id, 'browse');
    }
  },
  
  // 显示单词本管理页面
  showManagementScreen() {
    showScreen('wordbookScreen');
    this.renderWordbookList();
  }
};

// ==================== 统计弹窗 ====================

function showStatsModal() {
  const totalAttempts = AppState.stats.mcAttempts + AppState.stats.spAttempts;
  const totalCorrect = AppState.stats.mcCorrect + AppState.stats.spCorrect;
  const overallAccuracy = totalAttempts > 0 
    ? Math.round((totalCorrect / totalAttempts) * 100) 
    : 0;
  
  const masteredCount = [...AppState.masteredWords].filter(word => 
    AppState.currentWords.some(w => w.italian === word)
  ).length;
  
  const progress = AppState.currentWords.length > 0 
    ? Math.round((masteredCount / AppState.currentWords.length) * 100) 
    : 0;
  
  document.getElementById('statTotalLearned').textContent = AppState.masteredWords.size;
  document.getElementById('statMastered').textContent = masteredCount;
  document.getElementById('statProgress').textContent = progress + '%';
  document.getElementById('statMCAttempts').textContent = AppState.stats.mcAttempts;
  document.getElementById('statSpAttempts').textContent = AppState.stats.spAttempts;
  document.getElementById('statAccuracy').textContent = overallAccuracy + '%';
  
  document.getElementById('statsModal').classList.remove('hidden');
}

function hideStatsModal() {
  document.getElementById('statsModal').classList.add('hidden');
}

// ==================== 工具函数 ====================

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ==================== 事件绑定 ====================

function bindEvents() {
  // 系统词汇级别选择
  document.querySelectorAll('.vocab-source-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const level = btn.dataset.level;
      AppState.selectedLevel = level === 'all' ? 'all' : parseInt(level);
      AppState.selectedSource = 'system';
      AppState.selectedSourceType = 'system';
      AppState.currentWordbook = null;
      
      // 更新当前词汇列表
      updateCurrentWords();
      
      // 重新加载系统词汇的进度（不覆盖 selectedLevel）
      const mastered = localStorage.getItem(Storage.KEYS.MASTERED);
      if (mastered) {
        AppState.masteredWords = new Set(JSON.parse(mastered));
      } else {
        AppState.masteredWords = new Set();
      }
      
      // 更新UI
      updateHeaderStats();
      highlightSelectedLevel();
      
      // 保存选择的级别
      localStorage.setItem(Storage.KEYS.LEVEL, AppState.selectedLevel.toString());
    });
  });
  
  // 模式选择
  document.getElementById('multipleChoiceBtn').addEventListener('click', () => {
    MultipleChoice.start();
  });
  
  document.getElementById('spellingBtn').addEventListener('click', () => {
    Spelling.start();
  });
  
  document.getElementById('browseBtn').addEventListener('click', () => {
    Browse.start();
  });
  
  // 自定义单词本导入
  document.getElementById('importWordbookBtn').addEventListener('click', () => {
    document.getElementById('wordbookFileInput').click();
  });
  
  document.getElementById('wordbookFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const wordbook = await WordbookManager.importFromFile(file);
      alert(`✅ 成功导入单词本"${wordbook.name}"！\n包含 ${wordbook.wordCount} 个单词。`);
      WordbookManager.renderWordbookCards();
    } catch (error) {
      alert(`❌ 导入失败：${error}`);
    }
    
    // 清空文件输入
    e.target.value = '';
  });
  
  // 选择题模式
  document.getElementById('mcBackBtn').addEventListener('click', () => {
    // 返回欢迎页面前，重置当前单词本状态
    AppState.currentWordbook = null;
    // 重新加载系统词汇进度
    Storage.load();
    updateCurrentWords();
    updateHeaderStats();
    showScreen('welcomeScreen');
  });
  
  document.getElementById('mcNextBtn').addEventListener('click', () => {
    MultipleChoice.nextQuestion();
  });
  
  // 拼写模式
  document.getElementById('spBackBtn').addEventListener('click', () => {
    // 返回欢迎页面前，重置当前单词本状态
    AppState.currentWordbook = null;
    // 重新加载系统词汇进度
    Storage.load();
    updateCurrentWords();
    updateHeaderStats();
    showScreen('welcomeScreen');
  });
  
  document.getElementById('spCheckBtn').addEventListener('click', () => {
    Spelling.checkAnswer();
  });
  
  document.getElementById('spInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      Spelling.checkAnswer();
    }
  });
  
  document.getElementById('spNextBtn').addEventListener('click', () => {
    Spelling.nextQuestion();
  });
  
  // 浏览模式
  document.getElementById('brBackBtn').addEventListener('click', () => {
    // 返回欢迎页面前，重置当前单词本状态
    AppState.currentWordbook = null;
    // 重新加载系统词汇进度
    Storage.load();
    updateCurrentWords();
    updateHeaderStats();
    showScreen('welcomeScreen');
  });
  
  document.getElementById('searchInput').addEventListener('input', (e) => {
    Browse.render(e.target.value);
  });
  
  document.getElementById('filterBtn').addEventListener('click', () => {
    Browse.toggleFilter();
  });
  
  // 底部工具栏
  document.getElementById('resetBtn').addEventListener('click', () => {
    Storage.reset();
  });
  
  document.getElementById('statsBtn').addEventListener('click', () => {
    showStatsModal();
  });
  
  document.getElementById('themeBtn').addEventListener('click', () => {
    Storage.toggleTheme();
  });
  
  document.getElementById('helpBtn').addEventListener('click', () => {
    document.getElementById('helpModal').classList.remove('hidden');
  });

  // 关闭帮助弹窗
  document.getElementById('closeHelpBtn').addEventListener('click', () => {
    document.getElementById('helpModal').classList.add('hidden');
  });

  // 点击背景关闭帮助弹窗
  document.getElementById('helpModal').addEventListener('click', (e) => {
    if (e.target.id === 'helpModal') {
      document.getElementById('helpModal').classList.add('hidden');
    }
  });
  
  // 统计弹窗
  document.getElementById('closeStatsBtn').addEventListener('click', () => {
    hideStatsModal();
  });
  
  // 点击弹窗外部关闭
  document.getElementById('statsModal').addEventListener('click', (e) => {
    if (e.target.id === 'statsModal') {
      hideStatsModal();
    }
  });
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  loadVocabulary();
  
  // 渲染自定义单词本卡片
  WordbookManager.renderWordbookCards();
});
