/**
 * Vocabulary Quality Scanner
 * 检测词汇数据中的问题词条：
 * - 中文编码残留（页:、单位:、千美元等）
 * - 英文/中文翻译重复
 * - 大小写变体重复
 * - 翻译过长
 * - 翻译质量可疑
 */

const fs = require('fs');
const path = require('path');

// 项目根目录
const rootDir = path.join(__dirname, '..');

// 加载词汇数据
const vocabPath = path.join(rootDir, 'data', 'vocabulary.json');
const vocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

console.log(`总词条数: ${vocabulary.length}`);

// 问题检测规则
const issues = {
  encodingResidue: [],      // 中文编码残留
  duplicateTranslation: [], // 英文/中文翻译重复
  caseDuplicate: [],        // 大小写变体重复
  tooLong: [],              // 翻译过长
  emptyOrInvalid: [],       // 空或无效翻译
  allIssues: []             // 所有问题词条汇总
};

// 1. 检测中文编码残留
const encodingPatterns = [
  /页:\d/,
  /单位[:：]/,
  /千美元/,
  /\(单位/,
  //,
  /\d+\s*页/,
];

// 2. 检测翻译重复（重复超过3次视为问题）
function hasRepetition(text, threshold = 3) {
  if (!text || text.length < 10) return false;
  // 检测单词重复
  const words = text.toLowerCase().split(/\s*[;,]\s*|\s+/);
  const wordCounts = {};
  words.forEach(w => {
    if (w.length > 2) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    }
  });
  for (const [word, count] of Object.entries(wordCounts)) {
    if (count >= threshold) return { word, count };
  }
  return false;
}

// 3. 大小写变体检测
const caseMap = new Map();
vocabulary.forEach(entry => {
  const key = entry.italian.toLowerCase();
  if (!caseMap.has(key)) {
    caseMap.set(key, []);
  }
  caseMap.get(key).push(entry);
});

// 扫描所有词条
const issueSet = new Set();

vocabulary.forEach(entry => {
  const { italian, english, chinese } = entry;

  // 检测编码残留
  const chineseText = chinese || '';
  for (const pattern of encodingPatterns) {
    if (pattern.test(chineseText)) {
      issues.encodingResidue.push({
        ...entry,
        issueType: 'encoding_residue',
        issueDetail: `Chinese contains encoding artifact: "${chineseText.substring(0, 30)}"`
      });
      issueSet.add(italian.toLowerCase());
      break;
    }
  }

  // 检测英文重复
  const englishRep = hasRepetition(english, 4);
  if (englishRep) {
    issues.duplicateTranslation.push({
      ...entry,
      issueType: 'english_repetition',
      issueDetail: `English word "${englishRep.word}" repeated ${englishRep.count} times`
    });
    issueSet.add(italian.toLowerCase());
  }

  // 检测中文重复
  const chineseRep = hasRepetition(chinese, 6);
  if (chineseRep) {
    issues.duplicateTranslation.push({
      ...entry,
      issueType: 'chinese_repetition',
      issueDetail: `Chinese word "${chineseRep.word}" repeated ${chineseRep.count} times`
    });
    issueSet.add(italian.toLowerCase());
  }

  // 检测翻译过长
  if ((english && english.length > 100) || (chinese && chinese.length > 150)) {
    issues.tooLong.push({
      ...entry,
      issueType: 'too_long',
      issueDetail: `English: ${english.length} chars, Chinese: ${chinese?.length || 0} chars`
    });
    issueSet.add(italian.toLowerCase());
  }

  // 检测空或无效翻译
  if (!english || english.trim().length < 1 || !chinese || chinese.trim().length < 1) {
    issues.emptyOrInvalid.push({
      ...entry,
      issueType: 'empty_invalid',
      issueDetail: 'Missing translation'
    });
    issueSet.add(italian.toLowerCase());
  }
});

// 大小写变体重复
caseMap.forEach((entries, key) => {
  if (entries.length > 1) {
    // 检查是否翻译不同（需要合并）或相同（直接去重）
    const translations = entries.map(e => e.english?.toLowerCase());
    const uniqueTranslations = new Set(translations);

    issues.caseDuplicate.push({
      key,
      entries: entries.map(e => ({
        italian: e.italian,
        english: e.english,
        chinese: e.chinese,
        rank: e.rank
      })),
      issueType: 'case_duplicate',
      issueDetail: `${entries.length} case variants, ${uniqueTranslations.size} unique translations`,
      needsMerge: uniqueTranslations.size > 1  // 不同翻译需要合并含义
    });

    // 只将第一个作为问题词条（合并时保留这条）
    entries.slice(1).forEach(e => issueSet.add(e.italian.toLowerCase()));
  }
});

// 汇总所有问题
issues.allIssues = [
  ...issues.encodingResidue,
  ...issues.duplicateTranslation,
  ...issues.tooLong,
  ...issues.emptyOrInvalid
];

// 输出统计
console.log('\n=== 问题统计 ===');
console.log(`编码残留: ${issues.encodingResidue.length}`);
console.log(`翻译重复: ${issues.duplicateTranslation.length}`);
console.log(`翻译过长: ${issues.tooLong.length}`);
console.log(`空/无效: ${issues.emptyOrInvalid.length}`);
console.log(`大小写变体: ${issues.caseDuplicate.length} 组，涉及 ${issues.caseDuplicate.reduce((sum, g) => sum + g.entries.length - 1, 0)} 条重复`);
console.log(`总问题词条: ${issueSet.size}`);

// 导出问题词条（待修正）
const output = {
  summary: {
    totalEntries: vocabulary.length,
    encodingResidue: issues.encodingResidue.length,
    duplicateTranslation: issues.duplicateTranslation.length,
    tooLong: issues.tooLong.length,
    emptyOrInvalid: issues.emptyOrInvalid.length,
    caseDuplicateGroups: issues.caseDuplicate.length,
    totalIssues: issueSet.size
  },
  encodingResidue: issues.encodingResidue,
  duplicateTranslation: issues.duplicateTranslation,
  tooLong: issues.tooLong.slice(0, 50),  // 截取前50条过长词条
  emptyOrInvalid: issues.emptyOrInvalid,
  caseDuplicate: issues.caseDuplicate
};

fs.writeFileSync(
  path.join(rootDir, 'data', 'vocabulary_issues.json'),
  JSON.stringify(output, null, 2),
  'utf8'
);

console.log('\n✅ 问题词条已导出到 data/vocabulary_issues.json');

// 显示示例问题
console.log('\n=== 编码残留示例 ===');
issues.encodingResidue.slice(0, 10).forEach(e => {
  console.log(`${e.italian} | EN: ${e.english?.substring(0, 30)} | ZH: ${e.chinese?.substring(0, 30)}`);
});

console.log('\n=== 翻译重复示例 ===');
issues.duplicateTranslation.slice(0, 5).forEach(e => {
  console.log(`${e.italian} | ${e.issueDetail}`);
});

console.log('\n=== 大小写变体示例 ===');
issues.caseDuplicate.slice(0, 8).forEach(g => {
  console.log(`${g.key} (${g.entries.length} variants, ${g.issueDetail})`);
  g.entries.forEach(e => console.log(`  - ${e.italian}: ${e.english} / ${e.chinese?.substring(0, 20)}`));
});