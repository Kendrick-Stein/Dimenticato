#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Shared writer for course/1 data files (docs/data-schema.md).

    { meta: {schema:'course/1', lang, name, title, zh, count, builder, sources,
             licences, …},
      levels: [ {id, title, zh, description,
                 units: [ {id, number, title, summary,
                           words: ['<vocab word>', …],
                           grammar: [{label, slug}],
                           x?: {examples: [{text, zh, source}]}} ]} ] }

The file is `data/<code>-course.js`; it registers itself under
DIM_DATA.course.<code>.  One unit per line keeps diffs reviewable.
"""

import io
import json
import os

from data_module import register_footer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

META_ORDER = ('schema', 'lang', 'name', 'title', 'zh', 'description', 'count',
              'unitLabel', 'note', 'builder', 'sources', 'licences')
LEVEL_ORDER = ('id', 'title', 'zh', 'description')
UNIT_ORDER = ('id', 'number', 'title', 'summary', 'words', 'grammar', 'x')


def path_for(code):
    return os.path.join(ROOT, 'data', '%s-course.js' % code)


def global_for(code, data):
    name = (data.get('meta') or {}).get('name') or code
    return '%s_COURSE_DATA' % name.upper()


def _ordered(obj, order):
    out = {k: obj[k] for k in order if k in obj and obj[k] not in (None, '', [], {})}
    for k in obj:
        if k not in out and obj[k] not in (None, '', [], {}):
            out[k] = obj[k]
    return out


def _dump(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(', ', ': '))


def finalize(data, code):
    """Fill derived meta (schema, lang, count) and drop empty optional fields."""
    meta = dict(data.get('meta') or {})
    meta['schema'] = 'course/1'
    meta['lang'] = code
    meta['count'] = sum(len(l.get('units') or []) for l in data['levels'])
    for key in ('name', 'title', 'zh', 'builder', 'sources', 'licences'):
        if not meta.get(key):
            raise SystemExit('course/1 %s: meta.%s is required' % (code, key))
    levels = []
    for level in data['levels']:
        units = [_ordered(u, UNIT_ORDER) for u in level.get('units') or []]
        lv = _ordered({k: v for k, v in level.items() if k != 'units'}, LEVEL_ORDER)
        lv['units'] = units
        levels.append(lv)
    return {'meta': _ordered(meta, META_ORDER), 'levels': levels}


def render(code, data, header):
    data = finalize(data, code)
    name = global_for(code, data)
    lines = list(header or [])
    lines.append('const %s = {' % name)
    lines.append('"meta": %s,' % _dump(data['meta']))
    lines.append('"levels": [')
    for li, level in enumerate(data['levels']):
        head = {k: v for k, v in level.items() if k != 'units'}
        lines.append('%s, "units": [' % _dump(head)[:-1])
        units = level['units']
        for ui, unit in enumerate(units):
            lines.append(_dump(unit) + (',' if ui < len(units) - 1 else ''))
        lines.append(']}' + (',' if li < len(data['levels']) - 1 else ''))
    lines.append(']};')
    text = '\n'.join(lines) + '\n'
    text += ("\nif (typeof module !== 'undefined' && module.exports) {\n"
             "  module.exports = %s;\n}\n" % name)
    text += register_footer('course', code, name)
    return text


def write(code, data, header, path=None):
    text = render(code, data, header)
    with io.open(path or path_for(code), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)
    return len(text.encode('utf-8'))
