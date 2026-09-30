import React, { useState, useEffect } from "react";
import {
  ObsidianNote,
  ObsidianVaultState,
  loadObsidianVault,
  saveObsidianVault,
  pickLocalObsidianVault,
  extractWikilinks,
  extractTags,
} from "../../utils/obsidianStore";
import { ObsidianTableView } from "./ObsidianTableView";
import { ObsidianEditorView } from "./ObsidianEditorView";
import { ObsidianGraphView } from "./ObsidianGraphView";
import {
  Files,
  Network,
  Database,
  Calendar as CalendarIcon,
  Mail,
  Share2,
  Settings,
  HelpCircle,
  Folder,
  FolderOpen,
  Plus,
  Search,
  Bookmark,
  ChevronRight,
  ChevronDown,
  X,
  Minus,
  Square,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Bot,
  Send,
  SlidersHorizontal,
  FileText,
  Upload,
  CheckCircle2,
  HardDrive,
} from "lucide-react";

interface ObsidianBrainWorkspaceProps {
  onOpenGmail?: () => void;
  onOpenSocialStudio?: () => void;
  onOpenCalendar?: () => void;
  onClose?: () => void;
}

export const ObsidianBrainWorkspace: React.FC<ObsidianBrainWorkspaceProps> = ({
  onOpenGmail,
  onOpenSocialStudio,
  onOpenCalendar,
  onClose,
}) => {
  // Vault state
  const [vault, setVault] = useState<ObsidianVaultState>(() => loadObsidianVault());
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeActivity, setActiveActivity] = useState<"files" | "graph" | "base" | "calendar" | "gmail" | "social">("files");
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [copilotInput, setCopilotInput] = useState<string>("");
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Hallo! Ich bin dein Obsidian AI Brain. Du kannst mich bitten, Notizen zusammenzufassen, neue Gedanken als Markdown anzulegen oder Inhalte mit Gmail und Social Media zu synchronisieren.",
    },
  ]);
  const [searchSidebarQuery, setSearchSidebarQuery] = useState<string>("");

  // Persist vault changes
  useEffect(() => {
    saveObsidianVault(vault);
  }, [vault]);

  // Active note
  const activeNote = vault.notes.find((n) => n.id === vault.activeNoteId) || vault.notes[0] || null;

  // Open note
  const handleSelectNote = (noteId: string) => {
    setVault((prev) => {
      const openTabs = prev.openTabIds.includes(noteId) ? prev.openTabIds : [...prev.openTabIds, noteId];
      return {
        ...prev,
        activeNoteId: noteId,
        openTabIds: openTabs,
      };
    });
  };

  // Open note by title (from Wikilink)
  const handleOpenNoteByTitle = (title: string) => {
    const found = vault.notes.find(
      (n) => n.title.toLowerCase() === title.toLowerCase() || n.name.toLowerCase().startsWith(title.toLowerCase())
    );
    if (found) {
      handleSelectNote(found.id);
    } else {
      // Create note if not existing
      handleCreateNote(title);
    }
  };

  // Close tab
  const handleCloseTab = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVault((prev) => {
      const newTabs = prev.openTabIds.filter((id) => id !== noteId);
      const newActive = prev.activeNoteId === noteId ? newTabs[newTabs.length - 1] || null : prev.activeNoteId;
      return {
        ...prev,
        openTabIds: newTabs,
        activeNoteId: newActive,
      };
    });
  };

  // Create new note
  const handleCreateNote = (customTitle?: string) => {
    const title = customTitle || `Neue Notiz ${vault.notes.length + 1}`;
    const newNote: ObsidianNote = {
      id: `note-${Date.now()}`,
      name: `${title}.md`,
      title,
      path: `${title}.md`,
      type: "markdown",
      content: `# ${title}\n\nSchreibe deine Gedanken hier auf... Nutze [[Wikilinks]] für Vernetzungen!`,
      updatedAt: "Gerade eben",
      size: "120 B",
      tags: ["notiz"],
      links: [],
      backlinks: [],
    };

    setVault((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
      activeNoteId: newNote.id,
      openTabIds: [...prev.openTabIds, newNote.id],
      activeView: "editor",
    }));
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    setVault((prev) => {
      const filtered = prev.notes.filter((n) => n.id !== noteId);
      const newTabs = prev.openTabIds.filter((id) => id !== noteId);
      return {
        ...prev,
        notes: filtered,
        openTabIds: newTabs,
        activeNoteId: prev.activeNoteId === noteId ? newTabs[0] || null : prev.activeNoteId,
      };
    });
  };

  // Update note content
  const handleUpdateContent = (noteId: string, content: string) => {
    setVault((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            content,
            links: extractWikilinks(content),
            tags: extractTags(content),
            updatedAt: "Gerade eben",
          };
        }
        return n;
      }),
    }));
  };

  // Connect real local folder via File System Access API
  const handleConnectLocalVault = async () => {
    try {
      const result = await pickLocalObsidianVault();
      if (result) {
        setVault((prev) => ({
          ...prev,
          vaultName: result.vaultName,
          isConnectedToLocalFolder: true,
          notes: result.notes,
          activeNoteId: result.notes[0]?.id || null,
          openTabIds: result.notes.slice(0, 3).map((n) => n.id),
        }));
      }
    } catch (err) {
      console.error("Vault connection failed:", err);
    }
  };

  // Copilot quick send
  const handleSendCopilot = () => {
    if (!copilotInput.trim()) return;
    const userText = copilotInput.trim();
    setCopilotInput("");
    setCopilotMessages((prev) => [...prev, { role: "user", text: userText }]);

    // Simulated instant assistant response
    setTimeout(() => {
      let reply = `Ich habe deine Anfrage zu "${userText}" analysiert.`;
      if (userText.toLowerCase().includes("zusammenfass") && activeNote) {
        reply = `Zusammenfassung von [[${activeNote.title}]]: Die Notiz enthält Kernkonzepte zu ${activeNote.tags.join(", ") || "Produktivität"} mit ${activeNote.links.length} Querverweisen.`;
      } else if (userText.toLowerCase().includes("mail") || userText.toLowerCase().includes("gmail")) {
        reply = `Notiz kann direkt als E-Mail-Entwurf in dein Gmail Inbox Modul übernommen werden! Klicke oben einfach auf das Mail-Icon.`;
      } else {
        reply = `Möchtest du, dass ich dazu eine neue Notiz [[${userText}]] in deinem Vault erstelle?`;
      }
      setCopilotMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    }, 600);
  };

  return (
    <div className="flex h-screen w-screen bg-[#111113] text-slate-200 overflow-hidden font-sans select-none">
      {/* 1. NARROW ACTIVITY BAR (FAR LEFT) - Obsidian Style */}
      <div className="w-12 bg-[#141416] border-r border-[#202023] flex flex-col items-center py-3 justify-between shrink-0 z-20">
        {/* Top Activity Icons */}
        <div className="flex flex-col items-center gap-2">
          {/* Files Explorer */}
          <button
            onClick={() => {
              setActiveActivity("files");
              setSidebarOpen(true);
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              activeActivity === "files"
                ? "bg-[#27272a] text-purple-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1e1e22]"
            }`}
            title="Dateien & Vault"
          >
            <Files className="w-4 h-4" />
          </button>

          {/* Graph View */}
          <button
            onClick={() => {
              setActiveActivity("graph");
              setVault((prev) => ({ ...prev, activeView: "graph" }));
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              vault.activeView === "graph"
                ? "bg-[#27272a] text-purple-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1e1e22]"
            }`}
            title="Wissensgraph (Graph View)"
          >
            <Network className="w-4 h-4" />
          </button>

          {/* Database / Base View */}
          <button
            onClick={() => {
              setActiveActivity("base");
              setVault((prev) => ({ ...prev, activeView: "table" }));
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              vault.activeView === "table"
                ? "bg-[#27272a] text-cyan-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1e1e22]"
            }`}
            title="Obsidian Base / Tabelle"
          >
            <Database className="w-4 h-4" />
          </button>

          <div className="w-6 h-px bg-[#26262a] my-1" />

          {/* Core Triad Shortcuts */}
          {/* Gmail */}
          {onOpenGmail && (
            <button
              onClick={onOpenGmail}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
              title="Gmail Inbox öffnen"
            >
              <Mail className="w-4 h-4" />
            </button>
          )}

          {/* Social Media Studio */}
          {onOpenSocialStudio && (
            <button
              onClick={onOpenSocialStudio}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 transition"
              title="Social Media Studio öffnen"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {/* Chronos Calendar */}
          {onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition"
              title="Google Kalender öffnen"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bottom Activity Icons */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setCopilotOpen(!copilotOpen)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              copilotOpen ? "bg-purple-600 text-white" : "text-purple-400 hover:bg-[#1e1e22]"
            }`}
            title="KI-Assistent (Copilot)"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={handleConnectLocalVault}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#1e1e22] transition"
            title="Lokalen Obsidian-Ordner verknüpfen"
          >
            <HardDrive className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SECOND PANE: VAULT EXPLORER (Matching Screenshot) */}
      {sidebarOpen && (
        <div className="w-64 bg-[#18181a] border-r border-[#242428] flex flex-col shrink-0">
          {/* Header Action Bar */}
          <div className="h-10 border-b border-[#242428] px-3 flex items-center justify-between text-slate-400 text-xs">
            <div className="flex items-center gap-1 font-medium text-slate-300">
              <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
              <span className="truncate max-w-[110px]">{vault.vaultName}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCreateNote()}
                className="p-1 hover:text-slate-200 hover:bg-[#27272a] rounded transition"
                title="Neue Notiz (+)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:text-slate-200 hover:bg-[#27272a] rounded transition"
                title="Seitenleiste einklappen"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="px-3 py-2 border-b border-[#222226]">
            <div className="flex items-center gap-1.5 bg-[#141416] px-2 py-1 rounded border border-[#27272a] text-xs">
              <Search className="w-3 h-3 text-slate-500" />
              <input
                type="text"
                placeholder="Dateien durchsuchen..."
                value={searchSidebarQuery}
                onChange={(e) => setSearchSidebarQuery(e.target.value)}
                className="bg-transparent text-slate-200 placeholder-slate-500 outline-none w-full text-xs"
              />
            </div>
          </div>

          {/* Notes List (Matching Screenshot: Unbenannt BASE, Willkommen, etc.) */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
            {vault.notes
              .filter((n) => n.name.toLowerCase().includes(searchSidebarQuery.toLowerCase()))
              .map((note) => {
                const isActive = note.id === vault.activeNoteId;
                const isBase = note.type === "base";

                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition group ${
                      isActive
                        ? "bg-[#27272a] text-purple-300 font-medium"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#1e1e22]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isBase ? (
                        <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      )}
                      <span className="truncate">{note.title}</span>
                    </div>

                    {isBase && (
                      <span className="text-[9px] px-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                        BASE
                      </span>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Vault Footer Bar (Matching Screenshot: Obsidian Vault with ? and Settings) */}
          <div className="h-10 border-t border-[#242428] px-3 flex items-center justify-between bg-[#141416] text-xs text-slate-400">
            <button
              onClick={handleConnectLocalVault}
              className="flex items-center gap-1.5 hover:text-slate-200 transition cursor-pointer truncate"
              title="Klicken, um lokalen Ordner zu wählen"
            >
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span className="truncate font-mono text-[11px]">{vault.vaultName}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleOpenNoteByTitle("Willkommen")}
                className="p-1 hover:text-slate-200 transition"
                title="Hilfe & Anleitung"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE (TABS + VIEW SWITCHER + CONTENT) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#161618]">
        {/* Top Window / Tab Bar (Matching Screenshot with Tabs & + button) */}
        <div className="h-10 bg-[#121214] border-b border-[#242428] flex items-center justify-between px-2 select-none">
          {/* Left: Open Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {vault.openTabIds.map((tabId) => {
              const note = vault.notes.find((n) => n.id === tabId);
              if (!note) return null;
              const isActive = note.id === vault.activeNoteId;

              return (
                <div
                  key={tabId}
                  onClick={() => handleSelectNote(tabId)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs cursor-pointer border-t-2 transition ${
                    isActive
                      ? "bg-[#161618] border-purple-500 text-slate-100 font-medium"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#1a1a1d]"
                  }`}
                >
                  {note.type === "base" ? (
                    <Database className="w-3 h-3 text-cyan-400" />
                  ) : (
                    <FileText className="w-3 h-3 text-purple-400" />
                  )}
                  <span className="truncate max-w-[130px]">{note.title}</span>
                  <button
                    onClick={(e) => handleCloseTab(tabId, e)}
                    className="p-0.5 hover:bg-[#2b2b30] text-slate-500 hover:text-slate-200 rounded transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* + New Tab Button */}
            <button
              onClick={() => handleCreateNote()}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1f1f23] rounded transition ml-1"
              title="Neue Notiz öffnen"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: View Switcher (Table / Markdown / Graph) */}
          <div className="flex items-center gap-1 bg-[#1c1c20] p-0.5 rounded-lg border border-[#27272a]">
            <button
              onClick={() => setVault((prev) => ({ ...prev, activeView: "table" }))}
              className={`px-2.5 py-1 rounded text-xs transition ${
                vault.activeView === "table"
                  ? "bg-purple-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tabelle
            </button>
            <button
              onClick={() => setVault((prev) => ({ ...prev, activeView: "editor" }))}
              className={`px-2.5 py-1 rounded text-xs transition ${
                vault.activeView === "editor"
                  ? "bg-purple-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setVault((prev) => ({ ...prev, activeView: "graph" }))}
              className={`px-2.5 py-1 rounded text-xs transition ${
                vault.activeView === "graph"
                  ? "bg-purple-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Graph
            </button>
          </div>
        </div>

        {/* View Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {vault.activeView === "table" && (
            <ObsidianTableView
              notes={vault.notes}
              activeNoteId={vault.activeNoteId}
              onSelectNote={(id) => {
                handleSelectNote(id);
                setVault((prev) => ({ ...prev, activeView: "editor" }));
              }}
              onCreateNote={() => handleCreateNote()}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {vault.activeView === "editor" && (
            <ObsidianEditorView
              note={activeNote}
              onUpdateContent={handleUpdateContent}
              onOpenNoteByTitle={handleOpenNoteByTitle}
              onSendToGmail={() => onOpenGmail && onOpenGmail()}
              onSendToSocial={() => onOpenSocialStudio && onOpenSocialStudio()}
              onSendToCalendar={() => onOpenCalendar && onOpenCalendar()}
              vaultName={vault.vaultName}
            />
          )}

          {vault.activeView === "graph" && (
            <ObsidianGraphView
              notes={vault.notes}
              activeNoteId={vault.activeNoteId}
              onSelectNote={(id) => {
                handleSelectNote(id);
                setVault((prev) => ({ ...prev, activeView: "editor" }));
              }}
            />
          )}
        </div>
      </div>

      {/* 4. OPTIONAL AI COPILOT DRAWER (RIGHT) */}
      {copilotOpen && (
        <div className="w-80 bg-[#18181a] border-l border-[#242428] flex flex-col shrink-0">
          <div className="h-10 border-b border-[#242428] px-3 flex items-center justify-between text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Obsidian AI Copilot</span>
            </div>
            <button
              onClick={() => setCopilotOpen(false)}
              className="p-1 hover:bg-[#27272a] rounded text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {copilotMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-[#202024] text-slate-300 border border-[#2b2b32]"
                    : "bg-purple-600 text-white ml-4"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-2 border-t border-[#242428] bg-[#141416]">
            <div className="flex items-center gap-1 bg-[#1e1e22] px-2 py-1.5 rounded-lg border border-[#292930]">
              <input
                type="text"
                placeholder="Frage zu Notizen stellen..."
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendCopilot()}
                className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
              />
              <button
                onClick={handleSendCopilot}
                className="p-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
