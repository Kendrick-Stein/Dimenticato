/**
 * Vocabulary Deep Quality Scanner
 * 检测词汇数据中的各类问题：
 * 1. 编码残留（已修复，再次确认）
 * 2. 翻译截断（英文只有单个字母）
 * 3. 中文乱码/空白
 * 4. 英文与中文语义不匹配
 * 5. dictionary 与 english 字段严重不一致
 * 6. 意大利语单词异常（含数字、特殊字符、非意大利语）
 * 7. 多义词翻译过于笼统
 * 8. 词频/rank 异常值
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const vocabPath = path.join(rootDir, 'data', 'vocabulary_fixed.json');
const vocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

console.log(`总词条数: ${vocabulary.length}\n`);

const issues = {
  truncatedEnglish: [],       // 英文截断（单字母或极短）
  emptyChinese: [],           // 中文空白
  garbledChinese: [],         // 中文乱码
  dictionaryMismatch: [],     // dictionary 与 english 不匹配
  italianAnomaly: [],         // 意大利语单词异常
  semanticMismatch: [],       // 英文中文语义可能不匹配
  rankAnomaly: [],            // 词频异常
  polysemyTooSimple: [],      // 多义词翻译过于简单
  suspiciousPair: []          // 可疑的意-英配对
};

// === 检测规则 ===

// 1. 英文截断：只有单个字母或两个字母且不是常见词
const commonShortWords = ['a', 'an', 'I', 'in', 'on', 'at', 'to', 'of', 'by', 'up', 'is', 'it', 'be', 'or', 'as', 'if', 'so', 'my', 'me', 'we', 'no', 'go', 'do', 'he', 'or'];

// 2. 中文乱码检测：包含非中文字符且看起来像编码错误
const garbledPatterns = [
  /[琌]/,           // Big5 编码残留
  /[\x00-\x1F]/,      // 控制字符
  /[♪]/,              // 音符符号（翻译不应该有）
  /[?？]\s*[吗?]/,    // "? 吗" 这种模式
  /No\.\s*$/,         // 以 "No." 结尾
];

// 3. 意大利语异常：包含数字、特殊符号、非拉丁字符
const italianAnomalyPatterns = [
  /\d/,               // 含数字
  /[!@#$%^&*()]/,     // 特殊符号
  /[\u4e00-\u9fff]/,  // 中文字符
  /[\u3040-\u30ff]/,  // 日文字符
];

// 4. 语义不匹配检测（简化版）：英文是动词但中文是名词等
const verbMarkers = ['to ', '-ing', 'verb', 'v.'];
const nounMarkersEn = ['noun', 'n.', 'the ', 'a '];
const nounMarkersZh = ['者', '物', '事', '人', '地', '品', '件'];

// === 执行检测 ===

vocabulary.forEach((entry, idx) => {
  const { italian, dictionary, english, chinese, frequency, rank } = entry;
  const eng = (english || '').trim();
  const chi = (chinese || '').trim();
  const dict = (dictionary || '').trim();
  const ital = (italian || '').trim();

  // 1. 英文截断检测
  if (eng.length <= 2 && !commonShortWords.includes(eng.toLowerCase())) {
    issues.truncatedEnglish.push({ ...entry, issue: `English too short: "${eng}"` });
  }

  // 2. 中文空白检测
  if (!chi || chi.length < 1) {
    issues.emptyChinese.push({ ...entry, issue: 'Chinese empty' });
  }

  // 3. 中文乱码检测
  for (const pattern of garbledPatterns) {
    if (pattern.test(chi)) {
      issues.garbledChinese.push({ ...entry, issue: `Garbled: "${chi.substring(0, 20)}"` });
      break;
    }
  }

  // 4. dictionary 与 english 不匹配检测（dictionary 含有完整定义但 english 截断）
  if (dict.length > 30 && eng.length < 5 && dict.toLowerCase().indexOf(eng.toLowerCase()) === -1) {
    issues.dictionaryMismatch.push({ ...entry, issue: `Dict has "${dict.substring(0, 30)}..." but eng is "${eng}"` });
  }

  // 5. 意大利语异常检测
  for (const pattern of italianAnomalyPatterns) {
    if (pattern.test(ital)) {
      issues.italianAnomaly.push({ ...entry, issue: `Italian anomaly: "${ital}"` });
      break;
    }
  }

  // 6. 语义可能不匹配（简化检测）
  // 如果英文以 "to " 开头（动词）但中文不含动词特征词
  const engIsVerb = verbMarkers.some(m => eng.toLowerCase().startsWith(m));
  const chiHasVerbMarker = chi.includes('做') || chi.includes('是') || chi.includes('有') || chi.includes('去') || chi.includes('来') || chi.includes('说') || chi.includes('看');
  if (engIsVerb && chi.length > 2 && !chiHasVerbMarker && !chi.includes('；')) {
    // 可能是动词但中文翻译看起来不像动词
    // 只标记一些明显可疑的
    if (chi.includes('的') && !chi.includes('做的') && !chi.includes('是的')) {
      issues.semanticMismatch.push({ ...entry, issue: `EN verb "${eng}" but ZH "${chi}" looks like noun/adjective` });
    }
  }

  // 7. 词频异常检测（rank > 50000 但 frequency > 100000 或 vice versa）
  if (rank > 50000 && frequency > 100000) {
    issues.rankAnomaly.push({ ...entry, issue: `High frequency ${frequency} but low rank ${rank}` });
  }
  if (rank < 100 && frequency < 100) {
    issues.rankAnomaly.push({ ...entry, issue: `Low frequency ${frequency} but high rank ${rank}` });
  }

  // 8. 多义词翻译过于简单（英文有多个词但中文只有2字）
  if (eng.includes(';') && chi.length <= 4 && !chi.includes(';') && !chi.includes('；')) {
    issues.polysemyTooSimple.push({ ...entry, issue: `EN has multiple meanings "${eng}" but ZH too simple "${chi}"` });
  }

  // 9. 可疑配对检测（意大利语常用词但英文翻译完全不相关）
  // 高频词（rank < 200）但英文翻译看起来很奇怪
  if (rank < 200) {
    const top200Expected = {
      'e': 'and', 'di': 'of', 'che': 'that', 'non': 'not', 'la': 'the',
      'il': 'the', 'un': 'a', 'a': 'to', 'per': 'for', 'in': 'in',
      'essere': 'be', 'ha': 'has', 'con': 'with', 'su': 'on', 'da': 'from'
    };
    const expected = top200Expected[ital.toLowerCase()];
    if (expected && !eng.toLowerCase().includes(expected)) {
      issues.suspiciousPair.push({ ...entry, issue: `Expected "${expected}" for "${ital}" but got "${eng}"` });
    }
  }
});

// === 输出结果 ===

console.log('=== 检测结果 ===\n');

const categories = Object.keys(issues);
categories.forEach(cat => {
  const count = issues[cat].length;
  if (count > 0) {
    console.log(`${cat}: ${count} 条`);
  }
});

// 详细输出
console.log('\n=== 英文截断 ===');
issues.truncatedEnglish.slice(0, 20).forEach(e => {
  console.log(`${e.italian} | EN: "${e.english}" | ZH: "${e.chinese?.substring(0, 15)}" | ${e.issue}`);
});

console.log('\n=== 中文空白 ===');
issues.emptyChinese.slice(0, 10).forEach(e => {
  console.log(`${e.italian} | EN: "${e.english}" | ${e.issue}`);
});

console.log('\n=== 中文乱码 ===');
issues.garbledChinese.slice(0, 15).forEach(e => {
  console.log(`${e.italian} | ZH: "${e.chinese}" | ${e.issue}`);
});

console.log('\n=== Dictionary 不匹配 ===');
issues.dictionaryMismatch.slice(0, 10).forEach(e => {
  console.log(`${e.italian} | ${e.issue}`);
});

console.log('\n=== 意大利语异常 ===');
issues.italianAnomaly.slice(0, 10).forEach(e => {
  console.log(`${e.italian} | ${e.issue}`);
});

console.log('\n=== 可疑高频词配对 ===');
issues.suspiciousPair.slice(0, 15).forEach(e => {
  console.log(`${e.italian} (rank ${e.rank}) | EN: "${e.english}" | ${e.issue}`);
});

console.log('\n=== 多义词翻译过于简单 ===');
issues.polysemyTooSimple.slice(0, 15).forEach(e => {
  console.log(`${e.italian} | EN: "${e.english}" | ZH: "${e.chinese}" | ${e.issue}`);
});

// 保存完整报告
const report = {
  summary: {
    total: vocabulary.length,
    truncatedEnglish: issues.truncatedEnglish.length,
    emptyChinese: issues.emptyChinese.length,
    garbledChinese: issues.garbledChinese.length,
    dictionaryMismatch: issues.dictionaryMismatch.length,
    italianAnomaly: issues.italianAnomaly.length,
    semanticMismatch: issues.semanticMismatch.length,
    rankAnomaly: issues.rankAnomaly.length,
    polysemyTooSimple: issues.polysemyTooSimple.length,
    suspiciousPair: issues.suspiciousPair.length
  },
  issues
};

fs.writeFileSync(
  path.join(rootDir, 'data', 'vocabulary_deep_issues.json'),
  JSON.stringify(report, null, 2),
  'utf8'
);

console.log('\n✅ 详细报告已保存到 data/vocabulary_deep_issues.json');

// 总问题数
const totalIssues = categories.reduce((sum, cat) => sum + issues[cat].length, 0);
console.log(`\n总问题词条: ${totalIssues} 条`);