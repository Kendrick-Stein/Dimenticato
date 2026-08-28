/**
 * PracticeFlow — 四语言共享的选择题判分流程
 *
 * 背景：app.js / german-app.js (GermanApp+EnglishApp) / french-app.js 里各自
 * 手抄了一份 checkAnswer，语句顺序完全相同（state 计数 → 掌握记录 → 高亮 →
 * 反馈 → 准确率 → 保存 → 自动下一题）。反向出题、统计修复这类改动每次都要
 * 平行改四遍，「同一道题计 2 次」的统计 bug 就是这么长出来的。
 *
 * 设计：判分与 UI 流程共享；真正因语言而异的部分（掌握策略、准确率文案、
 * 保存动作、下一题延迟）由 env 适配器注入。拼写模式的判分（德语大小写宽容、
 * 法语重音宽容）是真实的语言差异，留在各 app，不在本模块强行统一。
 *
 * 答题遥测（StatsManager / SpacedRepetition / ReviewSession）原先由
 * app-enhanced.js 的 QuizIntegration 用「计数器差分包装」挂在各 check 方法
 * 外面；现在直接内联到这里，删掉 MC 侧的包装（拼写侧仍由包装覆盖）。
 */
(function (global) {
  'use strict';

  /** 答题遥测：与原 QuizIntegration.wrap 的记录语义逐字段一致。返回新一题的开始时刻。 */
  function recordTelemetry(lang, opts) {
    try {
      var timeSpent = opts.startedAt ? Date.now() - opts.startedAt : null;
      if (global.StatsManager) {
        global.StatsManager.recordActivity(lang, {
          correct: opts.correct ? 1 : 0,
          total: 1,
          durationMs: timeSpent || 0,
          words: opts.word ? [opts.word] : []
        });
      }
      if (global.SpacedRepetition && opts.word) {
        var quality = global.SpacedRepetition.convertCorrectToQuality(opts.correct, timeSpent);
        global.SpacedRepetition.review(lang, opts.word, quality);
      }
      if (global.ReviewSession) global.ReviewSession.onAnswered(lang);
    } catch (e) {
      // 埋点绝不能影响练习本身
      console.error('SRS 记录失败:', e);
    }
    return Date.now();
  }

  var PracticeFlow = {
    recordTelemetry: recordTelemetry,

    /**
     * 选择题判分 + 反馈 + 遥测 + 保存 + 自动下一题。
     *
     * @param {Object} env
     *   lang          'italian' | 'german' | 'english' | 'french'（遥测用）
     *   engine        QuizEngine 实例或返回实例的函数
     *   button        被点击的选项按钮（dataset.answer）
     *   word          当前词条
     *   state         { quizTotal, quizCorrect }（字段直接被更新）
     *   stats         { mcAttempts, mcCorrect }（字段直接被更新）
     *   recordMastery(word, isCorrect)  各语言的掌握策略（可组合多个调用）
     *   setText(id, text) / accuracyId / accuracyText()  准确率展示（可选）
     *   save()        持久化动作（各语言 saveState / Storage.save）
     *   next() / nextDelay  答对后的自动下一题
     *   startedAt     上一题的开始时刻（遥测算时长用，0 表示未知）
     * @returns {number} 新一题的开始时刻，调用方应存回自己的 _questionStartedAt
     */
    mcAnswer: function (env) {
      if (!env.word) return env.startedAt || 0; // 德/英/法原有的空词守卫，意语此前没有
      var engine = typeof env.engine === 'function' ? env.engine() : env.engine;
      var correctAnswer = engine.correctAnswerFor(env.word);
      var isCorrect = (env.button.dataset.answer || '') === correctAnswer;

      env.state.quizTotal += 1;
      env.stats.mcAttempts += 1;
      if (isCorrect) {
        env.state.quizCorrect += 1;
        env.stats.mcCorrect += 1;
      }
      if (env.recordMastery) env.recordMastery(env.word, isCorrect);

      engine.highlightOptions(correctAnswer);
      if (!isCorrect) {
        env.button.classList.remove('faded');
        env.button.classList.add('wrong');
      }
      engine.showFeedback(isCorrect, correctAnswer);

      var startedAt = recordTelemetry(env.lang, {
        correct: isCorrect,
        word: env.word,
        startedAt: env.startedAt || 0
      });

      if (env.setText && env.accuracyId) {
        env.setText(env.accuracyId, env.accuracyText());
      }
      if (env.save) env.save();
      if (isCorrect && env.next) {
        setTimeout(env.next, env.nextDelay || 900);
      }
      return startedAt;
    }
  };

  global.PracticeFlow = PracticeFlow;
})(window);
