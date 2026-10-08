/**
 * Dimenticato - 统计图表模块
 * 进度页（app.js renderProgress）里的「趋势图表」与「学习记录」两节。
 * Chart.js 只在进度页真正渲染时按需加载（CdnFallback.load('chart')）。
 *
 *   StatsCharts.sectionsHtml(lang) → 两节的 HTML（图表画布 + 最近 7 天记录表）
 *   StatsCharts.mount(lang)        → 在 innerHTML 写入后调用，懒加载并绘图
 */

const ChartsManager = {
  charts: {},
  lang: null,   // 当前绘图语言（code 或 key）；为空时跟随顶栏

  // 在绘制时读取设计 token（跟随当前主题；图表每次打开/切换标签页时
  // 都会重建，因此 draw-time 读取即可在明暗主题间保持正确配色）
  getTokens() {
    const cs = getComputedStyle(document.documentElement);
    const t = (name) => cs.getPropertyValue(name).trim();
    // 与 SpacedRepetition.getWordStatus 的 colorVar 同一套：新词 / 学习中 --gold / 已熟练 --verde
    return {
      accent: t('--verde'),
      card: t('--card'),
      card2: t('--paper-deep'),
      border: t('--line'),
      borderStrong: t('--gold'),
      ink: t('--ink'),
      ink2: t('--ink-soft'),
      muted: t('--muted')
    };
  },

  // 初始化所有图表
  initCharts(lang) {
    if (lang) this.lang = lang;
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
    const stats = StatsManager.getRecentStats(7, this.lang || undefined);
    const tokens = this.getTokens();

    // 准备数据
    const labels = stats.map(s => {
      const date = parseLocalDay(s.date);
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
    const stats = StatsManager.getRecentStats(7, this.lang || undefined);
    const tokens = this.getTokens();

    const labels = stats.map(s => {
      const date = parseLocalDay(s.date);
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
    const lang = this.lang || (window.DimStorage ? window.DimStorage.code() : Languages.DEFAULT);
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
  updateAllCharts(lang) {
    this.destroyCharts();
    this.initCharts(lang);
  }
};

function loadChartLib() {
  return window.CdnFallback ? window.CdnFallback.load('chart') : Promise.resolve();
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

const StatsCharts = {
  // 最近 7 天学习记录（新到旧）
  historyRows(lang) {
    return StatsManager.getRecentStats(7, lang).reverse().map(stat => {
      const accuracy = stat.totalCount > 0
        ? (stat.correctCount / stat.totalCount * 100).toFixed(1)
        : 0;
      const date = parseLocalDay(stat.date);
      const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
      return `<tr><td>${dateStr}</td><td>${stat.wordsLearned}</td>` +
        `<td>${formatDuration(stat.duration)}</td><td>${stat.totalCount}</td><td>${accuracy}%</td></tr>`;
    }).join('');
  },

  sectionsHtml(lang) {
    const total = StatsManager.getTotalStats(lang);
    return '<section class="panel progress-section" aria-labelledby="progressChartsTitle">' +
        '<div class="panel-title" id="progressChartsTitle">趋势图表</div>' +
        '<div class="chart-container"><canvas id="weeklyTrendChart" aria-label="最近 7 天学习趋势" role="img"></canvas></div>' +
        '<div class="charts-row">' +
          '<div class="chart-container"><canvas id="dailyWordsChart" aria-label="每日学习单词量" role="img"></canvas></div>' +
          '<div class="chart-container"><canvas id="masteryDistributionChart" aria-label="单词掌握度分布" role="img"></canvas></div>' +
        '</div>' +
      '</section>' +
      '<section class="panel progress-section" aria-labelledby="progressHistoryTitle">' +
        '<div class="panel-title" id="progressHistoryTitle">学习记录 · 最近 7 天</div>' +
        '<div class="stats-table-container"><table class="stats-table">' +
          '<thead><tr><th>日期</th><th>学习单词</th><th>学习时长</th><th>练习次数</th><th>正确率</th></tr></thead>' +
          '<tbody id="dailyStatsTableBody">' + this.historyRows(lang) + '</tbody>' +
        '</table></div>' +
        '<p class="muted small">累计学习 <span class="num">' + total.totalWords + '</span> 个词，用时 ' +
          formatDuration(total.totalDuration) + '。</p>' +
      '</section>';
  },

  // 进度页 innerHTML 写入之后调用：懒加载 Chart.js，画布仍在页面上才绘制
  mount(lang) {
    ChartsManager.destroyCharts();
    ChartsManager.lang = lang || null;
    return loadChartLib().then(() => {
      if (document.getElementById('weeklyTrendChart')) ChartsManager.initCharts(lang);
    });
  }
};

window.ChartsManager = ChartsManager;
window.StatsCharts = StatsCharts;
