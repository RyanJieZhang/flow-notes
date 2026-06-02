const STORAGE_KEY = "flow-notes-history";

const titleInput = document.querySelector("#titleInput");
const noteInput = document.querySelector("#noteInput");
const saveButton = document.querySelector("#saveButton");
const newNoteButton = document.querySelector("#newNoteButton");
const exportButton = document.querySelector("#exportButton");
const clearButton = document.querySelector("#clearButton");
const searchInput = document.querySelector("#searchInput");
const historyList = document.querySelector("#historyList");
const noteCount = document.querySelector("#noteCount");
const saveStatus = document.querySelector("#saveStatus");
const wordCount = document.querySelector("#wordCount");
const template = document.querySelector("#historyItemTemplate");

let notes = loadNotes();
let activeNoteId = notes[0]?.id ?? null;

render();
syncEditorFromActiveNote();

saveButton.addEventListener("click", saveCurrentNote);
newNoteButton.addEventListener("click", startFreshNote);
exportButton.addEventListener("click", exportCurrentNote);
clearButton.addEventListener("click", clearHistory);
searchInput.addEventListener("input", renderHistory);
noteInput.addEventListener("input", () => {
  updateWordCount();
  markDraft();
});
titleInput.addEventListener("input", markDraft);

function loadNotes() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function persistNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function saveCurrentNote() {
  const body = noteInput.value.trim();
  const title = titleInput.value.trim() || "未命名笔记";

  if (!body && !titleInput.value.trim()) {
    saveStatus.textContent = "先写点内容再保存";
    return;
  }

  const now = new Date();
  const note = {
    id: createNoteId(),
    title,
    body,
    createdAt: now.toISOString(),
  };

  notes = [note, ...notes];
  activeNoteId = note.id;
  persistNotes();
  render();
  saveStatus.textContent = `已保存：${formatDate(now)}`;
}

function startFreshNote() {
  activeNoteId = null;
  titleInput.value = "";
  noteInput.value = "";
  saveStatus.textContent = "新笔记";
  updateWordCount();
  renderHistory();
  titleInput.focus();
}

function restoreNote(id) {
  activeNoteId = id;
  syncEditorFromActiveNote();
  renderHistory();
}

function syncEditorFromActiveNote() {
  const activeNote = notes.find((note) => note.id === activeNoteId);

  if (!activeNote) {
    updateWordCount();
    return;
  }

  titleInput.value = activeNote.title;
  noteInput.value = activeNote.body;
  saveStatus.textContent = `已恢复：${formatDate(new Date(activeNote.createdAt))}`;
  updateWordCount();
}

function exportCurrentNote() {
  const title = titleInput.value.trim() || "未命名笔记";
  const body = noteInput.value;
  const blob = new Blob([`# ${title}\n\n${body}\n`], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${safeFilename(title)}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
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
  renderHistory();
  updateWordCount();
}

function renderHistory() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleNotes = notes.filter((note) => {
    const haystack = `${note.title} ${note.body}`.toLowerCase();
    return haystack.includes(query);
  });

  historyList.innerHTML = "";
  noteCount.textContent = `${notes.length} 条记录`;

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
    const title = item.querySelector("strong");
    const preview = item.querySelector(".preview");
    const time = item.querySelector("small");

    button.classList.toggle("active", note.id === activeNoteId);
    button.addEventListener("click", () => restoreNote(note.id));
    title.textContent = note.title;
    preview.textContent = note.body || "空白笔记";
    time.textContent = formatDate(new Date(note.createdAt));
    historyList.append(item);
  });
}

function updateWordCount() {
  const compact = noteInput.value.replace(/\s/g, "");
  wordCount.textContent = `${compact.length} 字`;
}

function markDraft() {
  saveStatus.textContent = "正在编辑";
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
