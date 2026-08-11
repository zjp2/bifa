/** 每日一言 - 古典诗词名句 */
export const DAILY_QUOTES: { text: string; author: string }[] = [
  { text: '落霞与孤鹜齐飞，秋水共长天一色。', author: '王勃《滕王阁序》' },
  { text: '人生若只如初见，何事秋风悲画扇。', author: '纳兰性德《木兰花令》' },
  { text: '此情可待成追忆，只是当时已惘然。', author: '李商隐《锦瑟》' },
  { text: '山有木兮木有枝，心悦君兮君不知。', author: '《越人歌》' },
  { text: '海上生明月，天涯共此时。', author: '张九龄《望月怀远》' },
  { text: '会当凌绝顶，一览众山小。', author: '杜甫《望岳》' },
  { text: '但愿人长久，千里共婵娟。', author: '苏轼《水调歌头》' },
  { text: '人生自古谁无死？留取丹心照汗青。', author: '文天祥《过零丁洋》' },
  { text: '众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。', author: '辛弃疾《青玉案·元夕》' },
  { text: '问渠那得清如许？为有源头活水来。', author: '朱熹《观书有感》' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游《冬夜读书示子聿》' },
  { text: '春风得意马蹄疾，一日看尽长安花。', author: '孟郊《登科后》' },
  { text: '两情若是久长时，又岂在朝朝暮暮。', author: '秦观《鹊桥仙》' },
  { text: '此情无计可消除，才下眉头，却上心头。', author: '李清照《一剪梅》' },
  { text: '问君能有几多愁？恰似一江春水向东流。', author: '李煜《虞美人》' },
  { text: '大漠孤烟直，长河落日圆。', author: '王维《使至塞上》' },
  { text: '接天莲叶无穷碧，映日荷花别样红。', author: '杨万里《晓出净慈寺》' },
  { text: '小荷才露尖尖角，早有蜻蜓立上头。', author: '杨万里《小池》' },
  { text: '沉舟侧畔千帆过，病树前头万木春。', author: '刘禹锡《酬乐天扬州初逢席上见赠》' },
  { text: '不畏浮云遮望眼，自缘身在最高层。', author: '王安石《登飞来峰》' },
  { text: '山重水复疑无路，柳暗花明又一村。', author: '陆游《游山西村》' },
  { text: '欲把西湖比西子，淡妆浓抹总相宜。', author: '苏轼《饮湖上初晴后雨》' },
  { text: '春江潮水连海平，海上明月共潮生。', author: '张若虚《春江花月夜》' },
  { text: '人生代代无穷已，江月年年望相似。', author: '张若虚《春江花月夜》' },
  { text: '天生我材必有用，千金散尽还复来。', author: '李白《将进酒》' },
  { text: '举杯邀明月，对影成三人。', author: '李白《月下独酌》' },
  { text: '安能摧眉折腰事权贵，使我不得开心颜。', author: '李白《梦游天姥吟留别》' },
  { text: '国破山河在，城春草木深。', author: '杜甫《春望》' },
  { text: '感时花溅泪，恨别鸟惊心。', author: '杜甫《春望》' },
  { text: '无边落木萧萧下，不尽长江滚滚来。', author: '杜甫《登高》' },
]

/** 获取每日一言（基于日期的确定性选择） */
export function getDailyQuote(): { text: string; author: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]
}
