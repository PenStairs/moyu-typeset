# Demo：公众号 Markdown 渲染全量测试

这是一份用于测试主题效果的 demo 文档，覆盖当前工程已经处理、部分处理、以及主题数据里有样式但渲染器还不完整的 Markdown 语法。建议切换不同主题查看标题、引用、图片、列表和强调文字的视觉差异。

**重点结论：**真正出彩的通常是标题、引用、图片、分割线和加粗文本。普通表格、脚注、删除线、任务列表目前更适合用来观察兼容性。

---

## 1. 标题层级

# 一级标题：用于文章主标题

一级标题通常会被主题替换成最强的标题组件，比如封面标题、边框标题、编号标题或大色块标题。

## 二级标题：用于章节标题

二级标题通常适合承载文章结构，也是很多主题最容易出彩的位置。

### 三级标题：用于小节标题

三级标题适合用在段落组内部，观察它和正文之间的层级关系。

#### 四级标题：用于更细的小标题

四级标题会按主题里的 `h4` 样式渲染，如果主题没有特别配置，视觉差异可能不明显。

##### 五级标题：用于补充说明

五级标题测试较小层级标题的兼容性。

###### 六级标题：用于极弱标题

六级标题测试最低层级标题的兼容性。

---

## 2. 段落、换行和行内样式

这是一个普通正文段落。它包含 **加粗文本**、*斜体文本*、`行内代码`、[普通链接](https://example.com)，以及一个自动链接 <https://example.com>。

这是第一行，末尾有两个空格用于测试硬换行。  
这是第二行，应该和上一行在视觉上保持连续但换行。

这是一个包含中文加粗边界的句子：**星链已成天花板。**目前市场仍在重新评估商业航天的增长速度。

这是删除线语法测试：~~这句话应该被删除线标记~~。当前渲染器还没有专门处理 `del` token，实际效果取决于解析和兜底逻辑。

---

## 3. 引用块

> 这是一段普通引用。很多主题会把引用替换成卡片、边框、引号装饰或强调块。

> **引用中的加粗文本** 也应该保留强调效果。
>
> 引用内部的第二段文字，用来测试多段引用在主题组件里的表现。

> ### 引用里的小标题
>
> 这段用于测试引用内部包含标题时的兼容性。

---

## 4. 无序列表

- 第一条：普通列表项
- 第二条：包含 **加粗重点**
- 第三条：包含 `行内代码`
- 第四条：包含 [链接](https://example.com)

---

## 5. 有序列表

1. 先建立文章主线
2. 再加入数据和案例
3. 最后提炼观点和行动建议

---

## 6. 嵌套列表

- 外层列表 A
  - 内层列表 A-1
  - 内层列表 A-2，包含 **重点**
- 外层列表 B
  1. 内层有序项 B-1
  2. 内层有序项 B-2

当前渲染器会处理列表 token，但嵌套列表是否足够漂亮，要看具体主题的列表样式和浏览器解析结果。

---

## 7. 任务列表

- [x] 已完成：准备文章素材
- [ ] 待完成：选择公众号主题
- [ ] 待完成：复制到公众号草稿箱

任务列表目前会接近普通列表处理，不会有专门的 checkbox 视觉组件。

---

## 8. 代码块

```js
const article = {
  title: 'SpaceX 市值重估',
  theme: 'social-media',
  ready: true,
};

console.log(article.title);
```

```bash
npm run dev -- /absolute/path/to/article.md
```

---

## 9. 图片

下面是一张单独成段的 Markdown 图片，用来测试 `figure + img + figcaption`：

![内嵌 base64 示例图](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDkwMCA1MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjkwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9IiNmZGRmNjMiLz48cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiByeD0iMzIiIGZpbGw9IiNmYjc5YTIiIHN0cm9rZT0iIzExMTgyNyIgc3Ryb2tlLXdpZHRoPSIxMiIvPjxjaXJjbGUgY3g9IjE0MCIgY3k9IjE0MCIgcj0iMzYiIGZpbGw9IiM0MGQwYzQiIHN0cm9rZT0iIzExMTgyNyIgc3Ryb2tlLXdpZHRoPSI4Ii8+PHJlY3QgeD0iMjAwIiB5PSIxMTAiIHdpZHRoPSI1NjAiIGhlaWdodD0iNjAiIHJ4PSIzMCIgZmlsbD0iIzExMTgyNyIvPjxyZWN0IHg9IjEyMCIgeT0iMjQwIiB3aWR0aD0iNjYwIiBoZWlnaHQ9IjMwIiByeD0iMTUiIGZpbGw9IiMxMTE4MjciIG9wYWNpdHk9Ii44NSIvPjxyZWN0IHg9IjEyMCIgeT0iMzEwIiB3aWR0aD0iNDgwIiBoZWlnaHQ9IjMwIiByeD0iMTUiIGZpbGw9IiMxMTE4MjciIG9wYWNpdHk9Ii44NSIvPjx0ZXh0IHg9IjQ1MCIgeT0iNDEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDQiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IiMxMTE4MjciPkltYWdlIFByZXZpZXc8L3RleHQ+PC9zdmc+)

这是一张行内图片 ![小图标](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzMCIgZmlsbD0iIzQwZDBjNCIgc3Ryb2tlPSIjMTExODI3IiBzdHJva2Utd2lkdGg9IjYiLz48L3N2Zz4=) 用来观察行内图片是否影响段落排版。

下面是 HTML 图片写法。预处理脚本能识别 HTML 图片标签里的 `src` 本地路径并转 base64，但当前 Markdown 渲染器对原始 HTML 的展示还不完整：

<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDYwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNlZmY2ZmYiLz48Y2lyY2xlIGN4PSIxMjAiIGN5PSIxMjAiIHI9IjYwIiBmaWxsPSIjZmI3OWEyIi8+PHJlY3QgeD0iMjIwIiB5PSI3MCIgd2lkdGg9IjI4MCIgaGVpZ2h0PSIzMCIgcng9IjE1IiBmaWxsPSIjMTExODI3Ii8+PHJlY3QgeD0iMjIwIiB5PSIxMzAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMzAiIHJ4PSIxNSIgZmlsbD0iIzQwZDBjNCIvPjwvc3ZnPg==" alt="HTML 图片测试">

---

## 10. 表格

| 模块 | 当前状态 | 观察重点 |
|---|---:|---|
| 标题 | 支持较好 | 是否有主题装饰 |
| 引用 | 支持较好 | 是否被替换成卡片 |
| 表格 | 不完整 | 是否被原样转义或降级 |

表格样式在主题数据里存在，但渲染器目前没有专门的表格分支，所以这是兼容性测试项。

---

## 11. 脚注

这里有一个脚注引用[^note]，用于测试解析器和渲染器的兼容性。

[^note]: 这是脚注内容。当前渲染器没有脚注专项处理。

---

## 12. 混合内容压力测试

### 观点一：高估值来自预期，而不是利润

SpaceX 的估值故事里，**星链现金流、发射频率、复用火箭能力** 是三条主线。它们分别对应收入、供给能力和成本结构。

> 如果一个公司同时改变了需求侧和供给侧，市场通常会提前把未来几年折现进估值。

1. 星链把用户规模推向全球市场
2. 猎鹰和星舰压低单位发射成本
3. 商业航天让客户从政府扩展到企业

### 观点二：风险来自兑现速度

- 技术迭代可能延期
- 监管审批可能影响发射节奏
- 资本市场可能重新定价成长股

```text
适合观察：
1. h3 小标题
2. 正文段落
3. 引用块
4. 有序和无序列表
5. 代码块
```

---

## 13. 原始 HTML 与特殊字符

下面这段包含原始 HTML 标签，当前通常不会按 HTML 原样渲染：

<section style="padding: 16px; border: 1px solid #ddd;">这是一段原始 HTML section。</section>

特殊字符测试：`<div>`、`&`、`"`、`'` 应该被安全处理。

---

## 14. 结尾 CTA

**建议测试方式：**先看“新孟菲斯”“高级活力黄”“Bento Grid”这类强视觉主题，再切到极简主题，对比标题、引用、图片边框和正文阅读体验。

---

全文结束。
