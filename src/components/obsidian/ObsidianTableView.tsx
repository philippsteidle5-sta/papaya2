import React, { useState } from "react";
import { ObsidianNote } from "../../utils/obsidianStore";
import {
  Table as TableIcon,
  ArrowUpDown,
  Filter,
  SlidersHorizontal,
  Search,
  Plus,
  FileText,
  Database,
  Calendar,
  Tag,
  ExternalLink,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface ObsidianTableViewProps {
  notes: ObsidianNote[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
}

export const ObsidianTableView: React.FC<ObsidianTableViewProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<"name" | "updatedAt" | "size">("name");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Collect unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || n.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "size") {
      comparison = (a.size || "").localeCompare(b.size || "");
    } else {
      comparison = a.updatedAt.localeCompare(b.updatedAt);
    }
    return sortAsc ? comparison : -comparison;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#161618] text-slate-200 overflow-hidden font-sans">
      {/* Subheader Toolbar matching Obsidian screenshot */}
      <div className="h-10 border-b border-[#26262a] flex items-center justify-between px-4 bg-[#18181b] text-xs text-slate-400 select-none">
        {/* Left: View type & Result count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
            <TableIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Tabelle</span>
          </div>
          <span className="text-[#71717a]">|</span>
          <span className="text-[#a1a1aa] font-mono">{filteredNotes.length} Ergebnisse</span>
        </div>

        {/* Right: Actions (Sortieren, Filtern, Eigenschaften, Suche, + Neu) */}
        <div className="flex items-center gap-3">
          {/* Sort Button */}
          <button
            onClick={() => {
              if (sortField === "name") setSortAsc(!sortAsc);
              else {
                setSortField("name");
                setSortAsc(true);
              }
            }}
            className="flex items-center gap-1 hover:text-slate-200 transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sortieren</span>
          </button>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-1 hover:text-slate-200 transition relative">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-400 focus:text-slate-200 outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1e1e22]">Alle Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag} className="bg-[#1e1e22]">
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-1.5 bg-[#202024] px-2 py-1 rounded border border-[#2d2d32]">
            <Search className="w-3 h-3 text-slate-400" />
            <input
              type="text"
              placeholder="Suche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-24 focus:w-36 transition-all"
            />
          </div>

          {/* + Neu Button */}
          <button
            onClick={onCreateNote}
            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Neu</span>
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#26262a] text-[#71717a] font-medium bg-[#141416]/50">
              <th className="py-2.5 px-4 w-1/3">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-slate-500" />
                  Dateiname
                </span>
              </th>
              <th className="py-2.5 px-4 w-1/6">Typ</th>
              <th className="py-2.5 px-4 w-1/4">Tags & Verknüpfungen</th>
              <th className="py-2.5 px-4 w-1/6">Zuletzt bearbeitet</th>
              <th className="py-2.5 px-4 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#212125]">
            {sortedNotes.map((note) => {
              const isActive = note.id === activeNoteId;
              const isBase = note.type === "base";

              return (
                <tr
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`group cursor-pointer transition ${
                    isActive ? "bg-purple-950/20 text-purple-200" : "hover:bg-[#1c1c20]"
                  }`}
                >
                  {/* Filename Column */}
                  <td className="py-2.5 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      {isBase ? (
                        <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                      )}
                      <span className="text-purple-300 group-hover:text-purple-200 hover:underline">
                        {note.name}
                      </span>
                      {isBase && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-tight font-mono">
                          BASE
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Type Column */}
                  <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                    {note.type === "base" ? "Obsidian Base" : "Markdown (.md)"}
                  </td>

                  {/* Tags & Links */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {note.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded bg-[#27272a] text-slate-300 text-[10px] font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.links?.length > 0 && (
                        <span className="text-[10px] text-purple-400 font-mono">
                          [[{note.links.length} Links]]
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Updated Column */}
                  <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                    {note.updatedAt}
                  </td>

                  {/* Action Column */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNote(note.id);
                        }}
                        className="p-1 hover:bg-[#2c2c32] text-slate-400 hover:text-slate-200 rounded transition"
                        title="Öffnen"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                        }}
                        className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition"
                        title="Löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
