/**
 * Dimenticato - 意大利语背单词应用
 * 主应用逻辑
 */

// ==================== Web Speech API 发音功能 ====================

class ItalianSpeaker {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.initVoice();
  }
  
  initVoice() {
    // 获取可用的语音
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // 优先选择意大利语语音
      this.voice = voices.find(v => v.lang.startsWith('it')) || voices[0];
    };
    
    // 有些浏览器需要异步加载语音列表
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }
  
  speak(text, autoplay = false) {
    if (!text) return;
    
    // 取消之前的朗读
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';
    utterance.rate = 0.9; // 稍慢一点，便于学习
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    this.synth.speak(utterance);
  }
  
  stop() {
    this.synth.cancel();
  }
}

// 创建全局 speaker 实例
const italianSpeaker = new ItalianSpeaker();

function renderIcon(name) {
  return `<svg class="icon"><use href="#${name}"></use></svg>`;
}

window.renderIcon = renderIcon;

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
  practiceContext: 'vocab', // 'vocab' | 'conjugation'
  activeModule: 'home',
  currentScreen: 'welcomeScreen',
  previousScreen: 'welcomeScreen',
  selectedGrammarTopic: 'conjugation',
  navigationStack: ['welcomeScreen'],
  
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

const ScreenMeta = {
  welcomeScreen: {
    module: 'home',
    topNav: 'welcomeScreen',
    breadcrumb: ['Home']
  },
  vocabularyScreen: {
    module: 'vocabulary',
    topNav: 'vocabularyScreen',
    breadcrumb: ['Vocabulary', '内容来源']
  },
  vocabularyModesScreen: {
    module: 'vocabulary',
    topNav: 'vocabularyScreen',
    breadcrumb: ['Vocabulary', '练习方式']
  },
  multipleChoiceScreen: {
    module: 'vocabulary',
    topNav: 'vocabularyScreen',
    breadcrumb: ['Vocabulary', '练习中', '选择题']
  },
  spellingScreen: {
    module: 'vocabulary',
    topNav: 'vocabularyScreen',
    breadcrumb: ['Vocabulary', '练习中', '拼写']
  },
  browseScreen: {
    module: 'vocabulary',
    topNav: 'vocabularyScreen',
    breadcrumb: ['Vocabulary', '练习中', '浏览']
  },
  communityBrowseScreen: {
    module: 'vocabulary',
    topNav: 'vocabularyScreen',
    breadcrumb: ['Vocabulary', '社区词本']
  },
  grammarScreen: {
    module: 'grammar',
    topNav: 'grammarScreen',
    breadcrumb: ['Grammar', '主题选择']
  },
  conjugationSetupScreen: {
    module: 'grammar',
    topNav: 'grammarScreen',
    breadcrumb: ['Grammar', '动词变位', '设置']
  },
  conjugationScreen: {
    module: 'grammar',
    topNav: 'grammarScreen',
    breadcrumb: ['Grammar', '动词变位', '练习中']
  },
  progressScreen: {
    module: 'progress',
    topNav: 'progressScreen',
    breadcrumb: ['Progress']
  },
  settingsScreen: {
    module: 'settings',
    topNav: 'settingsScreen',
    breadcrumb: ['Settings & Data']
  }
};

// ==================== 本地存储 ====================

const Storage = {
  KEYS: {
    MASTERED: 'dimenticato_mastered',
    STATS: 'dimenticato_stats',
    LEVEL: 'dimenticato_level',
    THEME: 'dimenticato_theme',
    CUSTOM_WORDBOOKS: 'dimenticato_custom_wordbooks',
    DAILY_STATS: 'dimenticato_daily_stats'
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
  },
  
  // 导出所有学习数据
  exportAllData() {
    try {
      // 收集所有 localStorage 数据
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        exportedFrom: 'Dimenticato',
        data: {
          // 系统词汇学习进度
          masteredWords: localStorage.getItem(this.KEYS.MASTERED) || '[]',
          stats: localStorage.getItem(this.KEYS.STATS) || '{}',
          level: localStorage.getItem(this.KEYS.LEVEL) || '1000',
          theme: localStorage.getItem(this.KEYS.THEME) || 'light',
          
          // 自定义单词本
          customWordbooks: localStorage.getItem(this.KEYS.CUSTOM_WORDBOOKS) || '[]',
          
          // 每日统计
          dailyStats: localStorage.getItem(this.KEYS.DAILY_STATS) || '{}',
          
          // 每个单词本的学习进度
          wordbookProgress: {}
        }
      };
      
      // 收集所有单词本的进度
      const customWordbooks = JSON.parse(exportData.data.customWordbooks);
      customWordbooks.forEach(wb => {
        const progressKey = `dimenticato_progress_wb_${wb.id}`;
        const progress = localStorage.getItem(progressKey);
        if (progress) {
          exportData.data.wordbookProgress[wb.id] = progress;
        }
      });
      
      // 转换为 JSON 字符串
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // 创建 Blob 并下载
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // 生成文件名（包含日期时间）
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      a.download = `Dimenticato_学习数据_${dateStr}_${timeStr}.json`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('✅ 学习数据导出成功！\n\n文件已保存，请妥善保管。');
      
    } catch (e) {
      console.error('导出数据失败:', e);
      alert('❌ 导出失败: ' + e.message);
    }
  },
  
  // 导入学习数据
  importAllData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const importData = JSON.parse(content);
          
          // 验证数据格式
          if (!importData.version || !importData.data) {
            reject('无效的数据文件格式');
            return;
          }
          
          // 显示导入预览
          const customWordbooks = JSON.parse(importData.data.customWordbooks || '[]');
          const masteredWords = JSON.parse(importData.data.masteredWords || '[]');
          const stats = JSON.parse(importData.data.stats || '{}');
          
          const confirmMsg = 
            `📥 即将导入学习数据\n\n` +
            `导出日期: ${new Date(importData.exportDate).toLocaleString()}\n` +
            `系统词汇已掌握: ${masteredWords.length} 个\n` +
            `自定义单词本: ${customWordbooks.length} 个\n` +
            `练习次数: ${(stats.mcAttempts || 0) + (stats.spAttempts || 0)} 次\n\n` +
            `选择导入模式：\n` +
            `1 - 覆盖模式（清空现有数据，用导入数据替换）\n` +
            `2 - 合并模式（保留现有数据，合并导入数据）\n` +
            `0 - 取消\n\n` +
            `请输入 0、1 或 2：`;
          
          const mode = prompt(confirmMsg);
          
          if (mode === '0' || mode === null) {
            reject('用户取消导入');
            return;
          }
          
          if (mode === '1') {
            // 覆盖模式：清空所有数据
            this.importWithOverwrite(importData);
            resolve('overwrite');
          } else if (mode === '2') {
            // 合并模式：合并数据
            this.importWithMerge(importData);
            resolve('merge');
          } else {
            reject('无效的选择');
            return;
          }
          
        } catch (error) {
          reject('JSON 解析失败: ' + error.message);
        }
      };
      
      reader.onerror = () => {
        reject('文件读取失败');
      };
      
      reader.readAsText(file);
    });
  },
  
  // 覆盖模式导入
  importWithOverwrite(importData) {
    try {
      const data = importData.data;
      
      // 清空所有相关数据
      this.clearAllData();
      
      // 导入基本数据
      localStorage.setItem(this.KEYS.MASTERED, data.masteredWords);
      localStorage.setItem(this.KEYS.STATS, data.stats);
      localStorage.setItem(this.KEYS.LEVEL, data.level);
      localStorage.setItem(this.KEYS.THEME, data.theme);
      localStorage.setItem(this.KEYS.CUSTOM_WORDBOOKS, data.customWordbooks);
      localStorage.setItem(this.KEYS.DAILY_STATS, data.dailyStats);
      
      // 导入单词本进度
      if (data.wordbookProgress) {
        Object.keys(data.wordbookProgress).forEach(wbId => {
          localStorage.setItem(`dimenticato_progress_wb_${wbId}`, data.wordbookProgress[wbId]);
        });
      }
      
      // 应用主题
      document.body.setAttribute('data-theme', data.theme);
      
      // 重新加载数据
      this.load();
      AppState.customWordbooks = JSON.parse(data.customWordbooks);
      
      // 刷新UI
      updateHeaderStats();
      WordbookManager.renderWordbookCards();
      highlightSelectedLevel();
      
      alert('✅ 数据导入成功（覆盖模式）！\n\n页面将刷新以应用新数据。');
      setTimeout(() => location.reload(), 1000);
      
    } catch (e) {
      console.error('导入数据失败:', e);
      alert('❌ 导入失败: ' + e.message);
    }
  },
  
  // 合并模式导入
  importWithMerge(importData) {
    try {
      const data = importData.data;
      
      // 合并已掌握的单词
      const currentMastered = new Set(JSON.parse(localStorage.getItem(this.KEYS.MASTERED) || '[]'));
      const importMastered = JSON.parse(data.masteredWords);
      importMastered.forEach(word => currentMastered.add(word));
      localStorage.setItem(this.KEYS.MASTERED, JSON.stringify([...currentMastered]));
      
      // 合并统计数据
      const currentStats = JSON.parse(localStorage.getItem(this.KEYS.STATS) || '{}');
      const importStats = JSON.parse(data.stats);
      const mergedStats = {
        mcAttempts: (currentStats.mcAttempts || 0) + (importStats.mcAttempts || 0),
        mcCorrect: (currentStats.mcCorrect || 0) + (importStats.mcCorrect || 0),
        spAttempts: (currentStats.spAttempts || 0) + (importStats.spAttempts || 0),
        spCorrect: (currentStats.spCorrect || 0) + (importStats.spCorrect || 0),
        totalLearned: Math.max(currentStats.totalLearned || 0, importStats.totalLearned || 0)
      };
      localStorage.setItem(this.KEYS.STATS, JSON.stringify(mergedStats));
      
      // 合并每日统计
      const currentDailyStats = JSON.parse(localStorage.getItem(this.KEYS.DAILY_STATS) || '{}');
      const importDailyStats = JSON.parse(data.dailyStats);
      Object.keys(importDailyStats).forEach(date => {
        if (!currentDailyStats[date]) {
          currentDailyStats[date] = importDailyStats[date];
        }
      });
      localStorage.setItem(this.KEYS.DAILY_STATS, JSON.stringify(currentDailyStats));
      
      // 合并自定义单词本（避免重复）
      const currentWordbooks = JSON.parse(localStorage.getItem(this.KEYS.CUSTOM_WORDBOOKS) || '[]');
      const importWordbooks = JSON.parse(data.customWordbooks);
      const existingIds = new Set(currentWordbooks.map(wb => wb.id));
      
      importWordbooks.forEach(wb => {
        if (!existingIds.has(wb.id)) {
          currentWordbooks.push(wb);
          // 导入该单词本的进度
          if (data.wordbookProgress && data.wordbookProgress[wb.id]) {
            localStorage.setItem(`dimenticato_progress_wb_${wb.id}`, data.wordbookProgress[wb.id]);
          }
        }
      });
      localStorage.setItem(this.KEYS.CUSTOM_WORDBOOKS, JSON.stringify(currentWordbooks));
      
      // 重新加载数据
      this.load();
      AppState.customWordbooks = currentWordbooks;
      
      // 刷新UI
      updateHeaderStats();
      WordbookManager.renderWordbookCards();
      
      alert('✅ 数据导入成功（合并模式）！\n\n已合并单词进度和统计数据。');
      
    } catch (e) {
      console.error('导入数据失败:', e);
      alert('❌ 导入失败: ' + e.message);
    }
  },
  
  // 清空所有数据（用于覆盖模式）
  clearAllData() {
    // 获取所有单词本的进度 key
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('dimenticato_')) {
        localStorage.removeItem(key);
      }
    });
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

function getVocabularySelectionLabel() {
  if (AppState.selectedSourceType === 'system') {
    const levelLabel = AppState.selectedLevel === 'all'
      ? '全部词汇'
      : `系统词汇 ${AppState.selectedLevel.toLocaleString()} 词`;
    return {
      title: '系统词汇库',
      detail: levelLabel
    };
  }

  if (AppState.selectedSourceType === 'custom' && AppState.currentWordbook) {
    return {
      title: '我的词本',
      detail: `${AppState.currentWordbook.name} · ${AppState.currentWordbook.wordCount} 词`
    };
  }

  return {
    title: '未选择来源',
    detail: '请先在上一层选择一个词汇来源'
  };
}

function updateVocabularySummary() {
  const summary = document.getElementById('vocabularySelectionSummary');
  const flowSummary = document.getElementById('vocabularyFlowSummary');
  if (!summary || !flowSummary) return;

  const selection = getVocabularySelectionLabel();
  summary.innerHTML = `
    <div class="selection-summary-item">
      <span class="selection-summary-label">当前来源</span>
      <strong>${selection.title}</strong>
    </div>
    <div class="selection-summary-item">
      <span class="selection-summary-label">当前选择</span>
      <span>${selection.detail}</span>
    </div>
    <div class="selection-summary-item">
      <span class="selection-summary-label">下一步</span>
      <span>选择题 / 拼写 / 浏览</span>
    </div>
  `;

  flowSummary.textContent = AppState.selectedSourceType ? `${selection.title} · ${selection.detail}` : '请选择词汇来源';
}

function updateProgressScreenStats() {
  const totalWords = AppState.currentWords.length;
  const masteredCount = [...AppState.masteredWords].filter(word =>
    AppState.currentWords.some(w => w.italian === word)
  ).length;
  const progress = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  const totalEl = document.getElementById('progressCurrentTotalWords');
  const masteredEl = document.getElementById('progressCurrentMasteredWords');
  const progressEl = document.getElementById('progressCurrentPercent');

  if (totalEl) totalEl.textContent = totalWords.toLocaleString();
  if (masteredEl) masteredEl.textContent = masteredCount.toLocaleString();
  if (progressEl) progressEl.textContent = progress + '%';
}

function updateHeaderNavigation(screenId) {
  const meta = ScreenMeta[screenId] || ScreenMeta.welcomeScreen;
  AppState.activeModule = meta.module;

  document.querySelectorAll('.top-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === meta.topNav);
  });

  const breadcrumb = document.getElementById('breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML = meta.breadcrumb
      .map((item, index) => `<span class="breadcrumb-item ${index === meta.breadcrumb.length - 1 ? 'current' : ''}">${item}</span>`)
      .join('<span class="breadcrumb-separator">/</span>');
  }
}

function setPracticeContext(context = 'vocab') {
  AppState.practiceContext = context;
  const moduleSection = document.getElementById('conjModuleSection');

  if (moduleSection) {
    moduleSection.classList.toggle('conj-context-active', context === 'conjugation');
  }
}

window.setPracticeContext = setPracticeContext;

function showScreen(screenId, options = {}) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');

  AppState.previousScreen = AppState.currentScreen;
  AppState.currentScreen = screenId;

  if (!options.skipHistory) {
    AppState.navigationStack.push(screenId);
  }

  updateHeaderNavigation(screenId);

  if (screenId === 'vocabularyModesScreen') {
    updateVocabularySummary();
  }

  if (screenId === 'progressScreen') {
    updateProgressScreenStats();
  }
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
    
    // 自动朗读意大利语单词
    setTimeout(() => {
      italianSpeaker.speak(AppState.currentWord.italian, true);
    }, 300); // 稍微延迟一下，让界面先更新
    
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
      notesContainer.innerHTML = `<strong>${renderIcon('icon-pen')} 笔记：</strong>${AppState.currentWord.notes}`;
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
      feedbackText.textContent = '回答正确';
      feedback.classList.remove('incorrect');
      feedback.classList.add('correct');
      // 答对时，1秒后自动跳转下一题
      setTimeout(() => this.nextQuestion(), 1000);
    } else {
      feedbackText.textContent = `回答有误，正确答案是：${correctAnswer}`;
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
  
  showHint() {
    // 显示中文提示，隐藏按钮
    const chineseHint = document.getElementById('mcChineseHint');
    const showHintBtn = document.getElementById('mcShowHintBtn');
    
    chineseHint.classList.remove('hidden');
    showHintBtn.classList.add('hidden');
  },
  
  showCompletion() {
    const accuracy = Math.round((AppState.quizCorrect / AppState.quizTotal) * 100);
    alert(`练习完成\n\n正确: ${AppState.quizCorrect}/${AppState.quizTotal}\n正确率: ${accuracy}%`);
    showScreen('vocabularyModesScreen');
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
      feedbackText.textContent = '回答正确';
      feedback.classList.remove('incorrect');
      feedback.classList.add('correct');
      // 答对时，1秒后自动跳转下一题
      setTimeout(() => this.nextQuestion(), 1000);
    } else {
      feedbackText.textContent = `回答有误，正确答案是：${AppState.currentWord.italian}`;
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
      notesContainer.innerHTML = `<strong>${renderIcon('icon-pen')} 笔记：</strong>${AppState.currentWord.notes}`;
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
    alert(`练习完成\n\n正确: ${AppState.quizCorrect}/${AppState.quizTotal}\n正确率: ${accuracy}%`);
    showScreen('vocabularyModesScreen');
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
        <div class="word-item ${isMastered ? 'mastered' : ''}" data-italian="${word.italian}">
          <div class="word-item-left">
            <div class="word-italian">${renderIcon('icon-volume')} ${word.italian}</div>
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
    
    // 为每个单词项添加点击朗读功能
    container.querySelectorAll('.word-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const italian = item.dataset.italian;
        if (italian) {
          italianSpeaker.speak(italian);
        }
      });
    });
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
  
  // 在 VOCABULARY_DATA 中查找意大利语单词
  lookupWord(italian) {
    if (typeof VOCABULARY_DATA === 'undefined') {
      return null;
    }
    
    const normalizedItalian = italian.toLowerCase().trim();
    return VOCABULARY_DATA.find(w => w.italian.toLowerCase() === normalizedItalian);
  },
  
  // 解析 TXT 格式单词本（支持灵活格式 + 自动查找）
  parseTxtWordbook(text) {
    // 移除文件开头的空行
    text = text.trim();
    
    // 按双换行符（空行）分割成单词块
    const blocks = text.split(/\n\s*\n+/);
    
    const words = [];
    let autoMatchedCount = 0;
    let needManualCount = 0;
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i].trim();
      if (!block) continue;
      
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length === 0) continue;
      
      let word = {
        italian: '',
        english: '',
        chinese: '',
        notes: ''
      };
      
      // 检测格式：1行=仅意大利语，2-4行=完整格式
      if (lines.length === 1) {
        // 仅意大利语，需要自动查找
        word.italian = lines[0];
        
        // 在 VOCABULARY_DATA 中查找
        const found = this.lookupWord(word.italian);
        if (found) {
          word.english = found.english || '';
          word.chinese = found.chinese || '';
          autoMatchedCount++;
        } else {
          // 未找到，留空英语和中文
          word.english = '';
          word.chinese = '';
          needManualCount++;
        }
      } else if (lines.length >= 2) {
        // 完整格式：意大利语、英语、中文（可选）、notes（可选）
        word.italian = lines[0];
        word.english = lines[1];
        
        if (lines.length >= 3) {
          word.chinese = lines[2];
        }
        
        if (lines.length >= 4) {
          word.notes = lines[3];
        }
        
        // 如果英语为空，尝试自动查找
        if (!word.english) {
          const found = this.lookupWord(word.italian);
          if (found) {
            word.english = found.english || '';
            if (!word.chinese) {
              word.chinese = found.chinese || '';
            }
            autoMatchedCount++;
          } else {
            needManualCount++;
          }
        }
      }
      
      // 验证必填字段（意大利语必须存在）
      if (!word.italian) {
        throw new Error(`第 ${i + 1} 个单词块缺少意大利语单词`);
      }
      
      words.push(word);
    }
    
    if (words.length === 0) {
      throw new Error('文件中没有找到有效的单词');
    }
    
    return { words, autoMatchedCount, needManualCount };
  },
  
  // 导入单词本（支持智能导入 + 重复检测）
  importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const isTxtFile = file.name.toLowerCase().endsWith('.txt');
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let data;
          let importStats = {
            autoMatchedCount: 0,
            needManualCount: 0,
            duplicatesSkipped: 0,
            totalImported: 0
          };
          
          if (isTxtFile) {
            // 解析 TXT 格式（新格式支持自动查找）
            const parseResult = this.parseTxtWordbook(content);
            const words = parseResult.words;
            importStats.autoMatchedCount = parseResult.autoMatchedCount;
            importStats.needManualCount = parseResult.needManualCount;
            
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
          
          // 检查是否存在同名单词本（用于重复检测）
          const existingWordbook = AppState.customWordbooks.find(wb => wb.name === data.name);
          let existingWords = new Set();
          
          if (existingWordbook) {
            // 如果存在同名单词本，提供三个选项
            const action = prompt(
              `已存在同名单词本"${data.name}"（${existingWordbook.wordCount} 词）。\n\n` +
              `请选择操作：\n` +
              `1 - 批量添加到现有单词本（跳过重复，保留原有单词）\n` +
              `2 - 创建新单词本（添加时间戳后缀）\n` +
              `0 - 取消导入\n\n` +
              `请输入 0、1 或 2：`
            );
            
            if (action === '0' || action === null) {
              reject('用户取消导入');
              return;
            } else if (action === '1') {
              // 批量添加模式：收集现有单词（大小写不敏感）
              existingWordbook.words.forEach(w => {
                existingWords.add(w.italian.toLowerCase().trim());
              });
            } else if (action === '2') {
              // 创建新单词本模式：不收集现有单词，后面会创建新单词本并添加时间戳
              existingWordbook = null;
            } else {
              reject('无效的选择');
              return;
            }
          }
          
          // 去重处理
          const wordsToImport = [];
          const notFoundWords = []; // 需要手动编辑的单词（英语或中文为空）
          const foundWords = []; // 已找到翻译的单词
          
          data.words.forEach(word => {
            const normalizedItalian = word.italian.toLowerCase().trim();
            
            // 检查重复
            if (existingWords.has(normalizedItalian)) {
              importStats.duplicatesSkipped++;
              return;
            }
            
            existingWords.add(normalizedItalian);
            
            // 分类：需要手动编辑 vs 已完整
            if (!word.english || !word.chinese) {
              notFoundWords.push(word);
            } else {
              foundWords.push(word);
            }
          });
          
          // 排序：需要手动编辑的单词放在最前面
          wordsToImport.push(...notFoundWords, ...foundWords);
          importStats.totalImported = wordsToImport.length;
          
          if (wordsToImport.length === 0) {
            reject('所有单词都已存在，没有新单词需要导入');
            return;
          }
          
          // 创建或更新单词本
          if (existingWordbook && existingWords.size > 0) {
            // 合并到现有单词本
            existingWordbook.words = [...existingWordbook.words, ...wordsToImport];
            existingWordbook.wordCount = existingWordbook.words.length;
            this.saveWordbooks();
            
            resolve({
              wordbook: existingWordbook,
              stats: importStats,
              isMerge: true
            });
          } else {
            // 创建新单词本
            const wordbook = {
              id: Date.now(),
              name: data.name,
              description: data.description || '',
              words: wordsToImport,
              wordCount: wordsToImport.length,
              createdAt: new Date().toISOString()
            };
            
            AppState.customWordbooks.push(wordbook);
            this.saveWordbooks();
            
            resolve({
              wordbook: wordbook,
              stats: importStats,
              isMerge: false
            });
          }
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
        <span class="wordbook-card-icon">${renderIcon('icon-book-open')}</span>
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
    setPracticeContext('vocab');
    updateVocabularySummary();
  },
  
  // 渲染单词本列表（旧的，保留作为备份）
  renderWordbookList() {
    const container = document.getElementById('wordbookList');
    
    if (AppState.customWordbooks.length === 0) {
      container.innerHTML = `
        <div class="wordbook-empty">
          <div class="wordbook-empty-icon">${renderIcon('icon-library')}</div>
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
            <span>${renderIcon('icon-pen')} ${wb.wordCount} 个单词</span>
            <span>${renderIcon('icon-calendar')} ${new Date(wb.createdAt).toLocaleDateString()}</span>
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
  document.querySelectorAll('.top-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.target);
    });
  });

  document.getElementById('goVocabularyBtn')?.addEventListener('click', () => showScreen('vocabularyScreen'));
  document.getElementById('goGrammarBtn')?.addEventListener('click', () => showScreen('grammarScreen'));
  document.getElementById('goProgressBtn')?.addEventListener('click', () => showScreen('progressScreen'));
  document.getElementById('goSettingsBtn')?.addEventListener('click', () => showScreen('settingsScreen'));
  document.getElementById('goConjugationSetupBtn')?.addEventListener('click', () => showScreen('conjugationSetupScreen'));
  document.getElementById('browseCommunityBtn')?.addEventListener('click', () => CommunityWordbooks.showBrowseScreen());
  document.getElementById('openProgressStatsBtn')?.addEventListener('click', () => {
    if (typeof showEnhancedStatsModal !== 'undefined') showEnhancedStatsModal();
  });

  document.getElementById('vocabularyBackBtn')?.addEventListener('click', () => showScreen('welcomeScreen'));
  document.getElementById('vocabularyModesBackBtn')?.addEventListener('click', () => showScreen('vocabularyScreen'));
  document.getElementById('grammarBackBtn')?.addEventListener('click', () => showScreen('welcomeScreen'));
  document.getElementById('conjugationSetupBackBtn')?.addEventListener('click', () => showScreen('grammarScreen'));
  document.getElementById('progressBackBtn')?.addEventListener('click', () => showScreen('welcomeScreen'));
  document.getElementById('settingsBackBtn')?.addEventListener('click', () => showScreen('welcomeScreen'));

  document.getElementById('settingsExportBtn')?.addEventListener('click', () => Storage.exportAllData());
  document.getElementById('settingsImportBtn')?.addEventListener('click', () => document.getElementById('importDataFileInput').click());
  document.getElementById('settingsThemeBtn')?.addEventListener('click', () => Storage.toggleTheme());
  document.getElementById('settingsHelpBtn')?.addEventListener('click', () => document.getElementById('helpModal').classList.remove('hidden'));
  document.getElementById('settingsCommunityUploadBtn')?.addEventListener('click', () => CommunityWordbooks.showUploadDialog());
  document.getElementById('settingsResetBtn')?.addEventListener('click', () => Storage.reset());

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
      setPracticeContext('vocab');
      updateVocabularySummary();
      
      // 保存选择的级别
      localStorage.setItem(Storage.KEYS.LEVEL, AppState.selectedLevel.toString());

      showScreen('vocabularyModesScreen');
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
  
  // 创建新单词本（仅当 WordbookEditor 可用时）
  document.getElementById('createWordbookBtn').addEventListener('click', () => {
    if (typeof WordbookEditor !== 'undefined') {
      const wordbook = WordbookEditor.createNewWordbook();
      if (wordbook) {
        alert(`已成功创建单词本"${wordbook.name}"。\n点击单词本卡片右上角的设置按钮可以添加单词。`);
      }
    } else {
      alert('单词本编辑功能未加载，请刷新页面重试。');
    }
  });
  
  document.getElementById('wordbookFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const result = await WordbookManager.importFromFile(file);
      const { wordbook, stats, isMerge } = result;
      
      // 构建详细的导入报告
      let message = isMerge 
        ? `✅ 成功合并到单词本"${wordbook.name}"！\n\n`
        : `✅ 成功导入单词本"${wordbook.name}"！\n\n`;
      
      message += `导入统计：\n`;
      message += `• 总计导入：${stats.totalImported} 个单词\n`;
      
      if (stats.autoMatchedCount > 0) {
        message += `• 自动匹配：${stats.autoMatchedCount} 个\n`;
      }
      
      if (stats.needManualCount > 0) {
        message += `• 需手动编辑：${stats.needManualCount} 个（已放在最前面）\n`;
      }
      
      if (stats.duplicatesSkipped > 0) {
        message += `• 跳过重复：${stats.duplicatesSkipped} 个\n`;
      }
      
      message += `\n单词本总数：${wordbook.wordCount} 个单词`;
      
      if (stats.needManualCount > 0) {
        message += `\n\n提示：点击单词本卡片右上角的设置按钮可补充缺失翻译`;
      }
      
      alert(message);
      WordbookManager.renderWordbookCards();
    } catch (error) {
      alert(`导入失败：${error}`);
    }
    
    // 清空文件输入
    e.target.value = '';
  });
  
  // 选择题模式
  document.getElementById('mcBackBtn').addEventListener('click', () => {
    showScreen('vocabularyModesScreen');
  });
  
  document.getElementById('mcNextBtn').addEventListener('click', () => {
    MultipleChoice.nextQuestion();
  });
  
  // 拼写模式
  document.getElementById('spBackBtn').addEventListener('click', () => {
    showScreen('vocabularyModesScreen');
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
  
  // 拼写模式发音按钮
  document.getElementById('spPronunciationBtn').addEventListener('click', () => {
    if (AppState.currentWord && AppState.currentWord.italian) {
      italianSpeaker.speak(AppState.currentWord.italian);
    }
  });
  
  // 浏览模式
  document.getElementById('brBackBtn').addEventListener('click', () => {
    showScreen('vocabularyModesScreen');
  });
  
  document.getElementById('searchInput').addEventListener('input', (e) => {
    Browse.render(e.target.value);
  });
  
  document.getElementById('filterBtn').addEventListener('click', () => {
    Browse.toggleFilter();
  });
  
  // 底部工具栏
  document.getElementById('exportDataBtn').addEventListener('click', () => {
    Storage.exportAllData();
  });
  
  document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importDataFileInput').click();
  });
  
  document.getElementById('importDataFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      await Storage.importAllData(file);
    } catch (error) {
      if (error !== '用户取消导入') {
        alert(`导入失败：${error}`);
      }
    }
    
    // 清空文件输入
    e.target.value = '';
  });
  
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
  
  // 统计弹窗 - 使用增强版本（如果可用）
  document.getElementById('statsBtn').removeEventListener('click', showStatsModal);
  document.getElementById('statsBtn').addEventListener('click', () => {
    if (typeof showEnhancedStatsModal !== 'undefined') {
      showEnhancedStatsModal();
    } else {
      showStatsModal();
    }
  });
  
  document.getElementById('closeStatsBtn').addEventListener('click', () => {
    hideStatsModal();
  });
  
  // 点击弹窗外部关闭
  document.getElementById('statsModal').addEventListener('click', (e) => {
    if (e.target.id === 'statsModal') {
      hideStatsModal();
    }
  });
  
  // 增强统计模态框关闭
  document.getElementById('enhancedStatsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'enhancedStatsModal') {
      hideEnhancedStatsModal();
    }
  });
}

// ==================== 学习时长跟踪 ====================

let sessionStartTime = null;
let durationUpdateInterval = null;

function startSessionTracking() {
  sessionStartTime = Date.now();
  
  // 每分钟更新一次学习时长（仅当 StatsManager 可用时）
  durationUpdateInterval = setInterval(() => {
    if (sessionStartTime && typeof StatsManager !== 'undefined') {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      StatsManager.updateDuration(60); // 增加60秒
    }
  }, 60000); // 每分钟
}

function stopSessionTracking() {
  if (sessionStartTime && typeof StatsManager !== 'undefined') {
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    StatsManager.updateDuration(duration);
    sessionStartTime = null;
  }
  
  if (durationUpdateInterval) {
    clearInterval(durationUpdateInterval);
    durationUpdateInterval = null;
  }
}

// ==================== 集成 SM-2 算法到测验模式 ====================

// 扩展 MultipleChoice 的 checkAnswer 方法（仅当增强功能可用时）
if (typeof StatsManager !== 'undefined' && typeof SpacedRepetition !== 'undefined') {
  const originalMCCheckAnswer = MultipleChoice.checkAnswer;
  MultipleChoice.checkAnswer = function(button) {
    const startTime = this.questionStartTime || Date.now();
    const timeSpent = Date.now() - startTime;
    
    originalMCCheckAnswer.call(this, button);
    
    // 记录到每日统计
    const selectedAnswer = button.dataset.answer;
    const correctAnswer = AppState.currentWord.english;
    const isCorrect = selectedAnswer === correctAnswer;
    
    StatsManager.recordActivity(AppState.currentWord, isCorrect, false);
    
    // 应用 SM-2 算法
    const quality = SpacedRepetition.convertCorrectToQuality(isCorrect, timeSpent);
    SpacedRepetition.calculateNextReview(AppState.currentWord, quality);
    
    // 如果是自定义单词本，保存更新后的数据
    if (AppState.currentWordbook) {
      WordbookManager.saveWordbooks();
    }
  };
}

MultipleChoice.loadQuestion = function() {
  if (AppState.quizIndex >= AppState.currentWords.length) {
    this.showCompletion();
    return;
  }
  
  AppState.currentWord = AppState.currentWords[AppState.quizIndex];
  this.questionStartTime = Date.now(); // 记录开始时间
  
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
  
  // 自动朗读意大利语单词
  setTimeout(() => {
    italianSpeaker.speak(AppState.currentWord.italian, true);
  }, 300); // 稍微延迟一下，让界面先更新
  
  // 处理中文提示 - 默认隐藏，显示"显示提示"按钮
  const chineseHint = document.getElementById('mcChineseHint');
  const showHintBtn = document.getElementById('mcShowHintBtn');
  
  if (AppState.currentWord.chinese) {
    // 有中文翻译时，显示提示按钮，隐藏中文
    chineseHint.textContent = `中文: ${AppState.currentWord.chinese}`;
    chineseHint.classList.add('hidden');
    showHintBtn.classList.remove('hidden');
  } else {
    // 没有中文翻译时，隐藏按钮和中文
    chineseHint.classList.add('hidden');
    showHintBtn.classList.add('hidden');
  }
  
  // 显示 notes（如果存在）
  this.displayNotes();
  
  // 生成选项
  this.generateOptions();
  
  // 隐藏反馈
  document.getElementById('mcFeedback').classList.add('hidden');
};

// 扩展 Spelling 的 checkAnswer 方法（仅当增强功能可用时）
if (typeof StatsManager !== 'undefined' && typeof SpacedRepetition !== 'undefined') {
  const originalSpCheckAnswer = Spelling.checkAnswer;
  Spelling.checkAnswer = function() {
    originalSpCheckAnswer.call(this);
    
    // 记录到每日统计
    const input = document.getElementById('spInput');
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = AppState.currentWord.italian.toLowerCase();
    const isCorrect = this.normalizeString(userAnswer) === this.normalizeString(correctAnswer);
    
    StatsManager.recordActivity(AppState.currentWord, isCorrect, false);
    
    // 应用 SM-2 算法
    const quality = SpacedRepetition.convertCorrectToQuality(isCorrect);
    SpacedRepetition.calculateNextReview(AppState.currentWord, quality);
    
    // 如果是自定义单词本，保存更新后的数据
    if (AppState.currentWordbook) {
      WordbookManager.saveWordbooks();
    }
  };
}

// ==================== 单词本卡片添加管理按钮 ====================

const originalRenderWordbookCards = WordbookManager.renderWordbookCards;
WordbookManager.renderWordbookCards = function() {
  const container = document.getElementById('wordbookCards');
  
  if (AppState.customWordbooks.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 1rem;">还没有导入任何单词本</p>';
    return;
  }
  
  container.innerHTML = AppState.customWordbooks.map(wb => `
    <div class="wordbook-card" data-wordbook-id="${wb.id}">
      <button class="wordbook-card-manage-btn" onclick="event.stopPropagation(); if(typeof WordbookEditor !== 'undefined') { WordbookEditor.openEditor(${wb.id}); } else { alert('单词本编辑功能未加载'); }" title="管理单词本">${renderIcon('icon-settings')}</button>
      <button class="wordbook-delete-btn" onclick="event.stopPropagation(); WordbookManager.deleteWordbook(${wb.id})" title="删除">×</button>
      <span class="wordbook-card-icon">${renderIcon('icon-book-open')}</span>
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
};

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  loadVocabulary();
  setPracticeContext('vocab');
  updateHeaderNavigation('welcomeScreen');
  
  // 渲染自定义单词本卡片
  WordbookManager.renderWordbookCards();
  
  // 开始会话跟踪
  startSessionTracking();
  
  // 页面卸载时停止跟踪
  window.addEventListener('beforeunload', () => {
    stopSessionTracking();
  });
});
