"use client";

import { useState } from "react";
import { IncompleteProperty, buildPartialProperty, ProjectProperty } from "@/lib/mapProject";

interface IncompletePanelProps {
  show: boolean;
  items: IncompleteProperty[];
  onClose: () => void;
  onSelect: (property: ProjectProperty) => void;
}

export default function IncompletePanel({
  show,
  items,
  onClose,
  onSelect,
}: IncompletePanelProps) {
  const [search, setSearch] = useState("");

  if (!show) return null;

  const filtered = items.filter((item) =>
    search ? item.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="absolute bottom-32 right-16 z-20 w-[340px] bg-white rounded-xl shadow-2xl overflow-hidden border border-amber-200">
      <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <h4 className="text-xs font-bold text-amber-800">
            {items.length} Properties Not on Map
          </h4>
        </div>
        <button
          onClick={onClose}
          className="text-amber-600 hover:text-amber-800 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="px-3 py-2 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search properties..."
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-amber-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="max-h-[280px] overflow-y-auto">
        {filtered.map((item, i) => (
          <div
            key={`incomplete-${i}`}
            className="px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-amber-50/50 cursor-pointer transition"
            onClick={() => {
              onSelect(buildPartialProperty(item.data));
              onClose();
            }}
          >
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </p>
            <p className="text-[11px] text-red-500 mt-0.5">{item.reason}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-gray-400">
            No results
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t">
        <p className="text-[10px] text-gray-500">
          Fix: Add latitude & longitude or use full Google Maps URL (not short
          links)
        </p>
      </div>
    </div>
  );
}
