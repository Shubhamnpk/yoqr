"use client";

import { useState, useEffect } from 'react';
import { Download, Trash2, Clock, Filter, Search, X, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { QRCodeResult } from '@/types/qr-types';
import { getQRTypeIcon } from '@/lib/qr-type-config';

interface HistoryPanelProps {
  history: QRCodeResult[];
  currentFilter: string;
  setCurrentFilter: (filter: string) => void;
  onSelectItem: (item: QRCodeResult) => void;
  onClearHistory: () => void;
  onExportCSV: () => void;
}

export default function HistoryPanel({
  history,
  currentFilter,
  setCurrentFilter,
  onSelectItem,
  onClearHistory,
  onExportCSV
}: HistoryPanelProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupedHistory, setGroupedHistory] = useState<{[key: string]: QRCodeResult[]}>({});

  // Filter types with icons
  const filterTypes = [
    { id: 'all', label: 'All', icon: <Clock className="h-4 w-4" /> },
    { id: 'url', label: 'URLs', icon: getQRTypeIcon('url') },
    { id: 'wifi', label: 'WiFi', icon: getQRTypeIcon('wifi') },
    { id: 'email', label: 'Email', icon: getQRTypeIcon('email') },
    { id: 'phone', label: 'Phone', icon: getQRTypeIcon('phone') },
    { id: 'text', label: 'Text', icon: getQRTypeIcon('text') }
  ];

  // Group history by date
  useEffect(() => {
    const grouped = history.reduce((acc: {[key: string]: QRCodeResult[]}, item) => {
      // Extract date part from timestamp
      const date = item.timestamp.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
    
    setGroupedHistory(grouped);
  }, [history]);

  // Filter and search history
  const filteredHistory = history
    .filter(item => {
      // Apply type filter
      const typeMatch = currentFilter === 'all' || item.type === currentFilter;
      
      // Apply search filter if query exists
      const searchMatch = !searchQuery || 
        item.data.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase());
        
      return typeMatch && searchMatch;
    });
    
  // Sort filtered history by timestamp (newest first)
  const sortedFilteredHistory = [...filteredHistory].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="= bg-card/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 h-full border border-border/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Scan History
        </h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {filteredHistory.length} items
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter by type</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search in history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background/50 pl-9 pr-9 py-2 h-9 text-sm"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Filter options */}
      {showFilters && (
        <div className="mb-4 bg-background/30 p-2 rounded-lg border border-border/50">
          <div className="flex flex-wrap gap-2">
            {filterTypes.map(filter => (
              <Button
                key={filter.id}
                variant={currentFilter === filter.id ? "default" : "outline"}
                size="sm"
                className={`text-xs py-1 h-8 ${currentFilter === filter.id ? 'bg-primary text-primary-foreground' : 'bg-background/50'}`}
                onClick={() => setCurrentFilter(filter.id)}
              >
                <span className="mr-1.5">{filter.icon}</span>
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* History list */}
      <div className="overflow-y-auto max-h-[calc(100vh-20rem)] mb-4 custom-scrollbar pr-1">
        {sortedFilteredHistory.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-background/30 rounded-lg border border-border/30 flex flex-col items-center">
            <Clock className="h-12 w-12 mb-3 opacity-40" />
            {searchQuery 
              ? 'No results match your search'
              : currentFilter === 'all'
                ? 'No scan history yet'
                : `No ${currentFilter} scans found`}
          </div>
        ) : (
          <div>
            {Object.entries(groupedHistory)
              .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([date, items]) => {
                // Only show date group if it has items that match the current filter/search
                const filteredItems = items.filter(item => {
                  const typeMatch = currentFilter === 'all' || item.type === currentFilter;
                  const searchMatch = !searchQuery || 
                    item.data.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.type.toLowerCase().includes(searchQuery.toLowerCase());
                  return typeMatch && searchMatch;
                });
                
                if (filteredItems.length === 0) return null;
                
                return (
                  <div key={date} className="mb-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h3 className="text-sm font-medium text-muted-foreground">{date}</h3>
                    </div>
                    <ul className="space-y-2">
                      {filteredItems.map(item => (
                        <li
                          key={item.id}
                          onClick={() => onSelectItem(item)}
                          className="bg-background/50 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-background/70 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center">
                            <div 
                              className={`qr-type-icon qr-type-${item.type} w-10 h-10 flex items-center justify-center rounded-lg mr-3 transition-all group-hover:scale-110`}
                              style={{backgroundColor: `hsla(${getTypeColor(item.type)}, 0.2)`, color: `hsl(${getTypeColor(item.type)})`}}
                            >
                              {getQRTypeIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{item.data}</p>
                              <p className="text-xs text-muted-foreground">{item.timestamp.split(' ')[1]}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex space-x-2 pt-4 border-t border-border/50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                className="flex-1 justify-center bg-red-500/90 hover:bg-red-600 text-white"
                onClick={onClearHistory}
                disabled={history.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete all scan history</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                className="flex-1 justify-center bg-primary/10 hover:bg-primary/20 text-primary"
                onClick={onExportCSV}
                disabled={history.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download scan history as CSV file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// Helper function to get color based on QR type
function getTypeColor(type: string): string {
  switch(type) {
    case 'url': return '220 100% 60%';
    case 'wifi': return '140 100% 40%';
    case 'email': return '330 100% 60%';
    case 'phone': return '30 100% 50%';
    case 'sms': return '280 100% 60%';
    case 'geo': return '0 100% 60%';
    case 'calendar': return '160 100% 40%';
    default: return '220 10% 60%';
  }
}