import type { ThemeDefinition } from './theme-types';

export interface ThemeTemplateDisplay {
  name: string;
  summary: string;
  chips: string[];
}

const themeDisplayCopy: Record<string, ThemeTemplateDisplay> = {
  default: {
    name: '清爽正文',
    summary: '最接近普通公众号正文，干净、耐读，适合不想让样式抢内容的文章。',
    chips: ['通用', '长文', '低干扰'],
  },
  'z-template': {
    name: '潮流发布',
    summary: '标题很有冲击力，适合新品发布、热点解读和面向年轻用户的内容。',
    chips: ['年轻感', '强标题', '科技'],
  },
  'Heavy Typography Press': {
    name: '黑白重磅',
    summary: '像头版新闻和发布会海报，适合观点鲜明、信息密度高的文章。',
    chips: ['观点', '硬核', '压场'],
  },
  'Studio Bulletin Editorial': {
    name: '设计简报',
    summary: '像设计工作室的项目简报，整齐克制，适合品牌、作品集和方法论内容。',
    chips: ['设计感', '简报', '克制'],
  },
  'Swiss International Grid': {
    name: '瑞士红白',
    summary: '红白配色加网格感，适合科技、商业分析和专业报告。',
    chips: ['专业', '网格', '报告'],
  },
  'Monochrome Strategy Deck': {
    name: '黑白策略稿',
    summary: '黑白为主，像咨询公司方案页，适合战略、复盘和商业判断。',
    chips: ['商业', '复盘', '理性'],
  },
  'Neo Memphis Parade': {
    name: '活泼波普',
    summary: '色彩跳跃、装饰感强，适合轻松、有趣、社媒传播感强的内容。',
    chips: ['活泼', '社媒', '年轻'],
  },
  'Bento Grid': {
    name: '卡片科技',
    summary: '有 Bento 卡片和产品发布感，适合 AI、工具、功能上线和产品介绍。',
    chips: ['产品', 'AI', '卡片'],
  },
  'Clay Soft Forms': {
    name: '柔和粘土',
    summary: '圆润、柔和、亲切，适合教程、生活方式和轻产品介绍。',
    chips: ['柔和', '教程', '亲切'],
  },
  'Yellow Black Pulse': {
    name: '黄黑快讯',
    summary: '黄黑对比强，醒目直接，适合快讯、活动通知和重点提醒。',
    chips: ['醒目', '活动', '快讯'],
  },
  'Glass Aura Layers': {
    name: '玻璃质感',
    summary: '有透明层次和轻科技感，适合趋势、AI、数字产品和创意内容。',
    chips: ['科技', '透明', '趋势'],
  },
  'French Vintage Press': {
    name: '复古书报',
    summary: '像旧报纸和文化杂志，适合人文、历史、品牌故事和深度阅读。',
    chips: ['人文', '复古', '故事'],
  },
  'Neo Brutal Force': {
    name: '醒目粗线',
    summary: '粗边框、强对比，很抓眼，适合态度表达、活动页和强营销内容。',
    chips: ['强视觉', '态度', '营销'],
  },
  'Y2K Chrome Dream': {
    name: '千禧银色',
    summary: '带一点未来感和银色 Y2K 气质，适合潮流、数码和年轻品牌。',
    chips: ['潮流', '数码', '未来感'],
  },
  'Wabi Sabi Silence': {
    name: '安静大地色',
    summary: '低饱和、留白多，适合生活方式、茶饮、空间和慢阅读内容。',
    chips: ['安静', '生活', '慢读'],
  },
  'Literary Breath Essay': {
    name: '文学专栏',
    summary: '排版留白舒服，适合读书笔记、散文、文化评论和个人专栏。',
    chips: ['文学', '专栏', '长文'],
  },
  luxury: {
    name: '高级品牌稿',
    summary: '精致、典雅，适合美妆、时尚、艺术、奢侈品和品牌故事。',
    chips: ['品牌', '高级', '典雅'],
  },
  warm: {
    name: '温暖分享',
    summary: '橙红色调亲切友好，适合社群、情感、生活和轻知识内容。',
    chips: ['亲切', '社群', '生活'],
  },
  swiss: {
    name: '科技杂志',
    summary: '像科技媒体专题页，适合行业观察、产品分析和趋势报告。',
    chips: ['科技', '专题', '专业'],
  },
  geeksavvy: {
    name: '极客说明书',
    summary: '简洁偏技术，适合开发者内容、工具教程和产品说明。',
    chips: ['开发者', '工具', '教程'],
  },
  bento_grid: {
    name: '苹果发布会',
    summary: '大字、卡片、发布会感，适合功能发布、产品介绍和亮点总结。',
    chips: ['发布', '产品', '亮点'],
  },
  avant_garde: {
    name: '前卫海报',
    summary: '更实验、更有艺术感，适合创意表达、展览、设计和观点内容。',
    chips: ['创意', '艺术', '实验'],
  },
  minimal_border: {
    name: '细线极简',
    summary: '用细线做层次，清爽但不单调，适合知识整理和轻量报告。',
    chips: ['极简', '知识', '清爽'],
  },
  typography_art: {
    name: '文字海报',
    summary: '把文字当视觉主角，适合标题党封面感、观点金句和创意文章。',
    chips: ['金句', '创意', '标题'],
  },
  border_less: {
    name: '无边框高级',
    summary: '弱化边框、强调留白和层次，适合正式但不沉闷的公众号文章。',
    chips: ['通用', '高级', '留白'],
  },
  hollow_gray: {
    name: '灰调镂空',
    summary: '灰色调和镂空字效果，适合冷静、克制的视觉表达。',
    chips: ['灰调', '克制', '极简'],
  },
  chinese_style: {
    name: '新中式',
    summary: '带中式气质，适合传统文化、节气、茶、书法和东方美学内容。',
    chips: ['中式', '文化', '节气'],
  },
  line_art: {
    name: '线条插画',
    summary: '线条装饰干净轻盈，适合设计、艺术、教程和清爽型文章。',
    chips: ['线条', '艺术', '轻盈'],
  },
  minimal_pro: {
    name: '专业极简',
    summary: '稳重、现代、信息层级清楚，适合职场、商业和专业知识内容。',
    chips: ['职场', '专业', '现代'],
  },
  refined_classic: {
    name: '精致经典',
    summary: '经典排版加一点装饰，适合品牌、文化、人物和正式长文。',
    chips: ['经典', '人物', '品牌'],
  },
  fugu: {
    name: '怀旧复古',
    summary: '复古氛围更明显，适合老照片、怀旧故事、城市记忆和文化内容。',
    chips: ['怀旧', '故事', '文化'],
  },
};

export function themeTemplateDisplay(theme: ThemeDefinition): ThemeTemplateDisplay {
  const themeKey = theme.value || theme.id;
  const displayCopy = themeDisplayCopy[themeKey] ?? themeDisplayCopy[theme.id];
  if (displayCopy) {
    return displayCopy;
  }

  const fallbackChips = (theme.tags ?? []).slice(0, 3).map((tag) => tag.name);

  return {
    name: theme.label,
    summary: theme.description || theme.labelEn || theme.label,
    chips: fallbackChips,
  };
}
