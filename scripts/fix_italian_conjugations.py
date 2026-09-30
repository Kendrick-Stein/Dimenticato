#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Repair the generated Italian conjugation datasets in place.

The original generator (scripts/build_it50k_conjugations.py, no longer in the
repo) produced data/conjugations-all-tenses.js (and a presente-only fallback file
that has since been dropped: every entry here carries indicativo_presente)
with four systematic defects:

  1. Every compound tense (passato prossimo, trapassato prossimo / remoto,
     futuro anteriore, congiuntivo passato / trapassato, condizionale passato)
     stored the bare past participle with no essere/avere auxiliary, so the
     drill graded "parlato" instead of "ho parlato".
  2. imperativo_non was produced by applying the wrong irregular template to
     the stem ("vere", "sga", "lascgliere", ...) and frequently dropped the
     "non " negation particle altogether.
  3. imperativo_* was typed "single" although its forms array is person
     indexed with the literal string "None" in slot 0 (the non-existent io
     imperative), which leaked "形式 2" prompts into the UI.
  4. 187 entries carry an empty english gloss, and a few forms carry
     generation artifacts (restringere's doubled "re" prefix, a leaked Python
     None, bogus participles such as perdere -> "perdo").

This script rewrites the dataset, keeping the exact file shape the app
expects (`const CONJUGATION_ALL_TENSES_DATA = [...];`).

Run from the repo root:  python3 scripts/fix_italian_conjugations.py
"""

import json
import os
import re
import sys
from data_module import register_footer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALL_TENSES = os.path.join(ROOT, 'data', 'conjugations-all-tenses.js')

PERSONS = ['io', 'tu', 'lui_lei', 'noi', 'voi', 'loro']

# tense key -> (auxiliary tense key on essere/avere)
COMPOUND_AUX_SOURCE = {
    'indicativo_passato_prossimo': 'indicativo_presente',
    'indicativo_trapassato_prossimo': 'indicativo_imperfetto',
    'indicativo_trapassato_remoto': 'indicativo_passato_remoto',
    'indicativo_futuro_anteriore': 'indicativo_futuro_semplice',
    'congiuntivo_passato': 'congiuntivo_presente',
    'congiuntivo_trapassato': 'congiuntivo_imperfetto',
    'condizionale_passato': 'condizionale_presente',
}

# ---------------------------------------------------------------------------
# Auxiliary selection.
# Default is avere (the overwhelming majority). ESSERE lists the verbs that
# take essere; BOTH lists the verbs that admit either auxiliary — those store
# the avere form first (primary / multiple-choice answer) plus the essere forms
# as accepted alternatives so a correct answer is never graded wrong.
# ---------------------------------------------------------------------------
ESSERE = set("""
essere andare stare venire morire tornare ritornare sembrare piacere arrivare
riuscire uscire succedere dispiacere capitare entrare rientrare restare bastare
diventare divenire rimanere scappare partire dipartire ripartire cadere ricadere
decadere scadere accadere valere prevalere esistere coesistere nascere rinascere
crescere giungere sopraggiungere sorgere insorgere risorgere scomparire sparire
spettare bisognare costare perire sopravvivere apparire riapparire comparire
dipendere impazzire risultare fuggire fallire sfuggire durare avvenire svenire
atterrare decollare scoppiare provenire pervenire rinvenire intervenire crollare
dolere invecchiare dimagrire ingrassare accedere riandare occorrere incorrere
ricorrere accorrere svanire marcire cascare inciampare arrampicare discendere
ascendere emergere riemergere attenere intrufolare arrugginire immigrare emigrare
sbocciare fiorire trapelare crepare arrossire fluire affluire confluire soccombere
deragliare regredire schiattare tramontare arrendere accorgere pentire vergognare
arrabbiare suicidare inginocchiare aggrappare fidare ammalare
""".split())

BOTH = set("""
finire passare servire cambiare continuare importare cominciare ricominciare
incominciare mancare sedere correre toccare interessare saltare salire risalire
scendere rovinare suonare risuonare esplodere volare bruciare procedere migliorare
peggiorare guarire aumentare diminuire originare scattare trascorrere avanzare
assomigliare somigliare cuocere terminare asciugare proseguire appartenere scorrere
piovere nevicare stupire gonfiare sgonfiare spuntare soffocare affondare pesare
calare precipitare derivare annegare affogare cessare evadere convenire necessitare
mutare schiantare infuriare giacere schizzare penetrare maturare filare gelare
rinfrescare smontare salpare spirare scolare raddoppiare rimbalzare schiarire
indebolire ingrandire arretrare arricchire rotolare sbarcare impaurire conseguire
traboccare scoccare filtrare progredire ardere trapassare rabbrividire lampeggiare
accorciare intorpidire sfollare ammorbidire retrocedere vivere marciare degenerare
""".split())

# ---------------------------------------------------------------------------
# Past-participle repairs. The generator produced a bogus first alternative for
# these verbs (perdere -> "perdo", succedere -> "succedso", compiere ->
# "compieuto", vivere -> "vivuto", ...). Values are
# [masc.sg, fem.sg, masc.pl, fem.pl].
# ---------------------------------------------------------------------------
PARTICIPLE_FIX = {
    'perdere': ['perso/perduto', 'persa/perduta', 'persi/perduti', 'perse/perdute'],
    'disperdere': ['disperso/disperduto', 'dispersa/disperduta', 'dispersi/disperduti', 'disperse/disperdute'],
    'succedere': ['successo/succeduto', 'successa/succeduta', 'successi/succeduti', 'successe/succedute'],
    'precedere': ['preceduto', 'preceduta', 'preceduti', 'precedute'],
    'procedere': ['proceduto', 'proceduta', 'proceduti', 'procedute'],
    'concedere': ['concesso/conceduto', 'concessa/conceduta', 'concessi/conceduti', 'concesse/concedute'],
    'cedere': ['ceduto', 'ceduta', 'ceduti', 'cedute'],
    'accedere': ['acceduto', 'acceduta', 'acceduti', 'accedute'],
    'riflettere': ['riflesso/riflettuto', 'riflessa/riflettuta', 'riflessi/riflettuti', 'riflesse/riflettute'],
    'compiere': ['compiuto', 'compiuta', 'compiuti', 'compiute'],
    'riapparire': ['riapparso/riapparito', 'riapparsa/riapparita', 'riapparsi/riappariti', 'riapparse/riapparite'],
    'riempire': ['riempito', 'riempita', 'riempiti', 'riempite'],
    'empire': ['empito', 'empita', 'empiti', 'empite'],
    'vivere': ['vissuto', 'vissuta', 'vissuti', 'vissute'],
    'sopravvivere': ['sopravvissuto', 'sopravvissuta', 'sopravvissuti', 'sopravvissute'],
    'convivere': ['convissuto', 'convissuta', 'convissuti', 'convissute'],
    'rivivere': ['rivissuto', 'rivissuta', 'rivissuti', 'rivissute'],
    'cuocere': ['cotto/cociuto', 'cotta/cociuta', 'cotti/cociuti', 'cotte/cociute'],
    'rispondere': ['risposto', 'risposta', 'risposti', 'risposte'],
    'corrispondere': ['corrisposto', 'corrisposta', 'corrisposti', 'corrisposte'],
    'siedere': ['seduto', 'seduta', 'seduti', 'sedute'],
    'restringere': ['ristretto', 'ristretta', 'ristretti', 'ristrette'],
}

# Verbs with no imperative at all (modal / impersonal / defective): the whole
# imperativo_* pair is dropped rather than shown as "None".
NO_IMPERATIVE = {'potere', 'dovere', 'bisognare', 'prudere', 'cere', 'sparere'}
# Verbs whose stored affermativo is broken but that DO have an imperative.
DERIVE_IMPERATIVE = {'scorgere'}

# ---------------------------------------------------------------------------
# English glosses for the entries the generator left empty. Junk lemmas
# produced by the lemmatiser (cere / care / mare / rare / tare / posire /
# sensire / ...) are deliberately left blank — the renderer hides the gloss
# line when it is empty rather than printing a placeholder.
# ---------------------------------------------------------------------------
# Lemmatiser artefacts: not Italian verbs (and not Italian words at all in some
# cases). Removed from both datasets rather than drilled with a blank gloss.
JUNK_LEMMAS = {
    'passire', 'cere', 'care', 'modere', 'posire', 'sparere', 'divertare',
    'indovare', 'mare', 'siedere', 'sensire', 'rare', 'abbandare', 'condere',
    'sbattare', 'strire', 'soprarvare', 'tare',
}

ENGLISH_GLOSSES = {
    'volare': 'to fly',
    'potere': 'to be able to, can', 'sapere': 'to know', 'volere': 'to want',
    'parlare': 'to speak', 'piacere': 'to be pleasing, to like',
    'riuscire': 'to succeed, to manage', 'tenere': 'to hold, to keep',
    'dispiacere': 'to be sorry, to displease', 'bastare': 'to be enough',
    'mangiare': 'to eat', 'smettere': 'to stop, to quit', 'bere': 'to drink',
    'cavare': 'to pull out, to extract', 'vestire': 'to dress',
    'sedere': 'to sit', 'fidare': 'to trust', 'interessare': 'to interest',
    'giurare': 'to swear', 'raccontare': 'to tell, to recount',
    'ringraziare': 'to thank', 'battere': 'to beat, to hit',
    'combattere': 'to fight', 'tessere': 'to weave',
    'arrabbiare': 'to get angry', 'spettare': 'to be up to, to be due',
    'costare': 'to cost', 'dimostrare': 'to demonstrate, to show',
    'avvicinare': 'to bring closer, to approach',
    'sbrigare': 'to deal with, to hurry up', 'gestire': 'to manage',
    'dipendere': 'to depend', 'accorgere': 'to notice, to realise',
    'risultare': 'to turn out, to result', 'produrre': 'to produce',
    'mirare': 'to aim', 'salutare': 'to greet',
    'spegnere': 'to switch off, to put out', 'commettere': 'to commit',
    'beccare': 'to peck, to catch', 'versare': 'to pour',
    'centrare': 'to hit the centre, to centre',
    'consegnare': 'to deliver, to hand over', 'catturare': 'to capture',
    'armare': 'to arm', 'trattenere': 'to hold back, to detain',
    'autorizzare': 'to authorise', 'lottare': 'to struggle, to fight',
    'fornire': 'to supply, to provide', 'sfuggire': 'to escape, to slip away',
    'tacere': 'to be silent', 'badare': 'to look after, to mind',
    'sbattere': 'to slam, to beat', 'compiere': 'to accomplish, to complete',
    'interrogare': 'to question, to interrogate',
    'figurare': 'to figure, to appear', 'obbligare': 'to oblige, to force',
    'pentire': 'to repent', 'rallentare': 'to slow down',
    'basare': 'to base', 'drogare': 'to drug',
    'svolgere': 'to carry out, to unfold',
    'strappare': 'to tear, to snatch', 'dedicare': 'to dedicate',
    'ripulire': 'to clean up', 'suicidare': 'to commit suicide',
    'avvenire': 'to happen, to occur', 'assomigliare': 'to resemble',
    'cuocere': 'to cook', 'augurare': 'to wish',
    'vergognare': 'to be ashamed', 'testimoniare': 'to testify',
    'premere': 'to press', 'spiare': 'to spy', 'asciugare': 'to dry',
    'campare': 'to get by, to live', 'provenire': 'to come from',
    'terrorizzare': 'to terrorise', 'incolpare': 'to blame',
    'crollare': 'to collapse', 'attivare': 'to activate',
    'somigliare': 'to resemble', 'tremare': 'to tremble, to shake',
    'risalire': 'to go back up, to date back', 'incasinare': 'to mess up',
    'gradire': 'to appreciate, to like', 'attrarre': 'to attract',
    'ripensare': 'to think again, to reconsider', 'testare': 'to test',
    'specializzare': 'to specialise', 'estrarre': 'to extract',
    'indire': 'to call, to announce', 'sudare': 'to sweat',
    'derubare': 'to rob', 'bacare': 'to become worm-eaten',
    'ritardare': 'to delay', 'scatenare': 'to unleash',
    'ammalare': 'to fall ill', 'ripagare': 'to repay',
    'riprovare': 'to try again', 'spuntare': 'to sprout, to tick off',
    'affondare': 'to sink', 'educare': 'to educate',
    'subire': 'to undergo, to suffer', 'intercettare': 'to intercept',
    'ficcare': 'to shove, to stick', 'calare': 'to lower, to drop',
    'riandare': 'to go back', 'rapinare': 'to rob',
    'pronunciare': 'to pronounce', 'confidare': 'to confide',
    'incoraggiare': 'to encourage', 'sporcare': 'to dirty',
    'ricostruire': 'to rebuild', 'interferire': 'to interfere',
    'infiltrare': 'to infiltrate', 'restringere': 'to narrow, to shrink',
    'associare': 'to associate', 'prelevare': 'to withdraw, to collect',
    'spacciare': 'to deal, to peddle', 'sdraiare': 'to lay down',
    'puzzare': 'to stink', 'infrangere': 'to break, to shatter',
    'costituire': 'to constitute, to set up',
    'riscaldare': 'to heat, to warm up', 'imbattere': 'to run into',
    'ricavare': 'to obtain, to derive',
    'intromettere': 'to interfere, to intrude',
    'ambientare': 'to set, to acclimatise', 'arruolare': 'to enlist',
    'compromettere': 'to compromise', 'confrontare': 'to compare',
    'marciare': 'to march', 'radunare': 'to gather',
    'innervosire': 'to make nervous', 'stressare': 'to stress',
    'giacere': 'to lie', 'spassare': 'to have fun',
    'sequestrare': 'to seize, to kidnap', 'allargare': 'to widen',
    'aggrappare': 'to cling', 'schizzare': 'to splash, to dash',
    'ripassare': 'to review, to go over again', 'virare': 'to veer, to turn',
    'rasare': 'to shave, to trim', 'immischiare': 'to meddle',
    'avverare': 'to come true', 'sbirciare': 'to peek',
    'recare': 'to bring, to bear', 'supportare': 'to support',
    'depositare': 'to deposit', 'aspirare': 'to aspire, to inhale',
    'inginocchiare': 'to kneel', 'schierare': 'to line up, to deploy',
    'allevare': 'to raise, to breed', 'incominciare': 'to begin',
    'classificare': 'to classify', 'sbucare': 'to pop out, to emerge',
    'attenere': 'to comply, to keep to',
    'scontrare': 'to clash, to collide', 'sballare': 'to unpack',
    'degenerare': 'to degenerate',
    'risentire': 'to feel the effects, to resent', 'invocare': 'to invoke',
    'rivoltare': 'to turn over, to revolt', 'scolare': 'to drain',
    'stuzzicare': 'to tease, to poke', 'risucchiare': 'to suck in',
    'ammanettare': 'to handcuff',
}


# ---------------------------------------------------------------------------
# io helpers
# ---------------------------------------------------------------------------
def read_dataset(path):
    with open(path, encoding='utf-8') as fh:
        src = fh.read()
    start = src.index('[')
    end = src.rindex(']', 0, src.index('\n// 统一注册') if '\n// 统一注册' in src else len(src))
    header, _, _ = src[:start].rpartition('=')
    return header.rstrip(), json.loads(src[start:end + 1])


def write_dataset(path, header, data):
    body = json.dumps(data, ensure_ascii=False)
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write('%s = %s;\n' % (header, body))
        fh.write(register_footer('conjugations', 'it', 'CONJUGATION_ALL_TENSES_DATA'))


def clean(value):
    """Drop the Python `None` literal the generator leaked into the data."""
    if value is None:
        return ''
    text = str(value)
    parts = [p for p in text.split('/') if p.strip() and p.strip().lower() != 'none']
    return '/'.join(parts)


def alternatives(value):
    return [p.strip() for p in clean(value).split('/') if p.strip()]


# ---------------------------------------------------------------------------
# per-verb repairs
# ---------------------------------------------------------------------------
def strip_doubled_prefix(verb, prefix):
    """restringere was generated as prefix + the already-prefixed form
    ("re" + "restringo" -> "rerestringo"), so every single form carries one
    extra copy of the prefix."""
    def fix(text):
        return '/'.join(
            alt[len(prefix):] if alt.startswith(prefix) and len(alt) > len(prefix) else alt
            for alt in str(text).split('/')
        )

    for tense in verb.get('tenses', {}).values():
        if tense.get('type') == 'person':
            tense['forms'] = {p: fix(v) for p, v in tense['forms'].items()}
        elif isinstance(tense.get('forms'), list):
            tense['forms'] = [fix(v) for v in tense['forms']]


def participle_slots(verb):
    """-> [masc.sg, fem.sg, masc.pl, fem.pl] or None when the verb is defective."""
    fixed = PARTICIPLE_FIX.get(verb['infinitive'])
    if fixed:
        return list(fixed)
    forms = (verb.get('tenses', {}).get('participio') or {}).get('forms') or []
    if len(forms) >= 5:
        slots = [clean(forms[1]), clean(forms[2]), clean(forms[3]), clean(forms[4])]
    elif len(forms) == 4:
        slots = [clean(forms[0]), clean(forms[1]), clean(forms[2]), clean(forms[3])]
    else:
        slots = []
    if not slots or not slots[0]:
        gerundio = (verb.get('tenses', {}).get('infinito_gerundio') or {}).get('forms') or []
        past = clean(gerundio[1]) if len(gerundio) > 1 else ''
        if not past:
            return None
        slots = [past, past, past, past]
    # backfill any empty agreement slot with the masculine singular
    return [s or slots[0] for s in slots]


def build_compound(aux_kind, aux_forms, slots, defective=()):
    """aux_kind: 'avere' | 'essere' | 'both'.

    `defective` lists the persons the verb does not have at all (impersonal
    verbs such as bisognare / piovere only exist in the 3rd person)."""
    forms = {}
    for idx, person in enumerate(PERSONS):
        if person in defective:
            forms[person] = ''
            continue
        singular = idx < 3
        answers = []
        if aux_kind in ('avere', 'both'):
            for aux in alternatives(aux_forms['avere'][person]):
                for pp in alternatives(slots[0]):
                    answers.append('%s %s' % (aux, pp))
        if aux_kind in ('essere', 'both'):
            gendered = (slots[0], slots[1]) if singular else (slots[2], slots[3])
            for aux in alternatives(aux_forms['essere'][person]):
                for slot in gendered:
                    pp = alternatives(slot)
                    if pp:
                        answers.append('%s %s' % (aux, pp[0]))
        # de-duplicate, keep order
        seen, ordered = set(), []
        for a in answers:
            if a not in seen:
                seen.add(a)
                ordered.append(a)
        forms[person] = '/'.join(ordered)
    return forms


def build_imperative(verb):
    """-> (affermativo forms, non forms) or (None, None) when there is none."""
    infinitive = verb['infinitive']
    tenses = verb.get('tenses', {})
    if infinitive in NO_IMPERATIVE:
        return None, None

    stored = (tenses.get('imperativo_affermativo') or {}).get('forms') or []
    ind = (tenses.get('indicativo_presente') or {}).get('forms') or {}
    cong = (tenses.get('congiuntivo_presente') or {}).get('forms') or {}

    if len(stored) == 6:
        aff = {
            'io': '',
            'tu': clean(stored[1]),
            'lui_lei': clean(stored[2]),
            'noi': clean(stored[3]),
            'voi': clean(stored[4]),
            'loro': clean(stored[5]),
        }
    elif infinitive in DERIVE_IMPERATIVE:
        aff = {
            'io': '',
            'tu': clean(ind.get('lui_lei') if infinitive.endswith('are') else ind.get('tu')),
            'lui_lei': clean(cong.get('lui_lei')),
            'noi': clean(cong.get('noi')),
            'voi': clean(ind.get('voi')),
            'loro': clean(cong.get('loro')),
        }
    else:
        return None, None

    if not any(aff[p] for p in PERSONS):
        return None, None

    def negate(text):
        alts = alternatives(text)
        return '/'.join('non %s' % a for a in alts)

    # tu -> non + infinitive; Lei/Loro -> non + congiuntivo; noi/voi -> non + imperative
    non = {
        'io': '',
        'tu': negate(infinitive),
        'lui_lei': negate(clean(cong.get('lui_lei')) or aff['lui_lei']),
        'noi': negate(aff['noi'] or clean(cong.get('noi'))),
        'voi': negate(aff['voi'] or clean(ind.get('voi'))),
        'loro': negate(clean(cong.get('loro')) or aff['loro']),
    }
    return aff, non


# ---------------------------------------------------------------------------
# main transform
# ---------------------------------------------------------------------------
def main():
    header_all, data_all = read_dataset(ALL_TENSES)

    # 0a. drop the lemmatiser's non-words. Every one of these is a mangled stem
    # of a real verb that is already in the dataset under its correct spelling
    # (sensire→sentire, siedere→sedere, sbattare→sbattere …) or is not a verb at
    # all (mare, rare, tare). They sit at ranks 134–928, i.e. inside the first
    # lessons, and they are exactly the entries that have no English gloss.
    dropped_junk = [v['infinitive'] for v in data_all if v['infinitive'] in JUNK_LEMMAS]
    data_all = [v for v in data_all if v['infinitive'] not in JUNK_LEMMAS]
    data_pres = [v for v in data_pres if v['infinitive'] not in JUNK_LEMMAS]

    by_infinitive = {v['infinitive']: v for v in data_all}

    # 0. targeted per-verb repairs that must happen before anything reads forms
    if 'restringere' in by_infinitive:
        strip_doubled_prefix(by_infinitive['restringere'], 're')

    # 1. snapshot the essere / avere paradigms used as auxiliaries
    aux_paradigms = {}
    for aux in ('essere', 'avere'):
        entry = by_infinitive[aux]
        aux_paradigms[aux] = {
            key: dict(entry['tenses'][src]['forms'])
            for key, src in COMPOUND_AUX_SOURCE.items()
        }

    report = {
        'compound_rebuilt': 0, 'compound_dropped': 0,
        'essere': 0, 'avere': 0, 'both': 0,
        'imperative_rebuilt': 0, 'imperative_dropped': 0,
        'none_cleaned': 0, 'english_filled': 0, 'english_still_empty': 0,
    }

    for verb in data_all:
        infinitive = verb['infinitive']
        tenses = verb.get('tenses', {})

        # 2. english gloss
        if not (verb.get('english') or '').strip():
            gloss = ENGLISH_GLOSSES.get(infinitive)
            if gloss:
                verb['english'] = gloss
                report['english_filled'] += 1
            else:
                verb['english'] = ''
                report['english_still_empty'] += 1

        # 3. participle repairs feed both the participio card and the compounds
        slots = participle_slots(verb)
        participio = tenses.get('participio')
        if participio is not None:
            participio['tense_label'] = 'Participio'
            forms = [clean(f) for f in (participio.get('forms') or [])]
            if slots:
                # slot 0 is the present participle; a 4-slot block has none
                present = forms[0] if len(forms) >= 5 else ''
                participio['forms'] = [present] + slots
            else:
                participio['forms'] = forms
        gerundio = tenses.get('infinito_gerundio')
        if gerundio is not None:
            forms = [clean(f) for f in (gerundio.get('forms') or [])]
            if slots and len(forms) >= 2:
                forms[1] = alternatives(slots[0])[0]
            gerundio['forms'] = forms

        # 4. compound tenses
        if infinitive in ESSERE:
            kind = 'essere'
        elif infinitive in BOTH:
            kind = 'both'
        else:
            kind = 'avere'
        report[kind] += 1

        # impersonal / defective verbs keep their gaps in the compound tenses
        presente = (tenses.get('indicativo_presente') or {}).get('forms') or {}
        defective = {p for p in PERSONS if not clean(presente.get(p))} if presente else set()

        for key, aux_src in COMPOUND_AUX_SOURCE.items():
            block = tenses.get(key)
            if block is None:
                continue
            if not slots:
                del tenses[key]
                report['compound_dropped'] += 1
                continue
            aux_forms = {
                'avere': aux_paradigms['avere'][key],
                'essere': aux_paradigms['essere'][key],
            }
            block['type'] = 'person'
            block['forms'] = build_compound(kind, aux_forms, slots, defective)
            report['compound_rebuilt'] += 1

        # 5. imperatives
        aff, non = build_imperative(verb)
        if aff is None:
            tenses.pop('imperativo_affermativo', None)
            tenses.pop('imperativo_non', None)
            report['imperative_dropped'] += 1
        else:
            tenses['imperativo_affermativo'] = {
                'type': 'person',
                'group_label': 'Imperativo',
                'tense_label': 'Affermativo',
                'forms': aff,
            }
            tenses['imperativo_non'] = {
                'type': 'person',
                'group_label': 'Imperativo',
                'tense_label': 'Negativo',
                'forms': non,
            }
            report['imperative_rebuilt'] += 1

        # 6. strip every remaining leaked Python None
        for block in tenses.values():
            if block.get('type') == 'person':
                for person, value in list(block['forms'].items()):
                    cleaned = clean(value)
                    if cleaned != value:
                        report['none_cleaned'] += 1
                    block['forms'][person] = cleaned
            elif isinstance(block.get('forms'), list):
                new_forms = []
                for value in block['forms']:
                    cleaned = clean(value)
                    if cleaned != value:
                        report['none_cleaned'] += 1
                    new_forms.append(cleaned)
                block['forms'] = new_forms

    write_dataset(ALL_TENSES, header_all, data_all)

    report['junk_lemmas_dropped'] = len(dropped_junk)
    for key in sorted(report):
        print('%-22s %s' % (key, report[key]))
    print('%-22s %s' % ('dropped', ' '.join(sorted(dropped_junk))))
    print('%-22s %s' % ('verbs_all_tenses', len(data_all)))

    # sanity: nothing may still say "None"
    leaked = 0
    for verb in data_all:
        for block in verb.get('tenses', {}).values():
            values = block['forms'].values() if block.get('type') == 'person' else block.get('forms') or []
            leaked += sum(1 for v in values if str(v).strip().lower() == 'none')
    print('%-22s %s' % ('leaked_none_after', leaked))
    return 0 if leaked == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
