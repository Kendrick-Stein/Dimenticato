#!/usr/bin/env python3
"""清洗意大利语词库里的机翻重复释义。

机翻管线（enhance_translations*.py）在 en / zh 两个字段里留下了
三类垃圾，它们会直接漏进练习选项（如 strada 的英文释义是 "road road"）：

  1. token 级重复      "road road" / "China China China" / "丈夫 丈夫"
  2. 短语级对半重复    "High school high school" / "奶油奶油 奶油 奶油"
  3. 编号义项残留      "acid; acid (2); acid (3)" —— 释义没翻出来，
                       只剩带编号的同一释义（运行时 cleanGloss 会删 "(2)"，
                       但删完仍显示 "acid; acid; acid"，得在数据里去重）

处理规则（保守，只动确实重复的内容）：
  - 义项按 ";" 切开，逐义项清洗后按「忽略大小写」去重，保留首个写法；
  - 义项尾部 "(2)" / "（三）" / "[12]" 编号剥掉，剥空了整个义项丢弃；
  - 空白分词后：偶数对半重复折叠、相邻重复折叠；纯 CJK token 自身
    对半重复（"奶油奶油"→"奶油"）也折叠，但 LEGIT_AA 白名单里的真实
    叠词（妈妈、谢谢、常常）保留。英文单词不做字面折叠，
    避免碰 "Bonbon" 这类真实词形。
  - 大小写不自动归一：重复样本里 "China" / "Mediterranean" 本身就是
    专有名词，自动小写会改错。

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

NUMBERING_TAIL = re.compile(r'\s*[\(（\[]\d{1,3}[\)）\]]\s*$')
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


def clean_entries(entries):
    fixed_english = fixed_chinese = 0
    for entry in entries:
        for field in ('en', 'zh'):
            new_value, changed = clean_gloss(entry.get(field))
            if changed:
                entry[field] = new_value
                if field == 'en':
                    fixed_english += 1
                else:
                    fixed_chinese += 1
    return fixed_english, fixed_chinese


def main():
    dry_run = '--dry-run' in sys.argv
    data = vs.read_vocab('it')
    entries = data['entries']
    fixed_en, fixed_zh = clean_entries(entries)
    label = f'it.js: {len(entries)} 条，en 修 {fixed_en} 条，zh 修 {fixed_zh} 条'
    if dry_run:
        print(f'DRY-RUN {label}')
        return
    if not (fixed_en or fixed_zh):
        print(f'OK {label}（无改动，未写入）')
        return
    meta = data['meta']
    vs.write_vocab('it', entries, sources=meta['sources'], licences=meta['licences'],
                   builder=BUILDER, notes=meta.get('notes', ''))
    print(f'OK {label}')


if __name__ == '__main__':
    main()
