/**
 * Dimenticato - 激流勇进打字游戏引擎 (typing game engine)
 *
 * 玩法：单词从屏幕上方顺流而下（激流勇进），每个「漂流物」上写着
 * 新词对应的释义；玩家在下方输入框里打出外语单词，打对了就把它击落，
 * 打错了/没来得及打它就沉到河底 → 扣一条命。三命结束。
 *
 * 设计要点：
 *  1. 逻辑与渲染分离。TypingGame.create() 返回的游戏实例完全不依赖 canvas，
 *     Node 无头环境可以直接驱动 tick()/submit() 做断言；Renderer 只是
 *     把同一份状态画到画布上。没有 canvas 时游戏照常运行。
 *  2. 大小写、重音符号一律宽松匹配：é==e、ö==o、ü==u，输入可省略重音。
 *     判定统一走 normalize()（NFD 去掉组合符号 + 小写 + 去首尾空白）。
 *  3. 实时前缀匹配：输入非空时，最靠上、答案以当前输入开头的漂流物被高亮；
 *     输入恰好等于完整答案时立即击落（无需按回车）。回车 = 提交，提交了
 *     但没打全/打错 → 记一次 miss 反馈（不扣命，只断连击）。
 *  4. 难度递增：每击落 6 个词升一级，下落速度变快、生成间隔变短。
 *
 * 事件（onEvent(type, payload)）：
 *   clear       {item, points, streak}   击落一个漂流物
 *   miss        {item}                   漂流物沉底（扣命）
 *   wrong       {input, matched}         回车提交但未命中（断连击）
 *   levelup     {level}
 *   gameover    {score, cleared, missed, bestStreak, duration}
 *   spawn       {item}                   新漂流物出现
 */
(function (global) {
  'use strict';

  // ==================== 纯工具 ====================

  function normalize(str) {
    return String(str == null ? '' : str)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .replace(/æ/g, 'ae')
      .replace(/œ/g, 'oe');
  }

  function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function now() {
    return (typeof performance !== 'undefined' && performance.now)
      ? performance.now()
      : Date.now();
  }

  // ==================== 游戏实例 ====================

  const DEFAULTS = {
    width: 800,
    height: 440,
    dangerY: 370,          // 越过这条线 = 沉底扣命
    lives: 3,
    maxConcurrent: 6,
    baseSpeed: 72,         // px/s（简单档）
    baseInterval: 2100,    // ms（简单档）
    speedPerLevel: 1.09,
    intervalPerLevel: 0.93,
    clearsPerLevel: 6,
    minInterval: 700,
    maxSpeed: 260,
    nextItemMaxX: 0.9      // 生成点横向范围（相对宽度）
  };

  function createGame(opts) {
    const o = Object.assign({}, DEFAULTS, opts || {});
    const game = {
      options: o,
      canvas: o.canvas || null,
      items: [],
      input: '',
      score: 0,
      streak: 0,            // 当前连击
      bestStreak: 0,
      lives: o.lives,
      level: 1,
      cleared: 0,
      missed: 0,
      spawnTimer: 0,
      startedAt: 0,
      running: false,
      over: false,
      _pool: [],
      _spawnId: 0,
      _particles: []
    };

    // ---------- 池管理 ----------
    function refill() {
      if (game._pool.length) return;
      const src = o.pool || [];
      game._pool = shuffle(src);
    }

    function nextPrompt() {
      refill();
      return game._pool.pop() || null;
    }

    // ---------- 输入 ----------
    function setInput(str) {
      game.input = String(str || '');
      autoClear();
    }

    function typeChar(ch) {
      if (game.over || !game.running) return;
      game.input += ch;
      autoClear();
    }

    function backspace() {
      if (game.over || !game.running) return;
      game.input = game.input.slice(0, -1);
    }

    // 打完整答案立即击落（无需回车）
    function autoClear() {
      if (game.over || !game.running) return;
      const exact = exactMatch();
      if (exact) clearItem(exact);
    }

    // ---------- 匹配 ----------
    function activeTarget() {
      const inp = normalize(game.input);
      if (!inp) return null;
      for (let i = 0; i < game.items.length; i++) {
        const it = game.items[i];
        if (it.dead) continue;
        if (it.nAnswer.indexOf(inp) === 0) return it;
      }
      return null;
    }

    function exactMatch() {
      const inp = normalize(game.input);
      if (!inp) return null;
      for (let i = 0; i < game.items.length; i++) {
        const it = game.items[i];
        if (it.dead) continue;
        if (it.nAnswer === inp) return it;
      }
      return null;
    }

    // ---------- 生成 ----------
    function spawn() {
      const prompt = nextPrompt();
      if (!prompt) return null;
      const pad = 12;
      const maxX = Math.max(o.width * o.nextItemMaxX, pad + 160);
      const x = randomInt(pad + 80, Math.min(maxX, o.width - pad - 80));
      const item = {
        id: ++game._spawnId,
        prompt: prompt.prompt,
        sub: prompt.sub || '',
        answer: prompt.answer,
        nAnswer: normalize(prompt.answer),
        x: x,
        y: -50,
        speed: o.baseSpeed * Math.pow(o.speedPerLevel, game.level - 1),
        w: 0,
        h: 0,
        dead: false,
        hit: false,
        spawnT: now(),
        clearedAt: 0
      };
      game.items.push(item);
      emit('spawn', { item: item });
      return item;
    }

    // ---------- 击落 / 沉底 ----------
    function clearItem(item) {
      if (item.dead) return;
      item.dead = true;
      item.hit = true;
      item.clearedAt = now();
      game.cleared++;
      game.streak++;
      if (game.streak > game.bestStreak) game.bestStreak = game.streak;
      const mult = Math.min(5, 1 + Math.floor(game.streak / 4));
      const points = 10 * mult;
      game.score += points;

      // 每 clearsPerLevel 个升一级
      if (game.cleared % o.clearsPerLevel === 0) {
        game.level++;
        emit('levelup', { level: game.level });
      }

      emit('clear', { item: item, points: points, streak: game.streak });
      game.input = '';
    }

    function missItem(item) {
      if (item.dead) return;
      item.dead = true;
      game.missed++;
      game.streak = 0;
      game.lives--;
      emit('miss', { item: item });
      game.input = '';
      if (game.lives <= 0) end();
    }

    // ---------- 提交 ----------
    function submit() {
      if (game.over || !game.running) return false;
      if (!game.input) return false;
      const exact = exactMatch();
      if (exact) {
        clearItem(exact);
        return true;
      }
      // 提交未命中：只断连击，不扣命
      const matched = activeTarget();
      game.streak = 0;
      emit('wrong', { input: game.input, matched: matched || null });
      return false;
    }

    // ---------- 主循环 ----------
    function tick(dtMs) {
      if (!game.running || game.over) return;
      const dt = dtMs / 1000;

      // 生成
      game.spawnTimer -= dtMs;
      const interval = Math.max(
        o.minInterval,
        o.baseInterval * Math.pow(o.intervalPerLevel, game.level - 1)
      );
      if (game.spawnTimer <= 0 && game.items.filter((i) => !i.dead).length < o.maxConcurrent) {
        spawn();
        game.spawnTimer = interval;
      }

      // 下落
      for (let i = game.items.length - 1; i >= 0; i--) {
        const it = game.items[i];
        if (it.dead) {
          // 击落后的残留粒子只存活很短时间，随后清掉
          if (it.clearedAt && now() - it.clearedAt > 600) {
            game.items.splice(i, 1);
          }
          continue;
        }
        it.y += it.speed * dt;
        if (it.y > o.dangerY) {
          game.items.splice(i, 1);
          missItem(it);
          if (game.over) return;
        }
      }
    }

    // ---------- 生命周期 ----------
    function start() {
      game.items = [];
      game.input = '';
      game.score = 0;
      game.streak = 0;
      game.bestStreak = 0;
      game.lives = o.lives;
      game.level = 1;
      game.cleared = 0;
      game.missed = 0;
      game.over = false;
      game.running = true;
      game.startedAt = now();
      game.spawnTimer = 300;
      for (let i = 0; i < 2; i++) spawn();
    }

    function stop() {
      game.running = false;
    }

    function end() {
      if (game.over) return;
      game.running = false;
      game.over = true;
      emit('gameover', {
        score: game.score,
        cleared: game.cleared,
        missed: game.missed,
        bestStreak: game.bestStreak,
        duration: Math.round((now() - game.startedAt) / 1000)
      });
    }

    function resize(w, h) {
      if (w > 0) o.width = w;
      if (h > 0) o.height = h;
      if (h > 0) o.dangerY = Math.max(80, h - 70);
    }

    function emit(type, payload) {
      if (typeof o.onEvent === 'function') {
        try { o.onEvent(type, payload); } catch (err) { /* 事件回调不许影响游戏 */ }
      }
    }

    game.setInput = setInput;
    game.typeChar = typeChar;
    game.backspace = backspace;
    game.activeTarget = activeTarget;
    game.exactMatch = exactMatch;
    game.submit = submit;
    game.tick = tick;
    game.start = start;
    game.stop = stop;
    game.end = end;
    game.resize = resize;
    game.refill = refill;
    game.spawn = spawn;
    return game;
  }

  // ==================== 渲染器 ====================

  /**
   * 把游戏状态画到 canvas 上。TypingGame.Renderer.attach(game, canvas) 之后
   * 由外部 rAF 循环驱动 renderer.draw(nowMs)。draw 内部用固定步长推进游戏逻辑
   * （否则帧率越低掉落越慢）。
   */
  const Renderer = {
    _raf: 0,
    _last: 0,
    _acc: 0,
    _tickStep: 1000 / 60,

    attach: function (game, canvas) {
      this._game = game;
      this._canvas = canvas;
      this._ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
      this._parts = [];   // 击落粒子
      this._floats = [];  // "+30" 漂浮文字
      this._last = now();
      this._acc = 0;
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(this._loop);
      return this;
    },

    detach: function () {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
    },

    _loop: function (t) {
      const self = Renderer;
      if (!self._raf) return;
      const dt = t - self._last;
      self._last = t;
      if (dt > 0 && dt < 500) {
        self._acc += dt;
        while (self._acc >= self._tickStep) {
          if (self._game) self._game.tick(self._tickStep);
          self._acc -= self._tickStep;
        }
      }
      self._draw(t);
      self._raf = requestAnimationFrame(self._loop);
    },

    _draw: function (t) {
      const ctx = this._ctx;
      const game = this._game;
      if (!ctx || !game) return;
      // 画布尺寸以 CSS 布局为准（DPR 放大保证清晰），引擎逻辑用 CSS 像素坐标
      const cssW = ctx.canvas.clientWidth || game.options.width;
      const cssH = ctx.canvas.clientHeight || game.options.height;
      const DPR = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      const w = Math.round(cssW * DPR);
      const h = Math.round(cssH * DPR);
      if (ctx.canvas.width !== w) ctx.canvas.width = w;
      if (ctx.canvas.height !== h) ctx.canvas.height = h;
      game.resize(cssW, cssH);
      if (!w || !h) return;

      // 背景：河流渐变 + 波光
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0e2038');
      grad.addColorStop(0.55, '#12375c');
      grad.addColorStop(1, '#0a1a2e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 波光（两层正弦光带）
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = '#7fd4ff';
      for (let layer = 0; layer < 2; layer++) {
        ctx.beginPath();
        const baseY = h * (0.82 + layer * 0.09);
        const amp = 6 + layer * 3;
        ctx.moveTo(0, baseY);
        for (let x = 0; x <= w; x += 6) {
          const y = baseY + Math.sin((x + t * (0.0004 + layer * 0.0002)) * 0.02 + layer * 2) * amp;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // 危险线（沉底线）
      const dangerY = game.options.dangerY;
      ctx.strokeStyle = 'rgba(255, 90, 110, 0.55)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, dangerY);
      ctx.lineTo(w, dangerY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 90, 110, 0.75)';
      ctx.font = '11px sans-serif';
      ctx.fillText('▽ 河底 · 沉到这里的单词会扣命', 10, dangerY - 8);

      // 漂流物
      const active = game.activeTarget && game.activeTarget();
      const inpLen = game.input ? game.input.length : 0;
      for (let i = 0; i < game.items.length; i++) {
        const it = game.items[i];
        if (it.dead) continue;
        this._drawItem(ctx, it, active === it, inpLen, t);
      }

      // 粒子
      this._parts = this._parts.filter((p) => p.t < 600);
      for (let i = 0; i < this._parts.length; i++) {
        const p = this._parts[i];
        const life = p.t / 600;
        ctx.globalAlpha = 1 - life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x + p.vx * p.t / 1000, p.y + p.vy * p.t / 1000, p.r * (1 - life * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 漂浮分数
      this._floats = this._floats.filter((f) => f.t < 900);
      for (let i = 0; i < this._floats.length; i++) {
        const f = this._floats[i];
        ctx.globalAlpha = 1 - f.t / 900;
        ctx.fillStyle = f.color;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(f.text, f.x, f.y - f.t / 90);
      }
      ctx.globalAlpha = 1;
    },

    _drawItem: function (ctx, it, isActive, inpLen, t) {
      const textW = ctx.measureText(it.prompt).width;
      const subW = it.sub ? ctx.measureText(it.sub).width : 0;
      const w = Math.max(150, Math.min(280, textW + 40, subW + 40));
      const h = it.sub ? 66 : 48;
      it.w = w;
      it.h = h;
      const x = it.x - w / 2;
      const y = it.y;

      // 在答题区内小范围晃动，更像顺流
      const drift = Math.sin(t * 0.002 + it.id) * 3;

      ctx.save();
      // 高亮目标：外发光
      if (isActive) {
        ctx.shadowColor = 'rgba(120, 220, 255, 0.95)';
        ctx.shadowBlur = 18;
      } else if (inpLen === 0) {
        ctx.shadowColor = 'rgba(120, 200, 255, 0.25)';
        ctx.shadowBlur = 6;
      }
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      if (isActive) {
        grad.addColorStop(0, '#ffd54f');
        grad.addColorStop(1, '#ff9800');
      } else {
        grad.addColorStop(0, '#2b5876');
        grad.addColorStop(1, '#1c3a54');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      this._roundRect(ctx, x + drift, y, w, h, 14);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 边框
      ctx.strokeStyle = isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.22)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath();
      this._roundRect(ctx, x + drift, y, w, h, 14);
      ctx.stroke();

      // 文字
      ctx.fillStyle = isActive ? '#3a2500' : '#eaf6ff';
      ctx.font = '600 16px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(it.prompt, x + w / 2 + drift, y + (it.sub ? 22 : h / 2));

      if (it.sub) {
        ctx.fillStyle = isActive ? 'rgba(58,37,0,0.75)' : 'rgba(234,246,255,0.7)';
        ctx.font = '12px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillText(it.sub, x + w / 2 + drift, y + 45);
      }
      ctx.restore();
    },

    _roundRect: function (ctx, x, y, w, h, r) {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    },

    /** 击落特效：粒子 + 漂浮分数 */
    burst: function (x, y, color, text) {
      for (let i = 0; i < 14; i++) {
        this._parts.push({
          x: x, y: y, t: 0,
          vx: (Math.random() - 0.5) * 160,
          vy: (Math.random() - 0.7) * 160,
          r: 2 + Math.random() * 3.5,
          color: color || '#ffd54f'
        });
      }
      if (text) this._floats.push({ x: x, y: y, t: 0, text: text, color: color || '#ffe082' });
    }
  };

  global.TypingGame = {
    create: createGame,
    Renderer: Renderer,
    normalize: normalize,
    shuffle: shuffle,
    DEFAULTS: DEFAULTS
  };
})(typeof window !== 'undefined' ? window : globalThis);
