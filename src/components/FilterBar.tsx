import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AccountSummary, RiskLevel } from '@/types/entities';
interface FilterBarProps {
  accounts: AccountSummary[];
  onFilterChange: (filtered: AccountSummary[]) => void;
}
export function FilterBar({ accounts, onFilterChange }: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirector, setSelectedDirector] = useState<string>('all');
  const [selectedTam, setSelectedTam] = useState<string>('all');
  const [selectedCsm, setSelectedCsm] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const directors = Array.from(new Set(accounts.map(a => a.accountDirector).filter(Boolean)));
  const tams = Array.from(new Set(accounts.map(a => a.tam).filter(Boolean)));
  const csms = Array.from(new Set(accounts.map(a => a.csm).filter(Boolean)));
  const riskLevels: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low', 'None'];
  useEffect(() => {
    let filtered = [...accounts];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        a => a.subsidiaryName.toLowerCase().includes(term) || a.subsidiaryId.toLowerCase().includes(term)
      );
    }
    if (selectedDirector !== 'all') {
      filtered = filtered.filter(a => a.accountDirector === selectedDirector);
    }
    if (selectedTam !== 'all') {
      filtered = filtered.filter(a => a.tam === selectedTam);
    }
    if (selectedCsm !== 'all') {
      filtered = filtered.filter(a => a.csm === selectedCsm);
    }
    if (selectedRisk !== 'all') {
      filtered = filtered.filter(a => a.riskLevel === selectedRisk);
    }
    onFilterChange(filtered);
  }, [searchTerm, selectedDirector, selectedTam, selectedCsm, selectedRisk, accounts, onFilterChange]);
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDirector('all');
    setSelectedTam('all');
    setSelectedCsm('all');
    setSelectedRisk('all');
  };
  const hasActiveFilters = searchTerm || selectedDirector !== 'all' || selectedTam !== 'all' || selectedCsm !== 'all' || selectedRisk !== 'all';
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Account Director</label>
          <Select value={selectedDirector} onValueChange={setSelectedDirector}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Directors</SelectItem>
              {directors.map(d => (
                <SelectItem key={d} value={d!}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">TAM</label>
          <Select value={selectedTam} onValueChange={setSelectedTam}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All TAMs</SelectItem>
              {tams.map(t => (
                <SelectItem key={t} value={t!}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">CSM</label>
          <Select value={selectedCsm} onValueChange={setSelectedCsm}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All CSMs</SelectItem>
              {csms.map(c => (
                <SelectItem key={c} value={c!}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Risk Level</label>
          <Select value={selectedRisk} onValueChange={setSelectedRisk}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {riskLevels.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}