/**
 * Dimenticato - 统计图表模块
 * 使用 Chart.js 显示学习数据可视化
 */

const ChartsManager = {
  charts: {},

  // 在绘制时读取设计 token（跟随当前主题；图表每次打开/切换标签页时
  // 都会重建，因此 draw-time 读取即可在明暗主题间保持正确配色）
  getTokens() {
    const cs = getComputedStyle(document.documentElement);
    const t = (name) => cs.getPropertyValue(name).trim();
    return {
      accent: t('--accent'),
      card: t('--card'),
      card2: t('--card-2'),
      border: t('--border'),
      borderStrong: t('--border-strong'),
      ink: t('--ink'),
      ink2: t('--ink-2'),
      muted: t('--muted')
    };
  },

  // 初始化所有图表
  initCharts() {
    if (typeof Chart !== 'undefined') {
      Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    }
    this.createWeeklyTrendChart();
    this.createDailyWordsChart();
    this.createMasteryDistributionChart();
  },
  
  // 销毁所有图表
  destroyCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  },
  
  // 创建每周学习趋势图
  createWeeklyTrendChart() {
    const canvas = document.getElementById('weeklyTrendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const stats = StatsManager.getRecentStats(7);
    const tokens = this.getTokens();

    // 准备数据
    const labels = stats.map(s => {
      const date = new Date(s.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const wordsData = stats.map(s => s.wordsLearned);
    const accuracyData = stats.map(s =>
      s.totalCount > 0 ? (s.correctCount / s.totalCount * 100).toFixed(1) : 0
    );

    if (this.charts.weeklyTrend) {
      this.charts.weeklyTrend.destroy();
    }

    this.charts.weeklyTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '学习单词数',
            data: wordsData,
            borderColor: tokens.accent,
            backgroundColor: 'transparent',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: '正确率 (%)',
            data: accuracyData,
            borderColor: tokens.muted,
            backgroundColor: 'transparent',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: tokens.ink
            }
          },
          title: {
            display: true,
            text: '最近 7 天学习趋势',
            color: tokens.ink,
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              color: tokens.muted
            },
            grid: {
              color: tokens.border
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 0,
            max: 100,
            ticks: {
              color: tokens.muted
            },
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            ticks: {
              color: tokens.muted
            },
            grid: {
              color: tokens.border
            }
          }
        }
      }
    });
  },
  
  // 创建每日单词量柱状图
  createDailyWordsChart() {
    const canvas = document.getElementById('dailyWordsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const stats = StatsManager.getRecentStats(7);
    const tokens = this.getTokens();

    const labels = stats.map(s => {
      const date = new Date(s.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const wordsData = stats.map(s => s.wordsLearned);

    if (this.charts.dailyWords) {
      this.charts.dailyWords.destroy();
    }

    // 最新一天用 --accent 强调，其余为中性色（同 .bar/.bar.latest）
    const lastIndex = wordsData.length - 1;
    this.charts.dailyWords = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '学习单词数',
          data: wordsData,
          backgroundColor: wordsData.map((_, i) => (i === lastIndex ? tokens.accent : tokens.card2)),
          borderColor: wordsData.map((_, i) => (i === lastIndex ? tokens.accent : tokens.border)),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '每日学习单词量',
            color: tokens.ink,
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: tokens.muted,
              stepSize: 10
            },
            grid: {
              color: tokens.border
            }
          },
          x: {
            ticks: {
              color: tokens.muted
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  },
  
  // 创建掌握度分布饼图
  createMasteryDistributionChart() {
    const canvas = document.getElementById('masteryDistributionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 统计不同状态的单词数量。词表跟着当前语言走：优先 ReviewSession.wordsFor()，
    // 否则直接取统一词库；条目都是 v1 entry，SRS 以 entry.word 为键。
    const lang = window.getActiveLanguage ? window.getActiveLanguage() : 'italian';
    const words = (window.ReviewSession && typeof window.ReviewSession.wordsFor === 'function')
      ? window.ReviewSession.wordsFor(lang)
      : (window.Vocab ? window.Vocab.entries(lang) : []);

    let newWords = 0;
    let learningWords = 0;
    let masteredWords = 0;

    words.forEach(word => {
      const status = SpacedRepetition.getWordStatus(word, lang);
      if (status.status === 'new') {
        newWords++;
      } else if (status.status === 'learning') {
        learningWords++;
      } else {
        masteredWords++;
      }
    });
    
    if (this.charts.masteryDistribution) {
      this.charts.masteryDistribution.destroy();
    }

    // 已熟练 = --accent；新词/学习中为中性色（--card-2 / --border-strong）
    const tokens = this.getTokens();
    this.charts.masteryDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['新词', '学习中', '已熟练'],
        datasets: [{
          data: [newWords, learningWords, masteredWords],
          backgroundColor: [
            tokens.card2,
            tokens.borderStrong,
            tokens.accent
          ],
          borderColor: [
            tokens.card,
            tokens.card,
            tokens.card
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: tokens.ink,
              padding: 15
            }
          },
          title: {
            display: true,
            text: '单词掌握度分布',
            color: tokens.ink,
            font: {
              size: 16
            }
          }
        }
      }
    });
  },
  
  // 更新所有图表
  updateAllCharts() {
    this.destroyCharts();
    this.initCharts();
  }
};

// 显示增强的统计模态框
function showEnhancedStatsModal() {
  const modal = document.getElementById('enhancedStatsModal');
  if (!modal) {
    console.error('增强统计模态框不存在');
    return;
  }
  
  // 更新基础统计数据
  updateBasicStats();
  
  // 更新每日统计
  updateDailyStats();
  
  // 初始化图表
  setTimeout(() => {
    ChartsManager.initCharts();
  }, 100);
  
  // 显示模态框
  modal.classList.remove('hidden');
}

// 隐藏增强的统计模态框
function hideEnhancedStatsModal() {
  const modal = document.getElementById('enhancedStatsModal');
  if (modal) {
    modal.classList.add('hidden');
    ChartsManager.destroyCharts();
  }
}

// 更新基础统计数据
function updateBasicStats() {
  const totalStats = StatsManager.getTotalStats();
  const todayStats = StatsManager.getTodayStats();
  
  // 总计统计
  document.getElementById('enhancedStatTotalWords').textContent = totalStats.totalWords;
  document.getElementById('enhancedStatTotalDuration').textContent = formatDuration(totalStats.totalDuration);
  document.getElementById('enhancedStatTotalAccuracy').textContent = totalStats.averageAccuracy + '%';
  document.getElementById('enhancedStatTotalAttempts').textContent = totalStats.totalAttempts;
  
  // 今日统计
  const todayWordsCount = Array.isArray(todayStats.wordsLearned) 
    ? todayStats.wordsLearned.length 
    : todayStats.wordsLearned.size;
  
  document.getElementById('enhancedStatTodayWords').textContent = todayWordsCount;
  document.getElementById('enhancedStatTodayDuration').textContent = formatDuration(todayStats.duration);
  
  const todayAccuracy = todayStats.totalCount > 0 
    ? (todayStats.correctCount / todayStats.totalCount * 100).toFixed(1) 
    : 0;
  document.getElementById('enhancedStatTodayAccuracy').textContent = todayAccuracy + '%';
}

// 更新每日统计表格
function updateDailyStats() {
  const tbody = document.getElementById('dailyStatsTableBody');
  if (!tbody) return;
  
  const stats = StatsManager.getRecentStats(7);
  
  tbody.innerHTML = stats.reverse().map(stat => {
    const accuracy = stat.totalCount > 0 
      ? (stat.correctCount / stat.totalCount * 100).toFixed(1) 
      : 0;
    
    const date = new Date(stat.date);
    const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
    
    return `
      <tr>
        <td>${dateStr}</td>
        <td>${stat.wordsLearned}</td>
        <td>${formatDuration(stat.duration)}</td>
        <td>${stat.totalCount}</td>
        <td>${accuracy}%</td>
      </tr>
    `;
  }).join('');
}

// 格式化时长
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0分钟';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

// 切换统计标签页
function switchStatsTab(tabName) {
  // 隐藏所有标签页内容
  document.querySelectorAll('.stats-tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // 移除所有标签按钮的选中状态
  document.querySelectorAll('.stats-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // 显示选中的标签页
  document.getElementById(`${tabName}Tab`).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // 如果切换到图表标签页，更新图表
  if (tabName === 'charts') {
    setTimeout(() => {
      ChartsManager.updateAllCharts();
    }, 100);
  }
}

window.showEnhancedStatsModal = showEnhancedStatsModal;
window.hideEnhancedStatsModal = hideEnhancedStatsModal;
window.switchStatsTab = switchStatsTab;
