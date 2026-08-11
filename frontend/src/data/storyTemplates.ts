/**
 * 灵感阁素材库 - 内置模板
 * 每个分类都是一个字符串数组，生成时随机从各分类中抽取组合
 *
 * 结构说明：
 * - opening: 开头场景（时间/氛围）
 * - scenes: 环境细节（所见之物）
 * - characters: 人物（角色形象）
 * - actions: 人物动作
 * - emotions: 内心感受
 * - imagery: 意境升华
 * - endings: 收尾语
 */

export interface StoryTemplates {
  opening: string[]
  scenes: string[]
  characters: string[]
  actions: string[]
  emotions: string[]
  imagery: string[]
  endings: string[]
}

/** localStorage key for user custom templates */
export const USER_TEMPLATES_KEY = 'inkwell_inspiration_user_templates'

/** 内置模板数据 */
export const BUILTIN_TEMPLATES: StoryTemplates = {
  opening: [
    '夜深了，',
    '清晨的第一缕阳光透过窗棂，',
    '雨后的空气里弥漫着泥土的芬芳，',
    '暮色四合之时，',
    '月色如水，',
    '春日的午后，',
    '秋风萧瑟，',
    '冬日暖阳斜照进书房，',
    '盛夏蝉鸣阵阵，',
    '郊外薄雾未散，',
    '山风拂过耳畔，',
    '江水悠悠，',
  ],

  scenes: [
    '书桌上的墨汁还未干，',
    '窗外的风铃轻响，',
    '一杯清茶在案头冒着氤氲的香气，',
    '指尖触碰着凉凉的书页，',
    '远处传来几声犬吠，',
    '庭院里的桂花正开得盛，',
    '廊下的灯笼随风摇曳，',
    '案上的烛火跳动着，',
    '檐下的燕子低飞，',
    '巷口的小贩正收拾担子，',
    '林间传来清脆的鸟鸣，',
    '溪水潺潺流过石上，',
  ],

  characters: [
    '那个白衣翩翩的少年',
    '一位拄着拐杖的老者',
    '撑着油纸伞的女子',
    '背着书箱的行脚商人',
    '身着青衫的书生',
    '提着灯笼的小童',
    '骑着毛驴的隐士',
    '披着红色斗篷的旅人',
    '素手焚香的女子',
    '腰佩长剑的侠客',
    '披着袈裟的行者',
    '头簪野花的少女',
  ],

  actions: [
    '缓缓走过石桥，',
    '驻足望向远方的山峦，',
    '轻轻翻开一本旧书，',
    '在纸上写下几行小字，',
    '从袖中取出一封泛黄的信笺，',
    '低声吟诵着什么，',
    '将一朵落花别在衣襟上，',
    '微微颔首，似有所悟，',
    '合掌闭目，',
    '仰天大笑出门去，',
    '低头整理行囊，',
    '挥毫泼墨，',
  ],

  emotions: [
    '心中涌起一阵莫名的感动',
    '思绪万千，一时竟不知从何说起',
    '嘴角勾起一抹淡淡的笑意',
    '眼眶微微泛红',
    '感到前所未有的宁静',
    '眉头微蹙，似有心事',
    '心情如湖水般平静',
    '内心翻涌着复杂的情感',
    '忽而悲从中来',
    '又或喜上眉梢',
    '只觉心中一片澄明',
    '暗下决心要做点什么',
  ],

  imagery: [
    '时光仿佛在这一刻静止了',
    '所有的喧嚣都远去了',
    '只有风声和心跳声清晰可闻',
    '像是被卷入了一个古老的梦境',
    '一切都变得温柔起来',
    '世界在眼中焕然一新',
    '心中的某个角落被轻轻触动',
    '忽然读懂了许多年前未曾理解的事',
    '天地万物仿佛都在倾听',
    '这一刻即是永恒',
    '前世今生的记忆涌来',
    '仿佛与古人隔空对话',
  ],

  endings: [
    '——这便是，属于我的故事。',
    '——谨以此记，不负时光。',
    '——愿这一刻，被永远铭记。',
    '——墨痕淡去，而意味长存。',
    '——故事还长，且待下回分解。',
    '——心中一动，便记下了这些。',
    '——愿岁月静好，现世安稳。',
    '——此心安处，便是吾乡。',
    '——笔墨停歇，余韵悠长。',
    '——且将心事付瑶琴。',
    '——一笑置之，江湖再见。',
    '——浮生若梦，为欢几何？',
  ],
}

/** 模板分类元数据 - 用于 UI 展示和编辑 */
export const TEMPLATE_CATEGORIES: { key: keyof StoryTemplates; label: string; hint: string }[] = [
  { key: 'opening', label: '开头', hint: '时间、季节、氛围' },
  { key: 'scenes', label: '场景', hint: '所见之物、环境细节' },
  { key: 'characters', label: '人物', hint: '角色形象、身份' },
  { key: 'actions', label: '动作', hint: '人物的行为举动' },
  { key: 'emotions', label: '心情', hint: '内心感受、情绪' },
  { key: 'imagery', label: '意境', hint: '升华与感悟' },
  { key: 'endings', label: '收尾', hint: '结尾语、点题' },
]

/** 从 localStorage 读取用户自定义模板 */
export function loadUserTemplates(): Partial<StoryTemplates> {
  try {
    const raw = localStorage.getItem(USER_TEMPLATES_KEY)
    if (raw) {
      return JSON.parse(raw) as Partial<StoryTemplates>
    }
  } catch {
    /* ignore */
  }
  return {}
}

/** 保存用户自定义模板到 localStorage */
export function saveUserTemplates(templates: Partial<StoryTemplates>) {
  try {
    localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(templates))
  } catch {
    /* ignore */
  }
}

/** 合并内置模板与用户自定义模板 */
export function getMergedTemplates(): StoryTemplates {
  const user = loadUserTemplates()
  const result: StoryTemplates = { ...BUILTIN_TEMPLATES }
  for (const key of Object.keys(BUILTIN_TEMPLATES) as (keyof StoryTemplates)[]) {
    const userArr = user[key]
    if (userArr && userArr.length > 0) {
      result[key] = [...BUILTIN_TEMPLATES[key], ...userArr]
    }
  }
  return result
}

/** 故事生成函数 - 使用合并后的模板 */
export function generateStory(): string {
  const templates = getMergedTemplates()
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  const segments = [
    pick(templates.opening),
    pick(templates.scenes),
    pick(templates.characters) + pick(templates.actions),
    pick(templates.emotions) + '，',
    pick(templates.imagery) + '。',
    pick(templates.endings),
  ]
  return segments.join('')
}
