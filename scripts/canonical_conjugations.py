#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rewrite a conjugation data file into the shared `conjugations/1` shape.

    python3 scripts/canonical_conjugations.py            # all four languages
    python3 scripts/canonical_conjugations.py de fr      # just these

The contract is docs/data-schema.md (`conjugations/1`).  This script is the one
place that knows how each language's conjugation table is laid out — person
labels, tense names, mood groups, imperative quirks, French elision — so the
feature code (conjugation-app.js, typing-game-app.js) holds no per-language
tables and reads all of it from the data's `meta` / `persons` / `tenses`.

It accepts either input shape and is idempotent:

  * legacy  — `const X = [ {infinitive, tenses:{k:{type, group_label,
              tense_label, forms}}, chinese, english, frequency, …}, … ]`
              (what scripts/build_{german,english,french}_conjugations.py emit);
  * canonical — a file this script already wrote.  Verbs pass through
              unchanged except that `freq` / `zh` / `en` are refreshed from
              data/vocab/<code>.js, and meta / persons / tenses are rebuilt
              from LANGS below.

The Italian generator (build_it50k_conjugations.py) is not in the repo, so the
canonical data/it-conjugations.js is the source of truth for Italian.
The builders for the other three languages call `canonicalize(code)` after
writing their output.
"""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_module import register_footer  # noqa: E402
from vocab_schema import read_vocab  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SCHEMA = 'conjugations/1'
PKEYS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']
HEADER_MARK = '// conjugations/1'


def T(key, group, label, zh, type_='person', time=None, **extra):
    """One `tenses[]` row.  groupLabel is filled from the language's groups."""
    row = {'key': key, 'group': group, 'label': label, 'zh': zh, 'type': type_}
    if time:
        row['time'] = time
    row.update(extra)
    return row


# ---------------------------------------------------------------------------
# Per-language tables (moved here from conjugation-app.js / typing-game-app.js)
# ---------------------------------------------------------------------------
#   persons    p1..p6: legacy person key, display label, Chinese, pronouns the
#              grader also accepts in front of the form ("io parlo").
#   groups     mood rows of the tense matrix, in display order.
#   tenses     display order.  Optional per tense:
#                time    'present'|'past'|'future' column of the matrix (tenses
#                        without one are listed under 其他时态)
#                omit    persons that do not exist in this tense (hidden rows)
#                labels  person-label overrides (Italian imperative Lei / Loro)
#                subject true: tables print the subject with the form (French)
#                from    legacy key + slot the value is read from (splits)
LANGS = {
    'it': {
        'file': 'data/it-conjugations.js',
        'const': 'CONJUGATIONS_IT',
        'name': 'Coniugazione dei verbi italiani',
        'builder': 'scripts/canonical_conjugations.py',
        'sources': [
            'scripts/build_it50k_conjugations.py (no longer in the repo) over data/it50k-verb-lemmas.json',
            'scripts/fix_italian_conjugations.py repairs (auxiliaries, imperativo negativo, participles; '
            'applied before the conjugations/1 conversion, retired since)',
            'zh / freq: data/vocab/it.js',
        ],
        'licences': ['early project data, per-field provenance not recorded (see ATTRIBUTION.md)'],
        'persons': [
            ('io', 'io', '我', ['io']),
            ('tu', 'tu', '你', ['tu']),
            ('lui_lei', 'lui / lei', '他/她', ['lui', 'lei']),
            ('noi', 'noi', '我们', ['noi']),
            ('voi', 'voi', '你们', ['voi']),
            ('loro', 'loro', '他们', ['loro']),
        ],
        'groups': [
            ('indicativo', 'Indicativo', '直陈式'),
            ('condizionale', 'Condizionale', '条件式'),
            ('congiuntivo', 'Congiuntivo', '虚拟式'),
            ('imperativo', 'Imperativo', '命令式'),
            ('infinito', 'Infinito', '不定式'),
            ('gerundio', 'Gerundio', '副动词'),
            ('participio', 'Participio', '分词'),
        ],
        'tenses': [
            T('indicativo_presente', 'indicativo', 'Presente', '直陈式现在时', time='present', level='A1'),
            T('indicativo_passato_prossimo', 'indicativo', 'Passato prossimo', '直陈式近过去时', time='past', level='A1'),
            T('indicativo_imperfetto', 'indicativo', 'Imperfetto', '直陈式未完成过去时', time='past', level='A2'),
            T('indicativo_trapassato_prossimo', 'indicativo', 'Trapassato prossimo', '直陈式近愈过去时', time='past', level='B1'),
            T('indicativo_passato_remoto', 'indicativo', 'Passato remoto', '直陈式远过去时', time='past', level='B2'),
            T('indicativo_trapassato_remoto', 'indicativo', 'Trapassato remoto', '直陈式远愈过去时', time='past', level='C1'),
            T('indicativo_futuro_semplice', 'indicativo', 'Futuro semplice', '直陈式简单将来时', time='future', level='A2'),
            T('indicativo_futuro_anteriore', 'indicativo', 'Futuro anteriore', '直陈式先将来时', time='future', level='B1'),
            T('condizionale_presente', 'condizionale', 'Presente', '条件式现在时', time='present', level='A2'),
            T('condizionale_passato', 'condizionale', 'Passato', '条件式过去时', time='past', level='B1'),
            T('congiuntivo_presente', 'congiuntivo', 'Presente', '虚拟式现在时', time='present', level='B1'),
            T('congiuntivo_passato', 'congiuntivo', 'Passato', '虚拟式过去时', time='past', level='B1'),
            T('congiuntivo_imperfetto', 'congiuntivo', 'Imperfetto', '虚拟式未完成过去时', time='past', level='B1'),
            T('congiuntivo_trapassato', 'congiuntivo', 'Trapassato', '虚拟式愈过去时', time='past', level='B2'),
            T('imperativo_affermativo', 'imperativo', 'Affermativo', '命令式（肯定）', time='present', level='A2',
              omit=['p1'], labels={'p3': 'Lei', 'p6': 'Loro'}),
            T('imperativo_non', 'imperativo', 'Negativo', '命令式（否定）', time='present', level='A2',
              omit=['p1'], labels={'p3': 'Lei', 'p6': 'Loro'}),
            T('infinito', 'infinito', 'Infinito', '不定式', 'single', level='A1', **{'from': ('infinito_gerundio', 0)}),
            T('gerundio', 'gerundio', 'Gerundio', '副动词', 'single', level='A2', **{'from': ('infinito_gerundio', 2)}),
            T('participio_presente', 'participio', 'Presente', '现在分词', 'single', level='B2', **{'from': ('participio', 0)}),
            T('participio_passato', 'participio', 'Passato', '过去分词', 'single', level='A1', **{'from': ('participio', 1)}),
        ],
        'placeholders': {'lookup': '例如：essere / sono / fossi / stato', 'typing': '例如：parlo / ho parlato'},
        'x': [],
    },
    'de': {
        'file': 'data/de-conjugations.js',
        'const': 'CONJUGATIONS_DE',
        'name': 'Deutsche Verbkonjugation',
        'builder': 'scripts/build_german_conjugations.py',
        'sources': [
            'en.wiktionary via wiktextract / kaikki.org',
            'german-pos-dict / Morphy (cross-check)',
            'zh: data/vocab/de.js with an EN->ZH pivot through data/vocab/en.js',
            'rank: wordfreq over the inflected paradigm; freq: data/vocab/de.js',
        ],
        'licences': ['CC BY-SA 4.0 (Wiktionary / wiktextract)', 'CC BY-SA 4.0 (german-pos-dict)', 'MIT (wordfreq)'],
        'persons': [
            ('ich', 'ich', '我', ['ich']),
            ('du', 'du', '你', ['du']),
            ('er_sie_es', 'er / sie / es', '他/她/它', ['er', 'sie', 'es']),
            ('wir', 'wir', '我们', ['wir']),
            ('ihr', 'ihr', '你们', ['ihr']),
            ('sie', 'sie', '他们/您', ['sie', 'Sie']),
        ],
        'groups': [
            ('indikativ', 'Indikativ', '直陈式'),
            ('konjunktiv', 'Konjunktiv', '虚拟式'),
            ('imperativ', 'Imperativ', '命令式'),
            ('infinit', 'Infinit', '非限定形式'),
        ],
        'tenses': [
            T('indikativ_praesens', 'indikativ', 'Präsens', '现在时', time='present', level='A1'),
            T('indikativ_praesens_nebensatz', 'indikativ', 'Präsens (Nebensatz)', '现在时（从句语序）', time='present', level='A2'),
            T('indikativ_perfekt', 'indikativ', 'Perfekt', '现在完成时', time='past', level='A1'),
            T('indikativ_praeteritum', 'indikativ', 'Präteritum', '过去时', time='past', level='A2'),
            T('indikativ_plusquamperfekt', 'indikativ', 'Plusquamperfekt', '过去完成时', time='past', level='B1'),
            T('indikativ_futur_i', 'indikativ', 'Futur I', '第一将来时', time='future', level='A2'),
            T('indikativ_futur_ii', 'indikativ', 'Futur II', '第二将来时', time='future', level='B2'),
            T('konjunktiv_i', 'konjunktiv', 'Konjunktiv I', '第一虚拟式', time='present', level='B2'),
            T('konjunktiv_i_perfekt', 'konjunktiv', 'Konjunktiv I Perfekt', '第一虚拟式完成时', time='past', level='C1'),
            T('konjunktiv_ii', 'konjunktiv', 'Konjunktiv II', '第二虚拟式', time='present', level='B1'),
            T('konjunktiv_ii_perfekt', 'konjunktiv', 'Konjunktiv II Perfekt', '第二虚拟式完成时', time='past', level='B1'),
            T('imperativ', 'imperativ', 'Imperativ', '命令式', time='present', level='A1',
              omit=['p1', 'p3'], labels={'p6': 'Sie'}),
            T('infinitiv', 'infinit', 'Infinitiv', '不定式', 'single', level='A1'),
            T('zu_infinitiv', 'infinit', 'zu + Infinitiv', 'zu 不定式', 'single', level='A2'),
            T('partizip_i', 'infinit', 'Partizip I', '第一分词', 'single', level='B1'),
            T('partizip_ii', 'infinit', 'Partizip II', '第二分词', 'single', level='A1'),
        ],
        'placeholders': {'lookup': '例如：sein / bin / war / gewesen', 'typing': '例如：bin / war / gewesen'},
        'x': ['auxiliary', 'verbClass', 'separable', 'separablePrefix', 'separablePrefixDisplay',
              'separableBase', 'konjunktivIiType', 'konjunktivIiSynthetischSelten', 'note'],
    },
    'en': {
        'file': 'data/en-conjugations.js',
        'const': 'CONJUGATIONS_EN',
        'name': 'English verb conjugation',
        'builder': 'scripts/build_english_conjugations.py',
        'sources': [
            'headwords: data/vocab/en.js; forms: hand table + lemminflect',
            'zh: ECDICT verb senses; rank: wordfreq Zipf of unambiguous verb forms; freq: data/vocab/en.js',
        ],
        'licences': ['MIT (lemminflect)', 'MIT (wordfreq)', 'ECDICT (see ATTRIBUTION.md)'],
        'persons': [
            ('i', 'I', '我', ['I']),
            ('you', 'you', '你', ['you']),
            ('he_she_it', 'he / she / it', '他/她/它', ['he', 'she', 'it']),
            ('we', 'we', '我们', ['we']),
            ('you_pl', 'you (pl.)', '你们', ['you']),
            ('they', 'they', '他们', ['they']),
        ],
        'groups': [
            ('indicative', 'Indicative', '陈述式'),
            ('conditional', 'Conditional', '条件式'),
            ('imperative', 'Imperative', '命令式'),
            ('nonfinite', 'Non-finite', '非限定形式'),
        ],
        'tenses': [
            T('indicative_present_simple', 'indicative', 'Present simple', '一般现在时', time='present', level='A1'),
            T('indicative_present_continuous', 'indicative', 'Present continuous', '现在进行时', time='present', level='A1'),
            T('indicative_present_perfect', 'indicative', 'Present perfect', '现在完成时', time='present', level='A2'),
            T('indicative_present_perfect_continuous', 'indicative', 'Present perfect continuous', '现在完成进行时', time='present', level='B1'),
            T('indicative_past_simple', 'indicative', 'Past simple', '一般过去时', time='past', level='A1'),
            T('indicative_past_continuous', 'indicative', 'Past continuous', '过去进行时', time='past', level='A2'),
            T('indicative_past_perfect', 'indicative', 'Past perfect', '过去完成时', time='past', level='B1'),
            T('indicative_past_perfect_continuous', 'indicative', 'Past perfect continuous', '过去完成进行时', time='past', level='B2'),
            T('indicative_future_will_simple', 'indicative', 'Future will simple', '一般将来时', time='future', level='A2'),
            T('indicative_future_will_continuous', 'indicative', 'Future will continuous', '将来进行时', time='future', level='B1'),
            T('indicative_future_will_perfect', 'indicative', 'Future will perfect', '将来完成时', time='future', level='B2'),
            T('indicative_future_will_perfect_continuous', 'indicative', 'Future will perfect continuous', '将来完成进行时', time='future', level='C1'),
            T('conditional_present', 'conditional', 'Present', '条件式（一般）', time='present', level='A2'),
            T('conditional_continuous', 'conditional', 'Continuous', '条件式（进行）', time='present', level='B1'),
            T('conditional_perfect', 'conditional', 'Perfect', '条件式（完成）', time='past', level='B1'),
            T('conditional_perfect_continuous', 'conditional', 'Perfect continuous', '条件式（完成进行）', time='past', level='B2'),
            T('imperative', 'imperative', 'Imperative', '命令式', 'single', time='present', level='A1'),
            T('nonfinite_base', 'nonfinite', 'Base / infinitive', '动词原形', 'single', level='A1'),
            T('nonfinite_past', 'nonfinite', 'Past', '过去式', 'single', level='A1'),
            T('nonfinite_past_participle', 'nonfinite', 'Past participle', '过去分词', 'single', level='A1'),
            T('nonfinite_present_participle', 'nonfinite', 'Present participle / gerund', '现在分词 / 动名词', 'single', level='A1'),
        ],
        'placeholders': {'lookup': '例如：be / am / was / been', 'typing': '例如：am / was / have been'},
        'x': [],
    },
    'fr': {
        'file': 'data/fr-conjugations.js',
        'const': 'CONJUGATIONS_FR',
        'name': 'Conjugaison française',
        'builder': 'scripts/build_french_conjugations.py',
        'sources': [
            'Wiktionary / Wiktextract via kaikki.org (simple tenses, participles, auxiliaries, aspirate h)',
            'Lexique 3.83 (corpus rank, participle agreement, spelling variants)',
            'compound tenses, reflexive layer and regular-paradigm engine: scripts/build_french_conjugations.py',
            'zh: hand-reviewed, new verbs via ECDICT pivot; freq: data/vocab/fr.js',
        ],
        'licences': ['CC BY-SA 4.0 (Wiktionary / Wiktextract)', 'CC BY-SA 4.0 (Lexique 3.83)',
                     'ECDICT (see ATTRIBUTION.md)'],
        'persons': [
            ('je', 'je', '我', ['je']),
            ('tu', 'tu', '你', ['tu']),
            ('il_elle_on', 'il / elle / on', '他/她/on', ['il', 'elle', 'on']),
            ('nous', 'nous', '我们', ['nous']),
            ('vous', 'vous', '您/你们', ['vous']),
            ('ils_elles', 'ils / elles', '他们/她们', ['ils', 'elles']),
        ],
        'groups': [
            ('indicatif', 'Indicatif', '直陈式'),
            ('conditionnel', 'Conditionnel', '条件式'),
            ('subjonctif', 'Subjonctif', '虚拟式'),
            ('imperatif', 'Impératif', '命令式'),
            ('participe', 'Participe', '分词'),
            ('infinitif', 'Infinitif', '不定式'),
        ],
        'tenses': [
            T('indicatif_present', 'indicatif', 'Présent', '直陈式现在时', time='present', level='A1', subject=True),
            T('indicatif_passe_compose', 'indicatif', 'Passé composé', '复合过去时', time='past', level='A1', subject=True),
            T('indicatif_imparfait', 'indicatif', 'Imparfait', '未完成过去时', time='past', level='A2', subject=True),
            T('indicatif_plus_que_parfait', 'indicatif', 'Plus-que-parfait', '愈过去时', time='past', level='B1', subject=True),
            T('indicatif_passe_simple', 'indicatif', 'Passé simple', '简单过去时', time='past', level='B2', subject=True),
            T('indicatif_passe_anterieur', 'indicatif', 'Passé antérieur', '先过去时', time='past', level='C1', subject=True),
            T('indicatif_futur_simple', 'indicatif', 'Futur simple', '简单将来时', time='future', level='A2', subject=True),
            T('indicatif_futur_anterieur', 'indicatif', 'Futur antérieur', '先将来时', time='future', level='B1', subject=True),
            T('conditionnel_present', 'conditionnel', 'Présent', '条件式现在时', time='present', level='A2', subject=True),
            T('conditionnel_passe', 'conditionnel', 'Passé', '条件式过去时', time='past', level='B1', subject=True),
            T('subjonctif_present', 'subjonctif', 'Présent', '虚拟式现在时', time='present', level='B1', subject=True),
            T('subjonctif_passe', 'subjonctif', 'Passé', '虚拟式过去时', time='past', level='B1', subject=True),
            T('subjonctif_imparfait', 'subjonctif', 'Imparfait', '虚拟式未完成过去时', time='past', level='C1', subject=True),
            T('subjonctif_plus_que_parfait', 'subjonctif', 'Plus-que-parfait', '虚拟式愈过去时', time='past', level='C1', subject=True),
            T('imperatif_present', 'imperatif', 'Présent', '命令式现在时', time='present', level='A1',
              omit=['p1', 'p3', 'p6']),
            T('imperatif_passe', 'imperatif', 'Passé', '命令式过去时', time='past', level='C1',
              omit=['p1', 'p3', 'p6']),
            T('participe_present', 'participe', 'Présent', '现在分词', 'single', level='B1'),
            T('participe_passe', 'participe', 'Passé', '过去分词', 'single', level='A1'),
            T('infinitif_present', 'infinitif', 'Présent', '不定式', 'single', level='A1'),
            T('infinitif_passe', 'infinitif', 'Passé', '过去不定式', 'single', level='B2'),
        ],
        'placeholders': {'lookup': '例如：être / suis / étais / été',
                         'typing': "例如：suis / étais / ai été（j'ai été 也算对）"},
        # je + ai -> j'ai.  Forms are stored without the subject; the app derives
        # the elided spelling.  Verbs flagged x.aspirateH (h aspiré: je hais)
        # are listed in aspirateVerbs; `aspirate` is a prefix list kept from the
        # app for forms the flag does not cover.
        'elision': {
            'contract': {'p1': "j'"},
            'vowel': '^[aeiouyhàâäéèêëîïôöùûüœæ]',
            'aspirate': [
                'hair', 'haïr', 'hais', 'hait', 'haissons', 'haïssons', 'haissez', 'haïssez', 'haissent',
                'haïssent', 'hache', 'halte', 'hanche', 'hante', 'harcele', 'hasarde', 'hate', 'hâte',
                'hausse', 'heurte', 'hisse', 'hoche', 'honte', 'hue', 'hurle',
            ],
        },
        'x': ['model', 'auxiliary', 'auxiliaryAlt', 'participle', 'reflexive', 'defective', 'gaps',
              'aspirateH', 'corpusRank', 'frequencyBasis'],
    },
}


# ---------------------------------------------------------------------------
# Reading / writing
# ---------------------------------------------------------------------------

_CONST_RE = re.compile(r'const\s+(\w+)\s*=\s*')


def read_js(path):
    """Return (header_comment_lines, payload) of a conjugation data file.

    payload is a list (legacy shape) or a dict (conjugations/1)."""
    text = Path(path).read_text(encoding='utf-8')
    match = _CONST_RE.search(text)
    if not match:
        raise ValueError(f'{path}: no `const X = …` payload')
    payload, _ = json.JSONDecoder().raw_decode(text, match.end())
    header = []
    for line in text.splitlines():
        if not line.startswith('//'):
            break
        header.append(line)
    return header, payload


def verbs_of(path):
    """Verb list in conjugations/1 shape, whichever shape the file holds (for builders)."""
    _, payload = read_js(path)
    return payload['verbs'] if isinstance(payload, dict) else payload


def dumps(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))


def write_js(code, header, data):
    cfg = LANGS[code]
    own = [
        f'{HEADER_MARK} — see docs/data-schema.md. Canonicalised by scripts/canonical_conjugations.py;',
        f'// builder: {cfg["builder"]}. One verb per line.',
    ]
    keep = [line for line in header if not line.startswith(HEADER_MARK)
            and not line.startswith('// builder: ')]
    lines = own + keep
    out = '\n'.join(lines) + '\n'
    out += f'const {cfg["const"]} = {{"meta":{dumps(data["meta"])},\n'
    out += '"persons":' + dumps(data['persons']) + ',\n'
    out += '"tenses":[\n' + ',\n'.join(dumps(t) for t in data['tenses']) + '\n],\n'
    out += '"verbs":[\n' + ',\n'.join(dumps(v) for v in data['verbs']) + '\n]};\n'
    out += f"if (typeof module !== 'undefined' && module.exports) {{ module.exports = {cfg['const']}; }}\n"
    out += register_footer('conjugations', code, cfg['const'])
    path = ROOT / cfg['file']
    path.write_text(out, encoding='utf-8')
    return path


# ---------------------------------------------------------------------------
# Conversion
# ---------------------------------------------------------------------------

def clean_form(value):
    if value is None:
        return None
    s = str(value).strip()
    if not s or s.lower() == 'none':
        return None
    return s


def join_alternatives(values):
    """['a', 'b/c', '', 'a'] -> 'a/b/c' (order kept, duplicates and blanks dropped)."""
    seen = []
    for value in values:
        for part in str(value or '').split('/'):
            part = part.strip()
            if part and part.lower() != 'none' and part not in seen:
                seen.append(part)
    return '/'.join(seen) if seen else None


def build_header(code):
    cfg = LANGS[code]
    persons = [{'key': PKEYS[i], 'label': label, 'zh': zh, 'pronouns': pronouns}
               for i, (_old, label, zh, pronouns) in enumerate(cfg['persons'])]
    group_label = {g: label for g, label, _zh in cfg['groups']}
    tenses = []
    for row in cfg['tenses']:
        out = {'key': row['key'], 'group': row['group'], 'groupLabel': group_label[row['group']],
               'label': row['label'], 'zh': row['zh'], 'type': row['type']}
        for opt in ('level', 'time', 'omit', 'labels', 'subject'):
            if opt in row:
                out[opt] = row[opt]
        tenses.append(out)
    return persons, tenses


def legacy_tense_value(code, verb, row):
    """The canonical value of one tense, read from a legacy verb record."""
    cfg = LANGS[code]
    old_keys = [p[0] for p in cfg['persons']]
    src_key, slot = row.get('from', (row['key'], None))
    block = (verb.get('tenses') or {}).get(src_key)
    if not block:
        return None
    forms = block.get('forms')
    if row['type'] == 'person':
        if not isinstance(forms, dict):
            return None
        arr = [clean_form(forms.get(k)) for k in old_keys]
        return arr if any(arr) else None
    values = forms if isinstance(forms, list) else [forms]
    if slot is not None:
        if code == 'it' and row['key'] == 'participio_passato':
            # all agreement forms (ms fs mp fp); fall back on infinito_gerundio's participle
            agree = values[1:5] if len(values) > 1 else []
            if not join_alternatives(agree):
                ig = ((verb.get('tenses') or {}).get('infinito_gerundio') or {}).get('forms') or []
                agree = ig[1:2]
            return join_alternatives(agree)
        return join_alternatives(values[slot:slot + 1]) if slot < len(values) else None
    return join_alternatives(values)


def legacy_x(code, verb):
    cfg = LANGS[code]
    x = {}
    for key in cfg['x']:
        if key not in verb:
            continue
        value = verb[key]
        if isinstance(value, dict):
            value = {k: v for k, v in value.items() if v not in ('', None)}
        if value in ('', None, [], {}, False):
            continue
        x[key] = value
    if code == 'it':
        # auxiliary, read off the stored passato prossimo ("sono stato" / "ho parlato")
        pp = ((verb.get('tenses') or {}).get('indicativo_passato_prossimo') or {}).get('forms') or {}
        aux = []
        for alt in str(pp.get('io') or '').split('/'):
            head = alt.strip().split(' ')[0]
            name = {'sono': 'essere', 'ho': 'avere'}.get(head)
            if name and name not in aux:
                aux.append(name)
        if aux:
            x['auxiliary'] = aux
        part = ((verb.get('tenses') or {}).get('participio') or {}).get('forms') or []
        slots = dict(zip(('ms', 'fs', 'mp', 'fp'), part[1:5]))
        slots = {k: v for k, v in slots.items() if clean_form(v)}
        if len(slots) > 1:
            x['participle'] = slots
    return x


def from_legacy(code, verb, tenses_cfg):
    tenses = {}
    for row in tenses_cfg:
        value = legacy_tense_value(code, verb, row)
        if value is not None:
            tenses[row['key']] = value
    out = {'word': verb['infinitive'], 'rank': verb.get('rank'), 'freq': None,
           'zh': (verb.get('chinese') or '').strip(), 'en': (verb.get('english') or '').strip(),
           'tenses': tenses}
    x = legacy_x(code, verb)
    if x:
        out['x'] = x
    return out


# Broken English glosses in the Italian source ("to ♪").
EN_FIX = {'it': {'mimare': 'to mime', 'mondare': 'to peel, to cleanse',
                 'pestare': 'to pound, to tread on', 'bisticciare': 'to squabble'}}

# Italian verbs that neither data/vocab/it.js nor the pivot can gloss (their
# English senses are phrasal or British-spelled).  Hand-reviewed; marked
# x.zhSource = 'manual' and recomputed like the pivot, so a vocab gloss wins.
ZH_FIX = {'it': {
    'ripulire': '清理干净', 'vergognare': '感到羞愧', 'terrorizzare': '使恐惧',
    'incasinare': '弄乱', 'specializzare': '使专门化；专攻', 'bacare': '被虫蛀',
    'riprovare': '再试', 'imbattere': '偶然遇到', 'innervosire': '使烦躁',
    'spassare': '玩乐', 'immischiare': '牵涉；插手', 'avverare': '实现',
    'risucchiare': '吸入', 'ammanettare': '给…戴上手铐',
    'pestare': '捣碎；踩', 'bisticciare': '争吵',
}}
CJK = re.compile('[\u3400-\u9fff]')


def _senses(gloss):
    out = []
    for sense in re.split(r'[,;/]', gloss or ''):
        s = re.sub(r'\(.*?\)', '', sense).strip()
        s = re.sub(r'^to\s+', '', s).strip()
        if s:
            out.append(s)
    return out


def pivot_zh(verbs):
    """Fallback Chinese gloss for Italian verbs data/vocab/it.js lacks.

    data/vocab/it.js is missing ~160 verb lemmas (even `parlare`), so their zh
    is borrowed from another language's conjugation table through the English
    gloss: the English verb itself (ECDICT verb senses), else a French / German
    verb whose first English sense equals one of the Italian senses, else an
    English vocab verb.  Only the first Chinese sense is kept, which limits the
    wrong-sense noise of the pivot.  The result is marked
    x.zhSource = 'pivot:<code>' so it can be audited and is replaced as soon as
    the vocab gains the word.  English pivots carry the homograph risk
    documented for ECDICT; treat them as provisional.
    """
    missing = [v for v in verbs if not v.get('zh')]
    if not missing:
        return
    tables = {}
    for code in ('fr', 'de'):
        _, payload = read_js(ROOT / LANGS[code]['file'])
        table = {}
        for v in (payload['verbs'] if isinstance(payload, dict) else []):
            senses = _senses(v.get('en'))
            segs = [z.strip() for z in re.split(r'[，,；;]', v.get('zh') or '') if z.strip()]
            if senses and segs and senses[0] not in table:
                table[senses[0]] = segs[0]
        tables[code] = table
    _, payload = read_js(ROOT / LANGS['en']['file'])
    en_table = {}
    for v in (payload['verbs'] if isinstance(payload, dict) else []):
        segs = [s.strip() for s in re.split(r'[，,；;]', v.get('zh') or '') if s.strip()]
        if segs:
            en_table[v['word']] = segs[0]
    tables['en'] = en_table
    en_vocab = {}
    for e in read_vocab('en')['entries']:
        if 'verb' in ([e.get('pos')] + (e.get('posAll') or [])) and e.get('zh'):
            segs = [s.strip() for s in re.split(r'[，,；;]', e['zh']) if s.strip()]
            en_vocab[e['word']] = segs[0]
    tables['en-vocab'] = en_vocab
    for v in missing:
        senses = _senses(v.get('en'))
        for code in ('en', 'fr', 'de', 'en-vocab'):
            hit = next((tables[code][s] for s in senses if s in tables[code]), None)
            if hit:
                v['zh'] = hit
                v.setdefault('x', {})['zhSource'] = 'pivot:' + code
                break


def order_verb(verb, tense_order):
    out = {'word': verb['word'], 'rank': verb['rank'], 'freq': verb.get('freq')}
    for key in ('zh', 'en'):
        if verb.get(key):
            out[key] = verb[key]
    out['tenses'] = {k: verb['tenses'][k] for k in tense_order if k in verb['tenses']}
    if verb.get('x'):
        out['x'] = verb['x']
    return out


def canonicalize(code, verbose=True):
    cfg = LANGS[code]
    path = ROOT / cfg['file']
    header, payload = read_js(path)
    persons, tenses = build_header(code)
    tense_order = [t['key'] for t in tenses]

    if isinstance(payload, dict):
        if payload.get('meta', {}).get('schema') != SCHEMA:
            raise ValueError(f'{path}: unknown object payload')
        verbs = [dict(v) for v in payload['verbs']]
    else:
        verbs = [from_legacy(code, v, cfg['tenses']) for v in payload]

    vocab = {e['word']: e for e in read_vocab(code)['entries']}
    missing_zh = []
    for v in verbs:
        entry = vocab.get(v['word'])
        v['freq'] = entry.get('freq') if entry else None
        if v['word'] in EN_FIX.get(code, {}):
            v['en'] = EN_FIX[code][v['word']]
        x = v.get('x') or {}
        if x.get('zhSource'):
            # a pivot / manual fallback is always recomputed (the vocab may have gained the word)
            v['zh'] = ''
            x.pop('zhSource')
            if not x:
                v.pop('x', None)
        if v.get('zh') and not CJK.search(v['zh']):
            v['zh'] = ''  # junk gloss (e.g. vocab "pest" for pestare)
        if not v.get('zh') and entry and entry.get('zh') and CJK.search(entry['zh']):
            v['zh'] = entry['zh']
        if not v.get('en') and entry and entry.get('en'):
            v['en'] = entry['en']
        if not v.get('zh') and v['word'] in ZH_FIX.get(code, {}):
            v['zh'] = ZH_FIX[code][v['word']]
            v.setdefault('x', {})['zhSource'] = 'manual'
    if code == 'it':
        pivot_zh(verbs)
    missing_zh = [v['word'] for v in verbs if not v.get('zh')]

    verbs.sort(key=lambda v: (v.get('rank') or 10 ** 9))
    for i, v in enumerate(verbs, 1):
        v['rank'] = i
    verbs = [order_verb(v, tense_order) for v in verbs]

    meta = {'schema': SCHEMA, 'lang': code, 'name': cfg['name'], 'count': len(verbs),
            'builder': cfg['builder'], 'sources': cfg['sources'], 'licences': cfg['licences'],
            'groups': [{'key': g, 'label': label, 'zh': zh} for g, label, zh in cfg['groups']],
            'placeholders': cfg['placeholders']}
    if cfg.get('elision'):
        elision = dict(cfg['elision'])
        elision['aspirateVerbs'] = [v['word'] for v in verbs if (v.get('x') or {}).get('aspirateH')]
        meta['elision'] = elision

    data = {'meta': meta, 'persons': persons, 'tenses': tenses, 'verbs': verbs}
    out = write_js(code, header, data)
    if verbose:
        print(f'{code}: {len(verbs)} verbs -> {out.relative_to(ROOT)} ({out.stat().st_size / 1e6:.2f} MB);'
              f' no freq: {sum(1 for v in verbs if v["freq"] is None)}; no zh: {len(missing_zh)}'
              + (f' {missing_zh[:20]}' if missing_zh else ''))
    return data


def main(argv):
    codes = argv or ['de', 'en', 'fr', 'it']  # it last: its zh fallback reads the others
    for code in codes:
        if code not in LANGS:
            raise SystemExit(f'unknown language {code!r}')
        canonicalize(code)


if __name__ == '__main__':
    main(sys.argv[1:])
