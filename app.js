const STORAGE_KEY = "flow-notes-history";
const DRAFT_KEY = "flow-notes-draft";
const THEME_KEY = "flow-notes-theme";
const VIEW_KEY = "flow-notes-view";
const SIDEBAR_WIDTH_KEY = "flow-notes-sidebar-width";
const SIDEBAR_COLLAPSED_KEY = "flow-notes-sidebar-collapsed";
const SPLIT_RATIO_KEY = "flow-notes-split-ratio";
const BACKUP_META_KEY = "flow-notes-backup-meta";
const BACKUP_SAVE_INTERVAL = 20;
const BACKUP_DAY_INTERVAL = 7;
const AUTOSAVE_DELAY = 2000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const appShell = document.querySelector("#appShell");
const titleInput = document.querySelector("#titleInput");
const noteInput = document.querySelector("#noteInput");
const saveButton = document.querySelector("#saveButton");
const newNoteButton = document.querySelector("#newNoteButton");
const codeBlockButton = document.querySelector("#codeBlockButton");
const codeLanguageSelect = document.querySelector("#codeLanguageSelect");
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
const versionsButton = document.querySelector("#versionsButton");
const versionsDialog = document.querySelector("#versionsDialog");
const closeVersionsButton = document.querySelector("#closeVersionsButton");
const versionList = document.querySelector("#versionList");
const backupDialog = document.querySelector("#backupDialog");
const closeBackupButton = document.querySelector("#closeBackupButton");
const backupLaterButton = document.querySelector("#backupLaterButton");
const backupNowButton = document.querySelector("#backupNowButton");
const backupMessage = document.querySelector("#backupMessage");
const importDialog = document.querySelector("#importDialog");
const closeImportButton = document.querySelector("#closeImportButton");
const importSummary = document.querySelector("#importSummary");
const importPreviewList = document.querySelector("#importPreviewList");
const previewImportButton = document.querySelector("#previewImportButton");
const mergeImportButton = document.querySelector("#mergeImportButton");
const overwriteImportButton = document.querySelector("#overwriteImportButton");
const sidebarToggleButton = document.querySelector("#sidebarToggleButton");
const sidebarResizer = document.querySelector("#sidebarResizer");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const tagFilter = document.querySelector("#tagFilter");
const statsPanel = document.querySelector("#statsPanel");
const historyList = document.querySelector("#historyList");
const noteCount = document.querySelector("#noteCount");
const saveStatus = document.querySelector("#saveStatus");
const wordCount = document.querySelector("#wordCount");
const tagInput = document.querySelector("#tagInput");
const lockButton = document.querySelector("#lockButton");
const pinButton = document.querySelector("#pinButton");
const archiveButton = document.querySelector("#archiveButton");
const focusModeButton = document.querySelector("#focusModeButton");
const exitFocusButton = document.querySelector("#exitFocusButton");
const workspace = document.querySelector("#workspace");
const editorSurface = document.querySelector("#editorSurface");
const lineGutter = document.querySelector("#lineGutter");
const currentLineHighlight = document.querySelector("#currentLineHighlight");
const splitResizer = document.querySelector("#splitResizer");
const previewPanel = document.querySelector("#previewPanel");
const outlinePanel = document.querySelector("#outlinePanel");
const viewButtons = document.querySelectorAll(".tab-button");
const formatToolbar = document.querySelector(".format-toolbar");
const template = document.querySelector("#historyItemTemplate");

const CHANGELOG_ENTRIES = [
  {
    date: "2026/06/08",
    title: "代码编辑体验",
    items: [
      "新增回收站，删除笔记会先移入回收站，可恢复或永久删除。",
      "新增笔记锁定 / 只读模式，重要笔记锁定后不可编辑，但仍可预览、复制和导出。",
      "新增正式笔记自动保存，已保存笔记编辑后 2 秒会自动更新并显示保存状态。",
      "新增自动备份提醒，每保存 20 次或距离上次备份 7 天会提示导出全部 JSON。",
      "导入 JSON 备份前新增确认面板，可选择覆盖当前、合并导入或仅预览。",
      "新增快捷键、统计面板、全量 Markdown/HTML 导出、搜索语法、图片压缩提示和版本差异预览。",
      "新增右侧笔记目录，会根据 #、##、### 标题自动生成并支持点击跳转。",
      "新增本地图片拖拽插入，拖到编辑区会自动转成可预览的 Markdown 图片。",
      "新增历史搜索高亮，标题、正文摘要和标签中的命中词会直接标出。",
      "新增编辑器行号和当前行标记，写代码时更容易定位。",
      "新增缩进参考线，代码块和嵌套列表的层级更清楚。",
      "新增代码块语言选择，插入代码块时可以选择 Python、JavaScript、HTML、CSS 或 Markdown。",
      "新增专注写作模式，一键隐藏历史栏、标签栏和工具栏，只保留正文。",
    ],
  },
  {
    date: "2026/06/07",
    title: "专业编辑增强",
    items: [
      "新增代码块内逐行定位，左侧选中代码行时右侧对应行会高亮。",
      "新增笔记版本历史，保存旧内容后可以打开版本面板恢复。",
      "新增 Markdown 快捷工具栏，可以快速插入标题、加粗、列表、表格、图片和代码块。",
    ],
  },
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
let isFocusMode = false;
let viewBeforeFocus = activeView;
let pendingImportNotes = [];
let pyodideReadyPromise = null;
let previewSyncTimer = null;
let autoSaveTimer = null;
let lastAutoSavedSignature = "";

applyTheme(loadTheme());
applySidebarLayout();
applySplitLayout();
applyView(activeView);
render();
syncEditorFromDraftOrActiveNote();
updatePreview();
updateEditorChrome();

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
versionsButton.addEventListener("click", openVersions);
closeVersionsButton.addEventListener("click", closeVersions);
versionsDialog.addEventListener("click", (event) => {
  if (event.target === versionsDialog) closeVersions();
});
closeBackupButton.addEventListener("click", closeBackupReminder);
backupLaterButton.addEventListener("click", closeBackupReminder);
backupNowButton.addEventListener("click", exportBackupFromReminder);
backupDialog.addEventListener("click", (event) => {
  if (event.target === backupDialog) closeBackupReminder();
});
closeImportButton.addEventListener("click", closeImportDialog);
previewImportButton.addEventListener("click", previewImportOnly);
mergeImportButton.addEventListener("click", () => applyPendingImport("merge"));
overwriteImportButton.addEventListener("click", () => applyPendingImport("overwrite"));
importDialog.addEventListener("click", (event) => {
  if (event.target === importDialog) closeImportDialog();
});
document.addEventListener("keydown", (event) => {
  if (handleGlobalShortcuts(event)) return;
  if (event.key !== "Escape") return;
  if (!changelogDialog.hidden) {
    closeChangelog();
    return;
  }
  if (!versionsDialog.hidden) {
    closeVersions();
    return;
  }
  if (!backupDialog.hidden) {
    closeBackupReminder();
    return;
  }
  if (!importDialog.hidden) {
    closeImportDialog();
    return;
  }
  if (isFocusMode) exitFocusMode();
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
  updateEditorChrome();
  handleEditorChanged();
  schedulePreviewSync();
});
noteInput.addEventListener("keydown", handleEditorKeydown);
noteInput.addEventListener("click", syncPreviewToEditorSelection);
noteInput.addEventListener("keyup", syncPreviewToEditorSelection);
noteInput.addEventListener("select", syncPreviewToEditorSelection);
noteInput.addEventListener("click", updateEditorChrome);
noteInput.addEventListener("keyup", updateEditorChrome);
noteInput.addEventListener("scroll", syncEditorScroll);
noteInput.addEventListener("dragover", handleEditorDragOver);
noteInput.addEventListener("dragleave", handleEditorDragLeave);
noteInput.addEventListener("drop", handleEditorDrop);
titleInput.addEventListener("input", () => {
  updatePreview();
  handleEditorChanged();
});
tagInput.addEventListener("input", () => {
  handleEditorChanged();
});
lockButton.addEventListener("click", toggleLocked);
pinButton.addEventListener("click", togglePinned);
archiveButton.addEventListener("click", toggleArchived);
focusModeButton.addEventListener("click", enterFocusMode);
exitFocusButton.addEventListener("click", exitFocusMode);
viewButtons.forEach((button) => {
  button.addEventListener("click", () => applyView(button.dataset.view));
});
previewPanel.addEventListener("click", handlePreviewAction);
outlinePanel.addEventListener("click", handleOutlineClick);
formatToolbar.addEventListener("click", handleFormatAction);
versionList.addEventListener("click", handleVersionAction);

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

function saveCurrentNote(options = {}) {
  const isAutoSave = options?.source === "auto";
  const body = noteInput.value.trim();
  const title = titleInput.value.trim() || "未命名笔记";
  const tags = parseTags(tagInput.value);
  const activeNote = notes.find((note) => note.id === activeNoteId);

  if (activeNote?.locked || activeNote?.trashed) {
    if (!isAutoSave) saveStatus.textContent = activeNote.trashed ? "笔记在回收站中，恢复后才能修改" : "笔记已锁定，解锁后才能修改";
    return;
  }

  if (!body && !titleInput.value.trim()) {
    if (!isAutoSave) saveStatus.textContent = "先写点内容再保存";
    return;
  }

  const now = new Date();

  if (activeNote) {
    if (!isAutoSave) addVersionSnapshot(activeNote);
    activeNote.title = title;
    activeNote.body = body;
    activeNote.tags = tags;
    activeNote.updatedAt = now.toISOString();
    notes = [activeNote, ...notes.filter((note) => note.id !== activeNote.id)];
    saveStatus.textContent = isAutoSave ? `已自动保存：${formatDate(now)}` : `已更新：${formatDate(now)}`;
  } else {
    if (isAutoSave) return;
    const note = {
      id: createNoteId(),
      title,
      body,
      tags,
      pinned: false,
      archived: false,
      trashed: false,
      trashedAt: null,
      locked: false,
      versions: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    notes = [note, ...notes];
    activeNoteId = note.id;
    saveStatus.textContent = `已保存：${formatDate(now)}`;
  }

  persistNotes();
  clearDraft();
  lastAutoSavedSignature = getEditorSignature();
  window.clearTimeout(autoSaveTimer);
  render();
  if (!isAutoSave) recordSaveForBackupReminder();
}

function startFreshNote() {
  window.clearTimeout(autoSaveTimer);
  activeNoteId = null;
  titleInput.value = "";
  noteInput.value = "";
  tagInput.value = "";
  saveStatus.textContent = "新笔记";
  lastAutoSavedSignature = getEditorSignature();
  clearDraft();
  updateWordCount();
  updatePreview();
  updateEditorChrome();
  updateNoteActions();
  updateEditorLockState();
  renderHistory();
  titleInput.focus();
}

function restoreNote(id) {
  window.clearTimeout(autoSaveTimer);
  activeNoteId = id;
  syncEditorFromActiveNote();
  clearDraft();
  renderHistory();
}

function deleteNote(id) {
  const note = notes.find((item) => item.id === id);
  if (!note) return;

  if (note.trashed) {
    const confirmed = window.confirm(`确定永久删除「${note.title}」吗？这个操作不能撤销。`);
    if (!confirmed) return;
    notes = notes.filter((item) => item.id !== id);
    if (activeNoteId === id) {
      window.clearTimeout(autoSaveTimer);
      activeNoteId = findNextVisibleNoteId();
      syncEditorFromActiveNote();
    }
    persistNotes();
    render();
    saveStatus.textContent = "笔记已永久删除";
    return;
  }

  const confirmed = window.confirm(`确定把「${note.title}」移入回收站吗？`);
  if (!confirmed) return;

  note.trashed = true;
  note.trashedAt = new Date().toISOString();
  note.updatedAt = note.trashedAt;
  if (activeNoteId === id) {
    window.clearTimeout(autoSaveTimer);
    activeNoteId = findNextVisibleNoteId();
    syncEditorFromActiveNote();
  }

  persistNotes();
  render();
  saveStatus.textContent = "笔记已移入回收站";
}

function restoreTrashedNote(id) {
  const note = notes.find((item) => item.id === id);
  if (!note) return;

  note.trashed = false;
  note.trashedAt = null;
  note.updatedAt = new Date().toISOString();
  activeNoteId = note.id;
  persistNotes();
  syncEditorFromActiveNote();
  render();
  saveStatus.textContent = "笔记已从回收站恢复";
}

function findNextVisibleNoteId() {
  return notes.find((note) => !note.trashed)?.id ?? null;
}

function addVersionSnapshot(note) {
  const changed =
    note.title !== (titleInput.value.trim() || "未命名笔记") ||
    note.body !== noteInput.value.trim() ||
    (note.tags || []).join("|") !== parseTags(tagInput.value).join("|");

  if (!changed) return;

  const snapshot = {
    id: createNoteId(),
    title: note.title,
    body: note.body,
    tags: note.tags || [],
    savedAt: note.updatedAt || note.createdAt || new Date().toISOString(),
  };

  note.versions = [snapshot, ...(note.versions || [])].slice(0, 20);
}

function handleEditorChanged() {
  if (isActiveNoteLocked()) {
    const activeNote = notes.find((note) => note.id === activeNoteId);
    saveStatus.textContent = activeNote?.trashed ? "笔记在回收站中，恢复后才能编辑" : "笔记已锁定，解锁后才能编辑";
    return;
  }

  markDraft();
  saveDraft();
  scheduleAutoSave();
}

function scheduleAutoSave() {
  window.clearTimeout(autoSaveTimer);

  const activeNote = notes.find((note) => note.id === activeNoteId);
  if (activeNote?.locked || activeNote?.trashed) {
    saveStatus.textContent = activeNote.trashed ? "笔记在回收站中" : "笔记已锁定";
    return;
  }

  if (!activeNote) {
    saveStatus.textContent = "正在编辑草稿，首次保存后会自动保存";
    return;
  }

  const nextSignature = getEditorSignature();
  if (nextSignature === lastAutoSavedSignature) return;

  saveStatus.textContent = "正在编辑，稍后自动保存";
  autoSaveTimer = window.setTimeout(() => {
    const latestNote = notes.find((note) => note.id === activeNoteId);
    if (!latestNote) return;
    if (getEditorSignature() === lastAutoSavedSignature) return;
    saveCurrentNote({ source: "auto" });
  }, AUTOSAVE_DELAY);
}

function isActiveNoteLocked() {
  const note = notes.find((item) => item.id === activeNoteId);
  return Boolean(note?.locked || note?.trashed);
}

function getEditorSignature() {
  return JSON.stringify({
    activeNoteId,
    title: titleInput.value.trim() || "未命名笔记",
    body: noteInput.value.trim(),
    tags: parseTags(tagInput.value),
  });
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

function toggleLocked() {
  const note = getActiveSavedNote();
  if (!note) return;

  window.clearTimeout(autoSaveTimer);
  note.locked = !note.locked;
  note.updatedAt = new Date().toISOString();
  persistNotes();
  render();
  syncEditorFromActiveNote();
  saveStatus.textContent = note.locked ? "已锁定，只读模式已开启" : "已解锁，可以继续编辑";
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
    updateEditorChrome();
    updateNoteActions();
    updateEditorLockState();
    lastAutoSavedSignature = getEditorSignature();
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
    lastAutoSavedSignature = getEditorSignature();
    updateWordCount();
    updatePreview();
    updateEditorChrome();
    updateNoteActions();
    updateEditorLockState();
    return;
  }

  titleInput.value = activeNote.title;
  noteInput.value = activeNote.body;
  tagInput.value = (activeNote.tags || []).join(", ");
  saveStatus.textContent = activeNote.trashed
    ? `回收站只读：${formatDate(new Date(activeNote.updatedAt || activeNote.createdAt))}`
    : activeNote.locked
      ? `只读模式：${formatDate(new Date(activeNote.updatedAt || activeNote.createdAt))}`
      : `正在编辑：${formatDate(new Date(activeNote.updatedAt || activeNote.createdAt))}`;
  lastAutoSavedSignature = getEditorSignature();
  updateWordCount();
  updatePreview();
  updateEditorChrome();
  updateNoteActions();
  updateEditorLockState();
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

  downloadExportFile(exportFile);
}

function downloadExportFile(exportFile) {
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

  if (exportFile.format === "all-json") {
    markBackupCompleted();
  }
}

function handleGlobalShortcuts(event) {
  const modifier = event.ctrlKey || event.metaKey;
  if (!modifier || event.altKey) return false;

  const key = event.key.toLowerCase();
  const actions = {
    s: () => saveCurrentNote(),
    b: () => applyShortcutFormat("bold"),
    i: () => applyShortcutFormat("italic"),
    k: () => applyShortcutFormat("link"),
    f: () => {
      searchInput.focus();
      searchInput.select();
    },
  };

  if (!actions[key]) return false;
  event.preventDefault();
  actions[key]();
  return true;
}

function applyShortcutFormat(action) {
  if (isActiveNoteLocked()) {
    saveStatus.textContent = "笔记已锁定，解锁后才能编辑";
    return;
  }

  applyView(activeView === "preview" ? "edit" : activeView);
  noteInput.focus();

  if (action === "bold") {
    wrapSelection("**", "**", "加粗文字");
  } else if (action === "italic") {
    wrapSelection("*", "*", "斜体文字");
  } else if (action === "link") {
    insertLink();
  }

  updateEditorState();
}

function clearHistory() {
  if (!notes.length) return;
  const clearingTrash = statusFilter.value === "trashed";
  const targetNotes = clearingTrash ? notes.filter((note) => note.trashed) : notes.filter((note) => !note.trashed);
  if (!targetNotes.length) return;

  const confirmed = window.confirm(clearingTrash
    ? "确定永久清空回收站吗？这个操作不能撤销。"
    : "确定清空所有非回收站笔记吗？这个操作不能撤销。");
  if (!confirmed) return;

  window.clearTimeout(autoSaveTimer);
  const targetIds = new Set(targetNotes.map((note) => note.id));
  notes = notes.filter((note) => !targetIds.has(note.id));
  activeNoteId = findNextVisibleNoteId();
  persistNotes();
  syncEditorFromActiveNote();
  render();
  saveStatus.textContent = clearingTrash ? "回收站已清空" : "非回收站笔记已清空";
}

function render() {
  renderTagFilter();
  renderHistory();
  renderStats();
  updateWordCount();
}

function renderStats() {
  const activeNotes = notes.filter((note) => !note.trashed);
  const archivedCount = activeNotes.filter((note) => note.archived).length;
  const tagCount = new Set(activeNotes.flatMap((note) => normalizeNote(note).tags)).size;
  const trashedCount = notes.filter((note) => note.trashed).length;

  statsPanel.innerHTML = `
    <div><strong>${activeNotes.length}</strong><span>总笔记</span></div>
    <div><strong>${archivedCount}</strong><span>归档</span></div>
    <div><strong>${tagCount}</strong><span>标签</span></div>
    <div><strong>${trashedCount}</strong><span>回收站</span></div>
  `;
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

function openVersions() {
  renderVersions();
  versionsDialog.hidden = false;
  closeVersionsButton.focus();
}

function closeVersions() {
  versionsDialog.hidden = true;
  versionsButton.focus();
}

function renderVersions() {
  const note = notes.find((item) => item.id === activeNoteId);
  versionList.innerHTML = "";

  if (!note) {
    versionList.innerHTML = '<p class="empty-state">先保存笔记，再查看版本历史</p>';
    return;
  }

  const versions = note.versions || [];
  if (!versions.length) {
    versionList.innerHTML = '<p class="empty-state">还没有旧版本。再次保存修改后，这里会出现可恢复的版本。</p>';
    return;
  }

  versions.forEach((version) => {
    const item = document.createElement("article");
    item.className = "version-item";

    const bodyPreview = version.body ? version.body.slice(0, 140) : "空白版本";
    item.innerHTML = `
      <div>
        <h3>${escapeHtml(version.title || "未命名笔记")}</h3>
        <time>${formatDate(new Date(version.savedAt))}</time>
        <p>${escapeHtml(bodyPreview)}${version.body?.length > 140 ? "..." : ""}</p>
        <div class="version-diff" data-version-diff="${escapeAttribute(version.id)}" hidden></div>
      </div>
      <div class="version-actions">
        <button class="ghost-button" type="button" data-version-action="compare" data-version-id="${escapeAttribute(version.id)}">对比</button>
        <button class="ghost-button" type="button" data-version-action="restore" data-version-id="${escapeAttribute(version.id)}">恢复</button>
      </div>
    `;
    versionList.append(item);
  });
}

function handleVersionAction(event) {
  const restoreButton = event.target.closest("[data-version-id]");
  if (!restoreButton) return;

  const note = notes.find((item) => item.id === activeNoteId);
  const version = note?.versions?.find((item) => item.id === restoreButton.dataset.versionId);
  if (!version) return;

  if (restoreButton.dataset.versionAction === "compare") {
    toggleVersionDiff(restoreButton, note, version);
    return;
  }

  if (note.locked) {
    saveStatus.textContent = "笔记已锁定，解锁后才能恢复旧版本";
    closeVersions();
    return;
  }

  titleInput.value = version.title || "";
  noteInput.value = version.body || "";
  tagInput.value = (version.tags || []).join(", ");
  updateEditorState();
  updateNoteActions();
  saveStatus.textContent = notes.some((item) => item.id === activeNoteId) ? "已恢复旧版本，稍后自动保存" : "已恢复旧版本，点击保存后生效";
  closeVersions();
  noteInput.focus();
}

function toggleVersionDiff(button, note, version) {
  const diffPanel = [...versionList.querySelectorAll("[data-version-diff]")].find((panel) => panel.dataset.versionDiff === version.id);
  if (!diffPanel) return;

  const isHidden = diffPanel.hidden;
  diffPanel.hidden = !isHidden;
  button.textContent = isHidden ? "收起" : "对比";
  if (isHidden) {
    diffPanel.innerHTML = renderVersionDiff(note.body || "", version.body || "");
  }
}

function renderVersionDiff(currentBody, versionBody) {
  const currentLines = currentBody.split(/\r?\n/);
  const versionLines = versionBody.split(/\r?\n/);
  const maxLines = Math.max(currentLines.length, versionLines.length);
  const rows = [];

  for (let index = 0; index < maxLines; index += 1) {
    const currentLine = currentLines[index] ?? "";
    const versionLine = versionLines[index] ?? "";
    if (currentLine === versionLine) continue;

    if (versionLine) {
      rows.push(`<div class="diff-line removed">- ${escapeHtml(versionLine)}</div>`);
    }
    if (currentLine) {
      rows.push(`<div class="diff-line added">+ ${escapeHtml(currentLine)}</div>`);
    }
    if (rows.length >= 16) break;
  }

  if (!rows.length) return '<p class="modal-copy">正文没有差异，可能只是标题或标签发生过变化。</p>';
  return `<div class="diff-summary">${rows.join("")}${maxLines > 16 ? '<p class="modal-copy">仅显示前几处差异。</p>' : ""}</div>`;
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
  const search = parseSearchQuery(searchInput.value);
  const status = statusFilter.value;
  const selectedTag = tagFilter.value;
  const visibleNotes = notes.filter((note) => {
    const normalized = normalizeNote(note);
    const matchesQuery = matchesSearch(normalized, search);
    const matchesTag = selectedTag === "all" || normalized.tags.includes(selectedTag);
    const matchesStatus =
      status === "all" ||
      (status === "active" && !normalized.archived && !normalized.trashed) ||
      (status === "pinned" && normalized.pinned && !normalized.trashed) ||
      (status === "archived" && normalized.archived && !normalized.trashed) ||
      (status === "trashed" && normalized.trashed);

    return matchesQuery && matchesTag && matchesStatus && (status === "trashed" || !normalized.trashed);
  }).sort((first, second) => {
    if (first.pinned !== second.pinned) return first.pinned ? -1 : 1;
    return new Date(second.updatedAt || second.createdAt) - new Date(first.updatedAt || first.createdAt);
  });

  historyList.innerHTML = "";
  const totalForStatus = status === "trashed" ? notes.filter((note) => note.trashed).length : notes.filter((note) => !note.trashed).length;
  noteCount.textContent = `${visibleNotes.length}/${totalForStatus} 条记录`;

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
    const restoreTrashButton = item.querySelector(".restore-note");
    const deleteButton = item.querySelector(".delete-note");
    const title = item.querySelector("strong");
    const preview = item.querySelector(".preview");
    const tagline = item.querySelector(".tagline");
    const time = item.querySelector("small");

    button.classList.toggle("active", note.id === activeNoteId);
    button.classList.toggle("pinned", Boolean(note.pinned));
    button.classList.toggle("archived", Boolean(note.archived));
    button.classList.toggle("locked", Boolean(note.locked));
    button.classList.toggle("trashed", Boolean(note.trashed));
    restoreButton.addEventListener("click", () => restoreNote(note.id));
    restoreTrashButton.hidden = !note.trashed;
    restoreTrashButton.addEventListener("click", () => restoreTrashedNote(note.id));
    deleteButton.addEventListener("click", () => deleteNote(note.id));
    deleteButton.title = note.trashed ? "永久删除这条笔记" : "移入回收站";
    deleteButton.setAttribute("aria-label", deleteButton.title);
    title.innerHTML = `${note.pinned ? "★ " : ""}${note.locked ? "[锁] " : ""}${highlightSearchMatches(note.title, search.highlightTerms)}`;
    preview.innerHTML = highlightSearchMatches(getSearchPreview(note, search.highlightTerms), search.highlightTerms);
    tagline.innerHTML = note.tags?.length ? highlightSearchMatches(note.tags.map((tag) => `#${tag}`).join(" "), search.highlightTerms) : "无标签";
    time.textContent = `${note.trashed ? "回收站 · " : ""}${note.locked ? "锁定 · " : ""}${note.archived ? "归档 · " : ""}${formatDate(new Date(note.updatedAt || note.createdAt))}`;
    historyList.append(item);
  });
}

function renderTagFilter() {
  const currentValue = tagFilter.value;
  const tags = [...new Set(notes.filter((note) => !note.trashed).flatMap((note) => normalizeNote(note).tags))]
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
    renderOutline([]);
    return;
  }

  const source = title ? `# ${title}\n\n${body}` : body;
  previewPanel.innerHTML = renderMarkdown(source, { sourceLineOffset: title ? -2 : 0 });
  renderOutline(extractHeadings(title, noteInput.value));
  syncPreviewToEditorSelection();
}

function extractHeadings(title, body) {
  const headings = [];
  if (title.trim()) {
    headings.push({
      id: "note-title",
      level: 1,
      text: title.trim(),
      line: 1,
      isTitle: true,
    });
  }

  body.split(/\r?\n/).forEach((line, index) => {
    const match = line.trim().match(/^(#{1,3})\s+(.+)$/);
    if (!match) return;

    headings.push({
      id: `heading-${index + 1}`,
      level: match[1].length,
      text: match[2].replace(/[*_`[\]()]/g, "").trim(),
      line: index + 1,
      isTitle: false,
    });
  });

  return headings;
}

function renderOutline(headings) {
  if (!headings.length) {
    outlinePanel.innerHTML = '<p class="outline-empty">添加 # 标题后会生成目录</p>';
    return;
  }

  const items = headings.map((heading) => {
    const lineLabel = heading.isTitle ? "标题" : `第 ${heading.line} 行`;
    return `<button class="outline-link level-${heading.level}" type="button" data-line="${heading.line}" data-title="${heading.isTitle ? "true" : "false"}">
      <span>${escapeHtml(heading.text || "未命名标题")}</span>
      <small>${lineLabel}</small>
    </button>`;
  }).join("");

  outlinePanel.innerHTML = `<div class="outline-header">目录</div><nav class="outline-list">${items}</nav>`;
}

function handleOutlineClick(event) {
  const link = event.target.closest(".outline-link");
  if (!link) return;

  const lineNumber = Number(link.dataset.line);
  const isTitle = link.dataset.title === "true";
  if (isTitle) {
    titleInput.focus();
    titleInput.select();
    previewPanel.querySelector("[data-source-line='1']")?.scrollIntoView({ block: "center", behavior: "smooth" });
    return;
  }

  focusEditorLine(lineNumber);
  syncPreviewToEditorSelection();
}

function focusEditorLine(lineNumber) {
  const lines = noteInput.value.split(/\r?\n/);
  const targetLine = Math.min(Math.max(lineNumber, 1), lines.length);
  const offset = lines.slice(0, targetLine - 1).reduce((total, line) => total + line.length + 1, 0);

  noteInput.focus();
  noteInput.setSelectionRange(offset, offset + lines[targetLine - 1].length);
  scrollEditorLineIntoView(targetLine);
  updateEditorChrome();
}

function scrollEditorLineIntoView(lineNumber) {
  const styles = window.getComputedStyle(noteInput);
  const lineHeight = Number.parseFloat(styles.lineHeight) || 30;
  const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
  const targetTop = paddingTop + (lineNumber - 1) * lineHeight;
  noteInput.scrollTop = Math.max(0, targetTop - noteInput.clientHeight * 0.35);
  syncEditorScroll();
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
  previewPanel.querySelector(".source-line-highlight")?.classList.remove("source-line-highlight");
  target.classList.add("source-highlight");
  if (target.classList.contains("code-line")) {
    target.classList.add("source-line-highlight");
  }
  target.scrollIntoView({ block: "center", behavior: "smooth" });
  window.setTimeout(() => {
    target.classList.remove("source-highlight");
    target.classList.remove("source-line-highlight");
  }, 900);
}

function getCurrentEditorLine() {
  const selectionStart = Math.min(noteInput.selectionStart, noteInput.selectionEnd);
  return noteInput.value.slice(0, selectionStart).split(/\r?\n/).length;
}

function updateEditorChrome() {
  renderLineNumbers();
  updateCurrentLineHighlight();
  syncEditorScroll();
}

function renderLineNumbers() {
  const lineCount = Math.max(1, noteInput.value.split(/\r?\n/).length);
  if (Number(lineGutter.dataset.lineCount) === lineCount) return;

  lineGutter.dataset.lineCount = String(lineCount);
  lineGutter.innerHTML = Array.from({ length: lineCount }, (_, index) => {
    return `<span data-line-number="${index + 1}">${index + 1}</span>`;
  }).join("");
}

function updateCurrentLineHighlight() {
  const lineNumber = getCurrentEditorLine();
  const styles = window.getComputedStyle(noteInput);
  const lineHeight = Number.parseFloat(styles.lineHeight) || 30;
  const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
  const top = paddingTop + (lineNumber - 1) * lineHeight - noteInput.scrollTop;

  currentLineHighlight.style.top = `${top}px`;
  currentLineHighlight.style.height = `${lineHeight}px`;
  lineGutter.querySelector(".active-line")?.classList.remove("active-line");
  lineGutter.querySelector(`[data-line-number="${lineNumber}"]`)?.classList.add("active-line");
}

function syncEditorScroll() {
  lineGutter.scrollTop = noteInput.scrollTop;
  updateCurrentLineHighlight();
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
  if (isActiveNoteLocked()) {
    saveStatus.textContent = "笔记已锁定，解锁后才能插入代码块";
    return;
  }

  applyView(activeView === "preview" ? "edit" : activeView);

  const language = codeLanguageSelect.value || "python";
  const label = getLanguageLabel(language);
  const template = `\`\`\`${language}\n# 在这里写 ${label} 代码\n${getCodeTemplate(language)}\n\`\`\``;
  const selectionStart = noteInput.selectionStart;
  const selectionEnd = noteInput.selectionEnd;
  const before = noteInput.value.slice(0, selectionStart);
  const after = noteInput.value.slice(selectionEnd);
  const needsLeadingBreak = before && !before.endsWith("\n") ? "\n\n" : "";
  const needsTrailingBreak = after && !after.startsWith("\n") ? "\n\n" : "";
  const insertText = `${needsLeadingBreak}${template}${needsTrailingBreak}`;
  const cursorOffset = needsLeadingBreak.length + `\`\`\`${language}\n`.length;

  noteInput.value = `${before}${insertText}${after}`;
  noteInput.focus();
  noteInput.setSelectionRange(selectionStart + cursorOffset, selectionStart + cursorOffset + `# 在这里写 ${label} 代码`.length);
  updateWordCount();
  updatePreview();
  updateEditorChrome();
  handleEditorChanged();
}

function getLanguageLabel(language) {
  const labels = {
    python: "Python",
    javascript: "JavaScript",
    html: "HTML",
    css: "CSS",
    markdown: "Markdown",
  };

  return labels[language] || language;
}

function getCodeTemplate(language) {
  const templates = {
    python: 'print("Hello Flow Notes")',
    javascript: 'console.log("Hello Flow Notes");',
    html: '<h1>Hello Flow Notes</h1>',
    css: "body {\n    color: #16645a;\n}",
    markdown: "## 小标题",
  };

  return templates[language] || "";
}

function handleFormatAction(event) {
  const button = event.target.closest("[data-format-action]");
  if (!button) return;

  if (isActiveNoteLocked()) {
    saveStatus.textContent = "笔记已锁定，解锁后才能编辑";
    return;
  }

  const action = button.dataset.formatAction;
  if (action === "code") {
    insertPythonCodeBlock();
    return;
  }

  applyView(activeView === "preview" ? "edit" : activeView);
  noteInput.focus();

  const selection = getSelectionText();
  const actions = {
    h1: () => insertLinePrefix("# "),
    h2: () => insertLinePrefix("## "),
    bold: () => wrapSelection("**", "**", "加粗文字"),
    italic: () => wrapSelection("*", "*", "斜体文字"),
    link: () => insertLink(),
    list: () => insertBlock(selection || "- 列表项\n- 列表项"),
    table: () => insertBlock("| 名称 | 内容 |\n| --- | --- |\n| 示例 | 说明 |"),
    image: () => insertBlock("![图片描述](https://example.com/image.png)"),
  };

  actions[action]?.();
  updateEditorState();
}

function getSelectionText() {
  return noteInput.value.slice(noteInput.selectionStart, noteInput.selectionEnd);
}

function insertLinePrefix(prefix) {
  const start = noteInput.selectionStart;
  const end = noteInput.selectionEnd;
  const lineStart = noteInput.value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = noteInput.value.indexOf("\n", end);
  const targetEnd = start === end ? (lineEnd === -1 ? noteInput.value.length : lineEnd) : end;
  const selectedText = noteInput.value.slice(lineStart, targetEnd);
  const prefixed = selectedText.split("\n").map((line) => {
    if (!line.trim()) return line;
    return line.startsWith(prefix) ? line : `${prefix}${line}`;
  }).join("\n");

  noteInput.setSelectionRange(lineStart, targetEnd);
  replaceSelection(prefixed || prefix);
}

function wrapSelection(before, after, placeholder) {
  const selectedText = getSelectionText() || placeholder;
  const start = noteInput.selectionStart;
  replaceSelection(`${before}${selectedText}${after}`);
  const selectionStart = start + before.length;
  noteInput.setSelectionRange(selectionStart, selectionStart + selectedText.length);
}

function insertBlock(value) {
  const start = noteInput.selectionStart;
  const end = noteInput.selectionEnd;
  const before = noteInput.value.slice(0, start);
  const after = noteInput.value.slice(end);
  const needsLeadingBreak = before && !before.endsWith("\n") ? "\n\n" : "";
  const needsTrailingBreak = after && !after.startsWith("\n") ? "\n\n" : "";
  const insertText = `${needsLeadingBreak}${value}${needsTrailingBreak}`;

  noteInput.value = `${before}${insertText}${after}`;
  noteInput.setSelectionRange(start + needsLeadingBreak.length, start + needsLeadingBreak.length + value.length);
}

function handleEditorDragOver(event) {
  if (!hasImageTransfer(event.dataTransfer)) return;
  event.preventDefault();
  editorSurface.classList.add("is-dragging-image");
}

function handleEditorDragLeave(event) {
  if (editorSurface.contains(event.relatedTarget)) return;
  editorSurface.classList.remove("is-dragging-image");
}

async function handleEditorDrop(event) {
  if (isActiveNoteLocked()) {
    saveStatus.textContent = "笔记已锁定，解锁后才能插入图片";
    return;
  }

  const files = [...(event.dataTransfer?.files || [])].filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;

  event.preventDefault();
  editorSurface.classList.remove("is-dragging-image");
  noteInput.focus();

  let imageBlocks;
  let originalBytes = 0;
  let insertedBytes = 0;
  try {
    imageBlocks = await Promise.all(files.map(async (file) => {
      originalBytes += file.size;
      const dataUrl = await prepareImageDataUrl(file);
      insertedBytes += estimateDataUrlBytes(dataUrl);
      const altText = file.name.replace(/\.[^.]+$/, "").replace(/[\][()]/g, " ").trim() || "本地图片";
      return `![${altText}](${dataUrl})`;
    }));
  } catch {
    saveStatus.textContent = "图片读取失败，请重试";
    return;
  }

  insertBlock(imageBlocks.join("\n\n"));
  updateEditorState();
  const compressed = insertedBytes < originalBytes * 0.9;
  saveStatus.textContent = compressed
    ? `已插入 ${files.length} 张图片，约 ${formatFileSize(originalBytes)} 压缩到 ${formatFileSize(insertedBytes)}`
    : `已插入 ${files.length} 张图片，约 ${formatFileSize(insertedBytes)}`;
}

function hasImageTransfer(dataTransfer) {
  const files = [...(dataTransfer?.files || [])];
  if (files.some((file) => file.type.startsWith("image/"))) return true;

  return [...(dataTransfer?.items || [])].some((item) => {
    return item.kind === "file" && item.type.startsWith("image/");
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

async function prepareImageDataUrl(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const shouldCompress = file.size > 900 * 1024 && /^image\/(png|jpe?g|webp)$/i.test(file.type);
  if (!shouldCompress) return dataUrl;

  try {
    return await compressImageDataUrl(dataUrl, file.type);
  } catch {
    return dataUrl;
  }
}

function compressImageDataUrl(dataUrl, type) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      const maxSide = 1600;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      if (scale >= 1) {
        resolve(dataUrl);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(type === "image/png" ? canvas.toDataURL("image/png") : canvas.toDataURL(type, 0.84));
    });
    image.addEventListener("error", reject);
    image.src = dataUrl;
  });
}

function estimateDataUrlBytes(dataUrl) {
  const base64 = String(dataUrl).split(",")[1] || "";
  return Math.round((base64.length * 3) / 4);
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function handleEditorKeydown(event) {
  if (isActiveNoteLocked()) return;

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
  updateEditorChrome();
  handleEditorChanged();
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
    locked: Boolean(activeNote?.locked),
    trashed: Boolean(activeNote?.trashed),
    trashedAt: activeNote?.trashedAt || null,
    versions: activeNote?.versions || [],
    createdAt: activeNote?.createdAt || null,
    updatedAt: activeNote?.updatedAt || new Date().toISOString(),
  };
}

function loadBackupMeta() {
  try {
    const meta = JSON.parse(localStorage.getItem(BACKUP_META_KEY) || "null");
    if (meta && typeof meta === "object") {
      return {
        saveCountSinceBackup: Number(meta.saveCountSinceBackup) || 0,
        lastBackupAt: meta.lastBackupAt || new Date().toISOString(),
        lastReminderAt: meta.lastReminderAt || null,
      };
    }
  } catch {
    // Fall through to a fresh backup metadata record.
  }

  return {
    saveCountSinceBackup: 0,
    lastBackupAt: new Date().toISOString(),
    lastReminderAt: null,
  };
}

function persistBackupMeta(meta) {
  localStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta));
}

function recordSaveForBackupReminder() {
  if (!notes.length) return;

  const meta = loadBackupMeta();
  meta.saveCountSinceBackup += 1;
  persistBackupMeta(meta);

  if (shouldShowBackupReminder(meta)) {
    openBackupReminder(meta);
  }
}

function shouldShowBackupReminder(meta) {
  const now = Date.now();
  const lastBackupTime = new Date(meta.lastBackupAt || 0).getTime();
  const lastReminderTime = meta.lastReminderAt ? new Date(meta.lastReminderAt).getTime() : 0;
  const dueBySaves = meta.saveCountSinceBackup >= BACKUP_SAVE_INTERVAL;
  const dueByDays = Number.isFinite(lastBackupTime) && now - lastBackupTime >= BACKUP_DAY_INTERVAL * ONE_DAY_MS;
  const remindedRecently = lastReminderTime && now - lastReminderTime < ONE_DAY_MS;

  return (dueBySaves || dueByDays) && !remindedRecently;
}

function openBackupReminder(meta) {
  const now = new Date().toISOString();
  const lastBackupTime = new Date(meta.lastBackupAt || now).getTime();
  const daysSinceBackup = Math.max(0, Math.floor((Date.now() - lastBackupTime) / ONE_DAY_MS));
  const reasons = [];

  if (meta.saveCountSinceBackup >= BACKUP_SAVE_INTERVAL) {
    reasons.push(`已保存 ${meta.saveCountSinceBackup} 次`);
  }
  if (daysSinceBackup >= BACKUP_DAY_INTERVAL) {
    reasons.push(`距离上次备份约 ${daysSinceBackup} 天`);
  }

  backupMessage.textContent = `${reasons.join("，")}，建议现在导出全部 JSON，防止浏览器 localStorage 数据丢失。`;
  meta.lastReminderAt = now;
  persistBackupMeta(meta);
  backupDialog.hidden = false;
  backupNowButton.focus();
}

function closeBackupReminder() {
  backupDialog.hidden = true;
  saveButton.focus();
}

function exportBackupFromReminder() {
  const exportFile = buildExportFile(buildExportNote(titleInput.value.trim() || "未命名笔记", noteInput.value), "all-json");
  if (!exportFile) {
    saveStatus.textContent = "没有可备份的笔记";
    closeBackupReminder();
    return;
  }

  downloadExportFile(exportFile);
  closeBackupReminder();
}

function markBackupCompleted() {
  persistBackupMeta({
    saveCountSinceBackup: 0,
    lastBackupAt: new Date().toISOString(),
    lastReminderAt: null,
  });
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

      openImportDialog(importedNotes, file.name);
    } catch {
      saveStatus.textContent = "JSON 格式不正确，导入失败";
    } finally {
      importInput.value = "";
    }
  });
  reader.readAsText(file, "utf-8");
}

function openImportDialog(importedNotes, filename) {
  pendingImportNotes = importedNotes;
  const latestNote = importedNotes.slice().sort((first, second) => {
    return new Date(second.updatedAt || second.createdAt) - new Date(first.updatedAt || first.createdAt);
  })[0];

  importSummary.textContent = `文件「${filename}」包含 ${importedNotes.length} 条笔记。当前浏览器已有 ${notes.length} 条笔记，请先预览再选择导入方式。最新一条：${latestNote?.title || "未命名笔记"}。`;
  renderImportPreview(importedNotes);
  importDialog.hidden = false;
  mergeImportButton.focus();
}

function renderImportPreview(importedNotes) {
  const previewItems = importedNotes.slice(0, 6).map((note) => {
    const tags = note.tags?.length ? note.tags.map((tag) => `#${tag}`).join(" ") : "无标签";
    const body = note.body ? note.body.slice(0, 90) : "空白笔记";
    return `<article class="import-preview-item">
      <div>
        <h3>${escapeHtml(note.title || "未命名笔记")}</h3>
        <p>${escapeHtml(body)}${note.body?.length > 90 ? "..." : ""}</p>
        <small>${escapeHtml(tags)} · ${formatOptionalDate(note.updatedAt || note.createdAt)}</small>
      </div>
    </article>`;
  }).join("");

  const remaining = importedNotes.length > 6 ? `<p class="modal-copy">还有 ${importedNotes.length - 6} 条未显示。</p>` : "";
  importPreviewList.innerHTML = previewItems + remaining;
}

function closeImportDialog() {
  pendingImportNotes = [];
  importDialog.hidden = true;
  importInput.value = "";
  importButton.focus();
}

function previewImportOnly() {
  saveStatus.textContent = `已预览 ${pendingImportNotes.length} 条笔记，未导入`;
  closeImportDialog();
}

function applyPendingImport(mode) {
  if (!pendingImportNotes.length) return;

  const preparedNotes = ensureUniqueImportedIds(pendingImportNotes, mode === "merge" ? new Set(notes.map((note) => note.id)) : new Set());

  if (mode === "overwrite") {
    const confirmed = window.confirm("覆盖当前会替换浏览器里现有全部笔记。确定继续吗？");
    if (!confirmed) return;
    notes = sortNotesByUpdatedAt(preparedNotes);
  } else {
    notes = sortNotesByUpdatedAt([...preparedNotes, ...notes]);
  }

  activeNoteId = notes[0]?.id ?? null;
  persistNotes();
  clearDraft();
  syncEditorFromActiveNote();
  render();
  saveStatus.textContent = mode === "overwrite" ? `已覆盖导入 ${preparedNotes.length} 条笔记` : `已合并导入 ${preparedNotes.length} 条笔记`;
  closeImportDialog();
}

function ensureUniqueImportedIds(importedNotes, existingIds) {
  const usedIds = new Set(existingIds);

  return importedNotes.map((note) => {
    const nextNote = { ...note };
    if (!nextNote.id || usedIds.has(nextNote.id)) {
      nextNote.id = createNoteId();
    }
    usedIds.add(nextNote.id);
    return nextNote;
  });
}

function sortNotesByUpdatedAt(noteList) {
  return noteList.sort((first, second) => {
    return new Date(second.updatedAt || second.createdAt) - new Date(first.updatedAt || first.createdAt);
  });
}

function formatOptionalDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "时间未知" : formatDate(date);
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
    locked: Boolean(note?.locked),
    trashed: Boolean(note?.trashed),
    trashedAt: note?.trashedAt || null,
    versions: normalizeVersions(note?.versions),
    createdAt: note?.createdAt || now,
    updatedAt: note?.updatedAt || note?.createdAt || now,
  };
}

function normalizeVersions(versions) {
  if (!Array.isArray(versions)) return [];

  return versions.slice(0, 20).map((version) => ({
    id: version?.id || createNoteId(),
    title: String(version?.title || "未命名笔记"),
    body: String(version?.body || ""),
    tags: Array.isArray(version?.tags) ? version.tags.map(String).map((tag) => tag.trim()).filter(Boolean) : [],
    savedAt: version?.savedAt || version?.updatedAt || version?.createdAt || new Date().toISOString(),
  }));
}

function parseTags(value) {
  return [...new Set(value.split(/[,，#\n]/).map((tag) => tag.trim()).filter(Boolean))];
}

function updateNoteActions() {
  const note = notes.find((item) => item.id === activeNoteId);
  const isTrashed = Boolean(note?.trashed);
  lockButton.classList.toggle("active", Boolean(note?.locked));
  pinButton.classList.toggle("active", Boolean(note?.pinned));
  archiveButton.classList.toggle("active", Boolean(note?.archived));
  lockButton.disabled = !note || isTrashed;
  pinButton.disabled = !note || isTrashed;
  archiveButton.disabled = !note || isTrashed;
  lockButton.textContent = note?.locked ? "解锁" : "锁定";
  pinButton.textContent = note?.pinned ? "取消置顶" : "置顶";
  archiveButton.textContent = note?.archived ? "取消归档" : "归档";
}

function updateEditorLockState() {
  const activeNote = notes.find((note) => note.id === activeNoteId);
  const locked = Boolean(activeNote?.locked || activeNote?.trashed);
  appShell.classList.toggle("note-locked", locked);
  titleInput.readOnly = locked;
  noteInput.readOnly = locked;
  tagInput.readOnly = locked;
  saveButton.disabled = locked;
  codeBlockButton.disabled = locked;
  formatToolbar.querySelectorAll("button").forEach((button) => {
    button.disabled = locked;
  });
  noteInput.placeholder = activeNote?.trashed
    ? "这条笔记在回收站中。恢复后才能编辑正文。"
    : locked
      ? "这条笔记已锁定。解锁后才能编辑正文。"
      : "把想法写在这里。支持 Markdown，保存后可以继续编辑，也可以切到预览查看排版。";
}

function parseSearchQuery(value) {
  const tokens = String(value || "").trim().match(/"[^"]+"|\S+/g) || [];
  const search = {
    text: [],
    title: [],
    body: [],
    tag: [],
    highlightTerms: [],
  };

  tokens.forEach((token) => {
    const cleanToken = token.replace(/^"|"$/g, "");
    const fieldMatch = cleanToken.match(/^(tag|title|body):(.+)$/i);
    if (fieldMatch) {
      const field = fieldMatch[1].toLowerCase();
      const term = fieldMatch[2].trim().toLowerCase();
      if (term) {
        search[field].push(term);
        search.highlightTerms.push(term);
      }
      return;
    }

    const term = cleanToken.trim().toLowerCase();
    if (term) {
      search.text.push(term);
      search.highlightTerms.push(term);
    }
  });

  search.highlightTerms = [...new Set(search.highlightTerms)];
  return search;
}

function matchesSearch(note, search) {
  const title = note.title.toLowerCase();
  const body = note.body.toLowerCase();
  const tags = note.tags.map((tag) => tag.toLowerCase());
  const haystack = `${title} ${body} ${tags.join(" ")}`;

  return (
    search.text.every((term) => haystack.includes(term)) &&
    search.title.every((term) => title.includes(term)) &&
    search.body.every((term) => body.includes(term)) &&
    search.tag.every((term) => tags.some((tag) => tag.includes(term)))
  );
}

function getSearchPreview(note, terms) {
  if (!note.body) return "空白笔记";
  const searchTerms = Array.isArray(terms) ? terms.filter(Boolean) : [];
  if (!searchTerms.length) return note.body;

  const lowerBody = note.body.toLowerCase();
  const matches = searchTerms.map((term) => lowerBody.indexOf(term)).filter((index) => index >= 0);
  const index = matches.length ? Math.min(...matches) : -1;
  if (index < 0) return note.body;

  const matchedTerm = searchTerms.find((term) => lowerBody.indexOf(term) === index) || searchTerms[0];
  const start = Math.max(0, index - 24);
  const end = Math.min(note.body.length, index + matchedTerm.length + 48);
  return `${start > 0 ? "..." : ""}${note.body.slice(start, end)}${end < note.body.length ? "..." : ""}`;
}

function highlightSearchMatches(value, terms) {
  const text = String(value || "");
  const needles = (Array.isArray(terms) ? terms : [terms]).map((term) => String(term || "").trim()).filter(Boolean);
  if (!needles.length) return escapeHtml(text);

  const lowerText = text.toLowerCase();
  const ranges = [];

  needles.forEach((needle) => {
    const lowerNeedle = needle.toLowerCase();
    let matchIndex = lowerText.indexOf(lowerNeedle);
    while (matchIndex >= 0) {
      ranges.push([matchIndex, matchIndex + needle.length]);
      matchIndex = lowerText.indexOf(lowerNeedle, matchIndex + needle.length);
    }
  });

  if (!ranges.length) return escapeHtml(text);

  const mergedRanges = ranges.sort((first, second) => first[0] - second[0]).reduce((merged, range) => {
    const previous = merged[merged.length - 1];
    if (previous && range[0] <= previous[1]) {
      previous[1] = Math.max(previous[1], range[1]);
    } else {
      merged.push([...range]);
    }
    return merged;
  }, []);

  let cursor = 0;
  let output = "";
  mergedRanges.forEach(([start, end]) => {
    output += escapeHtml(text.slice(cursor, start));
    output += `<mark class="search-highlight">${escapeHtml(text.slice(start, end))}</mark>`;
    cursor = end;
  });

  return output + escapeHtml(text.slice(cursor));
}

function insertLink() {
  const selectedText = getSelectionText() || "链接文字";
  const start = noteInput.selectionStart;
  replaceSelection(`[${selectedText}](https://example.com)`);
  const urlStart = start + selectedText.length + 3;
  noteInput.setSelectionRange(urlStart, urlStart + "https://example.com".length);
}

function buildExportFile(note, format) {
  const filename = safeFilename(note.title);

  if (format === "all-json") {
    if (!notes.length) return null;

    return {
      content: JSON.stringify({ exportedAt: new Date().toISOString(), notes: notes.map(normalizeNote) }, null, 2),
      filename: "flow-notes-backup.json",
      format,
      label: "全部 JSON",
      type: "application/json;charset=utf-8",
    };
  }

  if (format === "all-markdown") {
    if (!notes.some((note) => !note.trashed)) return null;

    return {
      content: buildAllMarkdownDocument(),
      filename: "flow-notes-all.md",
      format,
      label: "全部 Markdown",
      type: "text/markdown;charset=utf-8",
    };
  }

  if (format === "all-html") {
    if (!notes.some((note) => !note.trashed)) return null;

    return {
      content: buildAllHtmlDocument(),
      filename: "flow-notes-all.html",
      format,
      label: "全部 HTML",
      type: "text/html;charset=utf-8",
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
    format,
    filename: `${filename}.${exportFormat.extension}`,
  };
}

function buildAllMarkdownDocument() {
  return sortNotesByUpdatedAt(notes.map(normalizeNote).filter((note) => !note.trashed)).map((note) => {
    const tags = note.tags.length ? `\n\n标签：${note.tags.map((tag) => `#${tag}`).join(" ")}` : "";
    return `# ${note.title}\n\n更新时间：${formatOptionalDate(note.updatedAt || note.createdAt)}${tags}\n\n${note.body}`;
  }).join("\n\n---\n\n");
}

function buildAllHtmlDocument() {
  const content = sortNotesByUpdatedAt(notes.map(normalizeNote).filter((note) => !note.trashed)).map((note) => {
    const tags = note.tags.length ? `<p class="note-tags">${note.tags.map((tag) => `#${escapeHtml(tag)}`).join(" ")}</p>` : "";
    return `<article class="export-note">
      <h1>${escapeHtml(note.title)}</h1>
      <time>${formatOptionalDate(note.updatedAt || note.createdAt)}</time>
      ${tags}
      ${renderMarkdown(note.body, { interactiveCode: false })}
    </article>`;
  }).join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Flow Notes 全部笔记</title>
  <style>
    body { max-width: 860px; margin: 48px auto; padding: 0 22px; font-family: "Segoe UI", Arial, sans-serif; color: #20231f; line-height: 1.75; }
    .export-note { padding: 0 0 36px; margin: 0 0 36px; border-bottom: 1px solid #dce2d8; }
    h1 { line-height: 1.2; }
    time, .note-tags { color: #16645a; font-weight: 700; }
    code { padding: 2px 6px; border-radius: 6px; background: #eef4ef; }
    pre { overflow: auto; padding: 16px; border: 1px solid #dce2d8; border-radius: 8px; background: #eef4ef; }
    pre code { padding: 0; background: transparent; color: #20231f; font-family: Consolas, monospace; font-size: 14px; }
    img { display: block; max-width: 100%; height: auto; margin: 0 0 16px; border-radius: 8px; border: 1px solid #dce2d8; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 12px; border: 1px solid #dce2d8; text-align: left; vertical-align: top; }
    th { background: #eef4ef; color: #16645a; }
  </style>
</head>
<body>
${content}
</body>
</html>`;
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

function enterFocusMode() {
  if (isFocusMode) return;

  viewBeforeFocus = activeView;
  isFocusMode = true;
  appShell.classList.add("focus-mode");
  exitFocusButton.hidden = false;
  applyView("edit");
  noteInput.focus();
  updateEditorChrome();
}

function exitFocusMode() {
  if (!isFocusMode) return;

  isFocusMode = false;
  appShell.classList.remove("focus-mode");
  exitFocusButton.hidden = true;
  applyView(viewBeforeFocus);
  noteInput.focus();
  updateEditorChrome();
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
  const codeHtml = code.split("\n").map((line, index) => {
    return `<span class="code-line" data-source-line="${sourceLine + index + 1}">${escapeHtml(line) || " "}</span>`;
  }).join("");

  return `<div class="code-block" data-source-line="${sourceLine}" data-language="${escapeAttribute(language)}" data-code="${encodedCode}">
    <div class="code-toolbar">
      <span>${escapeHtml(label)}</span>
      <div class="code-actions">
        <button type="button" data-code-action="copy-code">复制</button>
        ${action}
      </div>
    </div>
    <pre><code class="${languageClass.trim()}">${codeHtml}</code></pre>
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
