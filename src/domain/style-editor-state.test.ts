import { describe, expect, it } from 'vitest';
import { createEmptyStyleOverrides, createPristineEditorState, resetStyleEditorToOriginal } from './style-editor-state';

describe('style editor state', () => {
  it('creates empty overrides with board disabled for the original theme look', () => {
    const state = createPristineEditorState('hero');

    expect(state.overrides).toEqual(createEmptyStyleOverrides());
    expect(state.board.enabled).toBe(false);
    expect(state.board.pattern).toBe('off');
  });

  it('resets custom style data while keeping the current editor location', () => {
    const state = createPristineEditorState('hero');
    state.activeTab = 'image';
    state.textTarget = 'h2';
    state.overrides.text.h2 = { color: '#ffffff' };
    state.board.enabled = true;
    state.board.pattern = 'fine-grid';

    const resetState = resetStyleEditorToOriginal(state, 'quote');

    expect(resetState.activeTab).toBe('image');
    expect(resetState.textTarget).toBe('h2');
    expect(resetState.decorationTarget).toBe('quote');
    expect(resetState.overrides).toEqual(createEmptyStyleOverrides());
    expect(resetState.board.enabled).toBe(false);
    expect(resetState.board.pattern).toBe('off');
  });
});
