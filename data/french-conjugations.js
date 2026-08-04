// French conjugation curriculum for the shared Dimenticato conjugation engine.
// The data is generated locally from reviewed paradigms so the source remains
// compact while every exercise receives the same schema as Italian/German/English.

(function () {
  'use strict';

  const PERSONS = ['je', 'tu', 'il_elle_on', 'nous', 'vous', 'ils_elles'];
  const AVOIR = ['ai', 'as', 'a', 'avons', 'avez', 'ont'];
  const ETRE = ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'];
  const IMPARFAIT_ENDINGS = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
  const FUTURE_ENDINGS = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
  const CONDITIONAL_ENDINGS = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];

  function personForms(values) {
    return Object.fromEntries(PERSONS.map((person, index) => [person, values[index] || '']));
  }

  function regularPresent(infinitive, group) {
    if (group === 'er') {
      const stem = infinitive.slice(0, -2);
      return [`${stem}e`, `${stem}es`, `${stem}e`, `${stem}ons`, `${stem}ez`, `${stem}ent`];
    }
    if (group === 'ir') {
      const stem = infinitive.slice(0, -2);
      return [`${stem}is`, `${stem}is`, `${stem}it`, `${stem}issons`, `${stem}issez`, `${stem}issent`];
    }
    const stem = infinitive.slice(0, -2);
    return [`${stem}s`, `${stem}s`, stem, `${stem}ons`, `${stem}ez`, `${stem}ent`];
  }

  function defaultParticiple(infinitive, group) {
    const stem = infinitive.slice(0, -2);
    if (group === 'er') return `${stem}é`;
    if (group === 'ir') return `${stem}i`;
    return `${stem}u`;
  }

  function defaultImperative(present, group) {
    let tu = present[1];
    if (group === 'er' && tu.endsWith('es')) tu = tu.slice(0, -1);
    return [tu, present[3], present[4]];
  }

  function deriveSubjunctive(present) {
    const pluralStem = present[5].endsWith('ent') ? present[5].slice(0, -3) : present[5];
    const nousStem = present[3].endsWith('ons') ? present[3].slice(0, -3) : present[3];
    return [
      `${pluralStem}e`, `${pluralStem}es`, `${pluralStem}e`,
      `${nousStem}ions`, `${nousStem}iez`, `${pluralStem}ent`
    ];
  }

  function compoundPast(auxiliary, participle) {
    if (auxiliary !== 'être') {
      return AVOIR.map(form => `${form} ${participle}`);
    }
    return [
      `${ETRE[0]} ${participle}/${ETRE[0]} ${participle}e`,
      `${ETRE[1]} ${participle}/${ETRE[1]} ${participle}e`,
      `${ETRE[2]} ${participle}/${ETRE[2]} ${participle}e`,
      `${ETRE[3]} ${participle}s/${ETRE[3]} ${participle}es`,
      `${ETRE[4]} ${participle}/${ETRE[4]} ${participle}e/${ETRE[4]} ${participle}s/${ETRE[4]} ${participle}es`,
      `${ETRE[5]} ${participle}s/${ETRE[5]} ${participle}es`
    ];
  }

  function makeVerb(definition, index) {
    const present = definition.present || regularPresent(definition.infinitive, definition.group);
    const imperfectStem = definition.imperfectStem ?? (
      present[3].endsWith('ons') ? present[3].slice(0, -3) : present[3]
    );
    const futureStem = definition.futureStem ?? (
      definition.group === 're' ? definition.infinitive.slice(0, -1) : definition.infinitive
    );
    const participle = definition.participle || defaultParticiple(definition.infinitive, definition.group);
    const subjunctive = definition.subjunctive || deriveSubjunctive(present);
    const imperative = definition.imperative === false
      ? []
      : (definition.imperative || defaultImperative(present, definition.group));

    const imperativeForms = personForms([
      '', imperative[0] || '', '', imperative[1] || '', imperative[2] || '', ''
    ]);

    return {
      rank: index + 1,
      infinitive: definition.infinitive,
      english: definition.meaning,
      chinese: definition.meaning,
      source: 'Dimenticato French curriculum (A1-B1)',
      tenses: {
        indicatif_present: {
          type: 'person', group_label: 'Indicatif', tense_label: 'Présent', forms: personForms(present)
        },
        indicatif_imparfait: {
          type: 'person', group_label: 'Indicatif', tense_label: 'Imparfait',
          forms: personForms(IMPARFAIT_ENDINGS.map(ending => `${imperfectStem}${ending}`))
        },
        indicatif_passe_compose: {
          type: 'person', group_label: 'Indicatif', tense_label: 'Passé composé',
          forms: personForms(compoundPast(definition.auxiliary || 'avoir', participle))
        },
        indicatif_futur_simple: {
          type: 'person', group_label: 'Indicatif', tense_label: 'Futur simple',
          forms: personForms(FUTURE_ENDINGS.map(ending => `${futureStem}${ending}`))
        },
        conditionnel_present: {
          type: 'person', group_label: 'Conditionnel', tense_label: 'Présent',
          forms: personForms(CONDITIONAL_ENDINGS.map(ending => `${futureStem}${ending}`))
        },
        subjonctif_present: {
          type: 'person', group_label: 'Subjonctif', tense_label: 'Présent', forms: personForms(subjunctive)
        },
        imperatif_present: {
          type: 'person', group_label: 'Impératif', tense_label: 'Présent', forms: imperativeForms
        }
      }
    };
  }

  const DEFINITIONS = [
    {
      infinitive: 'être', meaning: '是；存在', group: 'ir',
      present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
      imperfectStem: 'ét', futureStem: 'ser', participle: 'été',
      subjunctive: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
      imperative: ['sois', 'soyons', 'soyez']
    },
    {
      infinitive: 'avoir', meaning: '有；拥有', group: 'ir',
      present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
      imperfectStem: 'av', futureStem: 'aur', participle: 'eu',
      subjunctive: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
      imperative: ['aie', 'ayons', 'ayez']
    },
    {
      infinitive: 'aller', meaning: '去；前往', group: 'er', auxiliary: 'être',
      present: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
      imperfectStem: 'all', futureStem: 'ir', participle: 'allé',
      subjunctive: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
      imperative: ['va', 'allons', 'allez']
    },
    {
      infinitive: 'faire', meaning: '做；制作', group: 're',
      present: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
      imperfectStem: 'fais', futureStem: 'fer', participle: 'fait',
      subjunctive: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
      imperative: ['fais', 'faisons', 'faites']
    },
    {
      infinitive: 'pouvoir', meaning: '能够；可以', group: 'ir',
      present: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
      imperfectStem: 'pouv', futureStem: 'pourr', participle: 'pu',
      subjunctive: ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent'],
      imperative: false
    },
    {
      infinitive: 'vouloir', meaning: '想要；愿意', group: 'ir',
      present: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'],
      imperfectStem: 'voul', futureStem: 'voudr', participle: 'voulu',
      subjunctive: ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent'],
      imperative: ['veuille', 'voulons', 'veuillez']
    },
    {
      infinitive: 'devoir', meaning: '应该；必须', group: 'ir',
      present: ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'],
      imperfectStem: 'dev', futureStem: 'devr', participle: 'dû', imperative: false
    },
    {
      infinitive: 'savoir', meaning: '知道；会', group: 'ir',
      present: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'],
      imperfectStem: 'sav', futureStem: 'saur', participle: 'su',
      subjunctive: ['sache', 'saches', 'sache', 'sachions', 'sachiez', 'sachent'],
      imperative: ['sache', 'sachons', 'sachez']
    },
    {
      infinitive: 'dire', meaning: '说；告诉', group: 're',
      present: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'],
      imperfectStem: 'dis', futureStem: 'dir', participle: 'dit',
      imperative: ['dis', 'disons', 'dites']
    },
    {
      infinitive: 'venir', meaning: '来；来到', group: 'ir', auxiliary: 'être',
      present: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
      imperfectStem: 'ven', futureStem: 'viendr', participle: 'venu',
      imperative: ['viens', 'venons', 'venez']
    },
    {
      infinitive: 'prendre', meaning: '拿；乘坐；吃喝', group: 're',
      present: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
      imperfectStem: 'pren', futureStem: 'prendr', participle: 'pris',
      imperative: ['prends', 'prenons', 'prenez']
    },
    {
      infinitive: 'mettre', meaning: '放置；穿戴', group: 're',
      present: ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'],
      imperfectStem: 'mett', futureStem: 'mettr', participle: 'mis',
      imperative: ['mets', 'mettons', 'mettez']
    },
    {
      infinitive: 'voir', meaning: '看见；理解', group: 're',
      present: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'],
      imperfectStem: 'voy', futureStem: 'verr', participle: 'vu',
      imperative: ['vois', 'voyons', 'voyez']
    },
    {
      infinitive: 'lire', meaning: '阅读', group: 're',
      present: ['lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'],
      imperfectStem: 'lis', futureStem: 'lir', participle: 'lu',
      imperative: ['lis', 'lisons', 'lisez']
    },
    {
      infinitive: 'écrire', meaning: '写', group: 're',
      present: ['écris', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent'],
      imperfectStem: 'écriv', futureStem: 'écrir', participle: 'écrit',
      imperative: ['écris', 'écrivons', 'écrivez']
    },
    {
      infinitive: 'boire', meaning: '喝', group: 're',
      present: ['bois', 'bois', 'boit', 'buvons', 'buvez', 'boivent'],
      imperfectStem: 'buv', futureStem: 'boir', participle: 'bu',
      imperative: ['bois', 'buvons', 'buvez']
    },
    {
      infinitive: 'partir', meaning: '离开；出发', group: 'ir', auxiliary: 'être',
      present: ['pars', 'pars', 'part', 'partons', 'partez', 'partent'],
      imperfectStem: 'part', futureStem: 'partir', participle: 'parti',
      imperative: ['pars', 'partons', 'partez']
    },
    {
      infinitive: 'sortir', meaning: '出去；外出', group: 'ir', auxiliary: 'être',
      present: ['sors', 'sors', 'sort', 'sortons', 'sortez', 'sortent'],
      imperfectStem: 'sort', futureStem: 'sortir', participle: 'sorti',
      imperative: ['sors', 'sortons', 'sortez']
    },
    { infinitive: 'parler', meaning: '说话；谈论', group: 'er' },
    { infinitive: 'aimer', meaning: '喜欢；爱', group: 'er' },
    { infinitive: 'habiter', meaning: '居住', group: 'er' },
    { infinitive: 'travailler', meaning: '工作；学习', group: 'er' },
    { infinitive: 'donner', meaning: '给；给予', group: 'er' },
    { infinitive: 'demander', meaning: '询问；请求', group: 'er' },
    { infinitive: 'trouver', meaning: '找到；觉得', group: 'er' },
    { infinitive: 'penser', meaning: '思考；认为', group: 'er' },
    { infinitive: 'passer', meaning: '经过；度过', group: 'er' },
    {
      infinitive: 'manger', meaning: '吃', group: 'er',
      present: ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'],
      participle: 'mangé'
    },
    {
      infinitive: 'commencer', meaning: '开始', group: 'er',
      present: ['commence', 'commences', 'commence', 'commençons', 'commencez', 'commencent'],
      participle: 'commencé'
    },
    { infinitive: 'finir', meaning: '结束；完成', group: 'ir' },
    { infinitive: 'choisir', meaning: '选择', group: 'ir' },
    { infinitive: 'réussir', meaning: '成功；通过', group: 'ir' },
    { infinitive: 'vendre', meaning: '出售', group: 're' },
    { infinitive: 'attendre', meaning: '等待', group: 're', participle: 'attendu' },
    { infinitive: 'répondre', meaning: '回答', group: 're', participle: 'répondu' }
  ];

  window.FRENCH_CONJUGATION_DATA = DEFINITIONS.map(makeVerb);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.FRENCH_CONJUGATION_DATA;
  }
})();
