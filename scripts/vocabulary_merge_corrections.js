/**
 * Vocabulary Correction Merge Script
 * 合并修正数据并处理大小写变体
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 加载原始词汇
const vocabPath = path.join(rootDir, 'data', 'vocabulary.json');
const vocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

// 加载修正数据
const encodingCorrections = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'data', 'vocabulary_corrections_encoding.json'), 'utf8')
);
const duplicateCorrections = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'data', 'vocabulary_corrections_duplicates.json'), 'utf8')
);

console.log(`原始词条数: ${vocabulary.length}`);
console.log(`编码修正词条: ${Object.keys(encodingCorrections).length}`);
console.log(`重复修正词条: ${Object.keys(duplicateCorrections).length}`);

// 1. 应用编码修正
let encodingFixed = 0;
vocabulary.forEach(entry => {
  const key = entry.italian.toLowerCase();
  if (encodingCorrections[key]) {
    entry.english = encodingCorrections[key].english;
    entry.chinese = encodingCorrections[key].chinese;
    encodingFixed++;
  }
});
console.log(`已修复编码词条: ${encodingFixed}`);

// 2. 应用重复修正
let duplicateFixed = 0;
vocabulary.forEach(entry => {
  const key = entry.italian.toLowerCase();
  if (duplicateCorrections[key]) {
    entry.english = duplicateCorrections[key].english;
    entry.chinese = duplicateCorrections[key].chinese;
    duplicateFixed++;
  }
});
console.log(`已修复重复词条: ${duplicateFixed}`);

// 3. 合并大小写变体
// 去重策略：保留翻译最完整的词条，合并不同含义到合并后的词条
const uniqueVocab = new Map();
const mergedEntries = [];

vocabulary.forEach(entry => {
  const key = entry.italian.toLowerCase();

  if (!uniqueVocab.has(key)) {
    // 新词条，直接添加
    uniqueVocab.set(key, entry);
  } else {
    // 已存在，需要合并
    const existing = uniqueVocab.get(key);

    // 如果翻译不同，合并含义
    if (existing.english !== entry.english) {
      // 合并英文（用分号分隔不同含义）
      const englishSet = new Set([
        ...existing.english.split(/[;,]\s*/),
        ...entry.english.split(/[;,]\s*/)
      ]);
      existing.english = [...englishSet].slice(0, 3).join('; ');

      // 合并中文
      const chineseSet = new Set([
        ...(existing.chinese || '').split(/[;,]\s*/),
        ...(entry.chinese || '').split(/[;,]\s*/)
      ]);
      existing.chinese = [...chineseSet].slice(0, 3).join('; ');
    }

    // 保留较低的 rank（更常用）
    if (entry.rank < existing.rank) {
      existing.rank = entry.rank;
      existing.frequency = entry.frequency;
    }

    mergedEntries.push(entry.italian);  // 记录被合并的词条
  }
});

console.log(`合并大小写变体: ${mergedEntries.length} 条`);

// 4. 转换为数组并按 rank 排序
const finalVocabulary = [...uniqueVocab.values()];
finalVocabulary.sort((a, b) => a.rank - b.rank);

console.log(`最终词条数: ${finalVocabulary.length}`);
console.log(`去重词条数: ${vocabulary.length - finalVocabulary.length}`);

// 5. 保存修正后的词汇表
const outputPath = path.join(rootDir, 'data', 'vocabulary_fixed.json');
fs.writeFileSync(outputPath, JSON.stringify(finalVocabulary, null, 2), 'utf8');
console.log(`\n✅ 已保存修正后的词汇表到: ${outputPath}`);

// 6. 生成 vocabulary.js (内嵌格式)
const jsContent = `// Italian Vocabulary Data - Enhanced with translations
// Total entries: ${finalVocabulary.length}
// Structure: {italian, dictionary, english, chinese, frequency, rank}
// Fixed on ${new Date().toISOString().split('T')[0]}: encoding residue, duplicates, case variants merged

const VOCABULARY_DATA = ${JSON.stringify(finalVocabulary, null, 2)};
`;

const jsPath = path.join(rootDir, 'vocabulary_fixed.js');
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log(`✅ 已生成 vocabulary_fixed.js`);

// 7. 输出修正统计
console.log('\n=== 修正统计 ===');
console.log(`编码残留修复: ${encodingFixed}`);
console.log(`翻译重复修复: ${duplicateFixed}`);
console.log(`大小写变体合并: ${mergedEntries.length}`);
console.log(`总去重: ${vocabulary.length - finalVocabulary.length}`);

// 显示一些合并示例
console.log('\n=== 合并示例 ===');
const mergeExamples = mergedEntries.slice(0, 10);
mergeExamples.forEach(m => {
  const key = m.toLowerCase();
  const entry = uniqueVocab.get(key);
  console.log(`${key}: ${entry.english} / ${entry.chinese}`);
});