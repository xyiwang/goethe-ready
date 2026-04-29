const grammarPoints = [
  {
    id: 1,
    title: 'Konjunktiv II',
    title_en: 'Subjunctive II',
    explanation_zh:
      '用于表达假设、愿望或礼貌请求。常见形式：wuerde + 动词原形，或 haette/waere 等不规则形式。',
    explanation_en:
      'Used to express hypothetical situations, wishes, or polite requests.',
    examples_de: ['Wenn ich Zeit haette, wuerde ich reisen.', 'Koennten Sie mir bitte helfen?'],
    questions: [
      {
        id: 1,
        question: 'Wenn ich mehr Geld _____, wuerde ich eine Weltreise machen.',
        options: ['habe', 'haette', 'hatte', 'haben'],
        answer: 1,
        explanation_zh: '条件句中用 Konjunktiv II，haben 的虚拟式是 haette。',
        explanation_en:
          'Conditional clauses use Konjunktiv II; haette is the subjunctive form of haben.',
      },
      {
        id: 2,
        question: 'Ich wuenschte, ich _____ heute frei.',
        options: ['bin', 'waere', 'war', 'sei'],
        answer: 1,
        explanation_zh: '愿望表达常用虚拟式，sein 对应 waere。',
        explanation_en: 'Wishes usually use the subjunctive; waere is used with sein.',
      },
      {
        id: 3,
        question: '_____ du mir bitte den Weg zeigen?',
        options: ['Kannst', 'Koenntest', 'Konntest', 'Kann'],
        answer: 1,
        explanation_zh: '礼貌请求更常用 Koenntest。',
        explanation_en: 'Koenntest is preferred for polite requests.',
      },
    ],
  },
  {
    id: 2,
    title: 'Passiv',
    title_en: 'Passive Voice',
    explanation_zh: '强调动作或过程本身，而非执行者。常见结构：werden + Partizip II。',
    explanation_en:
      'The passive emphasizes the action or process rather than the doer.',
    examples_de: ['Das Haus wird gebaut.', 'Der Brief wurde geschrieben.'],
    questions: [
      {
        id: 1,
        question: 'Die Tuere _____ morgen repariert.',
        options: ['wird', 'ist', 'hat', 'war'],
        answer: 0,
        explanation_zh: '现在时被动：wird + Partizip II。',
        explanation_en: 'Present passive uses wird + past participle.',
      },
      {
        id: 2,
        question: 'Der Text _____ gestern gelesen.',
        options: ['wird', 'wurde', 'ist', 'hat'],
        answer: 1,
        explanation_zh: '过去时被动用 wurde。',
        explanation_en: 'Simple past passive uses wurde.',
      },
      {
        id: 3,
        question: 'Viele Fragen _____ im Unterricht erklaert.',
        options: ['werden', 'haben', 'sind', 'waren'],
        answer: 0,
        explanation_zh: '复数主语对应 werden。',
        explanation_en: 'A plural subject takes werden in passive present.',
      },
    ],
  },
  {
    id: 3,
    title: 'Relativsaetze',
    title_en: 'Relative Clauses',
    explanation_zh: '用关系代词补充说明名词，关系代词的格由从句中的功能决定。',
    explanation_en:
      'Relative clauses provide extra information about a noun using relative pronouns.',
    examples_de: ['Das ist der Mann, der neben mir wohnt.', 'Die Stadt, in der ich lebe, ist klein.'],
    questions: [
      {
        id: 1,
        question: 'Das ist die Frau, _____ ich gestern getroffen habe.',
        options: ['die', 'der', 'den', 'dem'],
        answer: 0,
        explanation_zh: '动词 treffen 需要第四格，先行词 Frau 阴性，关系代词用 die。',
        explanation_en:
          'Treffen takes accusative; with feminine antecedent Frau, the pronoun is die.',
      },
      {
        id: 2,
        question: 'Der Student, _____ Auto kaputt ist, kommt spaeter.',
        options: ['deren', 'dessen', 'dem', 'den'],
        answer: 1,
        explanation_zh: '阳性先行词所有关系用 dessen。',
        explanation_en: 'For masculine possessive relation, use dessen.',
      },
      {
        id: 3,
        question: 'Die Stadt, in _____ ich geboren bin, ist am Meer.',
        options: ['der', 'die', 'dem', 'den'],
        answer: 0,
        explanation_zh: '介词 in + Dativ，阴性单数对应 der。',
        explanation_en:
          'In takes dative here; feminine singular relative pronoun is der.',
      },
    ],
  },
  {
    id: 4,
    title: 'Infinitivkonstruktionen um...zu / ohne...zu / anstatt...zu',
    title_en: 'Infinitive Constructions',
    explanation_zh:
      '用不定式结构表达目的、否定伴随或替代动作。结构常见为 um...zu / ohne...zu / anstatt...zu。',
    explanation_en:
      'These infinitive structures express purpose, absence, or alternative action.',
    examples_de: [
      'Ich lerne viel, um die Pruefung zu bestehen.',
      'Er ging weg, ohne etwas zu sagen.',
    ],
    questions: [
      {
        id: 1,
        question: 'Sie spart Geld, _____ ein Auto zu kaufen.',
        options: ['um', 'ohne', 'anstatt', 'damit'],
        answer: 0,
        explanation_zh: '目的用 um...zu。',
        explanation_en: 'Use um...zu to express purpose.',
      },
      {
        id: 2,
        question: 'Er ging aus dem Zimmer, _____ sich zu verabschieden.',
        options: ['um', 'ohne', 'anstatt', 'damit'],
        answer: 1,
        explanation_zh: '未做某事用 ohne...zu。',
        explanation_en: 'Use ohne...zu for “without doing something.”',
      },
      {
        id: 3,
        question: 'Sie sieht fern, _____ zu lernen.',
        options: ['um', 'ohne', 'anstatt', 'dass'],
        answer: 2,
        explanation_zh: '“而不是”用 anstatt...zu。',
        explanation_en: 'Anstatt...zu means “instead of doing.”',
      },
    ],
  },
  {
    id: 5,
    title:
      'Zweiteilige Konnektoren (sowohl...als auch / entweder...oder / weder...noch / zwar...aber)',
    title_en: 'Two-part Connectors',
    explanation_zh:
      '双连接词用于并列、选择、否定并列或让步转折，结构成对出现且语义固定。',
    explanation_en:
      'Two-part connectors express addition, choice, negative pairing, or contrast.',
    examples_de: ['Sowohl Anna als auch Tom kommen.', 'Zwar ist es teuer, aber sehr gut.'],
    questions: [
      {
        id: 1,
        question: '_____ du kommst heute, _____ morgen.',
        options: ['Sowohl ... als auch', 'Entweder ... oder', 'Weder ... noch', 'Zwar ... aber'],
        answer: 1,
        explanation_zh: '二选一用 entweder...oder。',
        explanation_en: 'Use entweder...oder for a choice between two options.',
      },
      {
        id: 2,
        question: 'Er spricht _____ Deutsch _____ Englisch.',
        options: ['zwar ... aber', 'weder ... noch', 'entweder ... oder', 'sowohl ... als auch'],
        answer: 3,
        explanation_zh: '“两者都”用 sowohl...als auch。',
        explanation_en: 'Sowohl...als auch means “both ... and ...”.',
      },
      {
        id: 3,
        question: '_____ ist der Film lang, _____ er ist spannend.',
        options: ['Sowohl ... als auch', 'Weder ... noch', 'Zwar ... aber', 'Entweder ... oder'],
        answer: 2,
        explanation_zh: '让步转折固定搭配 zwar...aber。',
        explanation_en: 'Zwar...aber is the standard concessive contrast pair.',
      },
    ],
  },
  {
    id: 6,
    title: 'Kausale Konnektoren (weil / da / denn / deshalb / deswegen)',
    title_en: 'Causal Connectors',
    explanation_zh: '表示原因和结果。weil/da 引导从句，denn/deshalb/deswegen 多用于主句连接。',
    explanation_en:
      'They express cause and result; weil/da introduce subordinate clauses.',
    examples_de: ['Ich bleibe zu Hause, weil ich krank bin.', 'Es regnet, deshalb bleiben wir drin.'],
    questions: [
      {
        id: 1,
        question: 'Ich komme spaeter, _____ ich noch arbeiten muss.',
        options: ['denn', 'weil', 'deshalb', 'deswegen'],
        answer: 1,
        explanation_zh: 'weil 引导原因从句，动词后置。',
        explanation_en: 'Weil introduces a causal subordinate clause.',
      },
      {
        id: 2,
        question: 'Es war spaet, _____ gingen wir nach Hause.',
        options: ['da', 'weil', 'deshalb', 'denn'],
        answer: 2,
        explanation_zh: '结果关系可用 deshalb 连接主句。',
        explanation_en: 'Deshalb links two main clauses with a result meaning.',
      },
      {
        id: 3,
        question: 'Ich gehe nicht schwimmen, _____ das Wasser zu kalt ist.',
        options: ['denn', 'weil', 'deshalb', 'deswegen'],
        answer: 1,
        explanation_zh: '明确原因时常用 weil 从句。',
        explanation_en: 'Use weil to state the explicit reason.',
      },
    ],
  },
  {
    id: 7,
    title: 'Konzessive Konnektoren (obwohl / trotzdem / dennoch)',
    title_en: 'Concessive Connectors',
    explanation_zh: '表示“虽然...但是...”。obwohl 引导从句，trotzdem/dennoch 常接主句。',
    explanation_en:
      'They express concession: “although ... still ...”.',
    examples_de: ['Obwohl es regnet, gehen wir spazieren.', 'Es regnet, trotzdem gehen wir raus.'],
    questions: [
      {
        id: 1,
        question: '_____ er muede ist, arbeitet er weiter.',
        options: ['Weil', 'Obwohl', 'Da', 'Wenn'],
        answer: 1,
        explanation_zh: '让步从句用 obwohl。',
        explanation_en: 'Obwohl introduces a concessive subordinate clause.',
      },
      {
        id: 2,
        question: 'Es war teuer, _____ habe ich es gekauft.',
        options: ['denn', 'trotzdem', 'weil', 'da'],
        answer: 1,
        explanation_zh: '主句转折关系可用 trotzdem。',
        explanation_en: 'Trotzdem marks concession between main clauses.',
      },
      {
        id: 3,
        question: 'Er hatte wenig Zeit, _____ hat er mir geholfen.',
        options: ['dennoch', 'da', 'weil', 'wenn'],
        answer: 0,
        explanation_zh: 'dennoch 也表示“尽管如此”。',
        explanation_en: 'Dennoch also means “nevertheless”.',
      },
    ],
  },
  {
    id: 8,
    title: 'Temporale Konnektoren (als / wenn / waehrend / bevor / nachdem / seitdem)',
    title_en: 'Temporal Connectors',
    explanation_zh: '表示时间先后、同时或起点。连接词不同，时态和语义也不同。',
    explanation_en:
      'Temporal connectors express sequence, simultaneity, or starting points in time.',
    examples_de: ['Als ich klein war, spielte ich viel.', 'Bevor ich gehe, rufe ich dich an.'],
    questions: [
      {
        id: 1,
        question: '_____ ich klein war, wohnte ich in Berlin.',
        options: ['Wenn', 'Als', 'Bevor', 'Nachdem'],
        answer: 1,
        explanation_zh: '一次性过去事件常用 als。',
        explanation_en: 'Als is used for a one-time event in the past.',
      },
      {
        id: 2,
        question: 'Ich trinke Kaffee, _____ ich arbeite.',
        options: ['als', 'wenn', 'bevor', 'nachdem'],
        answer: 1,
        explanation_zh: '重复或一般条件用 wenn。',
        explanation_en: 'Wenn is used for repeated/general time situations.',
      },
      {
        id: 3,
        question: '_____ ich gegessen hatte, ging ich schlafen.',
        options: ['Waehrend', 'Bevor', 'Nachdem', 'Seitdem'],
        answer: 2,
        explanation_zh: '动作先后“之后”用 nachdem。',
        explanation_en: 'Nachdem indicates one action happens after another.',
      },
    ],
  },
  {
    id: 9,
    title: 'Modalverben',
    title_en: 'Modal Verbs',
    explanation_zh:
      '情态动词表达能力、许可、义务、意愿等；句末常保留动词原形。',
    explanation_en:
      'Modal verbs express ability, permission, obligation, or intention.',
    examples_de: ['Ich muss heute lernen.', 'Darf ich hier sitzen?'],
    questions: [
      {
        id: 1,
        question: 'Du _____ heute frueh aufstehen.',
        options: ['kannst', 'musst', 'darfst', 'willst'],
        answer: 1,
        explanation_zh: '义务语境应选 musst。',
        explanation_en: 'Musst is correct for obligation.',
      },
      {
        id: 2,
        question: '_____ ich bitte das Fenster oeffnen?',
        options: ['Muss', 'Kann', 'Darf', 'Soll'],
        answer: 2,
        explanation_zh: '请求许可常用 darf。',
        explanation_en: 'Darf is typically used to ask permission.',
      },
      {
        id: 3,
        question: 'Wir _____ morgen frueher gehen, wenn es noetig ist.',
        options: ['moegen', 'koennen', 'muessten', 'wollen'],
        answer: 1,
        explanation_zh: '表达能力/可能性可用 koennen。',
        explanation_en: 'Koennen fits ability/possibility here.',
      },
    ],
  },
  {
    id: 10,
    title: 'Adjektivdeklination',
    title_en: 'Adjective Declension',
    explanation_zh: '形容词词尾由冠词类型、性数格共同决定。',
    explanation_en:
      'Adjective endings depend on article type, gender, number, and case.',
    examples_de: ['ein gutes Buch', 'mit einem guten Freund'],
    questions: [
      {
        id: 1,
        question: 'Ich habe einen _____ Film gesehen.',
        options: ['gut', 'guter', 'guten', 'gutes'],
        answer: 2,
        explanation_zh: 'Akkusativ 阳性：einen + -en。',
        explanation_en: 'Masculine accusative after einen takes -en.',
      },
      {
        id: 2,
        question: 'Sie wohnt in einer _____ Wohnung.',
        options: ['grossen', 'grosse', 'grosser', 'grosses'],
        answer: 0,
        explanation_zh: 'Dativ 阴性：einer + -en。',
        explanation_en: 'Feminine dative after einer takes -en.',
      },
      {
        id: 3,
        question: 'Das ist ein _____ Auto.',
        options: ['neuen', 'neuer', 'neues', 'neuem'],
        answer: 2,
        explanation_zh: 'Nominativ 中性：ein + -es。',
        explanation_en: 'Neuter nominative after ein takes -es.',
      },
    ],
  },
  {
    id: 11,
    title: 'Komparativ und Superlativ',
    title_en: 'Comparative and Superlative',
    explanation_zh: '比较级多用 -er，最高级常用 am ...-sten 或定冠词 + -ste。',
    explanation_en:
      'Comparative uses -er; superlative often uses am ...-sten.',
    examples_de: ['Mein Bruder ist groesser als ich.', 'Heute ist es am kaeltesten.'],
    questions: [
      {
        id: 1,
        question: 'Anna ist _____ als Maria.',
        options: ['schnell', 'schneller', 'am schnellsten', 'schnellste'],
        answer: 1,
        explanation_zh: '“比”结构用比较级。',
        explanation_en: 'Use comparative for “than” structures.',
      },
      {
        id: 2,
        question: 'Heute ist es _____ Tag der Woche.',
        options: ['waermer', 'am waermsten', 'der waermste', 'waermste'],
        answer: 2,
        explanation_zh: '名词前作定语最高级要带冠词：der waermste。',
        explanation_en: 'Before a noun, use article + superlative adjective.',
      },
      {
        id: 3,
        question: 'Von allen Studenten spricht er _____.',
        options: ['am besten', 'besser', 'der beste', 'gut'],
        answer: 0,
        explanation_zh: '副词最高级常用 am ...-sten。',
        explanation_en: 'Adverbial superlative often takes am ...-sten.',
      },
    ],
  },
  {
    id: 12,
    title: 'Reflexive Verben',
    title_en: 'Reflexive Verbs',
    explanation_zh: '反身动词需要反身代词，常见格为 Akkusativ 或 Dativ。',
    explanation_en:
      'Reflexive verbs require a reflexive pronoun, often in accusative or dative.',
    examples_de: ['Ich interessiere mich fuer Musik.', 'Wir treffen uns morgen.'],
    questions: [
      {
        id: 1,
        question: 'Ich freue _____ auf den Urlaub.',
        options: ['mich', 'mir', 'dich', 'sich'],
        answer: 0,
        explanation_zh: 'sich freuen 用 Akkusativ 反身代词：mich。',
        explanation_en: 'Sich freuen takes accusative reflexive pronouns: mich.',
      },
      {
        id: 2,
        question: 'Wir treffen _____ um 18 Uhr.',
        options: ['uns', 'euch', 'sich', 'mich'],
        answer: 0,
        explanation_zh: '主语 wir 对应 uns。',
        explanation_en: 'With wir, the reflexive pronoun is uns.',
      },
      {
        id: 3,
        question: 'Er kann _____ gut konzentrieren.',
        options: ['ihn', 'ihm', 'sich', 'mich'],
        answer: 2,
        explanation_zh: '主语 er 的反身代词是 sich。',
        explanation_en: 'For er, the reflexive pronoun is sich.',
      },
    ],
  },
  {
    id: 13,
    title: 'Praepositionen mit Kasus',
    title_en: 'Prepositions and Case',
    explanation_zh: '不同介词支配不同格；双向介词还要根据静态/动态判断。',
    explanation_en:
      'Different prepositions govern different cases; two-way prepositions depend on movement vs location.',
    examples_de: ['mit dem Freund', 'in die Stadt / in der Stadt'],
    questions: [
      {
        id: 1,
        question: 'Ich fahre _____ Bus zur Arbeit.',
        options: ['mit dem', 'mit den', 'durch den', 'fuer den'],
        answer: 0,
        explanation_zh: 'mit 支配第三格：mit dem Bus。',
        explanation_en: 'Mit governs dative: mit dem Bus.',
      },
      {
        id: 2,
        question: 'Wir gehen _____ Kino.',
        options: ['im', 'ins', 'in dem', 'am'],
        answer: 1,
        explanation_zh: '有方向移动用 Akkusativ：ins Kino。',
        explanation_en: 'Movement takes accusative: ins Kino.',
      },
      {
        id: 3,
        question: 'Das Buch liegt _____ Tisch.',
        options: ['auf den', 'auf dem', 'an den', 'an dem'],
        answer: 1,
        explanation_zh: '静态位置用 Dativ：auf dem Tisch。',
        explanation_en: 'Static location takes dative: auf dem Tisch.',
      },
    ],
  },
  {
    id: 14,
    title: 'Genitivkonstruktionen',
    title_en: 'Genitive Constructions',
    explanation_zh: '第二格常表示所属关系，也常见于书面语固定结构。',
    explanation_en:
      'Genitive often expresses possession and appears in formal written style.',
    examples_de: ['das Auto meines Vaters', 'waehrend des Urlaubs'],
    questions: [
      {
        id: 1,
        question: 'Das ist die Tasche _____ Frau.',
        options: ['der', 'die', 'dem', 'den'],
        answer: 0,
        explanation_zh: '阴性所有关系第二格是 der Frau。',
        explanation_en: 'Feminine genitive is der Frau.',
      },
      {
        id: 2,
        question: 'Waehrend _____ Reise habe ich viel gelernt.',
        options: ['die', 'der', 'des', 'dem'],
        answer: 1,
        explanation_zh: 'Reise 阴性，Genitiv 为 der Reise。',
        explanation_en: 'Reise is feminine, so genitive is der Reise.',
      },
      {
        id: 3,
        question: 'Das Ende _____ Films war traurig.',
        options: ['den', 'des', 'dem', 'der'],
        answer: 1,
        explanation_zh: '阳/中性单数第二格多为 -s/-es：des Films。',
        explanation_en: 'Masculine/neuter singular genitive uses des + -(e)s.',
      },
    ],
  },
  {
    id: 15,
    title: 'Indirekte Rede',
    title_en: 'Reported Speech',
    explanation_zh: '间接引语常用于转述他人观点，形式上可用 Konjunktiv I/II 或 wuerde 结构。',
    explanation_en:
      'Reported speech conveys someone else’s statement using reported forms.',
    examples_de: ['Er sagt, er sei krank.', 'Sie meinte, sie wuerde spaeter kommen.'],
    questions: [
      {
        id: 1,
        question: 'Er sagte, er _____ keine Zeit.',
        options: ['hat', 'haette', 'hatte', 'ist'],
        answer: 1,
        explanation_zh: '转述语气常用虚拟式，如 haette。',
        explanation_en: 'Reported speech often takes subjunctive forms like haette.',
      },
      {
        id: 2,
        question: 'Sie meinte, sie _____ morgen kommen.',
        options: ['wird', 'wuerde', 'kam', 'komme'],
        answer: 1,
        explanation_zh: '将来意义转述常见 wuerde + Infinitiv。',
        explanation_en: 'Wuerde + infinitive is common for future in reported speech.',
      },
      {
        id: 3,
        question: 'Der Lehrer sagte, wir _____ mehr ueben.',
        options: ['sollen', 'sollten', 'muessen', 'muessten'],
        answer: 1,
        explanation_zh: '转述建议语气可用 sollten。',
        explanation_en: 'Reported recommendations can be expressed with sollten.',
      },
    ],
  },
  {
    id: 16,
    title: 'Futur I',
    title_en: 'Future Tense I',
    explanation_zh: 'Futur I 由 werden + Infinitiv 构成，用于表达将来计划或推测。',
    explanation_en:
      'Futur I is formed with werden + infinitive for future actions or assumptions.',
    examples_de: ['Ich werde morgen arbeiten.', 'Er wird schon zu Hause sein.'],
    questions: [
      {
        id: 1,
        question: 'Ich _____ naechste Woche nach Hamburg fahren.',
        options: ['werde', 'wird', 'bin', 'habe'],
        answer: 0,
        explanation_zh: '第一人称单数 Futur I 用 werde。',
        explanation_en: 'First person singular uses werde in Futur I.',
      },
      {
        id: 2,
        question: 'Sie _____ bald ankommen.',
        options: ['werde', 'wirst', 'wird', 'werden'],
        answer: 2,
        explanation_zh: '第三人称单数搭配 wird。',
        explanation_en: 'Third person singular takes wird.',
      },
      {
        id: 3,
        question: 'Wir _____ das Problem loesen.',
        options: ['wird', 'werden', 'seid', 'habt'],
        answer: 1,
        explanation_zh: 'wir 对应 werden。',
        explanation_en: 'With wir, use werden.',
      },
    ],
  },
  {
    id: 17,
    title: 'Perfekt vs Praeteritum',
    title_en: 'Perfect vs Simple Past',
    explanation_zh:
      '口语中常用 Perfekt，叙事和书面语常用 Praeteritum，尤其是 sein/haben/Modalverben。',
    explanation_en:
      'Perfekt is common in spoken German, while Praeteritum is frequent in narration and writing.',
    examples_de: ['Ich habe ihn gesehen.', 'Frueher wohnte ich in Koeln.'],
    questions: [
      {
        id: 1,
        question: 'Gestern _____ ich sehr muede.',
        options: ['bin', 'war', 'habe gewesen', 'gewesen'],
        answer: 1,
        explanation_zh: 'sein 在过去叙述中常用 war（Praeteritum）。',
        explanation_en: 'For sein in past narration, war is standard.',
      },
      {
        id: 2,
        question: 'Ich _____ heute Morgen gefruehstueckt.',
        options: ['habe', 'bin', 'war', 'hatte'],
        answer: 0,
        explanation_zh: '及物动词 Perfekt 常用 haben + Partizip II。',
        explanation_en: 'Perfekt commonly uses haben + past participle for transitive verbs.',
      },
      {
        id: 3,
        question: 'Als Kind _____ ich jeden Tag Fussball.',
        options: ['habe gespielt', 'spielte', 'bin gespielt', 'gespielt habe'],
        answer: 1,
        explanation_zh: '过去习惯动作叙述可用 Praeteritum：spielte。',
        explanation_en: 'Repeated past habits in narration often use Praeteritum.',
      },
    ],
  },
  {
    id: 18,
    title: 'Trennbare Verben',
    title_en: 'Separable Verbs',
    explanation_zh: '可分动词在主句中前后分离，在从句和不定式结构中通常不分离。',
    explanation_en:
      'Separable verbs split in main clauses, but often stay together in subordinate/infinitive forms.',
    examples_de: ['Ich stehe frueh auf.', '..., weil ich frueh aufstehe.'],
    questions: [
      {
        id: 1,
        question: 'Ich _____ morgen um sechs _____.',
        options: ['stehe ... auf', 'aufstehe ...', 'stehe auf ...', 'auf ... stehe'],
        answer: 0,
        explanation_zh: '主句第二位动词，前缀句末：stehe ... auf。',
        explanation_en: 'In main clauses, the prefix moves to the end.',
      },
      {
        id: 2,
        question: 'Er sagt, dass er frueh _____.',
        options: ['aufsteht', 'steht auf', 'auf stehen', 'aufstehen'],
        answer: 0,
        explanation_zh: '从句里通常不分离：aufsteht。',
        explanation_en: 'In subordinate clauses, separable verbs stay together.',
      },
      {
        id: 3,
        question: 'Wir wollen morgen frueh _____.',
        options: ['aufstehen', 'stehen auf', 'auf steht', 'aufgestanden'],
        answer: 0,
        explanation_zh: '不定式结构用连写：aufstehen。',
        explanation_en: 'Use the full infinitive form in infinitive constructions.',
      },
    ],
  },
  {
    id: 19,
    title: 'Wortstellung',
    title_en: 'Word Order Rules',
    explanation_zh: '主句动词第二位，从句动词后置；时间方式地点常见顺序为 TMP。',
    explanation_en:
      'Main clause verbs are in second position, while subordinate clause verbs go to the end.',
    examples_de: ['Heute gehe ich ins Kino.', '..., weil ich keine Zeit habe.'],
    questions: [
      {
        id: 1,
        question: 'Morgen _____ ich nach Berlin.',
        options: ['fahre', 'ich fahre', 'fahre ich', 'ich'],
        answer: 0,
        explanation_zh: '主句前置时间状语后，动词仍在第二位。',
        explanation_en: 'After a fronted adverbial, the verb still stays second.',
      },
      {
        id: 2,
        question: 'Ich bleibe zu Hause, weil ich krank _____.',
        options: ['bin', 'ist', 'sein', 'war'],
        answer: 0,
        explanation_zh: 'weil 从句动词后置：... weil ich krank bin。',
        explanation_en: 'In weil-clauses, the verb moves to the end.',
      },
      {
        id: 3,
        question: 'Heute _____ ich mit dem Bus zur Arbeit.',
        options: ['fahre', 'ich fahre', 'fahre ich', 'bin'],
        answer: 0,
        explanation_zh: '主句依旧动词第二位：Heute fahre ich ...',
        explanation_en: 'Verb second still applies: Heute fahre ich ...',
      },
    ],
  },
  {
    id: 20,
    title: 'n-Deklination',
    title_en: 'N-declension Nouns',
    explanation_zh:
      '部分阳性名词在除第一格单数外加 -n/-en，如 der Student, den Studenten。',
    explanation_en:
      'Certain masculine nouns take -n/-en in all forms except nominative singular.',
    examples_de: ['der Student, den Studenten', 'mit dem Kollegen'],
    questions: [
      {
        id: 1,
        question: 'Ich sehe den _____ jeden Tag.',
        options: ['Student', 'Studenten', 'Studentes', 'Studente'],
        answer: 1,
        explanation_zh: 'Akkusativ 阳性 n-Deklination 要加 -en。',
        explanation_en: 'Masculine accusative in n-declension takes -en.',
      },
      {
        id: 2,
        question: 'Ich spreche mit dem _____.',
        options: ['Kollege', 'Kollegen', 'Kolleges', 'Kolleg'],
        answer: 1,
        explanation_zh: 'Dativ 单数同样加 -n/-en：dem Kollegen。',
        explanation_en: 'Dative singular also takes -n/-en: dem Kollegen.',
      },
      {
        id: 3,
        question: 'Die Meinung des _____ ist interessant.',
        options: ['Student', 'Studenten', 'Students', 'Studentes'],
        answer: 1,
        explanation_zh: 'Genitiv 也遵循弱变化：des Studenten。',
        explanation_en: 'Genitive also follows n-declension: des Studenten.',
      },
    ],
  },
]

const DEFAULT_RESOURCES = [
  {
    name_zh: 'Deutsche Welle 练习',
    name_en: 'Deutsche Welle Practice',
    url: 'https://learngerman.dw.com',
  },
  {
    name_zh: 'Schubert Verlag 在线题库',
    name_en: 'Schubert Verlag B1 Exercises',
    url: 'https://www.schubert-verlag.de/aufgaben/uebungen_b1',
  },
]

function buildExtraQuestions(point) {
  return [
    {
      id: 4,
      question: `Welche Umformung passt am besten zu "${point.title}"?`,
      options_zh: [
        '意义不清，语法结构破裂',
        '句子功能保留，语法结构正确',
        '只做了词序替换，语法未对应',
        '动词位置错误，违反该语法规则',
      ],
      options_en: [
        'The meaning becomes unclear and the grammar collapses.',
        'The sentence function is preserved and the grammar is correct.',
        'Only the word order is changed without proper grammar.',
        'The verb position violates the target grammar rule.',
      ],
      answer: 1,
      explanation_zh: `${point.title} 的改写题先看句子功能，再检查结构是否完整。`,
      explanation_en: `For ${point.title}, first keep the sentence function, then check structure accuracy.`,
    },
    {
      id: 5,
      question: `Welche Variante ist fuer "${point.title}" grammatisch korrekt?`,
      options_zh: [
        '时态和语序同时出错',
        '意义清晰，形式匹配语法规则',
        '动词形式与主语不一致',
        '连接词后仍使用了主句语序',
      ],
      options_en: [
        'Tense and word order are both wrong.',
        'Meaning is clear and grammar is correct.',
        'The verb form does not agree with the subject.',
        'Main-clause word order is incorrectly kept after the connector.',
      ],
      answer: 1,
      explanation_zh: '改写判断重点在语序、动词形态和连接词后的结构。',
      explanation_en:
        'In rewriting tasks, focus on word order, verb form, and clause structure after connectors.',
    },
    {
      id: 6,
      question: `Im Rahmen von "${point.title}" waehlen Sie die beste Form.`,
      options_zh: [
        '语义接近，但句法结构错误',
        '语义与句法都符合目标语法',
        '忽略了格变化或动词规则',
        '混用了两个不兼容结构',
      ],
      options_en: [
        'The meaning is close, but the syntax is incorrect.',
        'Both meaning and syntax fit the target grammar.',
        'It ignores case or verb agreement rules.',
        'It mixes two incompatible structures.',
      ],
      answer: 1,
      explanation_zh: 'B1 改写题要求“意思不变 + 语法正确”同时满足。',
      explanation_en:
        'B1 rewriting requires both meaning preservation and grammatical correctness.',
    },
    {
      id: 7,
      question: `Im Dialog ist "${point.title}" noetig. Welche Option passt?`,
      options_zh: [
        '语境相关，但语法结构断裂',
        '语法正确且语境匹配',
        '词义相关，但结构规则错误',
        '时态和连接方式都不符合语境',
      ],
      options_en: [
        'Relevant context, but broken grammar structure.',
        'Correct grammar and contextually appropriate.',
        'Related meaning, but structural rule is wrong.',
        'Both tense and connector usage are contextually incorrect.',
      ],
      answer: 1,
      explanation_zh: '语境题先看交际意图，再验证该语法点是否真正成立。',
      explanation_en:
        'In context tasks, identify communicative intent first, then confirm the target grammar point.',
    },
    {
      id: 8,
      question: `Welche Antwort entspricht "${point.title}" im Gesamtzusammenhang?`,
      options_zh: [
        '局部语法正确，但破坏整体逻辑',
        '语法与逻辑都和上下文一致',
        '语境看似合理，但目标结构不成立',
        '表达看似高级，但与时态冲突',
      ],
      options_en: [
        'Partly grammatical but breaks the overall logic.',
        'Both grammar and logic match the context.',
        'Context seems fine, but target structure is wrong.',
        'Looks advanced, but conflicts with tense in context.',
      ],
      answer: 1,
      explanation_zh: '完整句语境题需要同时满足语法、语义和衔接。',
      explanation_en: 'A full-context item must satisfy grammar, meaning, and cohesion together.',
    },
    {
      id: 9,
      question: `Fuer "${point.title}" ist welche Loesung am natuerlichsten?`,
      options_zh: [
        '表达生硬并带有典型陷阱',
        '表达自然且符合 B1 常见句型',
        '口语感强但语法结构不完整',
        '形式正式但词语搭配不当',
      ],
      options_en: [
        'Stiff expression with a typical exam trap.',
        'Natural expression that matches common B1 patterns.',
        'Conversational style but incomplete grammar structure.',
        'Formal tone but incorrect lexical collocation.',
      ],
      answer: 1,
      explanation_zh: 'B1 语境题常考“自然表达 + 结构正确”的平衡。',
      explanation_en:
        'B1 context items often test the balance of natural expression and correct structure.',
    },
    {
      id: 10,
      question: `Bei "${point.title}" waehlen Sie die insgesamt beste Antwort.`,
      options_zh: [
        '只满足一个局部规则',
        '同时满足语法、语境逻辑与表达自然度',
        '词汇较高级但核心语法偏离',
        '句子可懂但评分点会明显扣分',
      ],
      options_en: [
        'Only one local rule is satisfied.',
        'Grammar, context logic, and natural expression all match.',
        'Vocabulary is advanced but core grammar is off target.',
        'Understandable sentence, but major scoring penalties remain.',
      ],
      answer: 1,
      explanation_zh: '综合题看整体表现：规则准确、语境合理、表达得体。',
      explanation_en:
        'Integrated items reward overall quality: correct rules, coherent context, and appropriate expression.',
    },
  ]
}

function typeByQuestionId(id) {
  if (id >= 1 && id <= 3) {
    return { type_zh: '填空', type_en: 'Fill in' }
  }
  if (id >= 4 && id <= 6) {
    return { type_zh: '改写', type_en: 'Rewrite' }
  }
  return { type_zh: '综合', type_en: 'Comprehensive' }
}

function withLocalizedOptions(question) {
  const fallback = Array.isArray(question.options) ? question.options : []
  const zhOptions = Array.isArray(question.options_zh) ? question.options_zh : fallback
  const enOptions = Array.isArray(question.options_en) ? question.options_en : fallback
  return {
    ...question,
    options_zh: zhOptions,
    options_en: enOptions,
    ...typeByQuestionId(question.id),
  }
}

function enrichPoint(point) {
  const extra = buildExtraQuestions(point)
  return {
    ...point,
    questions: [...point.questions, ...extra].map(withLocalizedOptions),
    tips_zh: `${point.title} 常见陷阱：先判断句子功能（陈述/条件/转折），再检查动词位置与格变化；记忆口诀是“先结构，后词形”。`,
    tips_en: `Common trap in ${point.title}: identify sentence function first, then check verb position and case; memory rule: structure first, forms second.`,
    resources: DEFAULT_RESOURCES,
  }
}

export default grammarPoints.map(enrichPoint)
