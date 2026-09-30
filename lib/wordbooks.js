/**
 * Personal wordbooks — storage, TXT / JSON import & export, and the editor
 * modal.  One implementation for every language.
 *
 * A wordbook row is always { word, zh, en?, notes? } (the vocab v1 field
 * names).  Rows written by earlier versions ({italian, english, chinese},
 * {german, display, meaning}, …) and community files in either shape are
 * normalised on load / import, so nothing downstream sees the old fields.
 *
 * Storage: dimenticato_custom_wordbooks (unchanged key); per-wordbook
 * mastered lists live under dimenticato_progress_wb_<lang>_<id>.
 */
(function (global) {
  'use strict';

  var KEY = 'dimenticato_custom_wordbooks';
  var esc = function (s) { return global.escapeHtml ? global.escapeHtml(s) : String(s == null ? '' : s); };

  function langKey(lang) {
    return (global.Languages && global.Languages.key(lang)) || lang || 'italian';
  }
  function langName(lang) {
    var p = global.Languages && global.Languages.get(lang);
    return p ? p.cn : lang;
  }

  /** Any historical row shape → { word, zh, en?, notes? } ('' word = unusable). */
  function normalizeRow(row, lang) {
    if (!row || typeof row !== 'object') return null;
    var key = langKey(lang);
    var word = String(row.word || row[key] || row.display || row.italian || '').trim();
    if (!word) return null;
    var chinese = String(row.zh || row.chinese || '').trim();
    var meaning = String(row.meaning || '').trim();
    var english = String(row.en || (key === 'english' ? '' : row.english) || '').trim();
    var out = { word: word, zh: chinese || meaning || '' };
    if (!out.zh && english) out.zh = english;
    if (english && english !== out.zh) out.en = english;
    if (row.notes) out.notes = String(row.notes).trim();
    return out;
  }

  function normalizeBook(wb) {
    if (!wb || typeof wb !== 'object') return null;
    var language = langKey(wb.language || 'italian');
    var words = (Array.isArray(wb.words) ? wb.words : [])
      .map(function (r) { return normalizeRow(r, language); })
      .filter(Boolean);
    var book = {
      id: wb.id != null ? wb.id : Date.now(),
      name: String(wb.name || '未命名词本'),
      language: language,
      description: wb.description ? String(wb.description) : '',
      words: words,
      wordCount: words.length,
      createdAt: wb.createdAt || new Date().toISOString()
    };
    if (wb.fromCommunity) book.fromCommunity = true;
    if (wb.communityId != null) book.communityId = wb.communityId;
    return book;
  }

  function download(name, text, type) {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function emitChange(lang) {
    try {
      document.dispatchEvent(new CustomEvent('dimenticato:wordbooks', { detail: { language: lang || null } }));
    } catch (e) { /* 旧浏览器 / 测试环境 */ }
  }

  var Wordbooks = {
    KEY: KEY,
    _books: null,

    all: function () {
      if (this._books) return this._books;
      var raw = null;
      try { raw = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { raw = []; }
      this._books = (Array.isArray(raw) ? raw : []).map(normalizeBook).filter(Boolean);
      return this._books;
    },
    /** Drops the in-memory copy (after a backup import rewrote storage). */
    reload: function () { this._books = null; emitChange(); return this.all(); },
    list: function (lang) {
      var key = langKey(lang);
      return this.all().filter(function (wb) { return wb.language === key; });
    },
    get: function (id) {
      var wanted = String(id);
      return this.all().find(function (wb) { return String(wb.id) === wanted; }) || null;
    },
    save: function (lang) {
      var payload = JSON.stringify(this.all());
      if (global.DimStorage) global.DimStorage.safeSetItem(KEY, payload);
      else { try { localStorage.setItem(KEY, payload); } catch (e) { /* quota */ } }
      emitChange(lang);
    },
    add: function (wb) {
      var book = normalizeBook(wb);
      if (!book) return null;
      while (this.get(book.id)) book.id = Number(book.id) + 1;
      this.all().push(book);
      this.save(book.language);
      return book;
    },
    create: function (lang, name, description) {
      return this.add({ id: Date.now(), name: name, language: langKey(lang), description: description || '', words: [] });
    },
    remove: function (id) {
      var list = this.all();
      var index = list.findIndex(function (wb) { return String(wb.id) === String(id); });
      if (index < 0) return false;
      var wb = list[index];
      list.splice(index, 1);
      this.save(wb.language);
      try {
        localStorage.removeItem(this.progressKey(wb));
        localStorage.removeItem('dimenticato_progress_wb_' + wb.id);
      } catch (e) { /* ignore */ }
      return true;
    },
    touch: function (wb) {
      wb.wordCount = wb.words.length;
      this.save(wb.language);
    },
    progressKey: function (wb) {
      return global.getWordbookProgressKey
        ? global.getWordbookProgressKey(wb.id, wb.language)
        : 'dimenticato_progress_wb_' + wb.language + '_' + wb.id;
    },
    /** Practice entries (vocab v1 shape, enriched from the system dictionary). */
    entries: function (wb) {
      if (!wb) return [];
      var V = global.Vocab;
      return wb.words.map(function (row) { return V ? V.fromWordbookWord(row, wb.language) : row; })
        .filter(Boolean);
    },

    normalizeRow: normalizeRow,
    normalizeBook: normalizeBook,

    /**
     * TXT format — blocks separated by a blank line:
     *   word
     *   meaning            (Chinese; or English when a 3rd line follows)
     *   中文               (optional)
     *   notes              (optional)
     * A one-line block is looked up in the system dictionary.
     */
    parseTxt: function (text, lang) {
      var V = global.Vocab;
      var blocks = String(text || '').replace(/\r\n?/g, '\n').trim().split(/\n\s*\n+/);
      var words = [];
      var autoMatchedCount = 0;
      var needManualCount = 0;
      blocks.forEach(function (block) {
        var lines = block.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        if (!lines.length) return;
        var row = { word: lines[0], zh: '' };
        if (lines.length === 1) {
          var hit = V ? V.find(lang, lines[0]) : null;
          if (!hit && V) {
            var resolved = V.resolveLegacyKey(lang, lines[0]);
            hit = resolved ? V.find(lang, resolved) : null;
          }
          if (hit) { row.zh = hit.zh; if (hit.en) row.en = hit.en; autoMatchedCount += 1; }
          else needManualCount += 1;
        } else if (lines.length === 2) {
          // 第 2 行是中文就当中文释义，否则当英文释义（旧 TXT 格式）
          if (/[\u3400-\u9fff]/.test(lines[1])) row.zh = lines[1];
          else row.en = lines[1];
        } else {
          row.en = lines[1];
          row.zh = lines[2];
          if (lines[3]) row.notes = lines.slice(3).join(' ');
        }
        var norm = normalizeRow(row, lang);
        if (norm) words.push(norm);
      });
      if (!words.length) throw new Error('文件中没有找到有效的单词');
      return { words: words, autoMatchedCount: autoMatchedCount, needManualCount: needManualCount };
    },

    /** File → wordbook (asks whether to merge into a same-named one). */
    importFile: function (file, lang) {
      var self = this;
      var language = langKey(lang);
      return file.text().then(function (content) {
        var isTxt = /\.txt$/i.test(file.name);
        var data;
        var stats = { autoMatchedCount: 0, needManualCount: 0, duplicatesSkipped: 0, totalImported: 0 };
        if (isTxt) {
          var parsed = self.parseTxt(content, language);
          stats.autoMatchedCount = parsed.autoMatchedCount;
          stats.needManualCount = parsed.needManualCount;
          data = { name: file.name.replace(/\.txt$/i, ''), description: '从 TXT 文件导入（' + new Date().toLocaleDateString() + '）', words: parsed.words };
        } else {
          var json;
          try { json = JSON.parse(content); } catch (e) { throw new Error('JSON 解析失败: ' + e.message); }
          data = Array.isArray(json) ? { name: file.name.replace(/\.json$/i, ''), words: json } : json;
          if (!data || !Array.isArray(data.words) || !data.words.length) throw new Error('words 字段必须是非空数组');
          if (data.language && langKey(data.language) !== language) {
            throw new Error('这是' + langName(data.language) + '词本，请在' + langName(data.language) + '里导入');
          }
        }
        var rows = data.words.map(function (r) { return normalizeRow(r, language); }).filter(Boolean);
        if (!rows.length) throw new Error('文件中没有找到有效的单词');

        var existing = self.list(language).find(function (wb) { return wb.name === data.name; });
        if (existing) {
          var action = global.prompt(
            '已存在同名单词本"' + data.name + '"（' + existing.wordCount + ' 词）。\n\n' +
            '1 - 合并到现有单词本（跳过重复）\n2 - 另建一个新单词本\n0 - 取消\n\n请输入 0、1 或 2：');
          if (action === '1') {
            var seen = new Set(existing.words.map(function (w) { return w.word.toLowerCase(); }));
            var added = rows.filter(function (w) {
              var k = w.word.toLowerCase();
              if (seen.has(k)) { stats.duplicatesSkipped += 1; return false; }
              seen.add(k);
              return true;
            });
            if (!added.length) throw new Error('所有单词都已存在，没有新单词需要导入');
            existing.words = existing.words.concat(added);
            self.touch(existing);
            stats.totalImported = added.length;
            return { wordbook: existing, stats: stats, isMerge: true };
          }
          if (action !== '2') throw new Error('已取消导入');
        }
        var book = self.add({
          id: Date.now(), name: existing ? data.name + ' (' + new Date().toLocaleDateString() + ')' : data.name,
          language: language, description: data.description || '', words: rows
        });
        stats.totalImported = book.wordCount;
        return { wordbook: book, stats: stats, isMerge: false };
      });
    },

    exportJson: function (id) {
      var wb = this.get(id);
      if (!wb) return;
      download(wb.name + '.json', JSON.stringify({
        name: wb.name, description: wb.description, language: wb.language, words: wb.words,
        exportDate: new Date().toISOString(), exportedFrom: 'Dimenticato'
      }, null, 2), 'application/json');
    },
    exportTxt: function (id) {
      var wb = this.get(id);
      if (!wb) return;
      // 与 parseTxt 对称：有英文释义时写 4 行，否则 2 行（注释只在 4 行格式里保留）
      var text = wb.words.map(function (w) {
        if (w.en || w.notes) return [w.word, w.en || w.zh, w.zh, w.notes || ''].filter(function (l, i) { return i < 3 || l; }).join('\n');
        return w.word + '\n' + w.zh;
      }).join('\n\n');
      download(wb.name + '.txt', text, 'text/plain;charset=utf-8');
    }
  };

  // ==================== 词本编辑器（模态框） ====================

  function $(id) { return document.getElementById(id); }

  var WordbookEditor = {
    current: null,
    editingIndex: null,
    selected: new Set(),
    pendingEntry: null,

    createNewWordbook: function (lang) {
      var name = global.prompt('请输入单词本名称：');
      if (!name || !name.trim()) return null;
      var description = global.prompt('请输入单词本描述（可选）：', '') || '';
      return Wordbooks.create(lang, name.trim(), description.trim());
    },

    openEditor: function (id) {
      var wb = Wordbooks.get(id);
      if (!wb) return;
      this.current = wb;
      this.selected.clear();
      $('editorWordbookName').textContent = wb.name;
      this.renderEditorWordList();
      $('wordbookEditorModal').classList.remove('hidden');
    },
    hideEditorModal: function () {
      $('wordbookEditorModal').classList.add('hidden');
      this.current = null;
      this.selected.clear();
    },

    renderEditorWordList: function () {
      var box = $('editorWordList');
      var wb = this.current;
      if (!box || !wb) return;
      this.updateBatchActionsVisibility();
      if (!wb.words.length) {
        box.innerHTML = '<p class="empty-state">此单词本还没有单词</p>';
        return;
      }
      var self = this;
      box.innerHTML = wb.words.map(function (w, i) {
        return '<div class="editor-word-item">'
          + '<input type="checkbox" class="word-checkbox" data-index="' + i + '"' + (self.selected.has(i) ? ' checked' : '') + ' aria-label="选择">'
          + '<div class="editor-word-content"><div class="editor-word-main">'
          + '<span class="editor-word-term">' + esc(w.word) + '</span>'
          + '<span class="editor-word-gloss">' + esc(w.zh) + '</span></div>'
          + (w.en ? '<div class="editor-word-sub">' + esc(w.en) + '</div>' : '')
          + (w.notes ? '<div class="editor-word-sub">' + esc(w.notes) + '</div>' : '')
          + '</div><div class="editor-word-actions">'
          + '<button type="button" class="icon-btn" data-edit="' + i + '" title="编辑" aria-label="编辑"><span class="msr" aria-hidden="true">edit</span></button>'
          + '<button type="button" class="icon-btn" data-delete="' + i + '" title="删除" aria-label="删除"><span class="msr" aria-hidden="true">delete</span></button>'
          + '</div></div>';
      }).join('');
    },
    updateBatchActionsVisibility: function () {
      var bar = document.querySelector('.editor-batch-actions');
      if (bar) bar.classList.toggle('hidden', this.selected.size === 0);
    },

    addNewWord: function () { if (this.current) this.showWordEditDialog(null); },
    editWord: function (index) {
      if (!this.current) return;
      this.showWordEditDialog(index);
    },
    showWordEditDialog: function (index) {
      var w = index == null ? null : this.current.words[index];
      this.editingIndex = index;
      $('editWordTextLabel').textContent = langName(this.current.language) + ' *';
      $('editWordText').value = w ? w.word : '';
      $('editWordZh').value = w ? w.zh : '';
      $('editWordEn').value = w && w.en ? w.en : '';
      $('editWordNotes').value = w && w.notes ? w.notes : '';
      $('wordEditDialogTitle').textContent = w ? '编辑单词' : '添加新单词';
      $('wordEditDialog').classList.remove('hidden');
      $('editWordText').focus();
    },
    hideWordEditDialog: function () {
      $('wordEditDialog').classList.add('hidden');
      this.editingIndex = null;
    },
    saveWordEdit: function () {
      var wb = this.current;
      if (!wb) return;
      var row = normalizeRow({
        word: $('editWordText').value, zh: $('editWordZh').value,
        en: $('editWordEn').value, notes: $('editWordNotes').value
      }, wb.language);
      if (!row || !row.zh) { global.alert('单词和中文释义不能为空'); return; }
      if (this.editingIndex == null) wb.words.push(row);
      else wb.words[this.editingIndex] = row;
      Wordbooks.touch(wb);
      this.renderEditorWordList();
      this.hideWordEditDialog();
    },
    deleteWord: function (index) {
      var wb = this.current;
      if (!wb || !global.confirm('确定要删除这个单词吗？')) return;
      wb.words.splice(index, 1);
      this.selected.clear();
      Wordbooks.touch(wb);
      this.renderEditorWordList();
    },
    batchDelete: function () {
      var wb = this.current;
      if (!wb || !this.selected.size) return;
      if (!global.confirm('确定要删除选中的 ' + this.selected.size + ' 个单词吗？')) return;
      Array.from(this.selected).sort(function (a, b) { return b - a; })
        .forEach(function (i) { wb.words.splice(i, 1); });
      this.selected.clear();
      Wordbooks.touch(wb);
      this.renderEditorWordList();
    },
    batchImportWords: function () {
      var input = $('editorBatchImportInput');
      var self = this;
      if (!input || !this.current) return;
      input.onchange = function () {
        var file = input.files && input.files[0];
        input.value = '';
        if (!file) return;
        file.text().then(function (text) {
          var wb = self.current;
          var parsed = Wordbooks.parseTxt(text, wb.language);
          var seen = new Set(wb.words.map(function (w) { return w.word.toLowerCase(); }));
          var added = parsed.words.filter(function (w) {
            var k = w.word.toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          wb.words = wb.words.concat(added);
          Wordbooks.touch(wb);
          self.renderEditorWordList();
          global.alert('已添加 ' + added.length + ' 个新单词（跳过重复 ' + (parsed.words.length - added.length) + ' 个）');
        }).catch(function (e) { global.alert('导入失败：' + e.message); });
      };
      input.click();
    },
    showExportDialog: function (id) {
      var wb = Wordbooks.get(id != null ? id : this.current && this.current.id);
      if (!wb) return;
      var format = global.prompt('导出"' + wb.name + '"\n\n1 - JSON（可重新导入）\n2 - TXT（易于编辑）\n\n请输入 1 或 2：');
      if (format === '1') Wordbooks.exportJson(wb.id);
      else if (format === '2') Wordbooks.exportTxt(wb.id);
    },

    /** "加入词本" from browse: pick one of this language's wordbooks. */
    addEntryToWordbook: function (entry, lang) {
      var books = Wordbooks.list(lang);
      this.pendingEntry = { entry: entry, lang: lang };
      if (!books.length) {
        if (!global.confirm('还没有' + langName(lang) + '单词本，现在创建一个吗？')) return;
        var wb = this.createNewWordbook(lang);
        if (wb) this.addPendingTo(wb.id);
        return;
      }
      $('wordbookSelectList').innerHTML = books.map(function (wb) {
        return '<button type="button" class="wordbook-select-item" data-wordbook-pick="' + esc(String(wb.id)) + '">'
          + '<span class="msr" aria-hidden="true">auto_stories</span><span class="wordbook-select-name">' + esc(wb.name) + '</span>'
          + '<span class="wordbook-select-count num">' + wb.wordCount + ' 词</span></button>';
      }).join('');
      $('wordbookSelectDialog').classList.remove('hidden');
    },
    addPendingTo: function (id) {
      var wb = Wordbooks.get(id);
      var pending = this.pendingEntry;
      this.hideWordbookSelectDialog();
      if (!wb || !pending) return;
      var e = pending.entry;
      if (wb.words.some(function (w) { return w.word === e.word; })) {
        global.alert('"' + e.word + '" 已经在"' + wb.name + '"里了');
        return;
      }
      var row = { word: e.word, zh: e.zh };
      if (e.en) row.en = e.en;
      wb.words.push(row);
      Wordbooks.touch(wb);
      if (global.App && global.App.toast) global.App.toast('已加入「' + wb.name + '」');
    },
    hideWordbookSelectDialog: function () {
      var d = $('wordbookSelectDialog');
      if (d) d.classList.add('hidden');
    },

    bind: function () {
      var self = this;
      var list = $('editorWordList');
      if (list) {
        list.addEventListener('change', function (event) {
          var box = event.target.closest('.word-checkbox');
          if (!box) return;
          var i = Number(box.dataset.index);
          if (box.checked) self.selected.add(i); else self.selected.delete(i);
          self.updateBatchActionsVisibility();
        });
        list.addEventListener('click', function (event) {
          var edit = event.target.closest('[data-edit]');
          if (edit) { self.editWord(Number(edit.dataset.edit)); return; }
          var del = event.target.closest('[data-delete]');
          if (del) self.deleteWord(Number(del.dataset.delete));
        });
      }
      var form = $('wordEditForm');
      if (form) form.addEventListener('submit', function (event) { event.preventDefault(); self.saveWordEdit(); });
      var pick = $('wordbookSelectList');
      if (pick) pick.addEventListener('click', function (event) {
        var btn = event.target.closest('[data-wordbook-pick]');
        if (btn) self.addPendingTo(btn.dataset.wordbookPick);
      });
    }
  };

  // 社区模块按旧名调用的两个入口
  var WordbookManager = {
    parseTxtWordbook: function (text, lang) { return Wordbooks.parseTxt(text, lang); }
  };

  global.Wordbooks = Wordbooks;
  global.WordbookEditor = WordbookEditor;
  global.WordbookManager = WordbookManager;

  if (typeof document !== 'undefined' && document.addEventListener) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { WordbookEditor.bind(); });
    else WordbookEditor.bind();
  }
})(typeof window !== 'undefined' ? window : globalThis);
