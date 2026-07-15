/**
 * Dimenticato - 通用测验引擎
 * 为选择题、拼写、浏览三种模式提供共享逻辑
 * 通过配置对象适配不同语言的字段名
 */
(function () {
  'use strict';

  /**
   * @param {Object} config
   * @param {Object} config.state - 包含 words, quizIndex, quizCorrect, quizTotal, currentWord getters/setters
   * @param {Object} config.stats - 包含 mcAttempts, mcCorrect, spAttempts, spCorrect 等统计
   * @param {Set}   config.mastered - 已掌握单词集合
   * @param {Object} config.fieldMap - { source: 'italian'|'german'|'english', target: 'english'|'display' }
   * @param {Function} config.saveFn - 保存回调
   * @param {Function} config.onUpdateStats - 更新 UI 统计回调
   * @param {Object} config.dom - DOM 元素引用
   */
  function QuizEngine(config) {
    this.config = config;
  }

  QuizEngine.prototype.shuffleArray = function (array) {
    var arr = array.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  };

  /**
   * 为选择题生成 4 个选项（1 个正确 + 3 个干扰项）
   * config.difficulty === 'hard' 时使用拼写相近的干扰项，否则随机
   */
  QuizEngine.prototype.generateOptions = function (correctAnswer, wordPool) {
    var options = [correctAnswer];
    var targetField = this.config.fieldMap.target;
    var sourceField = this.config.fieldMap.source;
    var currentWord = this.config.state.currentWord;
    var difficulty = this.config.difficulty || 'easy';

    if (difficulty === 'hard' && window.WordSimilarity && currentWord) {
      var distractors = window.WordSimilarity.pickConfusableDistractors(currentWord, wordPool, {
        count: 3,
        sourceField: sourceField,
        targetField: targetField,
        correctTarget: correctAnswer
      });
      for (var d = 0; d < distractors.length; d++) {
        options.push(distractors[d][targetField]);
      }
      return this.shuffleArray(options);
    }

    // easy / 回退：随机
    var otherWords = wordPool.filter(function (w) {
      return w[sourceField] !== currentWord[sourceField] &&
             w[targetField] !== correctAnswer;
    });

    var shuffled = this.shuffleArray(otherWords);
    for (var i = 0; i < 3 && i < shuffled.length; i++) {
      options.push(shuffled[i][targetField]);
    }

    return this.shuffleArray(options);
  };

  /**
   * 渲染选择题选项按钮
   */
  QuizEngine.prototype.renderOptions = function (options, onSelect) {
    var container = this.config.dom.optionsContainer;
    container.innerHTML = options.map(function (option) {
      return '<button class="option" data-answer="' + escapeAttribute(option) + '">' + escapeHtml(option || '—') + '</button>';
    }).join('');

    container.querySelectorAll('.option').forEach(function (btn) {
      btn.addEventListener('click', function () { onSelect(btn); });
    });
  };

  /**
   * 显示答题反馈（正确/错误）
   */
  QuizEngine.prototype.showFeedback = function (isCorrect, correctAnswer) {
    var feedback = this.config.dom.feedbackEl;
    var feedbackText = this.config.dom.feedbackTextEl;

    if (isCorrect) {
      feedbackText.innerHTML = '<span class="msr">check_circle</span>回答正确';
      feedbackText.classList.remove('no');
      feedbackText.classList.add('ok');
      feedback.classList.remove('incorrect');
      feedback.classList.add('correct');
    } else {
      feedbackText.innerHTML = '<span class="msr">cancel</span>回答有误，正确答案是：' + escapeHtml(correctAnswer);
      feedbackText.classList.remove('ok');
      feedbackText.classList.add('no');
      feedback.classList.remove('correct');
      feedback.classList.add('incorrect');
    }
    feedback.classList.remove('hidden');
  };

  /**
   * 高亮正确/错误选项
   */
  QuizEngine.prototype.highlightOptions = function (correctAnswer) {
    var container = this.config.dom.optionsContainer;
    container.querySelectorAll('.option').forEach(function (btn) {
      btn.disabled = true;
      if (btn.dataset.answer === correctAnswer) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('faded');
      }
    });
  };

  /**
   * 更新测验进度 UI
   */
  QuizEngine.prototype.updateProgress = function () {
    var s = this.config.state;
    var d = this.config.dom;
    d.progressCurrent.textContent = s.quizIndex + 1;
    d.progressTotal.textContent = s.words.length;
    var accuracy = s.quizTotal > 0 ? Math.round((s.quizCorrect / s.quizTotal) * 100) : 0;
    d.accuracyEl.textContent = accuracy + '%';
  };

  /**
   * 标准化文本（去重音、小写）用于拼写模式答案比较
   */
  QuizEngine.prototype.normalizeString = function (str) {
    return (str || '').toString().trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // ===== 难度偏好（localStorage 持久化，默认困难） =====
  QuizEngine.DIFFICULTY_KEY = 'dimenticato_quiz_difficulty';

  QuizEngine.getDifficulty = function () {
    try {
      var v = (typeof window !== 'undefined' && window.localStorage)
        ? localStorage.getItem(QuizEngine.DIFFICULTY_KEY) : null;
      return v === 'easy' ? 'easy' : 'hard';
    } catch (e) {
      return 'hard';
    }
  };

  QuizEngine.setDifficulty = function (value) {
    var v = value === 'easy' ? 'easy' : 'hard';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(QuizEngine.DIFFICULTY_KEY, v);
      }
    } catch (e) {}
    return v;
  };

  window.QuizEngine = QuizEngine;
})();