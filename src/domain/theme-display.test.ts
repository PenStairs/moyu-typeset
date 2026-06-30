import { describe, expect, it } from 'vitest';
import { themeTemplateDisplay } from './theme-display';
import type { ThemeDefinition } from './theme-types';

describe('themeTemplateDisplay', () => {
  it('uses plain-language copy for known templates', () => {
    const display = themeTemplateDisplay({
      id: 'Heavy Typography Press',
      value: 'Heavy Typography Press',
      label: '高压排版',
    });

    expect(display).toEqual({
      name: '黑白重磅',
      summary: '像头版新闻和发布会海报，适合观点鲜明、信息密度高的文章。',
      chips: ['观点', '硬核', '压场'],
    });
  });

  it('falls back to source labels and tags for unknown templates', () => {
    const theme: ThemeDefinition = {
      id: 'unknown',
      value: 'unknown',
      label: '未知主题',
      description: '原始简介',
      tags: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
        { id: 'c', name: 'C' },
        { id: 'd', name: 'D' },
      ],
    };

    expect(themeTemplateDisplay(theme)).toEqual({
      name: '未知主题',
      summary: '原始简介',
      chips: ['A', 'B', 'C'],
    });
  });
});
