import type { ThemeDefinition } from './theme-types';

export type TemplateScenarioId = 'all' | 'general' | 'businessTech' | 'knowledge' | 'brandAesthetic' | 'boldSocial';

export interface TemplateScenario {
  id: TemplateScenarioId;
  label: string;
  summary: string;
  themeIds: string[];
}

export const templateScenarios: TemplateScenario[] = [
  {
    id: 'all',
    label: '全部',
    summary: '查看所有模板。',
    themeIds: [],
  },
  {
    id: 'general',
    label: '通用排版',
    summary: '日常推文、通知、普通长文。',
    themeIds: ['default', 'border_less', 'minimal_pro', 'minimal_border', 'hollow_gray', 'line_art', 'warm'],
  },
  {
    id: 'businessTech',
    label: '商业科技',
    summary: '产品发布、行业观察、商业分析。',
    themeIds: [
      'swiss',
      'geeksavvy',
      'bento_grid',
      'Bento Grid',
      'Swiss International Grid',
      'Monochrome Strategy Deck',
      'Glass Aura Layers',
      'z-template',
    ],
  },
  {
    id: 'knowledge',
    label: '知识干货',
    summary: '教程、方法论、职场和专业内容。',
    themeIds: [
      'default',
      'minimal_border',
      'minimal_pro',
      'geeksavvy',
      'Clay Soft Forms',
      'Studio Bulletin Editorial',
      'Monochrome Strategy Deck',
      'line_art',
    ],
  },
  {
    id: 'brandAesthetic',
    label: '品牌审美',
    summary: '品牌故事、人文文化、生活方式。',
    themeIds: [
      'luxury',
      'refined_classic',
      'Studio Bulletin Editorial',
      'French Vintage Press',
      'Wabi Sabi Silence',
      'Literary Breath Essay',
      'chinese_style',
      'fugu',
      'warm',
    ],
  },
  {
    id: 'boldSocial',
    label: '个性吸睛',
    summary: '热点、活动、营销和强视觉传播。',
    themeIds: [
      'Neo Memphis Parade',
      'Yellow Black Pulse',
      'Neo Brutal Force',
      'Y2K Chrome Dream',
      'Heavy Typography Press',
      'typography_art',
      'avant_garde',
      'z-template',
    ],
  },
];

export function filterThemesByScenario(themes: ThemeDefinition[], scenarioId: TemplateScenarioId): ThemeDefinition[] {
  if (scenarioId === 'all') {
    return themes;
  }

  const scenario = templateScenarios.find((item) => item.id === scenarioId);
  if (!scenario) {
    console.warn(`[theme-preview] unknown template scenario="${scenarioId}". Falling back to all templates.`);
    return themes;
  }

  const themeIds = new Set(scenario.themeIds);
  return themes.filter((theme) => themeIds.has(theme.value || theme.id) || themeIds.has(theme.id));
}
