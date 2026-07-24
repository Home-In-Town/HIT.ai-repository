"use client";

import Image from "next/image";
import { FaArrowRight, FaMicrophone } from "react-icons/fa";

interface CategoryTab {
  name: string;
  icon: string;
}

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  categoryTabs: CategoryTab[];
  activeCategory: string;
  onCategoryChange: (name: string) => void;
  onDirectionsClick: () => void;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onSearch,
  categoryTabs,
  activeCategory,
  onCategoryChange,
  onDirectionsClick,
}: SearchBarProps) {
  return (
    <div className="absolute top-0 left-0 z-10 p-3 max-w-[420px]">
      {/* Logo */}
      <div className="mb-2">
        <Image
          alt="HomeInTown Logo"
          width={100}
          height={40}
          className="max-h-[36px] w-auto"
          src="/new_logo.png"
          priority
        />
      </div>

      {/* Search Input */}
      <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-lg border border-gray-100">
        <input
          type="text"
          placeholder="Search Area, City, Town"
          className="flex-grow bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <FaArrowRight
          className="text-gray-400 mr-2 cursor-pointer hover:text-blue-600 transition"
          size={14}
          onClick={onSearch}
        />
        <button aria-label="Voice search">
          <FaMicrophone
            className="text-gray-400 hover:text-blue-600 transition"
            size={14}
          />
        </button>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
        {categoryTabs.map((tab, index) => (
          <button
            key={`cat-${index}-${tab.name}`}
            onClick={() => onCategoryChange(tab.name)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeCategory === tab.name
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
        <button
          onClick={onDirectionsClick}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:border-orange-300 transition"
          title="Get Directions"
        >
          <span>🧭</span>
        </button>
      </div>
    </div>
  );
}
