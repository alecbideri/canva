'use client';

import React from 'react';
import { List, Hash, Check } from 'lucide-react';

type FilterType = 'all' | 'tagged' | 'completed';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  const filters: { type: FilterType; icon: React.ReactNode; label: string }[] = [
    { type: 'all', icon: <List className="w-4 h-4" />, label: 'All' },
    { type: 'tagged', icon: <Hash className="w-4 h-4" />, label: 'Tagged' },
    { type: 'completed', icon: <Check className="w-4 h-4" />, label: 'Completed' },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
      {filters.map(({ type, icon, label }) => (
        <button
          key={type}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
            transition-all duration-200
            ${activeFilter === type
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }
          `}
          onClick={() => onFilterChange(type)}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
