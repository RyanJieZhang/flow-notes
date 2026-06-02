const STORAGE_KEY = "flow-notes-history";
const DRAFT_KEY = "flow-notes-draft";
const THEME_KEY = "flow-notes-theme";
const VIEW_KEY = "flow-notes-view";

const titleInput = document.querySelector("#titleInput");
const noteInput = document.querySelector("#noteInput");
const saveButton = document.querySelector("#saveButton");
const newNoteButton = document.querySelector("#newNoteButton");
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
    a { color: #16645a; }
    @media print { body { max-width: none; margin: 0; padding: 0; } .print-action { display: none; } }
  </style>
</head>
<body>
${autoPrint ? '<div class="print-action"><button type="button" onclick="window.print()">保存为 PDF</button></div>' : ""}
${renderMarkdown(`# ${note.title}\n\n${note.body}`)}
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

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let listItems = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      listItems.push(`<li>${renderInline(listMatch[1])}</li>`);
      return;
    }

    flushList();

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      return;
    }

    blocks.push(`<p>${renderInline(trimmed)}</p>`);
  });

  flushList();
  return blocks.join("");

  function flushList() {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.join("")}</ul>`);
    listItems = [];
  }
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
