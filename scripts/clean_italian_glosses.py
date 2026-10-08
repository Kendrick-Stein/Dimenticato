#!/usr/bin/env python3
"""清洗意大利语词库里的机翻重复释义。

机翻管线（enhance_translations*.py）在 en / zh 两个字段里留下了
三类垃圾，它们会直接漏进练习选项（如 strada 的英文释义是 "road road"）：

  1. token 级重复      "road road" / "China China China" / "丈夫 丈夫"
  2. 短语级对半重复    "High school high school" / "奶油奶油 奶油 奶油"
  3. 编号义项残留      "acid; acid (2); acid (3)"、"好; (二); (三) 国家" —— 释义没翻出来，
                       只剩带编号的同一释义（运行时 cleanGloss 会删 "(2)"，
                       但删完仍显示 "acid; acid; acid"，得在数据里去重）

处理规则（保守，只动确实重复的内容）：
  - 义项按 ";" 切开，逐义项清洗后按「忽略大小写」去重，保留首个写法；
  - 义项尾部 "(2)" / "（三）" / "[12]" 编号剥掉，剥空了整个义项丢弃；
  - 空白分词后：偶数对半重复折叠、相邻重复折叠；纯 CJK token 自身
    对半重复（"奶油奶油"→"奶油"）也折叠，但 LEGIT_AA 白名单里的真实
    叠词（妈妈、谢谢、常常）保留。英文单词不做字面折叠，
    避免碰 "Bonbon" 这类真实词形。
  - 英文释义句首大写归一（normalise_en_case）：机翻把每个义项首字母都大写了
    （"Hand"、"Perhaps"、"Of course."）。只在有把握时改小写：首词小写形式是
    英语词库（data/vocab/en.js）的词头（含并入的屈折形式与复数）、且大写形式不是（English / Monday 这类
    本来就大写的词库里是大写词头），或首词带常见普通词后缀（-ing / -ment …）；
    KEEP_CAP 里的月份、星期、民族宗教词（China、Turkey、Polish 这类大小写
    两义的词）不动；专名 / 缩写词条整条跳过。义项末尾的句号一并去掉。

处理对象：
  - data/vocab/it.js   （DIM_VOCAB.it，schema v1，见 docs/vocab-schema.md；
                         经 scripts/vocab_schema.py 的 read_vocab / write_vocab
                         读写，只改 en / zh，其余字段与词条顺序不动）

用法：
  python3 scripts/clean_italian_glosses.py           # 实际写入
  python3 scripts/clean_italian_glosses.py --dry-run # 只统计不写入

幂等：对已清洗的文件再跑一遍是 no-op。
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import vocab_schema as vs  # noqa: E402

BUILDER = 'scripts/clean_italian_glosses.py'

NUMBERING_TAIL = re.compile(r'\s*[\(（\[](?:\d{1,3}|[一二三四五六七八九十]{1,2})[\)）\]]\s*$')
# 以中文编号开头的义项「(二)」「(三) 国家」：机翻把 "(2)" / "(3) ..." 编号义项译坏的残留，
# 编号后的文字与词义无关（la / su / molto 都被带出了「国家」），整个义项丢弃。
# 编号后必须是空白或结尾：「(一)群」「(一)双」是量词说明，是合法释义，不能动。
NUMBERED_RESIDUE = re.compile(r'^\s*[\(（][一二三四五六七八九十]{1,2}[\)）](?:\s|$)')
# 残留剥掉后只剩机翻碎片、没有可用中文的词条，手工补释义。
MANUAL_ZH = {
    'vermiglio': '朱红色的',   # 原文 "ver; (二)"
}
CJK_RANGE = ('\u4e00', '\u9fff')


def casefold_tokens(tokens):
    return [t.casefold() for t in tokens]


def collapse_round(tokens):
    """一轮折叠：偶数对半重复（忽略大小写）+ 相邻重复。"""
    while len(tokens) >= 2 and len(tokens) % 2 == 0:
        half = len(tokens) // 2
        if casefold_tokens(tokens[:half]) == casefold_tokens(tokens[half:]):
            tokens = tokens[:half]
        else:
            break
    out = []
    for tok in tokens:
        if out and out[-1].casefold() == tok.casefold():
            continue
        out.append(tok)
    return out


def collapse_token_repeats(tokens):
    """不动点折叠：对半/相邻/CJK token 自重复互相催化，直到稳定。

    只做一轮会在嵌套重复上停半路："赢赢赢赢" 先折成 "赢赢"，但不再往下；
    "Teen Teen…Te Te…" 在某一层对半不相等就提前 break。所以循环到不变为止。
    """
    seen = set()
    while True:
        tokens = [collapse_cjk_token(t) for t in tokens]
        tokens = collapse_round(tokens)
        key = tuple(tokens)
        if key in seen:
            return tokens
        seen.add(key)


def is_cjk(token):
    return bool(token) and all(CJK_RANGE[0] <= ch <= CJK_RANGE[1] for ch in token)


# 真实的 AA 型叠词：单字恰好重复两次在中文里极常见（妈妈、谢谢、常常），
# 不能按「自身重复」一刀切折叠 —— 此前 "Mother" 的释义就被折成了 "妈"。
# 取自德/英/法三份人工词源里出现过的 AA 词（去掉人名与怪异项），外加
# 意语词库里确认为真词的几个。不在表里的 AA（臂臂、锂锂、笔笔）是机翻
# 垃圾，照常折叠。
LEGIT_AA = frozenset('''
两两 人人 仅仅 偏偏 公公 凛凛 刚刚 可可 呱呱 呵呵 哈哈 啊啊 喃喃 夜夜 天天
太太 头头 奶奶 妈妈 妞妞 妹妹 姐姐 常常 往往 恰恰 惺惺 扬扬 拜拜 整整 时时
毛毛 汪汪 浩浩 混混 熊熊 爷爷 爸爸 爹爹 狒狒 猩猩 瑟瑟 痘痘 皑皑 睽睽 种种
谢谢 等等 紧紧 统统 贝贝 足足 迢迢 高高 鼎鼎 宝宝 舅舅 娃娃 尝尝 单单 点点 哥哥
弟弟 叔叔 伯伯 婆婆 渐渐 慢慢 默默 悄悄 轻轻 静静 稍稍 蝈蝈 蛐蛐 星星 猫猫
'''.split())


def collapse_cjk_token(token):
    """纯 CJK token 自身重复：胜利胜利胜利 → 胜利、奶油奶油 → 奶油。

    取最小的重复单元（整 token 必须恰好是它的整数次重复），英文单词
    不做字面折叠，避免碰 "Bonbon" 这类真实词形。LEGIT_AA 里的叠词保留。
    """
    if not is_cjk(token) or token in LEGIT_AA:
        return token
    n = len(token)
    for unit in range(1, n // 2 + 1):
        if n % unit:
            continue
        if token[:unit] * (n // unit) == token:
            return token[:unit]
    return token


def clean_sense(sense):
    """清洗单个义项：剥尾部编号 + 折叠重复 token。返回空串表示整个丢弃。"""
    if NUMBERED_RESIDUE.match(sense):
        return ''
    body = NUMBERING_TAIL.sub('', sense.strip()).strip()
    if not body:
        return ''
    tokens = collapse_token_repeats(body.split())
    return ' '.join(tokens)


def clean_gloss(raw):
    """按 ";" 切义项 → 逐个清洗 → 忽略大小写去重。返回 (新值, 是否有改动)。"""
    if raw is None:
        return raw, False
    text = str(raw)
    if not text.strip():
        return raw, False

    cleaned = []
    seen = set()
    for sense in text.split(';'):
        cleaned_sense = clean_sense(sense)
        if not cleaned_sense:
            continue
        key = cleaned_sense.casefold()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(cleaned_sense)

    if not cleaned:
        return raw, False   # 清洗后全空（理论到不了）：原文保底
    rebuilt = '; '.join(cleaned)
    return rebuilt, rebuilt != text


# 首词保持大写：月份 / 星期 / 称谓 / 民族宗教词，以及小写形式是另一个词的专名
# （China 瓷器、Turkey 火鸡、Polish 擦亮、March 行进、May 可以）。
KEEP_CAP = frozenset('''
January February March April May June July August September October November December
Monday Tuesday Wednesday Thursday Friday Saturday Sunday
I Mr Mrs Ms Dr St Lord God Christ Christian Catholic Protestant Bible Easter Christmas Mass
Jew Jewish Nazi Latin Greek Roman Pole Polish China Turkey Internet Renaissance
'''.split())
COMMON_SUFFIX = re.compile(r'(?:ing|ed|ment|ments|ness|ity|ities|tion|tions|sion|sions|ure|ly|able|ible|'
                           r'ous|ive|ful|less|er|ers|or|ors|ism|ist|ists|ance|ence|ship|hood)$')
FIRST_WORD = re.compile(r"^([A-Z][a-z][a-z'-]*)")
_EN_HEADWORDS = None


def en_headwords():
    global _EN_HEADWORDS
    if _EN_HEADWORDS is None:
        words = set()
        for e in vs.read_vocab('en')['entries']:
            words.add(e['word'])
            legacy = e.get('legacyWord') or []
            words.update([legacy] if isinstance(legacy, str) else legacy)  # merged inflections
        _EN_HEADWORDS = words
    return _EN_HEADWORDS


def is_common_word(word, headwords):
    low = word.lower()
    if low in headwords or COMMON_SUFFIX.search(word):
        return True
    # plurals of headwords: allergies, tomatoes, bridges
    return (low.endswith('ies') and low[:-3] + 'y' in headwords) or \
        (low.endswith('es') and low[:-2] in headwords) or \
        (low.endswith('s') and low[:-1] in headwords)


def normalise_en_sense(sense):
    sense = sense.strip()
    if re.search(r'[a-z]{2}\.$', sense) and not sense.endswith('etc.') and sense.count('.') == 1:
        sense = sense[:-1]
    m = FIRST_WORD.match(sense)
    if not m:
        return sense
    word = m.group(1)
    headwords = en_headwords()
    if word in KEEP_CAP or word in headwords:
        return sense
    if is_common_word(word, headwords):
        return sense[0].lower() + sense[1:]
    return sense


def normalise_en_case(text, pos=None):
    """'Hand; Palm' -> 'hand; palm'; proper nouns and abbreviations untouched."""
    if not text or pos in ('properNoun', 'abbreviation'):
        return text
    return '; '.join(normalise_en_sense(s) for s in text.split(';') if s.strip())


def clean_entries(entries):
    fixed_english = fixed_chinese = 0
    for entry in entries:
        manual = MANUAL_ZH.get(entry.get('word'))
        if manual and entry.get('zh') != manual:
            entry['zh'] = manual
            fixed_chinese += 1
        for field in ('en', 'zh'):
            new_value, changed = clean_gloss(entry.get(field))
            if changed:
                entry[field] = new_value
                if field == 'en':
                    fixed_english += 1
                else:
                    fixed_chinese += 1
        cased = normalise_en_case(entry.get('en'), entry.get('pos'))
        if cased != entry.get('en'):
            entry['en'] = cased
            fixed_english += 1
    return fixed_english, fixed_chinese


def main():
    dry_run = '--dry-run' in sys.argv
    data = vs.read_vocab('it')
    entries = data['entries']
    fixed_en, fixed_zh = clean_entries(entries)
    # 人工审校过的释义 / 词性 / 大小写修正（scripts/it_fixes/vocab.json，幂等）
    import italian_fixes
    reviewed = italian_fixes.apply_vocab(entries, data['meta'])
    label = (f'it.js: {len(entries)} 条，en 修 {fixed_en} 条，zh 修 {fixed_zh} 条，'
             f'人工修正 {reviewed} 条')
    if dry_run:
        print(f'DRY-RUN {label}')
        return
    if not (fixed_en or fixed_zh or reviewed):
        print(f'OK {label}（无改动，未写入）')
        return
    meta = data['meta']
    entries = [vs.clean_entry(e) for e in entries]
    vs.write_vocab('it', entries, sources=meta['sources'], licences=meta['licences'],
                   builder=BUILDER, notes=meta.get('notes', ''))
    print(f'OK {label}')


if __name__ == '__main__':
    main()
