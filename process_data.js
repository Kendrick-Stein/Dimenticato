/**
 * 数据处理脚本
 * 将意大利语词频数据与词典翻译合并，生成最终的词汇表
 */

const fs = require('fs');
const path = require('path');

// 读取词典文件 (JSON格式，包含HTML格式的定义)
function loadDictionary() {
  console.log('📖 读取词典文件...');
  const dictPath = path.join(__dirname, 'ita-eng', 'output.json');
  const data = fs.readFileSync(dictPath, 'utf8');
  return JSON.parse(data);
}

// 读取词频文件
function loadFrequencyList() {
  console.log('📊 读取词频文件...');
  const freqPath = path.join(__dirname, 'it_50k.txt');
  const data = fs.readFileSync(freqPath, 'utf8');
  const lines = data.trim().split('\n');
  
  const freqMap = new Map();
  lines.forEach((line, index) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      const word = parts[0].toLowerCase();
      const frequency = parseInt(parts[1]);
      freqMap.set(word, { rank: index + 1, frequency });
    }
  });
  
  return freqMap;
}

// 从HTML格式中提取纯英语翻译
function extractEnglishTranslation(htmlString) {
  if (!htmlString) return '';
  
  // 移除HTML标签
  let text = htmlString.replace(/<[^>]+>/g, ' ');
  
  // 移除特殊字符和多余空格
  text = text.replace(/\s+/g, ' ').trim();
  
  // 提取主要翻译（通常在定义中）
  // 尝试找到最相关的英语翻译部分
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // 收集看起来像翻译的部分（通常是简短的英语单词或短语）
  const translations = [];
  for (const line of lines) {
    // 跳过发音、词性等标注
    if (line.startsWith('/') || line.includes('ˈ') || line.includes('ˌ')) continue;
    if (line === 'noun' || line === 'verb' || line === 'adjective' || line === 'adverb') continue;
    
    // 提取实际翻译内容
    if (line.length > 0 && line.length < 100) {
      translations.push(line);
    }
  }
  
  // 返回前几个翻译，用分号分隔
  return translations.slice(0, 3).join('; ') || text.substring(0, 100);
}

// 合并数据
function mergeData(dictionary, frequencyMap) {
  console.log('🔄 合并数据...');
  
  const vocabulary = [];
  let matchCount = 0;
  let noFreqCount = 0;
  
  for (const [italian, htmlDef] of Object.entries(dictionary)) {
    const italianLower = italian.toLowerCase();
    const english = extractEnglishTranslation(htmlDef);
    
    if (!english || english.trim().length === 0) {
      continue; // 跳过无法提取翻译的条目
    }
    
    const freqData = frequencyMap.get(italianLower);
    
    if (freqData) {
      vocabulary.push({
        italian: italian,
        english: english,
        frequency: freqData.frequency,
        rank: freqData.rank
      });
      matchCount++;
    } else {
      // 没有词频数据的词，分配较低的优先级
      vocabulary.push({
        italian: italian,
        english: english,
        frequency: 0,
        rank: 999999
      });
      noFreqCount++;
    }
  }
  
  console.log(`✅ 成功匹配 ${matchCount} 个词`);
  console.log(`⚠️  ${noFreqCount} 个词没有词频数据`);
  
  // 按词频排序（rank越小越常用）
  vocabulary.sort((a, b) => a.rank - b.rank);
  
  return vocabulary;
}

// 生成统计信息
function generateStats(vocabulary) {
  const stats = {
    total: vocabulary.length,
    withFrequency: vocabulary.filter(v => v.frequency > 0).length,
    withoutFrequency: vocabulary.filter(v => v.frequency === 0).length,
    levels: {
      beginner: 1000,
      intermediate: 3000,
      advanced: 5000,
      all: vocabulary.length
    }
  };
  
  return stats;
}

// 主函数
function main() {
  console.log('🚀 开始处理数据...\n');
  
  try {
    // 1. 加载数据
    const dictionary = loadDictionary();
    const frequencyMap = loadFrequencyList();
    
    console.log(`📚 词典包含 ${Object.keys(dictionary).length} 个词条`);
    console.log(`📈 词频表包含 ${frequencyMap.size} 个词条\n`);
    
    // 2. 合并数据
    const vocabulary = mergeData(dictionary, frequencyMap);
    
    // 3. 生成统计
    const stats = generateStats(vocabulary);
    
    // 4. 创建输出目录
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // 5. 保存词汇表
    const vocabPath = path.join(dataDir, 'vocabulary.json');
    fs.writeFileSync(vocabPath, JSON.stringify(vocabulary, null, 2), 'utf8');
    console.log(`\n💾 词汇表已保存到: ${vocabPath}`);
    
    // 6. 保存统计信息
    const statsPath = path.join(dataDir, 'stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');
    console.log(`📊 统计信息已保存到: ${statsPath}`);
    
    // 7. 打印摘要
    console.log('\n📋 处理完成！');
    console.log('═══════════════════════════════════════');
    console.log(`总词汇量: ${stats.total}`);
    console.log(`有词频数据: ${stats.withFrequency}`);
    console.log(`无词频数据: ${stats.withoutFrequency}`);
    console.log('\n难度等级:');
    console.log(`  初级 (Beginner): ${stats.levels.beginner} 词`);
    console.log(`  中级 (Intermediate): ${stats.levels.intermediate} 词`);
    console.log(`  高级 (Advanced): ${stats.levels.advanced} 词`);
    console.log(`  全部 (All): ${stats.levels.all} 词`);
    console.log('═══════════════════════════════════════\n');
    
    // 8. 显示前10个高频词示例
    console.log('🔝 前10个高频词示例:');
    vocabulary.slice(0, 10).forEach((word, index) => {
      console.log(`${index + 1}. ${word.italian} → ${word.english.substring(0, 50)}${word.english.length > 50 ? '...' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行
main();
