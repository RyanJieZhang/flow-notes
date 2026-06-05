const STORAGE_KEY = "flow-notes-history";
const DRAFT_KEY = "flow-notes-draft";
const THEME_KEY = "flow-notes-theme";
const VIEW_KEY = "flow-notes-view";

const titleInput = document.querySelector("#titleInput");
const noteInput = document.querySelector("#noteInput");
const saveButton = document.querySelector("#saveButton");
const newNoteButton = document.querySelector("#newNoteButton");
const codeBlockButton = document.querySelector("#codeBlockButton");
const exportButton = document.querySelector("#exportButton");
const exportFormatSelect = document.querySelector("#exportFormatSelect");
const clearButton = document.querySelector("#clearButton");
const importButton = document.querySelector("#importButton");
const importInput = document.querySelector("#importInput");
const themeButton = document.querySelector("#themeButton");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const tagFilter = document.querySelector("#tagFilter");
const historyList = document.querySelector("#historyList");
const noteCount = document.querySelector("#noteCount");
const saveStatus = document.querySelector("#saveStatus");
const wordCount = document.querySelector("#wordCount");
const tagInput = document.querySelector("#tagInput");
const pinButton = document.querySelector("#pinButton");
const archiveButton = document.querySelector("#archiveButton");
const workspace = document.querySelector("#workspace");
const previewPanel = document.querySelector("#previewPanel");
const viewButtons = document.querySelectorAll(".tab-button");
const template = document.querySelector("#historyItemTemplate");

let notes = loadNotes();
let activeNoteId = notes[0]?.id ?? null;
let activeView = localStorage.getItem(VIEW_KEY) || "edit";

applyTheme(loadTheme());
applyView(activeView);
render();
syncEditorFromDraftOrActiveNote();
updatePreview();

saveButton.addEventListener("click", saveCurrentNote);
newNoteButton.addEventListener("click", startFreshNote);
codeBlockButton.addEventListener("click", insertPythonCodeBlock);
exportButton.addEventListener("click", exportCurrentNote);
clearButton.addEventListener("click", clearHistory);
importButton.addEventListener("click", () => importInput.click());
importInput.addEventListener("change", importNotes);
themeButton.addEventListener("click", toggleTheme);
searchInput.addEventListener("input", renderHistory);
statusFilter.addEventListener("change", renderHistory);
tagFilter.addEventListener("change", renderHistory);
noteInput.addEventListener("input", () => {
  updateWordCount();
  updatePreview();
  markDraft();
  saveDraft();
});
titleInput.addEventListener("input", () => {
  updatePreview();
  markDraft();
  saveDraft();
});
tagInput.addEventListener("input", () => {
  markDraft();
  saveDraft();
});
pinButton.addEventListener("click", togglePinned);
archiveButton.addEventListener("click", toggleArchived);
viewButtons.forEach((button) => {
  button.addEventListener("click", () => applyView(button.dataset.view));
});
previewPanel.addEventListener("click", handlePreviewAction);

function loadNotes() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.map(normalizeNote) : [];
  } catch {
    return [];
  }
}

function persistNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    return draft && typeof draft === "object" ? draft : null;
  } catch {
    return null;
  }
}

function saveDraft() {
  const draft = {
    activeNoteId,
    title: titleInput.value,
    body: noteInput.value,
    tags: parseTags(tagInput.value),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

function saveCurrentNote() {
  const body = noteInput.value.trim();
  const title = titleInput.value.trim() || "未命名笔记";
  const tags = parseTags(tagInput.value);

  if (!body && !titleInput.value.trim()) {
    saveStatus.textContent = "先写点内容再保存";
    return;
  }

  const now = new Date();
  const activeNote = notes.find((note) => note.id === activeNoteId);

  if (activeNote) {
    activeNote.title = title;
    activeNote.body = body;
    activeNote.tags = tags;
    activeNote.updatedAt = now.toISOString();
    notes = [activeNote, ...notes.filter((note) => note.id !== activeNote.id)];
    saveStatus.textContent = `已更新：${formatDate(now)}`;
  } else {
    const note = {
      id: createNoteId(),
      title,
      body,
      tags,
      pinned: false,
      archived: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    notes = [note, ...notes];
    activeNoteId = note.id;
    saveStatus.textContent = `已保存：${formatDate(now)}`;
  }

  persistNotes();
  clearDraft();
  render();
}

function startFreshNote() {
  activeNoteId = null;
  titleInput.value = "";
  noteInput.value = "";
  tagInput.value = "";
  saveStatus.textContent = "新笔记";
  clearDraft();
  updateWordCount();
  updatePreview();
  updateNoteActions();
  renderHistory();
  titleInput.focus();
}

function restoreNote(id) {
  activeNoteId = id;
  syncEditorFromActiveNote();
  clearDraft();
  renderHistory();
}

function deleteNote(id) {
  const note = notes.find((item) => item.id === id);
  if (!note) return;

  const confirmed = window.confirm(`确定删除「${note.title}」这条历史吗？`);
  if (!confirmed) return;

  notes = notes.filter((item) => item.id !== id);
  if (activeNoteId === id) {
    activeNoteId = notes[0]?.id ?? null;
    syncEditorFromActiveNote();
  }

  persistNotes();
  render();
  saveStatus.textContent = "历史记录已删除";
}

function togglePinned() {
  const note = getActiveSavedNote();
  if (!note) return;

  note.pinned = !note.pinned;
  note.updatedAt = new Date().toISOString();
  persistNotes();
  render();
  syncEditorFromActiveNote();
  saveStatus.textContent = note.pinned ? "已置顶" : "已取消置顶";
}

function toggleArchived() {
  const note = getActiveSavedNote();
  if (!note) return;

  note.archived = !note.archived;
  note.updatedAt = new Date().toISOString();
  persistNotes();
  render();
  syncEditorFromActiveNote();
  saveStatus.textContent = note.archived ? "已归档" : "已移出归档";
}

function getActiveSavedNote() {
  const note = notes.find((item) => item.id === activeNoteId);

  if (!note) {
    saveStatus.textContent = "先保存笔记再设置状态";
    return null;
  }

  return note;
}

function syncEditorFromDraftOrActiveNote() {
  const draft = loadDraft();
  if (draft && (draft.title || draft.body)) {
    const draftNoteExists = notes.some((note) => note.id === draft.activeNoteId);
    activeNoteId = draftNoteExists ? draft.activeNoteId : null;
    titleInput.value = draft.title || "";
    noteInput.value = draft.body || "";
    tagInput.value = (draft.tags || []).join(", ");
    saveStatus.textContent = `草稿已恢复：${formatDate(new Date(draft.updatedAt))}`;
    updateWordCount();
    updatePreview();
    updateNoteActions();
    return;
  }

  syncEditorFromActiveNote();
}

function syncEditorFromActiveNote() {
  const activeNote = notes.find((note) => note.id === activeNoteId);

  if (!activeNote) {
    titleInput.value = "";
    noteInput.value = "";
    tagInput.value = "";
    updateWordCount();
    updatePreview();
    updateNoteActions();
    return;
  }

  titleInput.value = activeNote.title;
  noteInput.value = activeNote.body;
  tagInput.value = (activeNote.tags || []).join(", ");
  saveStatus.textContent = `正在编辑：${formatDate(new Date(activeNote.updatedAt || activeNote.createdAt))}`;
  updateWordCount();
  updatePreview();
  updateNoteActions();
}

function exportCurrentNote() {
  const title = titleInput.value.trim() || "未命名笔记";
  const body = noteInput.value;
  const format = exportFormatSelect.value;
  const note = buildExportNote(title, body);

  if (format === "pdf") {
    exportPdf(note);
    return;
  }

  const exportFile = buildExportFile(note, format);

  if (!exportFile) {
    saveStatus.textContent = "没有可导出的内容";
    return;
  }

  const blob = new Blob([exportFile.content], { type: exportFile.type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = exportFile.filename;
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  saveStatus.textContent = `已导出：${exportFile.label}`;
}

function clearHistory() {
  if (!notes.length) return;
  const confirmed = window.confirm("确定清空所有历史记录吗？这个操作不能撤销。");
  if (!confirmed) return;

  notes = [];
  activeNoteId = null;
  persistNotes();
  startFreshNote();
  saveStatus.textContent = "历史记录已清空";
}

function render() {
  renderTagFilter();
  renderHistory();
  updateWordCount();
}

function renderHistory() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const selectedTag = tagFilter.value;
  const visibleNotes = notes.filter((note) => {
    const normalized = normalizeNote(note);
    const haystack = `${normalized.title} ${normalized.body} ${normalized.tags.join(" ")}`.toLowerCase();
    const matchesQuery = haystack.includes(query);
    const matchesTag = selectedTag === "all" || normalized.tags.includes(selectedTag);
    const matchesStatus =
      status === "all" ||
      (status === "active" && !normalized.archived) ||
      (status === "pinned" && normalized.pinned) ||
      (status === "archived" && normalized.archived);

    return matchesQuery && matchesTag && matchesStatus;
  }).sort((first, second) => {
    if (first.pinned !== second.pinned) return first.pinned ? -1 : 1;
    return new Date(second.updatedAt || second.createdAt) - new Date(first.updatedAt || first.createdAt);
  });

  historyList.innerHTML = "";
  noteCount.textContent = `${visibleNotes.length}/${notes.length} 条记录`;

  if (!visibleNotes.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = notes.length ? "没有匹配的历史记录" : "保存后会出现在这里";
    historyList.append(empty);
    return;
  }

  visibleNotes.forEach((note) => {
    const item = template.content.cloneNode(true);
    const button = item.querySelector(".history-item");
    const restoreButton = item.querySelector(".history-restore");
    const deleteButton = item.querySelector(".delete-note");
    const title = item.querySelector("strong");
    const preview = item.querySelector(".preview");
    const tagline = item.querySelector(".tagline");
    const time = item.querySelector("small");

    button.classList.toggle("active", note.id === activeNoteId);
    button.classList.toggle("pinned", Boolean(note.pinned));
    button.classList.toggle("archived", Boolean(note.archived));
    restoreButton.addEventListener("click", () => restoreNote(note.id));
    deleteButton.addEventListener("click", () => deleteNote(note.id));
    title.textContent = `${note.pinned ? "★ " : ""}${note.title}`;
    preview.textContent = getSearchPreview(note, query);
    tagline.textContent = note.tags?.length ? note.tags.map((tag) => `#${tag}`).join(" ") : "无标签";
    time.textContent = `${note.archived ? "归档 · " : ""}${formatDate(new Date(note.updatedAt || note.createdAt))}`;
    historyList.append(item);
  });
}

function renderTagFilter() {
  const currentValue = tagFilter.value;
  const tags = [...new Set(notes.flatMap((note) => normalizeNote(note).tags))]
    .sort((first, second) => first.localeCompare(second, "zh-CN"));

  tagFilter.innerHTML = '<option value="all">全部标签</option>';
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagFilter.append(option);
  });

  tagFilter.value = tags.includes(currentValue) ? currentValue : "all";
}

function updateWordCount() {
  const compact = noteInput.value.replace(/\s/g, "");
  wordCount.textContent = `${compact.length} 字`;
}

function updatePreview() {
  const title = titleInput.value.trim();
  const body = noteInput.value.trim();

  if (!title && !body) {
    previewPanel.innerHTML = '<p class="preview-empty">预览会显示在这里</p>';
    return;
  }

  const source = title ? `# ${title}\n\n${body}` : body;
  previewPanel.innerHTML = renderMarkdown(source);
}

function insertPythonCodeBlock() {
  applyView(activeView === "preview" ? "edit" : activeView);

  const template = '```python\n# 在这里写 Python 代码\nprint("Hello Flow Notes")\n```';
  const selectionStart = noteInput.selectionStart;
  const selectionEnd = noteInput.selectionEnd;
  const before = noteInput.value.slice(0, selectionStart);
  const after = noteInput.value.slice(selectionEnd);
  const needsLeadingBreak = before && !before.endsWith("\n") ? "\n\n" : "";
  const needsTrailingBreak = after && !after.startsWith("\n") ? "\n\n" : "";
  const insertText = `${needsLeadingBreak}${template}${needsTrailingBreak}`;
  const cursorOffset = needsLeadingBreak.length + "```python\n".length;

  noteInput.value = `${before}${insertText}${after}`;
  noteInput.focus();
  noteInput.setSelectionRange(selectionStart + cursorOffset, selectionStart + cursorOffset + "# 在这里写 Python 代码".length);
  updateWordCount();
  updatePreview();
  markDraft();
  saveDraft();
}

function handlePreviewAction(event) {
  const actionButton = event.target.closest("[data-code-action]");
  if (!actionButton) return;

  const codeBlock = actionButton.closest(".code-block");
  if (!codeBlock) return;

  const language = codeBlock.dataset.language || "";
  const code = decodeURIComponent(codeBlock.dataset.code || "");
  const output = codeBlock.querySelector(".code-output");

  if (actionButton.dataset.codeAction === "copy-code") {
    copyCode(code, actionButton);
    return;
  }

  if (actionButton.dataset.codeAction === "run-js") {
    runJavaScript(code, output);
    return;
  }

  if (actionButton.dataset.codeAction === "preview-html") {
    previewHtml(code, output);
  }
}

function buildExportNote(title, body) {
  const activeNote = notes.find((note) => note.id === activeNoteId);

  return {
    id: activeNote?.id || null,
    title,
    body,
    tags: activeNote?.tags || parseTags(tagInput.value),
    pinned: Boolean(activeNote?.pinned),
    archived: Boolean(activeNote?.archived),
    createdAt: activeNote?.createdAt || null,
    updatedAt: activeNote?.updatedAt || new Date().toISOString(),
  };
}

function importNotes() {
  const file = importInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result || ""));
      const importedNotes = normalizeImportedNotes(parsed);

      if (!importedNotes.length) {
        saveStatus.textContent = "没有找到可导入的笔记";
        return;
      }

      const existingIds = new Set(notes.map((note) => note.id));
      const mergedNotes = importedNotes.map((note) => ({
        ...note,
        id: existingIds.has(note.id) ? createNoteId() : note.id,
      }));

      notes = [...mergedNotes, ...notes].sort((first, second) => {
        return new Date(second.updatedAt || second.createdAt) - new Date(first.updatedAt || first.createdAt);
      });
      activeNoteId = mergedNotes[0].id;
      persistNotes();
      clearDraft();
      syncEditorFromActiveNote();
      render();
      saveStatus.textContent = `已导入 ${mergedNotes.length} 条笔记`;
    } catch {
      saveStatus.textContent = "JSON 格式不正确，导入失败";
    } finally {
      importInput.value = "";
    }
  });
  reader.readAsText(file, "utf-8");
}

function normalizeImportedNotes(value) {
  const rawNotes = Array.isArray(value) ? value : value?.notes;
  if (Array.isArray(rawNotes)) {
    return rawNotes.map(normalizeNote).filter((note) => note.title || note.body);
  }

  if (value && typeof value === "object") {
    const singleNote = normalizeNote(value);
    return singleNote.title || singleNote.body ? [singleNote] : [];
  }

  return [];
}

function normalizeNote(note) {
  const now = new Date().toISOString();
  return {
    id: note?.id || createNoteId(),
    title: String(note?.title || "未命名笔记"),
    body: String(note?.body || ""),
    tags: Array.isArray(note?.tags) ? note.tags.map(String).map((tag) => tag.trim()).filter(Boolean) : [],
    pinned: Boolean(note?.pinned),
    archived: Boolean(note?.archived),
    createdAt: note?.createdAt || now,
    updatedAt: note?.updatedAt || note?.createdAt || now,
  };
}

function parseTags(value) {
  return [...new Set(value.split(/[,，#\n]/).map((tag) => tag.trim()).filter(Boolean))];
}

function updateNoteActions() {
  const note = notes.find((item) => item.id === activeNoteId);
  pinButton.classList.toggle("active", Boolean(note?.pinned));
  archiveButton.classList.toggle("active", Boolean(note?.archived));
  pinButton.textContent = note?.pinned ? "取消置顶" : "置顶";
  archiveButton.textContent = note?.archived ? "取消归档" : "归档";
}

function getSearchPreview(note, query) {
  if (!note.body) return "空白笔记";
  if (!query) return note.body;

  const index = note.body.toLowerCase().indexOf(query);
  if (index < 0) return note.body;

  const start = Math.max(0, index - 24);
  const end = Math.min(note.body.length, index + query.length + 48);
  return `${start > 0 ? "..." : ""}${note.body.slice(start, end)}${end < note.body.length ? "..." : ""}`;
}

function buildExportFile(note, format) {
  const filename = safeFilename(note.title);

  if (format === "all-json") {
    if (!notes.length) return null;

    return {
      content: JSON.stringify({ exportedAt: new Date().toISOString(), notes: notes.map(normalizeNote) }, null, 2),
      filename: "flow-notes-backup.json",
      label: "全部 JSON",
      type: "application/json;charset=utf-8",
    };
  }

  const formats = {
    markdown: {
      content: `# ${note.title}\n\n${note.body}\n`,
      extension: "md",
      label: "Markdown",
      type: "text/markdown;charset=utf-8",
    },
    text: {
      content: `${note.title}\n\n${note.body}\n`,
      extension: "txt",
      label: "TXT",
      type: "text/plain;charset=utf-8",
    },
    html: {
      content: buildHtmlDocument(note),
      extension: "html",
      label: "HTML",
      type: "text/html;charset=utf-8",
    },
    json: {
      content: JSON.stringify(note, null, 2),
      extension: "json",
      label: "JSON",
      type: "application/json;charset=utf-8",
    },
  };

  const exportFormat = formats[format] || formats.markdown;
  return {
    ...exportFormat,
    filename: `${filename}.${exportFormat.extension}`,
  };
}

function exportPdf(note) {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    saveStatus.textContent = "请允许弹出窗口后再导出 PDF";
    return;
  }

  printWindow.document.write(buildHtmlDocument(note, true));
  printWindow.document.close();
  saveStatus.textContent = "PDF 打印窗口已打开";
}

function buildHtmlDocument(note, autoPrint = false) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(note.title)}</title>
  <style>
    @page { margin: 22mm 18mm; }
    body { max-width: 760px; margin: 48px auto; padding: 0 22px; font-family: "Segoe UI", Arial, sans-serif; color: #20231f; line-height: 1.75; }
    .print-action { position: sticky; top: 0; margin: -18px 0 28px; padding: 12px 0; background: #fff; border-bottom: 1px solid #dce2d8; }
    .print-action button { border: 0; border-radius: 8px; background: #16645a; color: #fff; cursor: pointer; font: inherit; font-weight: 700; padding: 10px 16px; }
    h1 { line-height: 1.2; }
    code { padding: 2px 6px; border-radius: 6px; background: #eef4ef; }
    pre { overflow: auto; padding: 16px; border: 1px solid #dce2d8; border-radius: 8px; background: #eef4ef; }
    pre code { padding: 0; background: transparent; color: #20231f; font-family: Consolas, monospace; font-size: 14px; }
    img { display: block; max-width: 100%; height: auto; margin: 0 0 16px; border-radius: 8px; border: 1px solid #dce2d8; }
    .table-wrap { overflow: auto; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; border: 1px solid #dce2d8; text-align: left; vertical-align: top; }
    th { background: #eef4ef; color: #16645a; }
    a { color: #16645a; }
    @media print { body { max-width: none; margin: 0; padding: 0; } .print-action { display: none; } }
  </style>
</head>
<body>
${autoPrint ? '<div class="print-action"><button type="button" onclick="window.print()">保存为 PDF</button></div>' : ""}
${renderMarkdown(`# ${note.title}\n\n${note.body}`, { interactiveCode: false })}
${autoPrint ? "<script>window.addEventListener('load', () => setTimeout(() => window.print(), 150));<\/script>" : ""}
</body>
</html>`;
}

function markDraft() {
  saveStatus.textContent = "正在编辑";
}

function applyView(view) {
  activeView = ["edit", "split", "preview"].includes(view) ? view : "edit";
  workspace.dataset.view = activeView;
  localStorage.setItem(VIEW_KEY, activeView);
  viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === activeView);
  });
}

function loadTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme) return storedTheme;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  themeButton.textContent = nextTheme === "dark" ? "☀" : "◐";
  localStorage.setItem(THEME_KEY, nextTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme;
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

function renderMarkdown(markdown, options = {}) {
  const interactiveCode = options.interactiveCode !== false;
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let listItems = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      index += 1;
      continue;
    }

    const fenceMatch = trimmed.match(/^```([\w-]*)\s*$/);
    if (fenceMatch) {
      flushList();
      const language = fenceMatch[1] ? ` language-${escapeAttribute(fenceMatch[1])}` : "";
      const codeLines = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push(renderCodeBlock(codeLines.join("\n"), fenceMatch[1], interactiveCode));
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      flushList();
      const table = parseTable(lines, index);
      blocks.push(renderTable(table.headers, table.rows));
      index = table.nextIndex;
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      listItems.push(`<li>${renderInline(listMatch[1])}</li>`);
      index += 1;
      continue;
    }

    flushList();

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    blocks.push(`<p>${renderInline(trimmed)}</p>`);
    index += 1;
  }

  flushList();
  return blocks.join("");

  function flushList() {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.join("")}</ul>`);
    listItems = [];
  }
}

function renderCodeBlock(code, rawLanguage, interactiveCode) {
  const language = normalizeLanguage(rawLanguage);
  const languageClass = language ? ` language-${escapeAttribute(language)}` : "";
  const encodedCode = encodeURIComponent(code);
  const label = language || "code";
  const action = interactiveCode ? getCodeAction(language) : "";
  const output = interactiveCode ? '<div class="code-output" aria-live="polite"></div>' : "";

  return `<div class="code-block" data-language="${escapeAttribute(language)}" data-code="${encodedCode}">
    <div class="code-toolbar">
      <span>${escapeHtml(label)}</span>
      <div class="code-actions">
        <button type="button" data-code-action="copy-code">复制</button>
        ${action}
      </div>
    </div>
    <pre><code class="${languageClass.trim()}">${escapeHtml(code)}</code></pre>
    ${output}
  </div>`;
}

function getCodeAction(language) {
  if (["js", "javascript"].includes(language)) {
    return '<button type="button" data-code-action="run-js">运行</button>';
  }

  if (language === "html") {
    return '<button type="button" data-code-action="preview-html">预览</button>';
  }

  return '<span class="code-note">暂不支持运行</span>';
}

function normalizeLanguage(language) {
  return String(language || "").trim().toLowerCase();
}

function runJavaScript(code, output) {
  output.textContent = "正在运行...";
  output.classList.remove("error");

  const runId = createNoteId();
  const blob = new Blob([buildJavaScriptRunner(code, runId)], { type: "text/javascript" });
  const workerUrl = URL.createObjectURL(blob);
  const worker = new Worker(workerUrl);
  const timeout = window.setTimeout(() => {
    cleanup();
    output.textContent = "运行超时";
    output.classList.add("error");
  }, 3000);

  worker.addEventListener("message", (event) => {
    if (event.data?.runId !== runId) return;

    if (event.data.type === "log") {
      output.textContent = appendOutput(output.textContent, event.data.payload);
      return;
    }

    if (event.data.type === "error") {
      cleanup();
      output.textContent = event.data.payload || "运行失败";
      output.classList.add("error");
      return;
    }

    if (event.data.type === "done") {
      cleanup();
      output.textContent = output.textContent === "正在运行..." ? "运行完成，无输出" : output.textContent;
    }
  });
  worker.addEventListener("error", (event) => {
    cleanup();
    output.textContent = event.message || "运行失败";
    output.classList.add("error");
  });

  function cleanup() {
    window.clearTimeout(timeout);
    worker.terminate();
    URL.revokeObjectURL(workerUrl);
  }
}

function buildJavaScriptRunner(code, runId) {
  return `
const runId = ${JSON.stringify(runId)};
const userCode = ${JSON.stringify(code)};
const send = (type, payload) => postMessage({ runId, type, payload });
const format = (value) => {
  if (typeof value === "string") return value;
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
};
const sandboxConsole = {
  log: (...values) => send("log", values.map(format).join(" ")),
  warn: (...values) => send("log", "Warning: " + values.map(format).join(" ")),
  error: (...values) => send("log", "Error: " + values.map(format).join(" ")),
};
self.addEventListener("error", (event) => send("error", event.message));
self.addEventListener("unhandledrejection", (event) => send("error", event.reason?.message || String(event.reason)));
(async () => {
  try {
    const runner = new Function("console", '"use strict"; return (async () => {\\n' + userCode + '\\n})();');
    const result = await runner(sandboxConsole);
    if (result !== undefined) send("log", format(result));
    send("done");
  } catch (error) {
    send("error", error.message);
  }
})();
`;
}

function appendOutput(currentOutput, nextLine) {
  return currentOutput && currentOutput !== "正在运行..." ? `${currentOutput}\n${nextLine}` : nextLine;
}

async function copyCode(code, button) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
    } else {
      fallbackCopy(code);
    }
    flashButton(button, "已复制");
  } catch {
    fallbackCopy(code);
    flashButton(button, "已复制");
  }
}

function fallbackCopy(value) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function flashButton(button, label) {
  const originalLabel = button.textContent;
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = originalLabel;
  }, 1200);
}

function previewHtml(code, output) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-forms");
  iframe.srcdoc = code;
  output.replaceChildren(iframe);
  output.classList.remove("error");
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => {
      const safeUrl = sanitizeUrl(url);
      return safeUrl ? `<img src="${safeUrl}" alt="${alt}">` : "";
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => {
      const safeUrl = sanitizeUrl(url);
      return safeUrl ? `<a href="${safeUrl}" target="_blank" rel="noreferrer">${text}</a>` : text;
    });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/\s+/g, "-");
}

function sanitizeUrl(value) {
  const decoded = value.replace(/&amp;/g, "&").trim();
  const isSafe =
    /^(https?:|mailto:)/i.test(decoded) ||
    /^data:image\/(png|gif|jpe?g|webp|svg\+xml);base64,/i.test(decoded) ||
    /^[./#][^\s]*$/.test(decoded);

  return isSafe ? escapeHtml(decoded) : "";
}

function isTableStart(lines, index) {
  return hasTableCells(lines[index]) && index + 1 < lines.length && isTableSeparator(lines[index + 1]);
}

function hasTableCells(line) {
  return line.includes("|") && splitTableRow(line).length > 1;
}

function isTableSeparator(line) {
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function parseTable(lines, startIndex) {
  const headers = splitTableRow(lines[startIndex]);
  const rows = [];
  let index = startIndex + 2;

  while (index < lines.length && hasTableCells(lines[index])) {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }

  return { headers, rows, nextIndex: index };
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(headers, rows) {
  const head = headers.map((header) => `<th>${renderInline(header)}</th>`).join("");
  const body = rows.map((row) => {
    const cells = headers.map((_, cellIndex) => `<td>${renderInline(row[cellIndex] || "")}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");

  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function safeFilename(value) {
  return value.replace(/[\\/:*?"<>|]/g, "-").slice(0, 48) || "note";
}

function createNoteId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
