#!/usr/bin/env python3
"""Canonical writer for verb-collocation data (docs/data-schema.md, collocations/1).

Every collocation generator hands its payload to ``write_collocations(code, data)``;
the payload may be the legacy shape the generators have always produced

    {meta: {prepositionOrder, totalVerbs, ...}, verbs: {slug: {display,
     prepositions: {key: ["<text> <中文>", ...]}, prepositionOrder, ...}},
     prepositions: {key: [slug, ...]}}

or an already canonical ``collocations/1`` payload.  ``canonicalize`` is
idempotent: running it on its own output changes nothing, so the CLI below can
re-normalise the shipped files at any time.

    python3 scripts/canonical_collocations.py            # rewrite all four files
    python3 scripts/canonical_collocations.py it de      # only these languages
    python3 scripts/canonical_collocations.py --scan     # report run-together words

Output (one verb / key per line):

    {meta:{schema:"collocations/1", lang, name, count, examples, builder,
           sources:[…], licences:[…], x?},
     keys:[{key, label, kind, case?, zh?, x?}],
     verbs:{<word>: {word, display?, level?, order:[key…],
                     keys:{<key>: [{text, zh, src?}]}, x?}},
     index:{<key>: [<word>…]},
     x?:{…}}

``src`` on an example is an index into ``meta.sources`` (same convention as
vocabulary entries).  Language extras live under ``x``:
  de  verbs[w].x.senses (structured Rektion rows), top-level x.nounVerb
      (Funktionsverbgefüge, itself collocations/1-shaped), meta.x.note
  en  verbs[w].x.zipf / x.senses, keys[i].x.particle, meta.x.keyNote
  fr  verbs[w].x.notes / x.nounCollocations / x.tatoeba (sentence ids)
"""
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data'
SCHEMA = 'collocations/1'

FILES = {code: DATA / f'{code}-collocations.js' for code in ('it', 'de', 'en', 'fr')}
LEGACY_FILES = {
    'it': DATA / 'verb-collocations-data.js',
    'de': DATA / 'german-collocations-data.js',
    'en': DATA / 'english-collocations-data.js',
    'fr': DATA / 'french-collocations-data.js',
}

NAMES = {
    'it': '意大利语动词搭配',
    'de': '德语动词的介词搭配（Rektion）',
    'en': '英语动词搭配与短语动词',
    'fr': '法语动词搭配',
}
BUILDERS = {
    'it': 'scripts/canonical_collocations.py',
    'de': 'scripts/build_german_extras.py',
    'en': 'scripts/build_english_collocations.py',
    'fr': 'scripts/build_french_extras.py',
}
IT_SOURCES = ['意汉动词介词搭配手册（扫描 OCR，出处未登记）']
IT_LICENCES = ['unverified']

CASE_LABEL = {'A': 'Akk.', 'D': 'Dat.', 'G': 'Gen.', 'N': 'Nom.'}
CASE_ZH = {'A': '第四格', 'D': '第三格', 'G': '第二格', 'N': '第一格'}
LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

# --------------------------------------------------------------------------
# example parsing
# --------------------------------------------------------------------------

IDEO = re.compile(r'[㐀-䶿一-鿿豈-﫿]')
CJK_ANY = re.compile(r'[　-〿㐀-䶿一-鿿豈-﫿＀-￯]')
OPENERS = '“‘「『《【（〈'
SENTENCE_END = '.!?…»"\')'
# Italian dictionary OCR debris: LaTeX, POS headers, "verb+" stubs, page JSON
JUNK = re.compile(r'\$\$|[vV]\.\s?(?:tr|intr|rif|rfil|pron|aus|servile)|\[assol|[①-⑳]|[\[(]$'
                  r'|\+\s*$|^\s*[~∘✓{}]|"\w+":|^\(Verbo')
DANGLING_LATIN = re.compile(r'(?<=[。！？])[A-Za-z0-9+]+$')


def _ascii_punct(text):
    """Fullwidth punctuation / digits that leaked into the target-language half."""
    out = []
    for ch in text:
        if '！' <= ch <= '～':
            ch = unicodedata.normalize('NFKC', ch)
        elif ch == '　':
            ch = ' '
        elif ch in '。':
            ch = '.'
        out.append(ch)
    return ''.join(out)


def split_example(raw):
    """'Text 中文' -> (text, zh).  zh is '' when there is no Chinese half.

    The split point is the first CJK ideograph (or a CJK opening bracket/quote
    directly in front of one).  A Latin token glued to the Chinese ("Tom的眼睛",
    "3个") belongs to the gloss when the target half already ended its sentence.
    """
    s = str(raw or '').replace('**', '').strip()
    m = IDEO.search(s)
    if not m:
        return s, ''
    i = m.start()
    while i > 0 and s[i - 1] in OPENERS:
        i -= 1
    if i > 0 and re.match(r'[A-Za-z0-9]', s[i - 1]):
        j = i
        while j > 0 and not s[j - 1].isspace():
            j -= 1
        head = s[:j].rstrip()
        if j > 0 and head and head[-1] in SENTENCE_END + '!?':
            i = j
    text, zh = s[:i].strip(), s[i:].strip()
    # fullwidth sentence punctuation before the split belongs to the text
    return text, zh


def clean_example(ex):
    """Normalise one example to {text, zh[, src]} or None when it is debris."""
    if isinstance(ex, dict):
        text, zh = str(ex.get('text') or '').replace('**', '').strip(), str(ex.get('zh') or '').strip()
        if not zh or CJK_ANY.search(text):
            t2, z2 = split_example(text + ' ' + zh)
            text, zh = t2, z2
        src = ex.get('src')
    else:
        text, zh = split_example(ex)
        src = None
    text = _ascii_punct(text)
    text = re.sub(r'[\s·•∘]+$', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    zh = DANGLING_LATIN.sub('', zh).strip()
    if not text or not zh or JUNK.search(text):
        return None
    if not re.search(r'[A-Za-zÀ-ɏ]', text) or CJK_ANY.search(text) or not IDEO.search(zh):
        return None
    out = {'text': text, 'zh': zh}
    if isinstance(src, int):
        out['src'] = src
    return out


# --------------------------------------------------------------------------
# data fixes (deterministic, idempotent; found by --scan and reviewed by hand)
# --------------------------------------------------------------------------

# Italian OCR run-togethers: missing spaces inside the target sentence.
TEXT_FIXES = {
    'it': [
        ('qualcunoa sé stesso', 'qualcuno a sé stesso'),
        ('Scusami,ho', 'Scusami, ho'),
        ('Levami(=ame)i vestiti', 'Levami (=a me) i vestiti'),
        ('Mi(=ame) hanno', 'Mi (=a me) hanno'),
        ('Procurami(=ame)un', 'Procurami (=a me) un'),
        ('Le(=alei)presento', 'Le (=a lei) presento'),
        ('qlcu.a un', 'qlcu. a un'),
        ('Si,li ho', 'Sì, li ho'),
        ('sie affermato', "s'è affermato"),
        ('con i compagni di lavaro', 'con i compagni di lavoro'),
        ('sarano ricompensati', 'saranno ricompensati'),
        ("luogo dlell'incidente", "luogo dell'incidente"),
        ('guardare a futuro', 'guardare al futuro'),
        ('SSicomplimentoconlei', 'Si complimentò con lei'),
        ('ricongiungerei figliconi genitori', 'ricongiungere i figli con i genitori'),
        ("Bisognatutelarel'ambientedall'inquinamento", "Bisogna tutelare l'ambiente dall'inquinamento"),
        ('una malatia', 'una malattia'),
        ('della fabrica', 'della fabbrica'),
        ('di amnici', 'di amici'),
        ('assemnblea', 'assemblea'),
    ],
}

# Regex fixes (pattern, replacement), applied after TEXT_FIXES.  Each must be
# idempotent: the output never matches the pattern again.
REGEX_FIXES = {
    'it': [
        # "Mi(=ame)hanno" -> "Mi (=a me) hanno"   (OCR glued the gloss bracket)
        (re.compile(r'\s*\(=\s*a\s?(me|te|lui|lei|noi|voi|loro)\)\s*'), r' (=a \1) '),
        # ",per" -> ", per"
        (re.compile(r',(?=[A-Za-zÀ-ÿ])'), ', '),
        # "Corroinufficio.." -> "...ufficio."  (but keep a real ellipsis)
        (re.compile(r'(?<!\.)\.\.(?!\.)'), '.'),
    ],
}

# Whole-token run-togethers, reviewed from `--scan` output (word-boundary match).
TOKEN_FIXES = {
    'it': {
        'gialloalnero': 'giallo al nero', 'giallocon': 'giallo con', 'lafatica': 'la fatica',
        'alnaso': 'al naso', 'mioconto': 'mio conto', 'addossareun': 'addossare un',
        'tavoloalla': 'tavolo alla', 'suocampo': 'suo campo', 'unascrivania': 'una scrivania',
        'daltavolo': 'dal tavolo', 'inpiedi': 'in piedi', 'unoscoglio': 'uno scoglio',
        'sullasbarra': 'sulla sbarra', 'unufficio': 'un ufficio', 'pensionea': 'pensione a',
        'candidatoal': 'candidato al', 'altelefono': 'al telefono', 'constadi': 'consta di',
        'credereai': 'credere ai', 'darea': 'dare a', 'daipropri': 'dai propri',
        'dimostratodi': 'dimostrato di', 'allostudio': 'allo studio', 'difilosofia': 'di filosofia',
        'perintelligenza': 'per intelligenza', 'conle': 'con le', 'dallemie': 'dalle mie',
        'gettatoqualcosa': 'gettato qualcosa', 'dallafinestra': 'dalla finestra',
        'malein': 'male in', 'popolazionedi': 'popolazione di', 'confiducia': 'con fiducia',
        'disugo': 'di sugo', 'impuntatoSu': 'impuntato su', 'nellaporta': 'nella porta',
        'inciampatoin': 'inciampato in', 'unsasso': 'un sasso', 'difurto': 'di furto',
        'nellatoppa': 'nella toppa', 'innamoratodi': 'innamorato di', 'matematicaa': 'matematica a',
        'cravattaal': 'cravatta al', 'intrufolatouna': 'intrufolato una', 'manonella': 'mano nella',
        'miaborsa': 'mia borsa', 'lepersone': 'le persone', 'manciaal': 'mancia al',
        'autodal': 'auto dal', 'mandatodei': 'mandato dei', 'obbedireai': 'obbedire ai',
        'inlavanderia': 'in lavanderia', 'pregiodi': 'pregio di', 'miofratello': 'mio fratello',
        'leresponsabilità': 'le responsabilità', 'conil': 'con il', 'diriordinare': 'di riordinare',
        'paretedi': 'parete di', 'maidi': 'mai di', 'Scoppiodi': 'Scoppio di',
        'sfogocon': 'sfogo con', 'daltreno': 'dal treno', 'diindovinare': 'di indovinare',
        'conla': 'con la', 'usufruiredi': 'usufruire di', 'conilcappello': 'con il cappello',
        'abbassartia': 'abbassarti a', 'ascriverea': 'ascrivere a',
        'avvicinarelasediaaltavolo': 'avvicinare la sedia al tavolo', 'caffèpenoso': 'caffè penoso',
        # multi-word run-togethers
        'Haaccondiscesoallesuerichieste': 'Ha accondisceso alle sue richieste',
        'bicchiereallelabbra': 'bicchiere alle labbra', 'alleggerirsidegli': 'alleggerirsi degli',
        'ancorarelaliraaldollaroamericano': 'ancorare la lira al dollaro americano',
        'adapplicarelemanicheallagiacca': 'ad applicare le maniche alla giacca',
        'avvantaggiarsidii': 'avvantaggiarsi di', 'colleghiamoconNewYork': 'colleghiamo con New York',
        'annoprecedente': 'anno precedente', 'Desideroconferirecon': 'Desidero conferire con',
        'controllatodii': 'controllato di', 'Corroinufficio': 'Corro in ufficio',
        'qualcunodaunacarica': 'qualcuno da una carica', 'consuetudinifamiliari': 'consuetudini familiari',
        'discernereilbenedalmale': 'discernere il bene dal male', 'esitòaconfessare': 'esitò a confessare',
        'puòestrapolare': 'può estrapolare', 'fuggiredacarcere': 'fuggire dal carcere',
        'Hannoinchiodatoilcoperchioallacassa': 'Hanno inchiodato il coperchio alla cassa',
        'linguaitaliana': 'lingua italiana', 'insidiandoalla': 'insidiando alla',
        'insudiciatodii': 'insudiciato di', 'compiereundelitto': 'compiere un delitto',
        'averlaconosciuta': 'averla conosciuta', 'pararsidaicolpi': 'pararsi dai colpi',
        'giaccadalsarto': 'giacca dal sarto', 'raccogliersiinpreghiera': 'raccogliersi in preghiera',
        'incrostaziooni': 'incrostazioni', 'realizzammodii': 'realizzammo di',
        'Nonsocomeregolarmi': 'Non so come regolarmi', 'romperelescatole': 'rompere le scatole',
        'Sie': "S'è", 'sie': "s'è", 'soddisfareaundesiderio': 'soddisfare a un desiderio',
        'Sopraelevarelacasa': 'Sopraelevare la casa', 'Nonsospettavadi': 'Non sospettava di',
        'esserecosì': 'essere così', 'sporcatolatovagliadi': 'sporcato la tovaglia di',
        'appuntamentoalledieci': 'appuntamento alle dieci', 'banditidallororifugio': 'banditi dal loro rifugio',
        'esserepuntuale': 'essere puntuale', 'deglialtri': 'degli altri', 'ilvestitocon': 'il vestito con',
        'Ècaduto': 'È caduto', 'èrisentito': 'è risentito', 'Sonosalito': 'Sono salito',
        'Nonnegherò': 'Non negherò', 'casae': 'casa è', 'fiumee': 'fiume è',
        'denunciatoil': 'denunciato il', 'incatenatiai': 'incatenati ai',
        'innalzatadi': 'innalzata di', 'minacciatodi': 'minacciato di', 'riempitodi': 'riempito di',
        'scaricatodi': 'scaricato di',
        # "<word>a" -> "<word> a"  (space before the preposition dropped by OCR)
        'abituatia': 'abituati a', 'Accondiscesea': 'Accondiscese a', 'colpaa': 'colpa a',
        'localea': 'locale a', 'Veneziaa': 'Venezia a', 'appaiaa': 'appaia a',
        'sinceramentea': 'sinceramente a', 'scalaa': 'scala a', 'animoa': 'animo a',
        'Aspettaa': 'Aspetta a', 'pubblicoa': 'pubblico a', 'bastaa': 'basta a', 'calzaa': 'calza a',
        'scusaa': 'scusa a', 'comunicòa': 'comunicò a', 'dirittoa': 'diritto a',
        'contraddirea': 'contraddire a', 'teoriaa': 'teoria a', 'qualcunoa': 'qualcuno a',
        'destinataa': 'destinata a', 'notiziaa': 'notizia a', 'disporsia': 'disporsi a',
        'particolarea': 'particolare a', 'dentea': 'dente a', 'disturboa': 'disturbo a',
        'Faticoa': 'Fatico a', 'feritoa': 'ferito a', 'fornirea': 'fornire a', 'guadagnoa': 'guadagno a',
        'Giraa': 'Gira a', 'gridatoa': 'gridato a', 'Insegnoa': 'Insegno a', 'fatturaa': 'fattura a',
        'intrattengoa': 'intrattengo a', 'invogliaa': 'invoglia a', 'soldatia': 'soldati a',
        'linguaa': 'lingua a', 'matrimonioa': 'matrimonio a', 'rispettoa': 'rispetto a',
        'ostaa': 'osta a', 'persistea': 'persiste a', 'piacea': 'piace a', 'terrenoa': 'terreno a',
        'candidaturaa': 'candidatura a', 'macchinaa': 'macchina a', 'presoa': 'preso a',
        'promisea': 'promise a', 'Proveròa': 'Proverò a', 'figlioa': 'figlio a', 'risalea': 'risale a',
        'patentea': 'patente a', 'Saliamoa': 'Saliamo a', 'maritoa': 'marito a', 'sfidatia': 'sfidati a',
        'tuttia': 'tutti a', 'spettaa': 'spetta a', 'spingea': 'spinge a', 'sposteràa': 'sposterà a',
        'stabilitia': 'stabiliti a', 'tendonoa': 'tendono a', 'tenersia': 'tenersi a',
        'trasferitoa': 'trasferito a', 'Corriacasa': 'Corri a casa',
    },
}

# Headword typos in the Italian OCR (doubled letters).  A rename is only applied
# when the corrected form is a real verb (vocab or another headword).
HEADWORD_PATTERNS = [
    (r'aare$', 'are'), (r'eere$', 'ere'), (r'iire$', 'ire'), (r'rre$', 're'),
    (r'rrsi$', 'rsi'), (r'aarsi$', 'arsi'), (r'iirsi$', 'irsi'), (r'rirsi$', 'rsi'),
    (r'alare$', 'are'), (r'lalare$', 'lare'), (r'tatare$', 'tare'), (r'arare$', 'are'),
    (r'irire$', 'ire'), (r'irre$', 'ire'), (r'erere$', 'ere'), (r'ilire$', 'ire'),
    (r'iaiare$', 'iare'), (r'iaiarsi$', 'iarsi'), (r'lllare$', 'llare'),
    (r'llare$', 'lare'), (r'rrare$', 'rare'), (r'ttane$', 'tare'), (r'ttare$', 'tare'),
    (r'atane$', 'are'), (r'ararcsin$', 'arsi'), (r'irirsi$', 'irsi'), (r'elersi$', 'ersi'),
    (r'sii$', 'si'), (r'ndlare$', 'ndare'), (r'ondlare$', 'ondare'), (r'vrivere$', 'vvivere'),
    (r'rtirire$', 'rtire'), (r'ininare$', 'inare'),
]


def _known_italian_words():
    try:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        from vocab_schema import read_vocab
        return {e['word'] for e in read_vocab('it')['entries']}
    except Exception:  # vocab is optional for the fix; no vocab -> only intra-dataset merges
        return set()


def fix_headword(word, vocab, headwords=()):
    """Corrected headword, or `word` itself.  Real words (in vocab) are never renamed."""
    if word in vocab:
        return word
    known = set(vocab) | set(headwords)
    for pat, rep in HEADWORD_PATTERNS:
        cand = re.sub(pat, rep, word)
        if cand != word and (cand in known or re.sub(r'si$', 'e', cand) in vocab):
            return cand
    return word


# --------------------------------------------------------------------------
# legacy -> canonical
# --------------------------------------------------------------------------

def _is_canonical(data):
    return isinstance(data.get('meta'), dict) and data['meta'].get('schema') == SCHEMA


def _level_min(levels):
    levels = [lv for lv in levels if lv in LEVELS]
    return min(levels, key=LEVELS.index) if levels else None


def _de_key(key):
    """'an +A' -> 'an+A'."""
    return re.sub(r'\s*\+\s*', '+', key)


def _legacy_examples(verb, key):
    entry = (verb.get('prepositions') or {}).get(key)
    if isinstance(entry, dict):
        return list(entry.get('examples') or [])
    return list(entry or [])


def _from_legacy(code, data):
    meta = data.get('meta') or {}
    out_meta = {'x': {}}
    keys = []
    verbs = {}
    xtop = {}

    if code == 'de':
        sources = ['Dimenticato (authored)', 'Tatoeba deu-cmn']
        src_of = {'Dimenticato (authored)': 0, 'Tatoeba CC BY 2.0 FR': 1}
        out_meta.update(sources=sources, licences=['project-authored', 'CC BY 2.0 FR (Tatoeba)'])
        if meta.get('note'):
            out_meta['x']['note'] = meta['note']
        cases = meta.get('prepositionCase') or {}
        bases = meta.get('prepositionBase') or {}
        for k in meta.get('prepositionOrder') or []:
            case = cases.get(k) or k.rsplit('+', 1)[-1].strip()
            base = bases.get(k) or k.split('+')[0].strip()
            keys.append({'key': _de_key(k), 'label': '%s + %s' % (base, CASE_LABEL.get(case, case)),
                         'kind': 'preposition', 'case': case, 'zh': CASE_ZH.get(case, '')})
        verbs = _de_verbs(data['verbs'], src_of, rekey=_de_key)
        if data.get('nounVerb'):
            nv = data['nounVerb']
            nmeta = nv.get('meta') or {}
            nv_keys = [{'key': k, 'label': k, 'kind': 'object'} for k in nmeta.get('prepositionOrder') or []]
            xtop['nounVerb'] = {
                'meta': {'name': nmeta.get('title') or '名词—动词固定搭配（Funktionsverbgefüge）',
                         'x': {'note': nmeta['note']} if nmeta.get('note') else {}},
                'keys': nv_keys,
                'verbs': _de_verbs(nv['verbs'], src_of, rekey=lambda k: k),
            }
    elif code == 'en':
        out_meta.update(sources=[s.get('label', s) if isinstance(s, dict) else s for s in meta.get('sources') or []],
                        licences=[s.get('license') for s in meta.get('sources') or [] if isinstance(s, dict)])
        if meta.get('keyNote'):
            out_meta['x']['keyNote'] = meta['keyNote']
        kinds = meta.get('keyKinds') or {}
        for k in meta.get('prepositionOrder') or []:
            kind = kinds.get(k, 'preposition')
            rec = {'key': k, 'label': k, 'kind': 'particle' if kind == 'particle' else 'preposition'}
            if kind == 'both':
                rec['x'] = {'particle': True}
            keys.append(rec)
        for slug, v in data['verbs'].items():
            order = list(v.get('prepositionOrder') or (v.get('prepositions') or {}).keys())
            rec = {'word': slug, 'display': v.get('display') or slug, 'order': order,
                   'keys': {k: _legacy_examples(v, k) for k in order}}
            x = {}
            if v.get('zipf') is not None:
                x['zipf'] = v['zipf']
            if v.get('senses'):
                x['senses'] = v['senses']
            if x:
                rec['x'] = x
            verbs[slug] = rec
    elif code == 'fr':
        srcs = [s for s in meta.get('sources') or [] if isinstance(s, dict)]
        src_ids = {s['id']: i for i, s in enumerate(srcs)}
        out_meta.update(sources=[s['label'] for s in srcs],
                        licences=sorted({s['license'] for s in srcs}))
        for k in meta.get('prepositionOrder') or []:
            keys.append({'key': k, 'label': k, 'kind': 'preposition'})
        for slug, v in data['verbs'].items():
            order = list(v.get('prepositionOrder') or (v.get('prepositions') or {}).keys())
            rec = {'word': slug, 'display': v.get('display') or slug, 'order': order, 'keys': {}}
            tatoeba = {}
            for k in order:
                exs = []
                prov = (v.get('sources') or {}).get(k) or []
                ids = []
                for i, raw in enumerate(_legacy_examples(v, k)):
                    text, zh = split_example(raw)
                    ex = {'text': text, 'zh': zh}
                    p = prov[i] if i < len(prov) else None
                    if p and p.get('kind') in src_ids:
                        ex['src'] = src_ids[p['kind']]
                    triple = [p.get('fr', ''), p.get('zh', ''), p.get('eng', '')] if p and p.get('fr') else None
                    if triple and not triple[2]:
                        triple = triple[:2]
                    ids.append(triple)
                    exs.append(ex)
                rec['keys'][k] = exs
                if any(ids):
                    tatoeba[k] = ids
            x = {}
            if v.get('notes'):
                x['notes'] = v['notes']
            if v.get('nounCollocations'):
                x['nounCollocations'] = [{'text': n.get('collocation') or split_example(n.get('text'))[0],
                                          'zh': n.get('chinese') or split_example(n.get('text'))[1]}
                                         for n in v['nounCollocations']]
            if tatoeba:
                x['tatoeba'] = tatoeba
            if x:
                rec['x'] = x
            verbs[slug] = rec
    else:  # it (and any future language with the plain legacy shape)
        out_meta.update(sources=list(IT_SOURCES), licences=list(IT_LICENCES))
        for k in meta.get('prepositionOrder') or []:
            keys.append({'key': k, 'label': k, 'kind': 'preposition'})
        for slug, v in data['verbs'].items():
            order = list(v.get('prepositionOrder') or (v.get('prepositions') or {}).keys())
            verbs[slug] = {'word': slug, 'display': v.get('display') or slug, 'order': order,
                           'keys': {k: _merge_split_pairs(_legacy_examples(v, k)) for k in order}}

    if not out_meta['x']:
        del out_meta['x']
    out = {'meta': out_meta, 'keys': keys, 'verbs': verbs}
    if xtop:
        out['x'] = xtop
    return out


def _merge_split_pairs(items):
    """OCR sometimes split one example over two list items: 'Sentence.' + '中文。'."""
    out = []
    i = 0
    while i < len(items):
        cur = str(items[i]).strip()
        nxt = str(items[i + 1]).strip() if i + 1 < len(items) else ''
        if cur and not CJK_ANY.search(cur) and IDEO.match(nxt.lstrip(OPENERS)) and not JUNK.search(cur):
            out.append(cur + ' ' + nxt)
            i += 2
            continue
        out.append(cur)
        i += 1
    return out


def _de_verbs(src_verbs, src_of, rekey):
    """German Rektion/FVG rows: examples come from the structured `entries`."""
    verbs = {}
    for slug, v in src_verbs.items():
        order = []
        keys = {}
        senses = {}
        levels = []
        entries = v.get('entries') or []
        if not entries:  # no structured rows: fall back to the flat strings
            for k in v.get('prepositionOrder') or []:
                nk = rekey(k)
                order.append(nk)
                keys[nk] = _legacy_examples(v, k)
        for e in entries:
            raw_key = e.get('key') or e.get('verb')
            nk = rekey(raw_key)
            if nk not in keys:
                keys[nk] = []
                order.append(nk)
            idx = []
            seen = {ex['text']: i for i, ex in enumerate(keys[nk])}
            for ex in e.get('examples') or []:
                text = (ex.get('de') or '').strip()
                if text in seen:
                    idx.append(seen[text])
                    continue
                rec = {'text': text, 'zh': (ex.get('zh') or '').strip()}
                if ex.get('source') in src_of:
                    rec['src'] = src_of[ex['source']]
                seen[text] = len(keys[nk])
                idx.append(len(keys[nk]))
                keys[nk].append(rec)
            sense = {'zh': e.get('chinese') or '', 'en': e.get('english') or ''}
            if e.get('level'):
                sense['level'] = e['level']
                levels.append(e['level'])
            sense['examples'] = idx
            senses.setdefault(nk, []).append(sense)
        rec = {'word': slug, 'display': v.get('display') or slug}
        lv = _level_min(levels)
        if lv:
            rec['level'] = lv
        rec['order'] = order
        rec['keys'] = keys
        if senses:
            rec['x'] = {'senses': senses}
        verbs[slug] = rec
    return verbs


# --------------------------------------------------------------------------
# canonical normalisation (always runs; idempotent)
# --------------------------------------------------------------------------

def _apply_text_fixes(code, text):
    for bad, good in TEXT_FIXES.get(code, []):
        if bad in text:
            text = text.replace(bad, good)
    for pat, repl in REGEX_FIXES.get(code, []):
        text = pat.sub(repl, text)
    tokens = TOKEN_FIXES.get(code)
    if tokens:
        text = _TOKEN_RE.sub(lambda m: tokens.get(m.group(0), m.group(0)), text)
    return text


_TOKEN_RE = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ]+")


def _remap(lst, mapping):
    """Re-point example indices after examples were dropped/merged."""
    return sorted({mapping[i] for i in lst if i in mapping})


def _normalise_block(code, block, rename=None, meta_name=None):
    """Shared pass for the main dataset and nested (x.nounVerb) blocks."""
    rename = rename or (lambda w: w)
    verbs_in = block.get('verbs') or {}
    verbs = {}
    for slug, v in verbs_in.items():
        word = rename(v.get('word') or slug)
        target = verbs.get(word)
        created = target is None
        if created:
            target = {'word': word}
            if (v.get('display') or word) != word and rename(v.get('display')) != word:
                target['display'] = v['display']
            if v.get('zh'):
                target['zh'] = v['zh']
            if v.get('level'):
                target['level'] = v['level']
            target['order'] = []
            target['keys'] = {}
            if v.get('x'):
                target['x'] = json.loads(json.dumps(v['x']))
            verbs[word] = target
        elif v.get('x'):
            for xk, xv in v['x'].items():  # merged typo headword: keep extras that do not clash
                target.setdefault('x', {}).setdefault(xk, xv)
        x = target.get('x') or {}
        for k in v.get('order') or list((v.get('keys') or {}).keys()):
            raw = (v.get('keys') or {}).get(k) or []
            dest = target['keys'].setdefault(k, [])
            seen = {e['text'] for e in dest}
            mapping = {}
            for i, ex in enumerate(raw):
                c = clean_example(ex)
                if not c:
                    continue
                c['text'] = re.sub(r'\s+', ' ', _apply_text_fixes(code, c['text'])).strip()
                if c['text'] in seen:
                    mapping[i] = next(j for j, e in enumerate(dest) if e['text'] == c['text'])
                    continue
                seen.add(c['text'])
                mapping[i] = len(dest)
                dest.append(c)
            if created and x:
                if isinstance(x.get('senses'), dict) and k in x['senses']:
                    for s in x['senses'][k]:
                        s['examples'] = _remap(s.get('examples') or [], mapping)
                    x['senses'][k] = [s for s in x['senses'][k] if s['examples']]
                    if not x['senses'][k]:
                        del x['senses'][k]
                if isinstance(x.get('tatoeba'), dict) and k in x['tatoeba']:
                    ids = x['tatoeba'][k]
                    new = [None] * len(dest)
                    for i, j in mapping.items():
                        if i < len(ids) and new[j] is None:
                            new[j] = ids[i]
                    x['tatoeba'][k] = new
            if k not in target['order']:
                target['order'].append(k)
    # drop empty keys / verbs
    for word in list(verbs):
        v = verbs[word]
        v['order'] = [k for k in v['order'] if v['keys'].get(k)]
        v['keys'] = {k: v['keys'][k] for k in v['order']}
        x = v.get('x')
        if x:
            for xk in ('senses', 'tatoeba', 'notes'):
                if isinstance(x.get(xk), dict):
                    x[xk] = {k: x[xk][k] for k in v['order'] if k in x[xk]}
                    if xk == 'tatoeba':
                        x[xk] = {k: ids for k, ids in x[xk].items() if any(ids)}
                    if not x[xk]:
                        del x[xk]
            if not x:
                del v['x']
        if not v['order']:
            del verbs[word]

    # keys: declared order first, then any undeclared key in first-use order
    declared = {}
    for rec in block.get('keys') or []:
        declared.setdefault(rec['key'], rec)
    used = []
    for v in verbs.values():
        for k in v['order']:
            if k not in used:
                used.append(k)
    keys = [declared[k] for k in declared if k in used]
    keys += [{'key': k, 'label': k, 'kind': 'preposition'} for k in used if k not in declared]
    index = {r['key']: [w for w, v in verbs.items() if r['key'] in v['keys']] for r in keys}
    return verbs, keys, index


def canonicalize(code, data):
    # deep copy (never mutate the caller's payload); integral floats -> int so a
    # Python build (zipf 4.0) and a JS round-trip (4) serialise identically
    data = json.loads(json.dumps(data), parse_float=lambda s: int(float(s)) if float(s).is_integer() else float(s))
    if not _is_canonical(data):
        data = _from_legacy(code, data)
    if code == 'it':
        import italian_fixes  # reviewed fix list: scripts/it_fixes/collocations.json
        data = italian_fixes.apply_collocations(data)
    meta = data.get('meta') or {}

    rename = None
    if code == 'it':
        known = _known_italian_words()
        headwords = set(data['verbs'])
        rename = lambda w: fix_headword(w, known, headwords)  # noqa: E731

    verbs, keys, index = _normalise_block(code, data, rename)
    out_meta = {
        'schema': SCHEMA,
        'lang': code,
        'name': NAMES.get(code) or meta.get('name') or code,
        'count': len(verbs),
        'examples': sum(len(ex) for v in verbs.values() for ex in v['keys'].values()),
        'builder': BUILDERS.get(code) or meta.get('builder') or 'scripts/canonical_collocations.py',
        'sources': meta.get('sources') or [],
        'licences': meta.get('licences') or [],
    }
    if meta.get('x'):
        out_meta['x'] = meta['x']
    out = {'meta': out_meta, 'keys': keys, 'verbs': verbs, 'index': index}

    xtop = data.get('x') or {}
    if xtop.get('nounVerb'):
        nv = xtop['nounVerb']
        nv_verbs, nv_keys, nv_index = _normalise_block(code, nv)
        nmeta = dict(nv.get('meta') or {})
        nmeta['count'] = len(nv_verbs)
        nmeta['examples'] = sum(len(ex) for v in nv_verbs.values() for ex in v['keys'].values())
        if not nmeta.get('x'):
            nmeta.pop('x', None)
        # FVG axis: most productive light verb first
        nv_keys.sort(key=lambda r: (-len(nv_index[r['key']]), r['key'].lower()))
        nv_index = {r['key']: nv_index[r['key']] for r in nv_keys}
        xtop = dict(xtop, nounVerb={'meta': nmeta, 'keys': nv_keys, 'verbs': nv_verbs, 'index': nv_index})
    if xtop:
        out['x'] = xtop
    return out


# --------------------------------------------------------------------------
# I/O
# --------------------------------------------------------------------------

def _dumps(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))


def _dump_block(block, indent=''):
    """meta / keys / verbs / index, one record per line."""
    parts = ['"meta":' + _dumps(block['meta'])]
    parts.append('"keys":[\n' + ',\n'.join(_dumps(k) for k in block['keys']) + '\n]')
    parts.append('"verbs":{\n' + ',\n'.join(_dumps(w) + ':' + _dumps(v) for w, v in block['verbs'].items()) + '\n}')
    parts.append('"index":{\n' + ',\n'.join(_dumps(k) + ':' + _dumps(v) for k, v in block['index'].items()) + '\n}')
    return (',\n').join(parts)


def render(code, data, header=''):
    data = canonicalize(code, data)
    body = _dump_block(data)
    if data.get('x'):
        xs = []
        for k, v in data['x'].items():
            if isinstance(v, dict) and {'meta', 'keys', 'verbs', 'index'} <= set(v):
                xs.append(_dumps(k) + ':{\n' + _dump_block(v) + '\n}')
            else:
                xs.append(_dumps(k) + ':' + _dumps(v))
        body += ',\n"x":{\n' + ',\n'.join(xs) + '\n}'
    lines = [line if line.startswith('//') else '// ' + line
             for line in (header or '').rstrip('\n').split('\n') if line.strip()]
    lines += [
        '// %s — schema collocations/1 (docs/data-schema.md).' % NAMES.get(code, code),
        '// GENERATED by %s via scripts/canonical_collocations.py; do not edit by hand.' % BUILDERS.get(code, ''),
        '// Validate: node scripts/validate_modules.js',
        '((globalThis.DIM_DATA = globalThis.DIM_DATA || {}).collocations = '
        'globalThis.DIM_DATA.collocations || {}).%s = {' % code,
    ]
    return '\n'.join(lines) + '\n' + body + '\n};\n', data


def write_collocations(code, data, header='', path=None):
    """Canonicalise `data` and write data/<code>-collocations.js.  Returns (path, bytes, data)."""
    text, canon = render(code, data, header)
    path = Path(path) if path else FILES[code]
    path.write_text(text, encoding='utf-8')
    return path, len(text.encode('utf-8')), canon


def read_collocations(code, path=None):
    """Evaluate a shipped collocation file (any shape) in node and return the payload."""
    path = Path(path) if path else (FILES[code] if FILES[code].exists() else LEGACY_FILES[code])
    js = (
        "const fs=require('fs'),vm=require('vm');const c={console};c.window=c;c.globalThis=c;"
        "vm.createContext(c);vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c);"
        "process.stdout.write(JSON.stringify(c.DIM_DATA.collocations[process.argv[2]]));"
    )
    out = subprocess.run(['node', '-e', js, str(path), code], check=True, capture_output=True)
    return json.loads(out.stdout.decode('utf-8'))


# --------------------------------------------------------------------------
# run-together scan (report only; reviewed fixes go into TEXT_FIXES)
# --------------------------------------------------------------------------

FUNCTION_WORDS = {
    'it': set('a al allo alla ai agli alle di del dello della dei degli delle da dal dallo dalla dai dagli '
              'dalle in nel nello nella nei negli nelle su sul sullo sulla sui sugli sulle con col per tra fra '
              'il lo la i gli le un uno una mi ti si ci vi ne e o che non mio tuo suo'.split()),
    'fr': set("à au aux de du des en par pour sur dans avec le la les un une et".split()),
    'de': set('an auf für mit nach über um von vor zu aus bei in den dem der die das ein eine sich'.split()),
    'en': set('at for from in into of on to with the a an up out off'.split()),
}


def scan(code, data):
    words = {}
    for v in data['verbs'].values():
        for exs in v['keys'].values():
            for ex in exs:
                for t in re.findall(r"[A-Za-zÀ-ɏ]+", ex['text'].lower()):
                    words[t] = words.get(t, 0) + 1
    known = {w for w, n in words.items() if n >= 2} | FUNCTION_WORDS.get(code, set())
    if code == 'it':
        known |= {w.lower() for w in _known_italian_words()}
    fw = FUNCTION_WORDS.get(code, set())
    hits = []
    for word, v in data['verbs'].items():
        for k, exs in v['keys'].items():
            for ex in exs:
                for t in re.findall(r"[A-Za-zÀ-ɏ]+", ex['text']):
                    tl = t.lower()
                    if tl in known or len(tl) < 5:
                        continue
                    for i in range(2, len(tl) - 1):
                        a, b = tl[:i], tl[i:]
                        if (a in known and b in known) and (a in fw or b in fw):
                            hits.append((word, k, t, a + ' ' + b, ex['text']))
                            break
    return hits


def main(argv):
    do_scan = '--scan' in argv
    codes = [a for a in argv if not a.startswith('--')] or ['it', 'de', 'en', 'fr']
    for code in codes:
        raw = read_collocations(code)
        if do_scan:
            canon = canonicalize(code, raw)
            for hit in scan(code, canon):
                print('%s\t%s\t%s\t%s -> %s\t%s' % ((code,) + hit[:2] + hit[2:4] + (hit[4],)))
            continue
        header = ''
        if FILES[code].exists():
            before = FILES[code].stat().st_size
            # keep the generator's own header comment (lines above the standard banner)
            for line in FILES[code].read_text(encoding='utf-8').split('\n'):
                if not line.startswith('//') or 'schema collocations/1' in line:
                    break
                header += line + '\n'
        else:
            before = LEGACY_FILES[code].stat().st_size
        path, size, canon = write_collocations(code, raw, header)
        print('%s: %s  %d verbs, %d examples, %d keys  (%d -> %d bytes)' % (
            code, path.relative_to(ROOT), canon['meta']['count'], canon['meta']['examples'],
            len(canon['keys']), before, size))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
