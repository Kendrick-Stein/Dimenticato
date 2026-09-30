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

  // ==================== 递进式提示（四语言共享） ====================
  //
  // 提示按档递进：先给最弱的线索（答案首字 + 长度），用户还想要才给更强的
  // （中文释义 / 英文释义）。直接亮出释义 ≈ 送答案，选择题就没意义了。
  // 每档内容由各 app 决定（意语选项是英文释义，德/法/英选项多是中文），
  // 这里只管档位推进与按钮文案。
  //
  // stages: [{ text, label }]，label 是「点这个按钮会进到该档」的按钮文字；
  // 空 text 的档会被跳过。返回新的档位，由调用方存起来。

  /** 答案首字线索：拉丁文数字母，CJK 数字（"答案 T… · 共 3 个字母" / "首字 打… · 共 2 字"） */
  function initialHint(answer) {
    // 只看第一个义项，并去掉括注（"the (feminine)" 的线索是 the，不是 11 个字母）
    var first = String(answer || '').split(/[;；]/)[0];
    var text = first.replace(/[(（[【][^)）\]】]*[)）\]】]/g, ' ').trim() || first.trim();
    if (!text) return '';
    var cjk = text.match(/[一-鿿]/g) || [];
    if (cjk.length) return '首字 ' + cjk[0] + '… · 共 ' + cjk.length + ' 字';
    var letters = text.match(/\p{L}/gu) || [];
    if (!letters.length) return '';
    return '答案 ' + letters[0].toUpperCase() + '… · 共 ' + letters.length + ' 个字母';
  }

  function hintReset(hintEl, btn, label) {
    if (hintEl) {
      hintEl.textContent = '';
      hintEl.classList.add('hidden');
    }
    if (btn) {
      btn.textContent = label || '显示提示';
      btn.classList.remove('hidden');
    }
    return 0;
  }

  function hintAdvance(stage, opts) {
    var stages = (opts.stages || []).filter(function (s) { return s && s.text; });
    var hintEl = opts.hintEl;
    var btn = opts.btn;
    var current = stages[stage];
    if (!current) {
      if (hintEl && !stages.length) {
        hintEl.textContent = '（这条词暂无可用提示）';
        hintEl.classList.remove('hidden');
      }
      if (btn) btn.classList.add('hidden');
      return stage;
    }
    if (hintEl) {
      hintEl.textContent = current.text;
      hintEl.classList.remove('hidden');
    }
    var next = stages[stage + 1];
    if (btn) {
      if (next) {
        btn.textContent = next.label || '更多提示';
        btn.classList.remove('hidden');
      } else {
        btn.classList.add('hidden');
      }
    }
    return stage + 1;
  }

  PracticeFlow.initialHint = initialHint;
  PracticeFlow.hintReset = hintReset;
  PracticeFlow.hintAdvance = hintAdvance;

  global.PracticeFlow = PracticeFlow;

  // ==================== 键盘快捷键（四语言选择题共享） ====================
  //
  // 四张选择题屏（意/德/英/法）都有同样的骨架：id 以 McOptions 结尾的
  // .options 容器、答完亮出的 .primary-btn「下一个」、.speaker 朗读按钮。
  // 1-4 选中第 n 个选项、Enter 进下一题、R 重听题面发音 —— 刷题的主路径
  // 不该依赖鼠标。document 级委托装一次全覆盖；拼写/打字游戏/搜索框里的
  // 按键不受影响（输入控件直接跳过）。变位与搭配练习屏（conjOptions、
  // vcPracticeOptions）刻意不在范围内：它们的按钮语义与选择题不同。
  var KEYBOARD_BOUND = false;

  function activeMcScreen() {
    if (typeof document === 'undefined' || !document.querySelector) return null;
    const screen = document.querySelector('.screen.active');
    if (!screen) return null;
    const containers = screen.querySelectorAll('.options');
    for (let i = 0; i < containers.length; i++) {
      if (/McOptions$/i.test(containers[i].id || '')) return screen;
    }
    return null;
  }

  function mcOptionsContainer(screen) {
    const containers = screen.querySelectorAll('.options');
    for (let i = 0; i < containers.length; i++) {
      if (/McOptions$/i.test(containers[i].id || '')) return containers[i];
    }
    return null;
  }

  function firstClickable(screen, selector) {
    const nodes = screen.querySelectorAll(selector);
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      if (!el.disabled && el.offsetParent !== null) return el;
    }
    return null;
  }

  function isTextInput(target) {
    if (!target || !target.tagName) return false;
    const tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select'
      || target.isContentEditable === true;
  }

  function installKeyboard() {
    if (KEYBOARD_BOUND) return;
    if (typeof document === 'undefined' || !document.addEventListener) return;
    KEYBOARD_BOUND = true;

    document.addEventListener('keydown', function (event) {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (isTextInput(target)) return;

      const screen = activeMcScreen();
      if (!screen) return;

      // 焦点在按钮上时 Enter 走浏览器原生点击，避免双触发
      if (event.key === 'Enter') {
        if (target && (target.tagName || '').toLowerCase() === 'button') return;
        const next = firstClickable(screen, 'button.primary-btn');
        if (next) {
          event.preventDefault();
          next.click();
        }
        return;
      }

      if (event.key === 'r' || event.key === 'R') {
        const speaker = firstClickable(screen, '.speaker');
        if (speaker) {
          event.preventDefault();
          speaker.click();
        }
        return;
      }

      const pick = ['1', '2', '3', '4'].indexOf(event.key);
      if (pick !== -1) {
        const container = mcOptionsContainer(screen);
        if (!container) return;
        const buttons = Array.prototype.filter.call(
          container.querySelectorAll('button.option'),
          (b) => !b.disabled
        );
        const btn = buttons[pick];
        if (btn) {
          event.preventDefault();
          btn.click();
        }
      }
    });
  }

  // boot 由 defer 脚本触发，注入本文件时 document 一定已就绪；
  // 无头测试的 dom-shim 也实现了 addEventListener。
  installKeyboard();
})(window);
