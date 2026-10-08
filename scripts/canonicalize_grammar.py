#!/usr/bin/env python3
"""Normalise shipped grammar books to grammar/1 in place.

    python3 scripts/canonicalize_grammar.py            # it de en fr
    python3 scripts/canonicalize_grammar.py it de      # just these

Idempotent: a second run is a no-op.  The Italian and German books have no
upstream source any more, so this script is their "builder"; English and
French are normally rebuilt by scripts/build_{english,french}_grammar.py,
which call the same grammar_schema.canonicalize().

Italian topics carry no level in the source book.  They get a CEFR level
from ITALIAN_LEVEL_RULES below (first matching Italian term in the topic
title wins, falling back to A2 for morphology and B1 for syntax), and the
file is stamped meta.levelSource = "heuristic".  Once assigned, a level is
kept on later runs, so hand corrections in the data file stick.
"""

import re
import sys

import grammar_schema

# The mapping follows the usual Italian L2 syllabus order (CILS/CELI and the
# Profilo della lingua italiana): core morphology and the present tense at A1;
# compound past, future, imperative, object pronouns, comparison at A2;
# subjunctive, combined pronouns, ci/ne, relatives, passive, the bulk of the
# complementi and subordinate clauses at B1; passato remoto, participial
# constructions and the literary clause types at B2/C1.
ITALIAN_LEVEL_RULES = [
    # --- morfologia --------------------------------------------------------
    (r'\(genere\)|（genere）|（numero）', 'A1'),
    (r'determinativo|indeterminativo', 'A1'),
    (r'articolo partitivo', 'A2'),
    (r'preposizioni articolate', 'A1'),
    (r"genere e numero dell'aggettivo", 'A1'),
    (r"collocazione dell'aggettivo", 'A2'),
    (r'colori|grande, povero, buono', 'B1'),
    (r'cardinali', 'A1'),
    (r'ordinali', 'A2'),
    (r'frazione|collettivi', 'B1'),
    (r'avverbi di tempo|avverbi di luogo', 'A1'),
    (r'avverbi di modo|avverbi di quantità', 'A2'),
    (r'collocazione degli avverbi', 'B1'),
    (r'pronomi soggetto', 'A1'),
    (r'forma tonica|forma atona', 'A2'),
    (r'pronomi combinati|particelle ci', 'B1'),
    (r'dimostrativi|possessivi', 'A1'),
    (r'indefiniti', 'A2'),
    (r'（congiunzioni）', 'A2'),
    (r'uso delle preposizioni', 'A2'),
    (r'relativi', 'B1'),
    (r'comparativo', 'A2'),
    (r'categorie dei verbi|coniugazioni dei verbi|presente indicativo', 'A1'),
    (r'passato prossimo|futurosemplice|futuro semplice|imperativo|infinito|riflessivi', 'A2'),
    (r'passato remoto|participi', 'B2'),
    (r'trapassati|futuro anteriore|congiuntivo|gerundio|passiva|impersonale', 'B1'),
    # --- sintassi ----------------------------------------------------------
    (r'complemento predicativo', 'B1'),
    (r'（soggetto）|（predicato）|（attributo）|complemento oggetto|complemento di termine', 'A2'),
    (r'complemento di luogo|complemento di tempo', 'A2'),
    (r'complemento di (fine|causa|modo|mezzo|compagnia)', 'B1'),
    (r'complemento di relazione', 'C1'),
    (r'specificazione|quantità|materia|argomento|vocazione|esclamazione', 'B1'),
    (r'complemento', 'B2'),
    (r'coordinate', 'A2'),
    (r'soggettiva', 'B2'),
    (r'oggettiva', 'B1'),
    (r'relativa|causale|finale', 'B1'),
    (r'condizionale', 'B1'),
    (r'periodo ipotetico|consecutiva|modale', 'B2'),
    (r'comparativa|avversativa', 'B2'),
    (r'interrogativa indiretta', 'B1'),
    (r'eccettuativa|esclusiva|aggiuntiva|limitativa', 'C1'),
]
_ITALIAN_RULES = [(re.compile(p), lv) for p, lv in ITALIAN_LEVEL_RULES]


def italian_level(topic, part, chapter):
    title = topic['title']
    for rx, level in _ITALIAN_RULES:
        if rx.search(title):
            return level
    return 'B1' if 'sintassi' in part['title'] else 'A2'


LEVEL_HOOKS = {'it': (italian_level, 'heuristic')}


def run(code):
    data = grammar_schema.read(code)
    if code == 'it':
        import italian_fixes  # reviewed fix list: scripts/it_fixes/grammar.json
        data = italian_fixes.apply_grammar(data)
    level_for, level_source = LEVEL_HOOKS.get(code, (None, None))
    out = grammar_schema.canonicalize(data, code, level_for=level_for, level_source=level_source)
    header = grammar_schema.LANGS[code]['header']
    if header is None:
        # en/fr: keep whatever header their builder wrote
        with open(grammar_schema.os.path.join(grammar_schema.ROOT, grammar_schema.LANGS[code]['file']),
                  encoding='utf-8') as fh:
            header = []
            for line in fh:
                if not line.startswith('//'):
                    break
                header.append(line.rstrip('\n'))
    path = grammar_schema.write(code, out, header=header)
    m = out['meta']
    print('%s: %d topics, levels %s, %d aliases -> %s' % (
        code, m['topicCount'], ','.join(m['levels']), len(m['aliases']), path))


def main(argv):
    codes = argv or ['it', 'de', 'en', 'fr']
    for code in codes:
        if code not in grammar_schema.LANGS:
            raise SystemExit('unknown language %r' % code)
        run(code)


if __name__ == '__main__':
    main(sys.argv[1:])
