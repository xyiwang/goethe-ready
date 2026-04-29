const writingTasks = [
  {
    id: 1,
    theme: 'Freundschaft',
    title_zh: '邀请朋友参加生日聚会',
    title_en: 'Invite a friend to your birthday party',
    prompt_de:
      'Du feierst naechste Woche Geburtstag und moechtest einen Freund / eine Freundin einladen. Schreibe eine E-Mail.',
    checklist_zh: ['说明聚会时间和地点', '告诉对方你准备了什么活动', '请对方尽快回复是否参加'],
    checklist_en: [
      'Mention the time and place',
      'Say what activities you prepared',
      'Ask for a quick reply about attendance',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 2,
    theme: 'Arbeit',
    title_zh: '向同事请假',
    title_en: 'Request leave from work',
    prompt_de:
      'Du kannst morgen nicht zur Arbeit kommen. Schreibe eine E-Mail an deine Kollegin / deinen Kollegen.',
    checklist_zh: ['解释不能上班的原因', '说明你已经完成或交接了哪些工作', '请求对方理解并回复'],
    checklist_en: [
      'Explain why you cannot come',
      'Mention what you have finished or handed over',
      'Ask for understanding and a reply',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 3,
    theme: 'Wohnung',
    title_zh: '向房东报修',
    title_en: 'Report a problem to your landlord',
    prompt_de:
      'In deiner Wohnung gibt es ein Problem (z. B. Heizung, Wasser, Licht). Schreibe eine E-Mail an den Vermieter.',
    checklist_zh: ['描述具体问题和影响', '说明问题持续了多久', '请求尽快维修并约时间'],
    checklist_en: [
      'Describe the exact problem and impact',
      'Say how long the problem has lasted',
      'Ask for quick repair and suggest a time',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 4,
    theme: 'Reise',
    title_zh: '向酒店投诉',
    title_en: 'Complain to a hotel',
    prompt_de:
      'Du warst in einem Hotel und bist unzufrieden. Schreibe eine Beschwerde-E-Mail an das Hotel.',
    checklist_zh: ['说明入住时间和预订信息', '指出不满意之处', '提出你的解决诉求（退款/补偿）'],
    checklist_en: [
      'State your stay date and booking details',
      'Point out what was unsatisfactory',
      'Request a solution (refund/compensation)',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 5,
    theme: 'Kurs',
    title_zh: '报名语言课程咨询',
    title_en: 'Ask about a language course',
    prompt_de:
      'Du moechtest einen Deutschkurs besuchen. Schreibe eine E-Mail an eine Sprachschule und bitte um Informationen.',
    checklist_zh: ['介绍你的目前水平和目标', '询问课程时间与费用', '询问是否有试听或分班测试'],
    checklist_en: [
      'Introduce your level and goal',
      'Ask about schedule and cost',
      'Ask about trial lessons or placement tests',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 6,
    theme: 'Nachbarschaft',
    title_zh: '给邻居写道歉信',
    title_en: 'Write an apology to your neighbor',
    prompt_de:
      'Es war gestern Abend bei dir zu laut. Schreibe eine Entschuldigungs-E-Mail an deine Nachbarin / deinen Nachbarn.',
    checklist_zh: ['对噪音打扰表示歉意', '解释原因但不过度辩解', '提出改进措施并请求谅解'],
    checklist_en: [
      'Apologize for the noise',
      'Explain the reason briefly',
      'Offer improvement and ask for understanding',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 7,
    theme: 'Freizeit',
    title_zh: '组织周末活动',
    title_en: 'Organize a weekend activity',
    prompt_de:
      'Du planst einen Ausflug mit Freunden am Wochenende. Schreibe eine E-Mail an die Gruppe.',
    checklist_zh: ['说明活动内容和集合时间', '建议交通方式与费用分担', '请大家确认是否参加'],
    checklist_en: [
      'Describe the plan and meeting time',
      'Suggest transport and cost sharing',
      'Ask everyone to confirm participation',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 8,
    theme: 'Gesundheit',
    title_zh: '改约医生门诊时间',
    title_en: "Reschedule a doctor's appointment",
    prompt_de:
      'Du hast einen Termin beim Arzt, kannst aber nicht kommen. Schreibe eine E-Mail an die Praxis.',
    checklist_zh: ['说明原预约时间', '解释无法到场的原因', '请求新的预约时间'],
    checklist_en: [
      'Mention the original appointment time',
      'Explain why you cannot attend',
      'Request a new appointment',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 9,
    theme: 'Studium',
    title_zh: '向老师申请延期',
    title_en: 'Ask a teacher for an extension',
    prompt_de:
      'Du kannst deine Aufgabe nicht puenktlich abgeben. Schreibe eine E-Mail an deine Lehrerin / deinen Lehrer.',
    checklist_zh: ['说明延期原因', '说明你已完成的进度', '提出新的提交时间并请求同意'],
    checklist_en: [
      'Explain the reason for delay',
      'State your current progress',
      'Propose a new deadline and ask for approval',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 10,
    theme: 'Veranstaltung',
    title_zh: '报名志愿者活动',
    title_en: 'Apply for a volunteer event',
    prompt_de:
      'In deiner Stadt gibt es ein Kulturfest. Du moechtest als freiwillige Person helfen. Schreibe eine E-Mail an die Organisation.',
    checklist_zh: ['简要介绍自己', '说明你可参与的时间', '询问具体工作内容和要求'],
    checklist_en: [
      'Briefly introduce yourself',
      'State when you are available',
      'Ask about tasks and requirements',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 11,
    theme: 'Einkauf',
    title_zh: '网购退换货',
    title_en: 'Request a return/exchange for an online order',
    prompt_de:
      'Du hast ein Produkt online gekauft, aber es ist defekt oder falsch. Schreibe eine E-Mail an den Kundenservice.',
    checklist_zh: ['提供订单基本信息', '描述商品问题', '提出退货或换货请求'],
    checklist_en: [
      'Provide basic order information',
      'Describe the product issue',
      'Request a return or exchange',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 12,
    theme: 'Verkehr',
    title_zh: '交通卡遗失求助',
    title_en: 'Ask for help after losing a transit card',
    prompt_de:
      'Du hast deine Monatskarte verloren. Schreibe eine E-Mail an den Verkehrsbetrieb.',
    checklist_zh: ['说明遗失时间和地点', '提供身份或卡片相关信息', '询问补办流程和费用'],
    checklist_en: [
      'Mention when and where you lost it',
      'Provide identity/card related details',
      'Ask about replacement process and cost',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 13,
    theme: 'Familie',
    title_zh: '邀请家人来访',
    title_en: 'Invite family members to visit',
    prompt_de:
      'Du wohnst in einer neuen Stadt. Schreibe eine E-Mail an deine Familie und lade sie zu einem Besuch ein.',
    checklist_zh: ['介绍你目前生活情况', '提出建议来访日期', '说明可一起进行的活动'],
    checklist_en: [
      'Describe your current life briefly',
      'Suggest possible visit dates',
      'Mention activities you can do together',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 14,
    theme: 'Technik',
    title_zh: '向客服反馈网络故障',
    title_en: 'Report an internet service issue',
    prompt_de:
      'Seit mehreren Tagen funktioniert dein Internet schlecht. Schreibe eine E-Mail an den Anbieter.',
    checklist_zh: ['说明故障表现与持续时间', '说明已尝试的自助排查', '请求技术支持上门或回电'],
    checklist_en: [
      'Describe the problem and duration',
      'Mention basic troubleshooting you tried',
      'Request technical support or a callback',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 15,
    theme: 'Pruefung',
    title_zh: '向考官机构咨询考试信息',
    title_en: 'Ask an exam center for details',
    prompt_de:
      'Du willst bald eine Deutschpruefung machen. Schreibe eine E-Mail an das Pruefungszentrum.',
    checklist_zh: ['说明你想参加的考试级别', '询问报名截止日期和考试时间', '询问成绩公布时间'],
    checklist_en: [
      'State the exam level you want to take',
      'Ask about registration deadline and exam date',
      'Ask when results will be published',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 16,
    theme: 'Alltag',
    title_zh: '向朋友借东西',
    title_en: 'Borrow something from a friend',
    prompt_de:
      'Du brauchst dringend etwas (z. B. Fahrrad, Buch, Laptop). Schreibe eine E-Mail an einen Freund / eine Freundin.',
    checklist_zh: ['说明借用原因和用途', '说明借用时长', '承诺按时归还并表达感谢'],
    checklist_en: [
      'Explain why you need to borrow it',
      'State how long you need it',
      'Promise timely return and thank them',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 17,
    theme: 'Kultur',
    title_zh: '向活动主办方提建议',
    title_en: 'Send suggestions to an event organizer',
    prompt_de:
      'Du hast an einer Veranstaltung teilgenommen und moechtest Feedback geben. Schreibe eine E-Mail an die Veranstalter.',
    checklist_zh: ['先肯定活动优点', '指出一个需要改进的问题', '提出可行建议'],
    checklist_en: [
      'Start with positive feedback',
      'Point out one problem to improve',
      'Offer a practical suggestion',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 18,
    theme: 'Beruf',
    title_zh: '申请实习岗位',
    title_en: 'Apply for an internship',
    prompt_de:
      'Du hast eine Anzeige fuer ein Praktikum gesehen. Schreibe eine E-Mail an das Unternehmen.',
    checklist_zh: ['简单介绍学习背景', '说明你对岗位的兴趣', '询问申请流程和所需材料'],
    checklist_en: [
      'Introduce your study background briefly',
      'Explain your interest in the position',
      'Ask about process and required documents',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 19,
    theme: 'Umwelt',
    title_zh: '给学校写环保倡议',
    title_en: 'Write an environmental initiative to school',
    prompt_de:
      'Du moechtest an deiner Schule mehr fuer Umweltschutz tun. Schreibe eine E-Mail an die Schulleitung.',
    checklist_zh: ['说明你关注的环保问题', '提出两项可执行措施', '请求学校支持并安排讨论'],
    checklist_en: [
      'Describe the environmental issue you care about',
      'Propose two practical measures',
      'Ask for support and a meeting/discussion',
    ],
    minWords: 80,
    maxWords: 100,
  },
  {
    id: 20,
    theme: 'Reklamation',
    title_zh: '课程取消后申请退款',
    title_en: 'Request refund after course cancellation',
    prompt_de:
      'Ein Kurs wurde kurzfristig abgesagt. Schreibe eine E-Mail an den Anbieter und bitte um Erstattung.',
    checklist_zh: ['说明课程名称和取消情况', '表达你的不便', '提出退款方式和时间请求'],
    checklist_en: [
      'State the course and cancellation details',
      'Express the inconvenience caused',
      'Ask about refund method and timeline',
    ],
    minWords: 80,
    maxWords: 100,
  },
]

export default writingTasks
