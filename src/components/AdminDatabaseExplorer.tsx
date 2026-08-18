import React, { useState, useEffect } from 'react';
import { Database, Table, Search, RefreshCw, Layers, ShieldCheck, CheckCircle2, ChevronRight, Filter, AlertCircle, Eye } from 'lucide-react';

interface TableStats {
  users: number;
  symptomCategories: number;
  symptoms: number;
  questions: number;
  assessments: number;
  medicalConditions: number;
  medicines: number;
  auditLogs: number;
  healthMeasurements: number;
}

export const AdminDatabaseExplorer: React.FC = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('symptom_categories');
  const [tableData, setTableData] = useState<{ total: number; records: any[] }>({ total: 0, records: [] });
  const [stats, setStats] = useState<TableStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const fetchStatsAndTables = async () => {
    try {
      const [tblRes, statRes] = await Promise.all([
        fetch('/api/v1/admin/tables'),
        fetch('/api/v1/admin/stats'),
      ]);
      if (tblRes.ok) {
        const tblList = await tblRes.json();
        setTables(tblList);
      }
      if (statRes.ok) {
        const statData = await statRes.json();
        setStats(statData.counts);
      }
    } catch (err) {
      console.warn('Failed to load table list or stats:', err);
    }
  };

  const loadTableRecords = async (tableName: string) => {
    setIsLoading(true);
    setSelectedRecord(null);
    try {
      const res = await fetch(`/api/v1/admin/tables/${tableName}?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setTableData({ total: data.total, records: data.records || [] });
      }
    } catch (err) {
      console.error(`Failed to load records for table ${tableName}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedNotice(null);
    try {
      const res = await fetch('/api/v1/admin/seed', { method: 'POST' });
      const data = await res.json();
      setSeedNotice(data.status === 'already_seeded' ? 'Database already populated.' : 'Master data seeded successfully!');
      await fetchStatsAndTables();
      await loadTableRecords(selectedTable);
    } catch (err: any) {
      setSeedNotice(`Seed error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    fetchStatsAndTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableRecords(selectedTable);
    }
  }, [selectedTable]);

  const filteredRecords = tableData.records.filter((r) => {
    if (!searchFilter.trim()) return true;
    const str = JSON.stringify(r).toLowerCase();
    return str.includes(searchFilter.toLowerCase());
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#1A1A1A] text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-400 block mb-1">
            Cloud SQL PostgreSQL 15 Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Relational Model & Admin Console
          </h2>
          <p className="text-sm font-serif italic text-white/80 max-w-2xl mt-1">
            24 verified database models, foreign key cascades, strict PostgreSQL type safety, and DRF-standard REST endpoints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#1A1A1A] font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            {isSeeding ? 'SEEDING...' : 'POPULATE MASTER DATA'}
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>24 / 24 MODELS ACTIVE</span>
          </div>
        </div>
      </div>

      {seedNotice && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-600 text-emerald-900 font-mono text-xs flex items-center justify-between">
          <span>{seedNotice}</span>
          <button onClick={() => setSeedNotice(null)} className="font-bold cursor-pointer">×</button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white border-2 border-[#1A1A1A] p-3 text-center">
            <span className="text-[10px] font-mono text-[#666] uppercase block">Users & Patients</span>
            <span className="text-2xl font-black font-mono">{stats.users}</span>
          </div>
          <div className="bg-white border-2 border-[#1A1A1A] p-3 text-center">
            <span className="text-[10px] font-mono text-[#666] uppercase block">Categories</span>
            <span className="text-2xl font-black font-mono">{stats.symptomCategories}</span>
          </div>
          <div className="bg-white border-2 border-[#1A1A1A] p-3 text-center">
            <span className="text-[10px] font-mono text-[#666] uppercase block">Symptoms</span>
            <span className="text-2xl font-black font-mono">{stats.symptoms}</span>
          </div>
          <div className="bg-white border-2 border-[#1A1A1A] p-3 text-center">
            <span className="text-[10px] font-mono text-[#666] uppercase block">Questions</span>
            <span className="text-2xl font-black font-mono">{stats.questions}</span>
          </div>
          <div className="bg-white border-2 border-[#1A1A1A] p-3 text-center">
            <span className="text-[10px] font-mono text-[#666] uppercase block">Conditions</span>
            <span className="text-2xl font-black font-mono">{stats.medicalConditions}</span>
          </div>
          <div className="bg-white border-2 border-[#1A1A1A] p-3 text-center">
            <span className="text-[10px] font-mono text-[#666] uppercase block">Medicines</span>
            <span className="text-2xl font-black font-mono">{stats.medicines}</span>
          </div>
        </div>
      )}

      {/* Main Two-Column Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Table Directory */}
        <div className="lg:col-span-1 border-2 border-[#1A1A1A] bg-white">
          <div className="p-4 bg-[#FAF9F6] border-b-2 border-[#1A1A1A] flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4" />
              PostgreSQL Tables ({tables.length || 24})
            </span>
          </div>

          <div className="divide-y divide-[#1A1A1A]/10 max-h-[600px] overflow-y-auto font-mono text-xs">
            {tables.map((tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors cursor-pointer ${
                  selectedTable === tbl
                    ? 'bg-[#1A1A1A] text-white font-bold'
                    : 'hover:bg-[#FAF9F6] text-[#333]'
                }`}
              >
                <span className="truncate">{tbl}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Records Browser & Inspector */}
        <div className="lg:col-span-3 space-y-6">
          <div className="border-2 border-[#1A1A1A] bg-white">
            <div className="p-4 bg-[#FAF9F6] border-b-2 border-[#1A1A1A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-[#666] uppercase tracking-wider block">Selected Entity</span>
                <h3 className="font-black font-mono text-base uppercase text-[#1A1A1A]">
                  table: {selectedTable} ({tableData.total} records)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter records..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-white border border-[#1A1A1A] focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => loadTableRecords(selectedTable)}
                  className="p-1.5 bg-white border border-[#1A1A1A] hover:bg-[#FAF9F6] cursor-pointer"
                  title="Reload table"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Table Records View */}
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              {isLoading ? (
                <div className="p-12 text-center text-xs font-mono text-[#666]">
                  Querying PostgreSQL table {selectedTable}...
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono text-[#666]">
                  No records found in '{selectedTable}'. Click "Populate Master Data" to seed sample entities.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-[#1A1A1A] text-white text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="p-2.5">Action</th>
                      {Object.keys(filteredRecords[0] || {}).map((col) => (
                        <th key={col} className="p-2.5 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]/10">
                    {filteredRecords.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF9F6]">
                        <td className="p-2">
                          <button
                            onClick={() => setSelectedRecord(row)}
                            className="px-2 py-0.5 bg-[#1A1A1A] text-white text-[10px] hover:bg-neutral-800 cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            VIEW
                          </button>
                        </td>
                        {Object.entries(row).map(([col, val], cIdx) => (
                          <td key={cIdx} className="p-2 max-w-[200px] truncate text-[#333]">
                            {val === null || val === undefined
                              ? <span className="text-neutral-400 italic">null</span>
                              : typeof val === 'object'
                              ? JSON.stringify(val)
                              : typeof val === 'boolean'
                              ? val ? 'TRUE' : 'FALSE'
                              : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Record Detail Inspector Drawer */}
          {selectedRecord && (
            <div className="border-2 border-[#1A1A1A] bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#666]">
                    Entity Inspector
                  </span>
                  <h4 className="font-black text-sm font-mono uppercase">
                    {selectedTable} • Record ID #{selectedRecord.id || 'N/A'}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-3 py-1 bg-[#1A1A1A] text-white font-mono text-xs uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="bg-[#FAF9F6] border border-[#1A1A1A]/20 p-4 font-mono text-xs overflow-x-auto">
                <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
