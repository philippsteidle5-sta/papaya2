import React, { useState } from "react";
import { ObsidianNote } from "../../utils/obsidianStore";
import {
  FileText,
  Save,
  Sparkles,
  Share2,
  Mail,
  Calendar,
  ExternalLink,
  Code,
  Eye,
  CheckSquare,
  Hash,
  Link2,
  Copy,
  Check,
  Database,
  Plus,
} from "lucide-react";

interface ObsidianEditorViewProps {
  note: ObsidianNote | null;
  onUpdateContent: (noteId: string, content: string) => void;
  onOpenNoteByTitle: (title: string) => void;
  onSendToGmail?: (text: string) => void;
  onSendToSocial?: (text: string) => void;
  onSendToCalendar?: (text: string) => void;
  vaultName: string;
}

export const ObsidianEditorView: React.FC<ObsidianEditorViewProps> = ({
  note,
  onUpdateContent,
  onOpenNoteByTitle,
  onSendToGmail,
  onSendToSocial,
  onSendToCalendar,
  vaultName,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#161618]">
        <FileText className="w-12 h-12 stroke-1 mb-2 text-slate-600" />
        <p className="text-sm">Keine Notiz ausgewählt</p>
        <p className="text-xs text-slate-600 mt-1">Wähle eine Notiz aus der Seitenleiste oder erstelle eine neue.</p>
      </div>
    );
  }

  // Copy Obsidian URI
  const handleOpenInObsidianApp = () => {
    const encodedVault = encodeURIComponent(vaultName || "Obsidian Vault");
    const encodedFile = encodeURIComponent(note.name);
    const uri = `obsidian://open?vault=${encodedVault}&file=${encodedFile}`;
    window.open(uri, "_blank");
  };

  // Render clickable Wikilinks [[Note Title]]
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      // Heading 1
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="text-2xl font-bold text-slate-100 mt-4 mb-2 pb-1 border-b border-[#26262a]">
            {line.substring(2)}
          </h1>
        );
      }
      // Heading 2
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-lg font-semibold text-purple-300 mt-4 mb-1.5">
            {line.substring(3)}
          </h2>
        );
      }
      // Heading 3
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-sm font-semibold text-slate-200 mt-3 mb-1">
            {line.substring(4)}
          </h3>
        );
      }
      // Checkbox list
      if (line.trim().startsWith("- [ ] ") || line.trim().startsWith("- [x] ")) {
        const checked = line.trim().startsWith("- [x] ");
        const text = line.trim().substring(6);
        return (
          <div key={i} className="flex items-center gap-2 text-sm text-slate-300 my-1">
            <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? "bg-purple-600 border-purple-500 text-white" : "border-slate-600 bg-[#202024]"}`}>
              {checked && <Check className="w-3 h-3" />}
            </span>
            <span className={checked ? "line-through text-slate-500" : ""}>{renderInlineLinks(text)}</span>
          </div>
        );
      }
      // Bullet list
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={i} className="text-sm text-slate-300 ml-4 list-disc my-0.5">
            {renderInlineLinks(line.trim().substring(2))}
          </li>
        );
      }
      // Empty line
      if (line.trim() === "") {
        return <div key={i} className="h-2" />;
      }

      return (
        <p key={i} className="text-sm text-slate-300 leading-relaxed my-1">
          {renderInlineLinks(line)}
        </p>
      );
    });
  };

  // Helper to parse Wikilinks [[...]] and tags #...
  const renderInlineLinks = (text: string) => {
    const parts = text.split(/(\[\[.*?\]\]|#[a-zA-Z0-9_-]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("[[") && part.endsWith("]]")) {
        const target = part.slice(2, -2);
        return (
          <button
            key={idx}
            onClick={() => onOpenNoteByTitle(target)}
            className="text-purple-400 hover:text-purple-300 hover:underline font-medium inline-flex items-center gap-0.5 bg-purple-500/10 px-1 py-0.5 rounded transition text-xs"
          >
            <Link2 className="w-3 h-3" />
            {target}
          </button>
        );
      }
      if (part.startsWith("#")) {
        return (
          <span key={idx} className="text-cyan-400 font-mono text-xs px-1 py-0.5 bg-cyan-500/10 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#161618] text-slate-200 overflow-hidden font-sans">
      {/* Editor Subheader Toolbar */}
      <div className="h-11 border-b border-[#26262a] flex items-center justify-between px-4 bg-[#18181b] select-none">
        {/* Left: Filename & Type */}
        <div className="flex items-center gap-2">
          {note.type === "base" ? (
            <Database className="w-4 h-4 text-cyan-400" />
          ) : (
            <FileText className="w-4 h-4 text-purple-400" />
          )}
          <span className="font-semibold text-slate-200 text-sm">{note.name}</span>
          <span className="text-xs text-slate-500 font-mono">• {note.updatedAt}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Edit / Preview Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition ${
              isEditing
                ? "bg-purple-600 text-white font-medium"
                : "bg-[#27272a] text-slate-300 hover:text-white"
            }`}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            <span>{isEditing ? "Vorschau" : "Bearbeiten"}</span>
          </button>

          {/* Send to Gmail */}
          {onSendToGmail && (
            <button
              onClick={() => onSendToGmail(note.content)}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#27272a] rounded transition"
              title="Als E-Mail-Entwurf in Gmail übernehmen"
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Send to Social Media */}
          {onSendToSocial && (
            <button
              onClick={() => onSendToSocial(note.content)}
              className="p-1.5 text-slate-400 hover:text-pink-400 hover:bg-[#27272a] rounded transition"
              title="In Social Media Studio posten"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Send to Calendar */}
          {onSendToCalendar && (
            <button
              onClick={() => onSendToCalendar(note.title)}
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#27272a] rounded transition"
              title="Als Termin im Google Kalender blocken"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Open in Obsidian Desktop App */}
          <button
            onClick={handleOpenInObsidianApp}
            className="flex items-center gap-1 bg-[#27272a] hover:bg-[#323238] text-purple-300 hover:text-purple-200 px-2 py-1 rounded text-xs transition"
            title="Direkt in der Obsidian Desktop App öffnen (obsidian://)"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">In Obsidian öffnen</span>
          </button>
        </div>
      </div>

      {/* Editor or Preview Body */}
      <div className="flex-1 overflow-auto p-6 max-w-4xl w-full mx-auto">
        {isEditing ? (
          <textarea
            value={note.content}
            onChange={(e) => onUpdateContent(note.id, e.target.value)}
            placeholder="Schreibe Notizen mit Markdown und [[Wikilinks]]..."
            className="w-full h-full min-h-[500px] bg-transparent text-slate-200 font-mono text-sm leading-relaxed outline-none resize-none placeholder-slate-600"
          />
        ) : (
          <div className="prose prose-invert max-w-none">
            {renderFormattedMarkdown(note.content)}
          </div>
        )}
      </div>

      {/* Footer Meta Info */}
      <div className="h-7 border-t border-[#26262a] px-4 flex items-center justify-between text-[11px] text-slate-500 bg-[#18181b] select-none">
        <div className="flex items-center gap-3">
          <span>{note.content.length} Zeichen</span>
          <span>•</span>
          <span>{note.content.split(/\s+/).filter(Boolean).length} Wörter</span>
          <span>•</span>
          <span>{note.links.length} Links</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Obsidian Markdown v1.8</span>
        </div>
      </div>
    </div>
  );
};
