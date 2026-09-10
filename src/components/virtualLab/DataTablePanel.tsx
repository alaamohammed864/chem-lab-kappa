// Laboratory Data Table Panel
// Displays live recorded points from simulations with search, sorting, and CSV export.

import React, { useState } from 'react';
import { Table, Download, Trash2, Search, Filter } from 'lucide-react';
import { TableColumnDefinition, SimulationDataPoint } from '../../engines/simulation';

interface DataTablePanelProps {
  columns: TableColumnDefinition[];
  dataPoints: SimulationDataPoint[];
  onClearData?: () => void;
  isArabic?: boolean;
}

export const DataTablePanel: React.FC<DataTablePanelProps> = ({
  columns,
  dataPoints,
  onClearData,
  isArabic = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter rows based on search term
  const filteredPoints = dataPoints.filter((dp) => {
    if (!searchTerm) return true;
    return Object.values(dp.values).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Export data points as CSV
  const handleExportCSV = () => {
    if (dataPoints.length === 0) return;
    const headerRow = columns.map((col) => `"${col.label}${col.unit ? ` (${col.unit})` : ''}"`).join(',');
    const rows = dataPoints.map((dp) => {
      return columns
        .map((col) => {
          const val = dp.values[col.key];
          return typeof val === 'number' && col.precision !== undefined
            ? val.toFixed(col.precision)
            : `"${val ?? ''}"`;
        })
        .join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `virtual_lab_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-[#0d1622] border border-[#18293d] rounded-xl p-3.5 space-y-3 shadow-md">
      {/* Header with Search & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#18293d] pb-2">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isArabic ? 'جدول البيانات والقياسات' : 'Experimental Data Table'}
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#132030] text-slate-400">
            {dataPoints.length} {isArabic ? 'صفوف' : 'rows'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
            <input
              type="text"
              placeholder={isArabic ? 'بحث...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pr-2 py-1 text-xs bg-[#121f2d] border border-[#223750] rounded text-slate-200 focus:outline-none focus:border-cyan-500 w-28 sm:w-36"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={dataPoints.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#132030] text-cyan-400 hover:text-cyan-300 hover:bg-[#1b2e45] border border-[#223750] text-xs font-medium transition cursor-pointer disabled:opacity-40"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          {/* Clear */}
          {onClearData && dataPoints.length > 0 && (
            <button
              onClick={onClearData}
              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-[#152436] transition cursor-pointer"
              title="Clear Data Table"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-60 scrollbar-thin border border-[#142334] rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#09111a] text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-[#142334]">
            <tr>
              <th className="py-2 px-3">#</th>
              {columns.map((col) => (
                <th key={col.key} className="py-2 px-3">
                  {isArabic && col.labelAr ? col.labelAr : col.label}
                  {col.unit && <span className="text-slate-500 ml-1">({col.unit})</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#142334] font-mono text-[11px] text-slate-300">
            {filteredPoints.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-8 text-center text-slate-500 italic font-sans"
                >
                  {isArabic
                    ? 'لا توجد بيانات مسجلة. قم بتشغيل التجربة لتسجيل نقاط القياس.'
                    : 'No data recorded yet. Run the simulation to populate points.'}
                </td>
              </tr>
            ) : (
              filteredPoints.map((dp, idx) => (
                <tr key={dp.id || idx} className="hover:bg-[#132030]/60 transition">
                  <td className="py-1.5 px-3 text-slate-500">{idx + 1}</td>
                  {columns.map((col) => {
                    const rawVal = dp.values[col.key];
                    const displayVal =
                      typeof rawVal === 'number' && col.precision !== undefined
                        ? rawVal.toFixed(col.precision)
                        : rawVal ?? '—';
                    return (
                      <td key={col.key} className="py-1.5 px-3">
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
