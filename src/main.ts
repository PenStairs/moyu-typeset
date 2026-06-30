import './styles.css';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';
import themesDataset from './data/themes.json';
import { generatedArticleMarkdown } from './data/generated-article';
import { listEditableDecorationColorFields } from './domain/decoration-style-fields';
import { createPristineEditorState, resetStyleEditorToOriginal } from './domain/style-editor-state';
import { styleControlEventNames } from './domain/style-control-events';
import {
  filterThemesByScenario,
  templateScenarios,
  type TemplateScenarioId,
} from './domain/template-scenarios';
import { articlePlainTextFromHtml, canCopyWechatRichText } from './domain/wechat-clipboard';
import {
  applyThemeStyleOverrides,
  buildPreviewBoardStyle,
  buildPreviewBoardStyleMap,
  shadowStyleForLevel,
} from './domain/style-overrides';
import { renderThemeMarkdown } from './domain/theme-renderer';
import { themeTemplateDisplay } from './domain/theme-display';
import { selectPreviewTheme } from './domain/theme-selection';
import type { ThemeDefinition, ThemesDataset } from './domain/theme-types';
import type {
  BoardPattern,
  EditorTab,
  StyleEditorState,
  TextStyleTarget,
  ThemeStyleOverrides,
} from './domain/style-editor-types';

type ActiveTool = 'template' | 'style';
type PreviewDevice = 'desktop' | 'mobile';

const editorTabs: Array<{ id: EditorTab; label: string; icon: string }> = [
  { id: 'text', label: '文本', icon: 'T' },
  { id: 'image', label: '图片', icon: '▧' },
  { id: 'background', label: '背景', icon: '◉' },
  { id: 'decoration', label: '装饰', icon: '✧' },
  { id: 'board', label: '底板', icon: '▦' },
];

const textTargets: Array<{ id: TextStyleTarget; label: string }> = [
  { id: 'h1', label: '一级标题' },
  { id: 'h2', label: '二级标题' },
  { id: 'h3', label: '三级标题' },
  { id: 'p', label: '正文段落' },
  { id: 'blockquote', label: '引用块' },
  { id: 'hr', label: '分割线' },
];

const boardPresets: Array<{ id: BoardPattern; label: string }> = [
  { id: 'off', label: '关闭' },
  { id: 'fine-grid', label: '细网格' },
  { id: 'standard-grid', label: '标准网格' },
  { id: 'coarse-grid', label: '粗网格' },
  { id: 'dot', label: '圆点' },
  { id: 'cross', label: '交叉' },
];

const dataset = themesDataset as unknown as ThemesDataset;
const articleMarkdown = generatedArticleMarkdown;
const initialThemeSelection = selectPreviewTheme({
  themes: dataset.themes,
  requestedThemeId: new URLSearchParams(window.location.search).get('theme'),
  storedThemeId: readStoredThemeId(),
});

const state = {
  selectedThemeId: initialThemeSelection.selectedThemeId,
  activeTool: 'template' as ActiveTool,
  templateScenarioId: 'all' as TemplateScenarioId,
  previewDevice: 'desktop' as PreviewDevice,
  templateListScrollTop: 0,
  toast: '',
  editor: readStoredEditorState() ?? createPristineEditorState(firstDecorationTarget(initialThemeSelection.selectedTheme)),
};

let toastTimer: number | undefined;

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) {
  throw new Error('Missing #app root.');
}
const app = appRoot;

function renderApp(): void {
  rememberTemplateListScroll();

  const selectedTheme = requireSelectedTheme(dataset.themes, state.selectedThemeId);
  normalizeDecorationTarget(selectedTheme);
  const editedTheme = applyThemeStyleOverrides(selectedTheme, buildPreviewOverrides(state.editor));
  const renderedPreview = renderPreview(editedTheme);
  const selectedThemeDisplay = themeTemplateDisplay(selectedTheme);
  const visibleTemplateThemes = filterThemesByScenario(dataset.themes, state.templateScenarioId);

  app.innerHTML = `
    <main class="appShell">
      <aside class="leftPanel" aria-label="${state.activeTool === 'template' ? '预设模板' : '样式设置'}">
        ${renderLeftPanel(visibleTemplateThemes, selectedTheme, editedTheme)}
      </aside>

      <section class="contentArea">
        <section class="editorStage">
          <header class="stageHeader">
            <div class="documentMeta">
              <span class="documentDot" style="background: ${escapeAttribute(selectedTheme.primary_color || '#111111')}"></span>
              <div>
                <strong>${escapeHtml(selectedThemeDisplay.name)}</strong>
                <span>${escapeHtml(selectedThemeDisplay.summary)}</span>
              </div>
            </div>
            ${renderHeaderResetButton()}
          </header>

          <div class="stageCanvas ${state.previewDevice === 'mobile' ? 'isMobilePreview' : ''}">
            <div class="deviceChrome" aria-hidden="true">
              <div class="phoneStatus"><span>15:32</span><span>100%</span></div>
              <div class="phoneNotch"></div>
            </div>
            <div class="previewBoard">
              ${renderedPreview}
            </div>
          </div>
        </section>

        <aside class="rightRail" aria-label="工具菜单">
          ${renderRightToolbar()}
        </aside>
      </section>

      ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ''}
    </main>
  `;

  bindEvents();
  restoreTemplateListScroll();
}

function bindEvents(): void {
  const templateList = app.querySelector<HTMLElement>('.templateList');
  templateList?.addEventListener('scroll', () => {
    state.templateListScrollTop = templateList.scrollTop;
  });

  app.querySelectorAll<HTMLButtonElement>('[data-theme-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const themeId = button.dataset.themeId;
      if (!themeId) {
        return;
      }

      state.selectedThemeId = themeId;
      normalizeDecorationTarget(requireSelectedTheme(dataset.themes, themeId));
      persistSelectedTheme(themeId);
      writeThemeToUrl(themeId);
      renderApp();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-template-scenario]').forEach((button) => {
    button.addEventListener('click', () => {
      const scenarioId = button.dataset.templateScenario as TemplateScenarioId | undefined;
      if (!scenarioId || scenarioId === state.templateScenarioId) {
        return;
      }

      state.templateScenarioId = scenarioId;
      state.templateListScrollTop = 0;
      renderApp();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => {
    button.addEventListener('click', async () => {
      const tool = button.dataset.tool;

      if (tool === 'template' || tool === 'style') {
        state.activeTool = tool;
        renderApp();
        return;
      }

      if (tool === 'preview') {
        state.previewDevice = state.previewDevice === 'desktop' ? 'mobile' : 'desktop';
        showToast(state.previewDevice === 'mobile' ? '已切换手机预览' : '已切换桌面预览');
        return;
      }

      if (tool === 'copy') {
        await copyCurrentArticleHtml();
      }
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-editor-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.editor.activeTab = button.dataset.editorTab as EditorTab;
      persistEditorState(state.editor);
      renderApp();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-text-target]').forEach((button) => {
    button.addEventListener('click', () => {
      state.editor.textTarget = button.dataset.textTarget as TextStyleTarget;
      persistEditorState(state.editor);
      renderApp();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-decoration-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const decorationTarget = button.dataset.decorationTarget;
      if (!decorationTarget) {
        return;
      }

      state.editor.decorationTarget = decorationTarget;
      persistEditorState(state.editor);
      renderApp();
    });
  });

  app.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-style-scope]').forEach((control) => {
    styleControlEventNames({
      tagName: control.tagName,
      inputType: control instanceof HTMLInputElement ? control.type : undefined,
    }).forEach((eventName) => {
      control.addEventListener(eventName, () => {
        updateStyleControl(control);
        persistEditorState(state.editor);
        renderApp();
      });
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-style-scope="reset"]').forEach((button) => {
    button.addEventListener('click', () => {
      resetEditorState();
      renderApp();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-align]').forEach((button) => {
    button.addEventListener('click', () => {
      assignTextStyle(state.editor.textTarget, 'text-align', button.dataset.align ?? 'left');
      persistEditorState(state.editor);
      renderApp();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-shadow-level]').forEach((button) => {
    button.addEventListener('click', () => {
      const level = button.dataset.shadowLevel as 'none' | 'light' | 'medium' | 'heavy';
      state.editor.overrides.image.figure['box-shadow'] = shadowStyleForLevel(level);
      persistEditorState(state.editor);
      renderApp();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-board-pattern]').forEach((button) => {
    button.addEventListener('click', () => {
      const pattern = button.dataset.boardPattern as BoardPattern;
      state.editor.board.pattern = pattern;
      state.editor.board.enabled = pattern !== 'off';
      state.editor.board.size = defaultBoardSize(pattern, state.editor.board.size);
      persistEditorState(state.editor);
      renderApp();
    });
  });

  app.querySelectorAll<HTMLButtonElement>('[data-padding-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = button.dataset.paddingPreset;
      if (!preset) {
        return;
      }

      state.editor.overrides.background.container.padding = paddingPresetValue(preset);
      persistEditorState(state.editor);
      renderApp();
    });
  });
}

function rememberTemplateListScroll(): void {
  const templateList = app.querySelector<HTMLElement>('.templateList');
  if (!templateList) {
    return;
  }

  state.templateListScrollTop = templateList.scrollTop;
}

function restoreTemplateListScroll(): void {
  const templateList = app.querySelector<HTMLElement>('.templateList');
  if (!templateList) {
    return;
  }

  templateList.scrollTop = state.templateListScrollTop;
}

function renderLeftPanel(
  themes: ThemeDefinition[],
  selectedTheme: ThemeDefinition,
  editedTheme: ThemeDefinition,
): string {
  if (state.activeTool === 'style') {
    return renderStyleEditor(editedTheme);
  }

  return renderTemplatePanel(themes, selectedTheme);
}

function renderTemplatePanel(themes: ThemeDefinition[], selectedTheme: ThemeDefinition): string {
  return `
    <div class="panelHeader">
      <div>
        <h1>预设模板</h1>
        <p>选择适合发布场景的主题模板</p>
      </div>
    </div>
    <div class="scenarioTabs" aria-label="文章场景">
      ${templateScenarios
        .map((scenario) => renderTemplateScenarioButton(scenario.id, scenario.label, scenario.summary))
        .join('')}
    </div>
    <nav class="templateList" aria-label="可用模板">
      ${themes.map((theme) => renderThemeTemplateCard(theme, selectedTheme)).join('')}
    </nav>
  `;
}

function renderTemplateScenarioButton(scenarioId: TemplateScenarioId, label: string, summary: string): string {
  return `
    <button
      type="button"
      class="${state.templateScenarioId === scenarioId ? 'active' : ''}"
      data-template-scenario="${scenarioId}"
      title="${escapeAttribute(summary)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function renderThemeTemplateCard(theme: ThemeDefinition, selectedTheme: ThemeDefinition): string {
  const themeId = theme.value || theme.id;
  const isSelected = themeId === (selectedTheme.value || selectedTheme.id);
  const display = themeTemplateDisplay(theme);

  return `
    <button class="templateCard${isSelected ? ' isSelected' : ''}" type="button" data-theme-id="${escapeAttribute(themeId)}">
      <span class="templateThumb" aria-hidden="true">
        <span class="templateThumbInner">${theme.section_html ?? ''}</span>
      </span>
      <span class="templateInfo">
        <strong>${escapeHtml(display.name)}</strong>
        <em>${escapeHtml(display.summary)}</em>
        ${
          display.chips.length > 0
            ? `<span class="templateChips">${display.chips
                .slice(0, 3)
                .map((chip) => `<b>${escapeHtml(chip)}</b>`)
                .join('')}</span>`
            : ''
        }
      </span>
    </button>
  `;
}

function renderRightToolbar(): string {
  const items: Array<{ id: 'preview' | 'copy' | 'template' | 'style'; label: string; icon: string; active: boolean }> = [
    { id: 'preview', label: '预览', icon: 'ti-device-mobile', active: state.previewDevice === 'mobile' },
    { id: 'copy', label: '复制', icon: 'ti-copy', active: false },
    { id: 'template', label: '模板', icon: 'ti-palette', active: state.activeTool === 'template' },
    { id: 'style', label: '样式', icon: 'ti-letter-t', active: state.activeTool === 'style' },
  ];

  return `
    <div class="railGroup">
      ${items
        .map(
          (item) => `
            <button type="button" class="railButton${item.active ? ' active' : ''}" data-tool="${item.id}">
              <i class="ti ${item.icon}"></i>
              <span>${item.label}</span>
            </button>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderHeaderResetButton(): string {
  return `<button class="resetButton" type="button" data-style-scope="reset" data-style-key="all">重置样式</button>`;
}

function renderPreview(editedTheme: ThemeDefinition): string {
  const result = renderThemeMarkdown({ markdown: articleMarkdown, theme: editedTheme });
  return `<div class="articleFrame">${result.html}</div>`;
}

function renderStyleEditor(editedTheme: ThemeDefinition): string {
  return `
    <div class="settingsHeader">
      <div>
        <h2>${state.editor.activeTab === 'board' ? '底板设置' : '自定义模板样式'}</h2>
        <p>${state.editor.activeTab === 'board' ? '设置背景修饰' : '自定义字体样式'}</p>
      </div>
    </div>
    <div class="editorTabs">
      ${editorTabs
        .map(
          (tab) => `
            <button type="button" class="${state.editor.activeTab === tab.id ? 'active' : ''}" data-editor-tab="${tab.id}">
              <span>${tab.icon}</span>
              <strong>${tab.label}</strong>
            </button>
          `,
        )
        .join('')}
    </div>
    <div class="editorBody">
      ${renderEditorBody(editedTheme)}
    </div>
  `;
}

function renderEditorBody(editedTheme: ThemeDefinition): string {
  switch (state.editor.activeTab) {
    case 'text':
      return renderTextEditor(editedTheme);
    case 'image':
      return renderImageEditor(editedTheme);
    case 'background':
      return renderBackgroundEditor(editedTheme);
    case 'decoration':
      return renderDecorationEditor(editedTheme);
    case 'board':
      return renderBoardEditor();
  }
}

function renderTextEditor(theme: ThemeDefinition): string {
  const targetStyle = theme.config?.block?.[state.editor.textTarget] ?? {};
  const strongStyle = theme.config?.inline?.strong ?? {};

  return `
    <div class="chipGrid">
      ${textTargets
        .map(
          (target) => `
            <button type="button" class="${state.editor.textTarget === target.id ? 'active' : ''}" data-text-target="${target.id}">
              ${target.label}
            </button>
          `,
        )
        .join('')}
    </div>
    <section class="settingCard">
      ${renderColorControl('文字颜色', 'text', 'color', stringStyle(targetStyle.color, '#4A4A45'))}
      ${renderRangeControl('字号', 'text', 'font-size', numericStyle(targetStyle['font-size'], 15), 10, 40, 1, 'px')}
      ${renderSelectControl('粗细', 'text', 'font-weight', stringStyle(targetStyle['font-weight'], '400'), [
        ['300', '细体'],
        ['400', '正常'],
        ['600', '半粗'],
        ['700', '粗体'],
        ['800', '特粗'],
      ])}
      ${renderRangeControl('字间距', 'text', 'letter-spacing', numericStyle(targetStyle['letter-spacing'], 0), 0, 2, 0.01, 'px')}
      ${renderRangeControl('行高', 'text', 'line-height', numericStyle(targetStyle['line-height'], 1.8), 1, 3, 0.01, '')}
      ${renderAlignControl(stringStyle(targetStyle['text-align'], 'left'))}
      ${renderRangeControl('下边距', 'text', 'margin-bottom', numericStyle(targetStyle['margin-bottom'], 16), 0, 80, 1, 'px')}
    </section>
    <section class="settingCard">
      <h3>加粗字体样式</h3>
      ${renderSelectControl('字体粗细', 'strong', 'font-weight', stringStyle(strongStyle['font-weight'], '700'), [
        ['600', '半粗'],
        ['700', '粗体'],
        ['800', '特粗'],
      ])}
      ${renderColorControl('文字颜色', 'strong', 'color', normalizeColorValue(stringStyle(strongStyle.color, '#000000')))}
      ${renderTextControl('背景颜色', 'strong', 'background', stringStyle(strongStyle.background, 'transparent'))}
    </section>
  `;
}

function renderImageEditor(theme: ThemeDefinition): string {
  const imageStyle = theme.config?.block?.image ?? {};
  const figureStyle = theme.config?.block?.figure ?? {};
  const captionStyle = theme.config?.block?.figcaption ?? {};

  return `
    <section class="editorSection">
      <h3>图片样式</h3>
      <div class="settingCard">
        ${renderRangeControl('最大宽度', 'image.image', 'max-width', numericStyle(imageStyle['max-width'], 100), 40, 100, 1, '%')}
        ${renderRangeControl('圆角', 'image.image', 'border-radius', numericStyle(imageStyle['border-radius'], 8), 0, 40, 1, 'px')}
        <div class="controlRow">
          <span>阴影</span>
          <div class="buttonGroup">
            ${['none', 'light', 'medium', 'heavy']
              .map((level) => `<button type="button" data-shadow-level="${level}">${shadowLabel(level)}</button>`)
              .join('')}
          </div>
        </div>
      </div>
    </section>
    <section class="editorSection">
      <h3>图片说明</h3>
      <div class="settingCard">
        ${renderToggleControl('显示说明文本', 'image.figcaption', 'display', stringStyle(captionStyle.display, 'block') !== 'none')}
        ${renderColorControl('颜色', 'image.figcaption', 'color', normalizeColorValue(stringStyle(captionStyle.color, '#6B6B6B')))}
        ${renderRangeControl('字号', 'image.figcaption', 'font-size', numericStyle(captionStyle['font-size'], 12), 10, 20, 1, 'px')}
        ${renderSelectControl('对齐', 'image.figcaption', 'text-align', stringStyle(captionStyle['text-align'], 'center'), [
          ['left', '左对齐'],
          ['center', '居中'],
          ['right', '右对齐'],
        ])}
      </div>
    </section>
    <section class="editorSection">
      <h3>间距设置</h3>
      <div class="settingCard">
        ${renderRangeControl('下边距', 'image.figure', 'margin-bottom', numericStyle(figureStyle['margin-bottom'], 32), 0, 80, 1, 'px')}
      </div>
    </section>
  `;
}

function renderBackgroundEditor(theme: ThemeDefinition): string {
  const containerStyle = theme.config?.block?.container ?? {};

  return `
    <section class="settingCard">
      ${renderColorControl('背景颜色', 'background.container', 'background-color', normalizeColorValue(stringStyle(containerStyle['background-color'], '#FFFFFF')))}
    </section>
    <section class="editorSection">
      <h3>内边距</h3>
      <div class="settingCard">
        <div class="presetGrid">
          ${['none', 'tight', 'medium', 'loose', 'wide']
            .map((preset) => `<button type="button" data-padding-preset="${preset}">${paddingPresetLabel(preset)}</button>`)
            .join('')}
        </div>
        ${renderTextControl('整体', 'background.container', 'padding', stringStyle(containerStyle.padding, '0.5rem 1rem'))}
      </div>
    </section>
    <section class="editorSection">
      <h3>外边距</h3>
      <div class="settingCard">
        ${renderTextControl('整体', 'background.container', 'margin', stringStyle(containerStyle.margin, '0 auto'))}
      </div>
    </section>
  `;
}

function renderDecorationEditor(theme: ThemeDefinition): string {
  const targets = decorationTargets(theme);
  const activeTarget = state.editor.decorationTarget || targets[0]?.componentName || '';
  const activeRule = targets.find((target) => target.componentName === activeTarget);
  const component = theme.config?.components?.[activeTarget];
  const previewTemplate = component?.template ?? (activeRule?.variant ? component?.variants?.[activeRule.variant]?.template : undefined);
  const colorEntries = listEditableDecorationColorFields(component?.style ?? {});
  const preview = renderDecorationPreview(previewTemplate ?? '', component?.style ?? {});

  return `
    <div class="chipGrid">
      ${targets
        .map(
          (target) => `
            <button type="button" class="${activeTarget === target.componentName ? 'active' : ''}" data-decoration-target="${escapeAttribute(target.componentName)}">
              ${escapeHtml(target.label)}
            </button>
          `,
        )
        .join('')}
    </div>
    <section class="decorationPreview">
      <span>预览效果</span>
      ${preview || '<p>当前装饰无模板预览</p>'}
    </section>
    <section class="editorSection">
      <h3>装饰属性</h3>
      <div class="settingCard">
        ${
          colorEntries.length > 0
            ? colorEntries
                .map(({ key, value }) =>
                  renderColorControl(decorativeFieldLabel(key), `decoration.${activeTarget}`, key, normalizeColorValue(String(value))),
                )
                .join('')
            : '<p class="emptyHint">当前装饰没有可直接编辑的颜色变量。</p>'
        }
      </div>
    </section>
  `;
}

function renderBoardEditor(): string {
  const board = state.editor.board;

  return `
    <section class="settingCard boardEnable">
      <strong>启用底板样式</strong>
      ${renderToggleControl('', 'board', 'enabled', board.enabled)}
    </section>
    <section class="editorSection">
      <h3>快速预设</h3>
      <div class="boardPresetGrid">
        ${boardPresets
          .map(
            (preset) => `
              <button type="button" class="${board.pattern === preset.id ? 'active' : ''}" data-board-pattern="${preset.id}">
                <span class="miniPattern" style="${escapeAttribute(buildPreviewBoardStyle({
                  enabled: preset.id !== 'off',
                  pattern: preset.id,
                  size: defaultBoardSize(preset.id, board.size),
                  opacity: board.opacity,
                  color: board.color,
                }))}"></span>
                <strong>${preset.label}</strong>
              </button>
            `,
          )
          .join('')}
      </div>
    </section>
    <section class="settingCard">
      ${renderRangeControl('尺寸', 'board', 'size', board.size, 8, 40, 1, 'px')}
      ${renderRangeControl('不透明度', 'board', 'opacity', board.opacity, 0, 100, 1, '%')}
      ${renderColorControl('颜色', 'board', 'color', board.color)}
    </section>
  `;
}

function requireSelectedTheme(themes: ThemeDefinition[], themeId: string): ThemeDefinition {
  return selectPreviewTheme({
    themes,
    requestedThemeId: themeId,
  }).selectedTheme;
}

async function copyCurrentArticleHtml(): Promise<void> {
  const selectedTheme = requireSelectedTheme(dataset.themes, state.selectedThemeId);
  const editedTheme = applyThemeStyleOverrides(selectedTheme, buildPreviewOverrides(state.editor));
  const html = renderThemeMarkdown({ markdown: articleMarkdown, theme: editedTheme }).html;
  const plainText = articlePlainTextFromHtml(html);
  const canWriteWechatRichText = canCopyWechatRichText({
    canCreateClipboardItem: typeof ClipboardItem === 'function',
    canWriteRichContent: typeof navigator.clipboard?.write === 'function',
  });

  if (!canWriteWechatRichText) {
    console.warn(
      '[theme-preview] rich clipboard write is unavailable. Falling back to plain html copy for WeChat article content.',
    );
    fallbackCopyText(html);
    showToast('已复制 HTML 源码');
    return;
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      }),
    ]);
    showToast('已复制公众号富文本');
  } catch (error) {
    console.warn(`[theme-preview] rich clipboard write failed reason="${String(error)}". Falling back to plain html copy.`);
    fallbackCopyText(html);
    showToast('已复制 HTML 源码');
  }
}

function fallbackCopyText(text: string): void {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } catch (error) {
    console.warn(`[theme-preview] fallback copy failed reason="${String(error)}".`);
  } finally {
    document.body.removeChild(textarea);
  }
}

function showToast(message: string): void {
  state.toast = message;
  window.clearTimeout(toastTimer);
  renderApp();
  toastTimer = window.setTimeout(() => {
    state.toast = '';
    renderApp();
  }, 1800);
}

function readStoredThemeId(): string | null {
  try {
    return window.localStorage.getItem('theme-preview:selected-theme');
  } catch (error) {
    console.warn(`[theme-preview] localStorage read failed reason="${String(error)}". Falling back to URL/first theme.`);
    return null;
  }
}

function persistSelectedTheme(themeId: string): void {
  try {
    window.localStorage.setItem('theme-preview:selected-theme', themeId);
  } catch (error) {
    console.warn(`[theme-preview] localStorage write failed theme="${themeId}" reason="${String(error)}".`);
  }
}

function writeThemeToUrl(themeId: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('theme', themeId);
  window.history.replaceState(null, '', url);
}

function buildPreviewOverrides(editorState: StyleEditorState): ThemeStyleOverrides {
  const boardPatternStyle = buildPreviewBoardStyleMap(editorState.board);
  const nextOverrides = structuredClone(editorState.overrides);

  nextOverrides.background.container = {
    ...nextOverrides.background.container,
    ...boardPatternStyle,
  };

  return nextOverrides;
}

function readStoredEditorState(): StyleEditorState | null {
  try {
    const storedState = window.localStorage.getItem('theme-preview:style-editor');
    return storedState ? (JSON.parse(storedState) as StyleEditorState) : null;
  } catch (error) {
    console.warn(`[theme-preview] style editor state ignored reason="${String(error)}". Falling back to defaults.`);
    return null;
  }
}

function persistEditorState(editorState: StyleEditorState): void {
  try {
    window.localStorage.setItem('theme-preview:style-editor', JSON.stringify(editorState));
  } catch (error) {
    console.warn(`[theme-preview] style editor state write failed reason="${String(error)}".`);
  }
}

function clearStoredEditorState(): void {
  try {
    window.localStorage.removeItem('theme-preview:style-editor');
  } catch (error) {
    console.warn(`[theme-preview] style editor state clear failed reason="${String(error)}".`);
  }
}

function resetEditorState(): void {
  const selectedTheme = requireSelectedTheme(dataset.themes, state.selectedThemeId);
  state.editor = resetStyleEditorToOriginal(state.editor, firstDecorationTarget(selectedTheme));
  clearStoredEditorState();
}

function updateStyleControl(control: HTMLInputElement | HTMLSelectElement): void {
  const scope = control.dataset.styleScope;
  const styleKey = control.dataset.styleKey;
  if (!scope || !styleKey) {
    return;
  }

  if (scope === 'reset') {
    resetEditorState();
    return;
  }

  const value = controlValue(control);

  if (scope === 'text') {
    assignTextStyle(state.editor.textTarget, styleKey, value);
    return;
  }

  if (scope === 'strong') {
    state.editor.overrides.strong[styleKey] = value;
    return;
  }

  if (scope === 'image.image') {
    state.editor.overrides.image.image[styleKey] = value;
    return;
  }

  if (scope === 'image.figure') {
    state.editor.overrides.image.figure[styleKey] = value;
    return;
  }

  if (scope === 'image.figcaption') {
    state.editor.overrides.image.figcaption[styleKey] = value;
    return;
  }

  if (scope === 'background.container') {
    state.editor.overrides.background.container[styleKey] = value;
    return;
  }

  if (scope === 'board') {
    updateBoardSetting(styleKey, value);
    return;
  }

  if (scope.startsWith('decoration.')) {
    const componentName = scope.slice('decoration.'.length);
    state.editor.overrides.decorations[componentName] = {
      ...(state.editor.overrides.decorations[componentName] ?? {}),
      [styleKey]: value,
    };
  }
}

function controlValue(control: HTMLInputElement | HTMLSelectElement): string {
  if (control instanceof HTMLInputElement && control.type === 'checkbox') {
    if (control.dataset.styleKey === 'display') {
      return control.checked ? 'block' : 'none';
    }

    return control.checked ? 'true' : 'false';
  }

  const unit = control.dataset.unit ?? '';
  return `${control.value}${unit}`;
}

function updateBoardSetting(styleKey: string, value: string): void {
  if (styleKey === 'enabled') {
    state.editor.board.enabled = value === 'true';
    return;
  }

  if (styleKey === 'color') {
    state.editor.board.color = value;
    return;
  }

  if (styleKey === 'size' || styleKey === 'opacity') {
    state.editor.board[styleKey] = Number.parseFloat(value);
  }
}

function assignTextStyle(target: TextStyleTarget, styleKey: string, value: string): void {
  state.editor.overrides.text[target] = {
    ...(state.editor.overrides.text[target] ?? {}),
    [styleKey]: value,
  };
}

function firstDecorationTarget(theme: ThemeDefinition): string {
  return decorationTargets(theme)[0]?.componentName ?? '';
}

function normalizeDecorationTarget(theme: ThemeDefinition): void {
  const targets = decorationTargets(theme);
  if (targets.length === 0) {
    state.editor.decorationTarget = '';
    return;
  }

  if (!targets.some((target) => target.componentName === state.editor.decorationTarget)) {
    console.warn(
      `[theme-preview] decoration target reset theme="${theme.value || theme.id}" stored="${state.editor.decorationTarget}" next="${targets[0].componentName}".`,
    );
    state.editor.decorationTarget = targets[0].componentName;
    persistEditorState(state.editor);
  }
}

function decorationTargets(theme: ThemeDefinition): Array<{
  label: string;
  ruleKey: string;
  componentName: string;
  variant?: string;
}> {
  return Object.entries(theme.config?.rules ?? {})
    .filter(([, rule]) => Boolean(rule.decoration))
    .map(([ruleKey, rule]) => ({
      label: `${decorationRuleLabel(ruleKey)} ${ruleKey}`,
      ruleKey,
      componentName: rule.decoration ?? '',
      variant: rule.variant,
    }));
}

function renderRangeControl(
  label: string,
  scope: string,
  styleKey: string,
  value: number,
  min: number,
  max: number,
  step: number,
  unit: string,
): string {
  return `
    <label class="controlRow">
      <span>${label}</span>
      <input class="rangeInput" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-style-scope="${scope}" data-style-key="${styleKey}" data-unit="${unit}" />
      <input class="valueInput" type="text" value="${escapeAttribute(`${value}${unit}`)}" data-style-scope="${scope}" data-style-key="${styleKey}" />
    </label>
  `;
}

function renderColorControl(label: string, scope: string, styleKey: string, value: string): string {
  return `
    <label class="controlRow">
      <span>${label}</span>
      <input class="colorInput" type="color" value="${escapeAttribute(value)}" data-style-scope="${scope}" data-style-key="${styleKey}" />
      <input class="valueInput" type="text" value="${escapeAttribute(value)}" data-style-scope="${scope}" data-style-key="${styleKey}" />
    </label>
  `;
}

function renderTextControl(label: string, scope: string, styleKey: string, value: string): string {
  return `
    <label class="controlRow">
      <span>${label}</span>
      <input class="wideInput" type="text" value="${escapeAttribute(value)}" data-style-scope="${scope}" data-style-key="${styleKey}" />
    </label>
  `;
}

function renderSelectControl(label: string, scope: string, styleKey: string, value: string, options: string[][]): string {
  return `
    <label class="controlRow">
      <span>${label}</span>
      <select class="wideInput" data-style-scope="${scope}" data-style-key="${styleKey}">
        ${options.map(([optionValue, optionLabel]) => `<option value="${optionValue}" ${value === optionValue ? 'selected' : ''}>${optionLabel}</option>`).join('')}
      </select>
    </label>
  `;
}

function renderToggleControl(label: string, scope: string, styleKey: string, enabled: boolean): string {
  return `
    <label class="toggleControl">
      ${label ? `<span><strong>${label}</strong></span>` : ''}
      <input type="checkbox" ${enabled ? 'checked' : ''} data-style-scope="${scope}" data-style-key="${styleKey}" />
      <i></i>
    </label>
  `;
}

function renderAlignControl(value: string): string {
  const options = [
    ['left', '☰'],
    ['center', '≡'],
    ['right', '☷'],
    ['justify', '▤'],
  ];

  return `
    <div class="controlRow">
      <span>对齐</span>
      <div class="buttonGroup">
        ${options
          .map(
            ([align, icon]) =>
              `<button type="button" class="${value === align ? 'active' : ''}" data-align="${align}" title="${align}">${icon}</button>`,
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderDecorationPreview(template: string, styleMap: Record<string, unknown>): string {
  if (!template) {
    return '';
  }

  return template
    .replace(/\{\{content\}\}/g, '示例文本内容')
    .replace(/\{\{number\}\}/g, '01')
    .replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key: string) => {
      const value = styleMap[key];
      return value == null ? '' : String(value);
    });
}

function stringStyle(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function numericStyle(value: unknown, fallback: number): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsedValue = Number.parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }

  return fallback;
}

function normalizeColorValue(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';
}

function shadowLabel(level: string): string {
  const labels: Record<string, string> = {
    none: '无',
    light: '轻',
    medium: '中',
    heavy: '重',
  };
  return labels[level] ?? level;
}

function paddingPresetLabel(preset: string): string {
  const labels: Record<string, string> = {
    none: '无',
    tight: '紧凑',
    medium: '适中',
    loose: '宽松',
    wide: '超宽',
  };
  return labels[preset] ?? preset;
}

function paddingPresetValue(preset: string): string {
  const values: Record<string, string> = {
    none: '0',
    tight: '0.5rem 0.75rem',
    medium: '1rem',
    loose: '1.5rem',
    wide: '2rem',
  };
  return values[preset] ?? '1rem';
}

function defaultBoardSize(pattern: BoardPattern, currentSize: number): number {
  const values: Partial<Record<BoardPattern, number>> = {
    'fine-grid': 15,
    'standard-grid': 24,
    'coarse-grid': 36,
    dot: 24,
    cross: 28,
  };
  return values[pattern] ?? currentSize;
}

function decorationRuleLabel(ruleKey: string): string {
  const labels: Record<string, string> = {
    h1: '一级标题',
    h2: '二级标题',
    h3: '三级标题',
    blockquote: '引用块',
    h2_content: 'h2_content',
    section_divider: 'section_divider',
  };
  return labels[ruleKey] ?? ruleKey;
}

function decorativeFieldLabel(fieldKey: string): string {
  const labels: Record<string, string> = {
    color: '颜色',
    title_color: '标题色',
    text_color: '文字色',
    meta_color: 'meta color',
    accent_color: '强调色',
    number_color: '序号色',
    number_bg: '序号背景',
    line_color: '线条色',
    sub_line_color: '辅助线',
  };
  return labels[fieldKey] ?? fieldKey;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

renderApp();
