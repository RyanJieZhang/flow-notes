# Flow Notes

Flow Notes 是一个零依赖的网页版笔记工具，适合写 Markdown 笔记、整理学习资料、保存代码片段和做轻量知识管理。

在线访问：https://ryanjiezhang.github.io/flow-notes/

## 功能

- 自动保存草稿，刷新页面后可以恢复未保存内容
- 支持编辑已有笔记，而不是每次保存都生成重复记录
- 支持标签、置顶、归档和删除
- 支持按标题、正文、标签搜索
- 支持按状态和标签过滤笔记
- 支持浅色 / 深色模式切换
- 支持 Markdown 编辑、预览和分屏模式
- 支持 Markdown、TXT、HTML、PDF、JSON 导出
- 支持全部笔记 JSON 备份
- 支持导入 JSON 备份恢复笔记

## Markdown 支持

Flow Notes 支持常用 Markdown 语法：

```md
# 一级标题
## 二级标题
### 三级标题

**加粗**
*斜体*
`行内代码`

- 列表
- 列表

[链接](https://example.com)

![图片](https://picsum.photos/600/300)

| 名称 | 状态 |
| --- | --- |
| 表格 | 支持 |
| 图片 | 支持 |
```

## 代码块运行

JavaScript 代码块支持在预览区直接运行：

````md
```js
console.log("Hello Flow Notes");
console.log(1 + 2);
```
````

HTML 代码块支持在预览区打开 iframe 预览：

````md
```html
<h1>Hello</h1>
<p style="color: teal">HTML 预览</p>
```
````

说明：当前运行能力是前端静态网页中的轻量预览功能。Python、C++、Java 等语言需要后端沙箱或第三方编译服务，GitHub Pages 无法安全提供本地编译环境。

## 导入导出

单篇笔记可以导出为：

- Markdown
- TXT
- HTML
- PDF
- JSON

也可以选择“全部 JSON”导出完整备份。完整备份会包含笔记正文、标题、标签、置顶、归档、创建时间和更新时间。

导入功能支持读取 Flow Notes 导出的 JSON 文件，用于恢复或迁移笔记。

## 数据存储

所有笔记数据保存在浏览器的 `localStorage` 中。

这意味着：

- 同一设备、同一浏览器会自动保留笔记
- 换浏览器或换设备不会自动同步
- 清除浏览器网站数据可能会删除笔记
- 建议定期使用“全部 JSON”进行备份

## 本地使用

直接打开 `index.html` 即可使用，不需要安装依赖。

项目文件：

- `index.html`：页面结构
- `styles.css`：界面样式
- `app.js`：笔记、Markdown、导入导出和交互逻辑

## 部署

本项目是纯静态网页，可以部署到 GitHub Pages、Netlify、Vercel 或任何静态文件托管服务。
