import { describe, expect, it, vi } from 'vitest';
import { filterThemesByScenario } from './template-scenarios';
import type { ThemeDefinition } from './theme-types';

const themes: ThemeDefinition[] = [
  { id: 'default', value: 'default', label: '默认' },
  { id: 'swiss', value: 'swiss', label: '杂志风' },
  { id: 'luxury', value: 'luxury', label: '奢华典雅' },
  { id: 'Neo Brutal Force', value: 'Neo Brutal Force', label: '新野兽主义' },
];

describe('filterThemesByScenario', () => {
  it('returns all themes for the all scenario', () => {
    expect(filterThemesByScenario(themes, 'all')).toEqual(themes);
  });

  it('filters themes by common article scenarios', () => {
    expect(filterThemesByScenario(themes, 'businessTech').map((theme) => theme.id)).toEqual(['swiss']);
    expect(filterThemesByScenario(themes, 'brandAesthetic').map((theme) => theme.id)).toEqual(['luxury']);
    expect(filterThemesByScenario(themes, 'boldSocial').map((theme) => theme.id)).toEqual(['Neo Brutal Force']);
  });

  it('logs and falls back to all themes for an unknown scenario', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(filterThemesByScenario(themes, 'missing' as never)).toEqual(themes);
    expect(warnSpy).toHaveBeenCalledWith(
      '[theme-preview] unknown template scenario="missing". Falling back to all templates.',
    );

    warnSpy.mockRestore();
  });
});
