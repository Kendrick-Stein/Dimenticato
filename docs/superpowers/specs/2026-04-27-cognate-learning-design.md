# Cognate 词表与练习功能设计

## 概述

从现有意大利语词表中筛选出与英语高度相似的 cognate 单词，创建独立词表，并设计专门练习模式，帮助用户利用已有英语词汇记忆快速迁移到意大利语学习。

## 数据结构

### Cognate 词表 (`data/cognates.js`)

```javascript
{
  "italian": "informazione",
  "english": "information",
  "chinese": "信息",
  "patternType": "-zione/-tion",      // 后缀规律类型（可选）
  "similarityScore": 85,               // 相似度分数 (0-100)
  "difficulty": "easy",                // 基于相似度分组
  "rank": 1234                         // 保留原词频排名
}
```

### 相似度计算规则

通过脚本 `scripts/cognate_extractor.js` 自动筛选：

1. **Levenshtein 距离计算**：
   - 距离 ≤ 2 → 基础分数 90-100
   - 距离 3-4 → 基础分数 70-89
   - 距离 5-6 → 基础分数 50-69

2. **后缀模式匹配加分**：
   - 预定义规则：-zione/-tion、-ità/-ity、-ico/-ic、-ale/-al、-mente/-ly、-o/-e 等
   - 匹配规则额外加 20 分

3. **难度分组**：
   - easy：相似度 ≥ 80
   - medium：相似度 50-79
   - hard：相似度 < 50

4. **筛选阈值**：
   - 最终相似度 ≥ 50 且词频 rank ≤ 10000 的入选

## UI 集成

### 词表选择

在现有词表选择流程中添加：

```
[选择词表]
  ├─ 系统词汇 (按难度分级)
  ├─ Cognates (新) ← 点击后显示 cognate 词表
  └─ 自定义单词本
```

选择 Cognates 词表后，练习模式选项自动切换为 cognate 专用模式。

### 练习模式选择

```
[练习模式]
  ├─ 英语提示模式 (默认) — 显示英语，拼写意大利语
  ├─ 对比练习模式 — 同时显示意英，高亮差异
  ├─ 模式识别练习 — 按后缀规律分组练习
  └─ 浏览模式 — 快速翻看 cognate 词表
```

## 练习模式实现

### 1. 英语提示模式 (EnglishPromptMode)

**流程：**
- 显示英语单词作为提示
- 用户输入对应的意大利语拼写
- 使用 QuizEngine.normalizeString() 进行答案比对（忽略重音差异）
- 答错时显示差异对比视图，高亮不匹配字符

**计分：**
- 正确拼写得分较高（因难度相对较低）
- 连续正确加速进度推进

### 2. 对比练习模式 (ContrastMode)

**流程：**
- 同时显示意大利语和英语单词
- 用颜色高亮差异部分
- 例如："inform**azione**" vs "inform**ation**"
- 快速翻页浏览，强化记忆差异规律
- 可按 difficulty 或 patternType 分组浏览

**样式：**
- 差异部分用醒目颜色（如橙色）标记
- 相同部分保持默认颜色

### 3. 模式识别练习 (PatternGroupMode)

**流程：**
- 按 patternType 分组（如 "-zione/-tion" 组有 50+ 词）
- 先展示规律说明卡片
- 再进入该组词汇的测试
- 完成一组后解锁下一组
- 渐进学习，掌握规律后词汇记忆更牢固

**进度追踪：**
- 每个 patternType 的完成状态保存到 localStorage

### 4. 浏览模式 (BrowseMode)

**流程：**
- 复用现有 Browse 模式框架
- 显示意/英/中三列
- 额外显示 similarityScore 和 patternType
- 可按难度或规律类型筛选

## 技术架构

### 新增文件

| 文件 | 用途 |
|------|------|
| `data/cognates.js` | Cognate 词表数据 |
| `scripts/cognate_extractor.js` | 词表生成脚本（提取相似词） |
| `cognate-app.js` | Cognate 练习核心逻辑 |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `index.html` | 添加 cognate-app.js 引用，词表选择 UI |
| `app.js` | 词表选择逻辑扩展，支持 cognate 模式切换 |
| `styles.css` | 添加差异高亮、对比显示样式 |

### 数据流

```
vocabulary.js → cognate_extractor.js → data/cognates.js
                                        ↓
                        用户选择 Cognates 词表
                                        ↓
                        加载 cognate-app.js 练习模式
                                        ↓
                        执行对应练习逻辑
```

### 代码复用

- 复用 `lib/quiz-engine.js` 的基础测验功能
- 复用 `lib/utils.js` 的 escapeHtml 等工具函数
- 复用现有 Storage 机制的 localStorage 存储模式
- 复用 ScreenMeta 的界面导航框架

## 预期词表规模

基于 27,117 条意大利语词汇：
- 预计筛选出约 2,000-4,000 条 cognate 词汇
- 按 difficulty 分组便于渐进学习
- 按 patternType 分组便于规律练习

## 预览效果示例

### 英语提示模式
```
┌─────────────────────────────┐
│ English: information         │
│                             │
│ Type Italian: [__________]  │
│                             │
│ Progress: 5/20  Accuracy: 80%│
└─────────────────────────────┘
```

### 对比练习模式
```
┌─────────────────────────────┐
│ Italian: inform**azione**    │
│ English: inform**ation**     │
│ Chinese: 信息                │
│                             │
│ Pattern: -zione/-tion        │
│ Similarity: 85%              │
│                             │
│ [← Prev] [Next →]           │
└─────────────────────────────┘
```