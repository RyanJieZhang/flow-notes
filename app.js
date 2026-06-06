const STORAGE_KEY = "flow-notes-history";
const DRAFT_KEY = "flow-notes-draft";
const THEME_KEY = "flow-notes-theme";
const VIEW_KEY = "flow-notes-view";
const SIDEBAR_WIDTH_KEY = "flow-notes-sidebar-width";
const SIDEBAR_COLLAPSED_KEY = "flow-notes-sidebar-collapsed";
const SPLIT_RATIO_KEY = "flow-notes-split-ratio";

const appShell = document.querySelector("#appShell");
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
const changelogButton = document.querySelector("#changelogButton");
const changelogDialog = document.querySelector("#changelogDialog");
const closeChangelogButton = document.querySelector("#closeChangelogButton");
const changelogList = document.querySelector("#changelogList");
const sidebarToggleButton = document.querySelector("#sidebarToggleButton");
const sidebarResizer = document.querySelector("#sidebarResizer");
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
const splitResizer = document.querySelector("#splitResizer");
const previewPanel = document.querySelector("#previewPanel");
const viewButtons = document.querySelectorAll(".tab-button");
const template = document.querySelector("#historyItemTemplate");

const CHANGELOG_ENTRIES = [
  {
    date: "2026/06/06",
    title: "布局体验优化",
    items: [
      "新增历史栏拖拽调整宽度，半屏写笔记时可以把左侧空间让给编辑区。",
      "新增历史栏一键收起按钮，窄窗口下只保留一个展开入口。",
      "新增分屏比例拖拽，编辑区和预览区的宽度可以按当前任务自由调整。",
      "新增编辑区到预览区的同步定位，选中左侧内容时右侧会滚动到对应结果。",
      "系统会记住历史栏宽度和收起状态，下次打开继续沿用。",
    ],
  },
  {
    date: "2026/06/05",
    title: "代码运行增强",
    items: [
      "新增更新日志入口，可以直接查看今天和近期做了什么功能。",
      "Python 代码块支持在浏览器中运行，并会自动加载 Pyodide 支持的依赖库。",
      "编辑器支持 Tab 缩进、Shift+Tab 反缩进，以及回车自动延续缩进。",
      "新增 +代码块 按钮，一键插入 Python 模板。",
    ],
  },
  {
    date: "2026/06/04",
    title: "代码与 Markdown 增强",
    items: [
      "Markdown 预览支持表格、图片和围栏代码块。",
      "代码块支持复制，JavaScript 支持沙箱运行，HTML 支持 iframe 预览。",
      "导出格式扩展为 Markdown、TXT、HTML、PDF、JSON 和全部 JSON 备份。",
    ],
  },
  {
    date: "2026/06/03",
    title: "笔记管理升级",
    items: [
      "支持编辑已有笔记，避免重复保存出多条相同记录。",
      "新增标签、置顶、归档、搜索和状态过滤。",
      "新增浅色 / 深色模式切换，适合白天和夜间使用。",
    ],
  },
];

let notes = loadNotes();
let activeNoteId = notes[0]?.id ?? null;
let activeView = localStorage.getItem(VIEW_KEY) || "edit";
let sidebarWidth = loadSidebarWidth();
let isSidebarCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
let splitRatio = loadSplitRatio();
let pyodideReadyPromise = null;
let previewSyncTimer = null;

applyTheme(loadTheme());
applySidebarLayout();
applySplitLayout();
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
changelogButton.addEventListener("click", openChangelog);
closeChangelogButton.addEventListener("click", closeChangelog);
changelogDialog.addEventListener("click", (event) => {
  if (event.target === changelogDialog) closeChangelog();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !changelogDialog.hidden) closeChangelog();
});
window.addEventListener("resize", () => {
  sidebarWidth = clampSidebarWidth(sidebarWidth);
  applySidebarLayout();
  splitRatio = clampSplitRatio(splitRatio);
  applySplitLayout();
});
sidebarToggleButton.addEventListener("click", toggleSidebar);
sidebarResizer.addEventListener("pointerdown", startSidebarResize);
sidebarResizer.addEventListener("keydown", handleSidebarResizeKeydown);
splitResizer.addEventListener("pointerdown", startSplitResize);
splitResizer.addEventListener("keydown", handleSplitResizeKeydown);
searchInput.addEventListener("input", renderHistory);
statusFilter.addEventListener("change", renderHistory);
tagFilter.addEventListener("change", renderHistory);
noteInput.addEventListener("input", () => {
  updateWordCount();
  updatePreview();
  markDraft();
  saveDraft();
  schedulePreviewSync();
});
noteInput.addEventListener("keydown", handleEditorKeydown);
noteInput.addEventListener("click", syncPreviewToEditorSelection);
noteInput.addEventListener("keyup", syncPreviewToEditorSelection);
noteInput.addEventListener("select", syncPreviewToEditorSelection);
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

function loadSidebarWidth() {
  const storedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
  return clampSidebarWidth(Number.isFinite(storedWidth) ? storedWidth : 340);
}

function applySidebarLayout() {
  const width = clampSidebarWidth(sidebarWidth);
  sidebarWidth = width;
  appShell.style.setProperty("--sidebar-width", `${width}px`);
  appShell.classList.toggle("sidebar-collapsed", isSidebarCollapsed);
  sidebarToggleButton.textContent = isSidebarCollapsed ? "›" : "‹";
  sidebarToggleButton.title = isSidebarCollapsed ? "展开历史栏" : "收起历史栏";
  sidebarToggleButton.setAttribute("aria-label", sidebarToggleButton.title);
  sidebarToggleButton.setAttribute("aria-expanded", String(!isSidebarCollapsed));
}

function toggleSidebar() {
  isSidebarCollapsed = !isSidebarCollapsed;
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  applySidebarLayout();
}

function startSidebarResize(event) {
  if (isSidebarCollapsed || event.pointerType === "keyboard") return;
  event.preventDefault();
  sidebarResizer.setPointerCapture(event.pointerId);
  document.body.classList.add("resizing-sidebar");

  const handlePointerMove = (moveEvent) => {
    sidebarWidth = clampSidebarWidth(moveEvent.clientX);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
    applySidebarLayout();
  };

  const stopResize = () => {
    document.body.classList.remove("resizing-sidebar");
    sidebarResizer.removeEventListener("pointermove", handlePointerMove);
    sidebarResizer.removeEventListener("pointerup", stopResize);
    sidebarResizer.removeEventListener("pointercancel", stopResize);
  };

  sidebarResizer.addEventListener("pointermove", handlePointerMove);
  sidebarResizer.addEventListener("pointerup", stopResize);
  sidebarResizer.addEventListener("pointercancel", stopResize);
}

function handleSidebarResizeKeydown(event) {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();

  if (isSidebarCollapsed) {
    isSidebarCollapsed = false;
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, "false");
  }

  sidebarWidth = clampSidebarWidth(sidebarWidth + (event.key === "ArrowRight" ? 24 : -24));
  localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
  applySidebarLayout();
}

function clampSidebarWidth(width) {
  const maxWidth = Math.min(440, Math.max(260, window.innerWidth * 0.45));
  return Math.round(Math.min(Math.max(width, 240), maxWidth));
}

function loadSplitRatio() {
  const storedRatio = Number(localStorage.getItem(SPLIT_RATIO_KEY));
  return clampSplitRatio(Number.isFinite(storedRatio) ? storedRatio : 50);
}

function applySplitLayout() {
  const ratio = clampSplitRatio(splitRatio);
  splitRatio = ratio;
  workspace.style.setProperty("--editor-fr", `${ratio}fr`);
  workspace.style.setProperty("--preview-fr", `${100 - ratio}fr`);
  splitResizer.setAttribute("aria-valuemin", "30");
  splitResizer.setAttribute("aria-valuemax", "75");
  splitResizer.setAttribute("aria-valuenow", String(ratio));
}

function startSplitResize(event) {
  if (activeView !== "split" || event.pointerType === "keyboard") return;
  event.preventDefault();
  splitResizer.setPointerCapture(event.pointerId);
  document.body.classList.add("resizing-split");

  const handlePointerMove = (moveEvent) => {
    const bounds = workspace.getBoundingClientRect();
    const nextRatio = ((moveEvent.clientX - bounds.left) / bounds.width) * 100;
    splitRatio = clampSplitRatio(nextRatio);
    localStorage.setItem(SPLIT_RATIO_KEY, String(splitRatio));
    applySplitLayout();
  };

  const stopResize = () => {
    document.body.classList.remove("resizing-split");
    splitResizer.removeEventListener("pointermove", handlePointerMove);
    splitResizer.removeEventListener("pointerup", stopResize);
    splitResizer.removeEventListener("pointercancel", stopResize);
  };

  splitResizer.addEventListener("pointermove", handlePointerMove);
  splitResizer.addEventListener("pointerup", stopResize);
  splitResizer.addEventListener("pointercancel", stopResize);
}

function handleSplitResizeKeydown(event) {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  applyView("split");
  splitRatio = clampSplitRatio(splitRatio + (event.key === "ArrowRight" ? 5 : -5));
  localStorage.setItem(SPLIT_RATIO_KEY, String(splitRatio));
  applySplitLayout();
}

function clampSplitRatio(value) {
  const workspaceWidth = workspace?.clientWidth || window.innerWidth;
  const minimumRatio = workspaceWidth < 760 ? 40 : 30;
  const maximumRatio = workspaceWidth < 760 ? 60 : 75;
  return Math.round(Math.min(Math.max(value, minimumRatio), maximumRatio));
}

function openChangelog() {
  renderChangelog();
  changelogDialog.hidden = false;
  closeChangelogButton.focus();
}

function closeChangelog() {
  changelogDialog.hidden = true;
  changelogButton.focus();
}

function renderChangelog() {
  changelogList.innerHTML = "";

  CHANGELOG_ENTRIES.forEach((entry) => {
    const article = document.createElement("article");
    article.className = "changelog-entry";

    const header = document.createElement("div");
    header.className = "changelog-entry-header";

    const title = document.createElement("h3");
    title.textContent = entry.title;

    const time = document.createElement("time");
    time.dateTime = entry.date.replaceAll("/", "-");
    time.textContent = entry.date;

    const list = document.createElement("ul");
    entry.items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      list.append(listItem);
    });

    header.append(title, time);
    article.append(header, list);
    changelogList.append(article);
  });
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
  previewPanel.innerHTML = renderMarkdown(source, { sourceLineOffset: title ? -2 : 0 });
  syncPreviewToEditorSelection();
}

function schedulePreviewSync() {
  window.clearTimeout(previewSyncTimer);
  previewSyncTimer = window.setTimeout(syncPreviewToEditorSelection, 80);
}

function syncPreviewToEditorSelection() {
  if (activeView !== "split" && activeView !== "preview") return;

  const selectedLine = getCurrentEditorLine();
  const target = findPreviewBlockForLine(selectedLine);
  if (!target) return;

  previewPanel.querySelector(".source-highlight")?.classList.remove("source-highlight");
  target.classList.add("source-highlight");
  target.scrollIntoView({ block: "center", behavior: "smooth" });
  window.setTimeout(() => target.classList.remove("source-highlight"), 900);
}

function getCurrentEditorLine() {
  const selectionStart = Math.min(noteInput.selectionStart, noteInput.selectionEnd);
  return noteInput.value.slice(0, selectionStart).split(/\r?\n/).length;
}

function findPreviewBlockForLine(lineNumber) {
  const blocks = [...previewPanel.querySelectorAll("[data-source-line]")];
  if (!blocks.length) return null;

  return blocks.reduce((bestMatch, block) => {
    const blockLine = Number(block.dataset.sourceLine);
    const bestLine = Number(bestMatch.dataset.sourceLine);
    if (blockLine <= lineNumber && blockLine >= bestLine) return block;
    return bestMatch;
  }, blocks[0]);
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

function handleEditorKeydown(event) {
  if (event.key === "Tab") {
    event.preventDefault();
    if (event.shiftKey) {
      unindentSelection();
    } else {
      indentSelection();
    }
    updateEditorState();
    return;
  }

  if (event.key === "Enter") {
    const lineStart = noteInput.value.lastIndexOf("\n", noteInput.selectionStart - 1) + 1;
    const currentLine = noteInput.value.slice(lineStart, noteInput.selectionStart);
    const baseIndent = currentLine.match(/^\s*/)?.[0] || "";
    const indent = currentLine.trimEnd().endsWith(":") ? `${baseIndent}    ` : baseIndent;

    if (indent) {
      event.preventDefault();
      replaceSelection(`\n${indent}`);
      updateEditorState();
    }
  }
}

function indentSelection() {
  const start = noteInput.selectionStart;
  const end = noteInput.selectionEnd;

  if (start === end) {
    replaceSelection("    ");
    return;
  }

  const lineStart = noteInput.value.lastIndexOf("\n", start - 1) + 1;
  const selectedText = noteInput.value.slice(lineStart, end);
  const indented = selectedText.split("\n").map((line) => `    ${line}`).join("\n");

  noteInput.setSelectionRange(lineStart, end);
  replaceSelection(indented);
  noteInput.setSelectionRange(start + 4, lineStart + indented.length);
}

function unindentSelection() {
  const start = noteInput.selectionStart;
  const end = noteInput.selectionEnd;
  const lineStart = noteInput.value.lastIndexOf("\n", start - 1) + 1;
  const selectedText = noteInput.value.slice(lineStart, end);
  const unindented = selectedText.split("\n").map((line) => line.replace(/^( {1,4}|\t)/, "")).join("\n");

  noteInput.setSelectionRange(lineStart, end);
  replaceSelection(unindented);
  noteInput.setSelectionRange(Math.max(lineStart, start - 4), lineStart + unindented.length);
}

function replaceSelection(value) {
  const start = noteInput.selectionStart;
  const end = noteInput.selectionEnd;
  noteInput.value = `${noteInput.value.slice(0, start)}${value}${noteInput.value.slice(end)}`;
  noteInput.setSelectionRange(start + value.length, start + value.length);
}

function updateEditorState() {
  updateWordCount();
  updatePreview();
  markDraft();
  saveDraft();
  schedulePreviewSync();
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

  if (actionButton.dataset.codeAction === "run-python") {
    runPython(code, output);
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
  const sourceLineOffset = options.sourceLineOffset || 0;
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let listItems = [];
  let listStartLine = 1;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    const sourceLine = Math.max(1, index + 1 + sourceLineOffset);

    if (!trimmed) {
      flushList();
      index += 1;
      continue;
    }

    const fenceMatch = trimmed.match(/^```([\w-]*)\s*$/);
    if (fenceMatch) {
      flushList();
      const codeLines = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push(renderCodeBlock(codeLines.join("\n"), fenceMatch[1], interactiveCode, sourceLine));
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      flushList();
      const table = parseTable(lines, index);
      blocks.push(renderTable(table.headers, table.rows, sourceLine));
      index = table.nextIndex;
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      if (!listItems.length) listStartLine = sourceLine;
      listItems.push(`<li>${renderInline(listMatch[1])}</li>`);
      index += 1;
      continue;
    }

    flushList();

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level} data-source-line="${sourceLine}">${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    blocks.push(`<p data-source-line="${sourceLine}">${renderInline(trimmed)}</p>`);
    index += 1;
  }

  flushList();
  return blocks.join("");

  function flushList() {
    if (!listItems.length) return;
    blocks.push(`<ul data-source-line="${listStartLine}">${listItems.join("")}</ul>`);
    listItems = [];
  }
}

function renderCodeBlock(code, rawLanguage, interactiveCode, sourceLine = 1) {
  const language = normalizeLanguage(rawLanguage);
  const languageClass = language ? ` language-${escapeAttribute(language)}` : "";
  const encodedCode = encodeURIComponent(code);
  const label = language || "code";
  const action = interactiveCode ? getCodeAction(language) : "";
  const output = interactiveCode ? '<div class="code-output" aria-live="polite"></div>' : "";

  return `<div class="code-block" data-source-line="${sourceLine}" data-language="${escapeAttribute(language)}" data-code="${encodedCode}">
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

  if (["py", "python"].includes(language)) {
    return '<button type="button" data-code-action="run-python">运行</button>';
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

async function runPython(code, output) {
  output.textContent = "正在加载 Python 运行环境...";
  output.classList.remove("error");

  try {
    const pyodide = await loadPythonRuntime();
    output.textContent = "正在加载代码依赖...";
    if (pyodide.loadPackagesFromImports) {
      await pyodide.loadPackagesFromImports(code);
    }
    output.textContent = "正在运行...";
    pyodide.globals.set("__flow_notes_code", code);
    const result = await pyodide.runPythonAsync(`
import contextlib
import io
import traceback

__flow_stdout = io.StringIO()
__flow_stderr = io.StringIO()

try:
    with contextlib.redirect_stdout(__flow_stdout), contextlib.redirect_stderr(__flow_stderr):
        exec(__flow_notes_code, {})
    __flow_result = __flow_stdout.getvalue() + __flow_stderr.getvalue()
except Exception:
    __flow_result = traceback.format_exc()

__flow_result
`);
    output.textContent = result.trim() || "运行完成，无输出";
    output.classList.toggle("error", result.includes("Traceback"));
  } catch (error) {
    output.textContent = error.message || "Python 运行失败";
    output.classList.add("error");
  }
}

function loadPythonRuntime() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadScript("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js")
      .then(() => window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      }));
  }

  return pyodideReadyPromise;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", resolve);
    script.addEventListener("error", () => reject(new Error("无法加载 Python 运行环境，请检查网络连接")));
    document.head.append(script);
  });
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

function renderTable(headers, rows, sourceLine = 1) {
  const head = headers.map((header) => `<th>${renderInline(header)}</th>`).join("");
  const body = rows.map((row) => {
    const cells = headers.map((_, cellIndex) => `<td>${renderInline(row[cellIndex] || "")}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");

  return `<div class="table-wrap" data-source-line="${sourceLine}"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
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
