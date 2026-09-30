/**
 * Cognate Extractor Script
 * 从 data/vocab/it.js（schema v1）提取与英语相似的 cognate 单词
 *
 * 运行: node scripts/cognate_extractor.js [输出路径]
 * 输出: data/cognates.js（默认）
 *
 * 注意：data/cognates.js 生成后经过多轮人工校订（见其文件头），重跑会覆盖这些校订；
 * 需要对照时请把输出写到别处。rank 是 v1 的稠密频率名次（1…N）。
 */

const fs = require('fs');
const path = require('path');
const { loadVocab } = require('./vocab_node');

const rootDir = path.join(__dirname, '..');
// 旧 vocabulary.js 的 rank 是稀疏的语料名次，筛选上限是 10000；v1 rank 是稠密的
// 1…N，旧名次 10000 正好对应 v1 第 3977 名，取整为 4000。
const RANK_LIMIT = 4000;

// v1 字段 → 本脚本沿用的旧字段名
const vocabulary = loadVocab('it').entries.map((e) => ({
  italian: e.word, english: e.en || '', chinese: e.zh || '', rank: e.rank,
}));

console.log(`总词条数: ${vocabulary.length}`);

// === 相似度计算 ===

/**
 * 计算 Levenshtein 编辑距离
 */
function levenshteinDistance(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i-1] === b[j-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else {
        dp[i][j] = Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1;
      }
    }
  }
  return dp[m][n];
}

/**
 * 根据编辑距离计算基础相似度分数
 */
function baseSimilarityScore(distance, maxLen) {
  const ratio = maxLen > 0 ? distance / maxLen : 0;
  if (ratio <= 0.1) return 100;
  if (ratio <= 0.2) return 90 - Math.round(ratio * 10);
  if (ratio <= 0.3) return 80 - Math.round(ratio * 10);
  if (ratio <= 0.5) return 60 - Math.round(ratio * 20);
  return Math.max(30, 50 - Math.round(ratio * 50));
}

// === 后缀模式定义 ===

const suffixPatterns = [
  { pattern: /zione$/i, suffix: '-zione/-tion', englishSuffix: 'tion' },
  { pattern: /ità$/i, suffix: '-ità/-ity', englishSuffix: 'ity' },
  { pattern: /ico$/i, suffix: '-ico/-ic', englishSuffix: 'ic' },
  { pattern: /ale$/i, suffix: '-ale/-al', englishSuffix: 'al' },
  { pattern: /mente$/i, suffix: '-mente/-ly', englishSuffix: 'ly' },
  { pattern: /ario$/i, suffix: '-ario/-ary', englishSuffix: 'ary' },
  { pattern: /oria$/i, suffix: '-oria/-ory', englishSuffix: 'ory' },
  { pattern: /ista$/i, suffix: '-ista/-ist', englishSuffix: 'ist' },
  { pattern: /ismo$/i, suffix: '-ismo/-ism', englishSuffix: 'ism' },
  { pattern: /ente$/i, suffix: '-ente/-ent', englishSuffix: 'ent' },
  { pattern: /ante$/i, suffix: '-ante/-ant', englishSuffix: 'ant' },
  { pattern: /ore$/i, suffix: '-ore/-or', englishSuffix: 'or' },
  { pattern: /ella$/i, suffix: '-ella/-el', englishSuffix: 'el' },
  { pattern: /ello$/i, suffix: '-ello/-el', englishSuffix: 'el' },
  { pattern: /etto$/i, suffix: '-etto/-et', englishSuffix: 'et' },
  { pattern: /atto$/i, suffix: '-atto/-at', englishSuffix: 'at' },
  { pattern: /utto$/i, suffix: '-utto/-ut', englishSuffix: 'ut' },
];

/**
 * 检查是否匹配后缀规律
 */
function matchSuffixPattern(italian, english) {
  for (const p of suffixPatterns) {
    if (p.pattern.test(italian)) {
      // 检查英语是否对应
      const englishBase = english.toLowerCase().replace(/e$/, ''); // 去掉末尾 e
      const italianBase = italian.toLowerCase().replace(p.pattern, '');
      if (englishBase.includes(italianBase) || italianBase.includes(englishBase)) {
        return p.suffix;
      }
    }
  }
  return null;
}

/**
 * 计算最终相似度分数
 */
function calculateSimilarity(italian, english) {
  const distance = levenshteinDistance(italian, english);
  const maxLen = Math.max(italian.length, english.length);
  let score = baseSimilarityScore(distance, maxLen);

  // 后缀匹配加分
  const pattern = matchSuffixPattern(italian, english);
  if (pattern) {
    score += 20;
  }

  // 长度相近加分
  const lenDiff = Math.abs(italian.length - english.length);
  if (lenDiff <= 2) score += 10;

  return { score: Math.min(100, score), pattern };
}

/**
 * 确定难度等级
 */
function getDifficulty(score) {
  if (score >= 80) return 'easy';
  if (score >= 50) return 'medium';
  return 'hard';
}

// === 执行筛选 ===

const cognates = [];
const stats = { easy: 0, medium: 0, hard: 0, byPattern: {} };

vocabulary.forEach(entry => {
  const { italian, english, chinese, rank } = entry;

  // 只处理有英文翻译的词条
  if (!english || english.length < 2) return;

  // 验证 rank 字段
  if (typeof rank !== 'number' || rank <= 0) return;

  // 取英文翻译的第一个词（如果有多个）
  const firstEnglish = english.split(/[;,]/)[0].trim().toLowerCase();

  // 计算相似度
  const { score, pattern } = calculateSimilarity(italian, firstEnglish);

  // 筛选条件：相似度 >= 50 且 rank <= RANK_LIMIT
  if (score >= 50 && rank <= RANK_LIMIT) {
    const difficulty = getDifficulty(score);

    cognates.push({
      italian,
      english: firstEnglish,
      chinese: (chinese || '').split(/[;,]/)[0].trim(),
      patternType: pattern,
      similarityScore: score,
      difficulty,
      rank
    });

    stats[difficulty]++;
    if (pattern) {
      stats.byPattern[pattern] = (stats.byPattern[pattern] || 0) + 1;
    }
  }
});

// 按相似度排序
cognates.sort((a, b) => b.similarityScore - a.similarityScore);

console.log(`\n筛选结果:`);
console.log(`  Easy (>=80): ${stats.easy}`);
console.log(`  Medium (50-79): ${stats.medium}`);
console.log(`  Hard (<50): ${stats.hard}`);
console.log(`  总计: ${cognates.length}`);
console.log(`\n按后缀规律分布:`);
Object.entries(stats.byPattern)
  .sort((a, b) => b[1] - a[1])
  .forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count}`);
  });

// === 生成 cognates.js ===

const jsContent = `// Cognate Vocabulary Data
// Italian-English similar words for efficient vocabulary transfer
// Total entries: ${cognates.length}
// Generated on ${new Date().toISOString().split('T')[0]}
// Structure: {italian, english, chinese, patternType, similarityScore, difficulty, rank}

const COGNATE_DATA = ${JSON.stringify(cognates, null, 2)};

// 统一注册：消费方经 LangLoader.data(lang, module) 取数（lib/lang-loader.js）
(globalThis.DIM_DATA = globalThis.DIM_DATA || {});
(globalThis.DIM_DATA.cognates = globalThis.DIM_DATA.cognates || {}).it = COGNATE_DATA;
`;

const outputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(rootDir, 'data', 'cognates.js');
fs.writeFileSync(outputPath, jsContent, 'utf8');
console.log(`\n✅ 已保存到: ${outputPath}`);
