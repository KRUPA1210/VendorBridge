import React from 'react';

interface Column<T> {
  header: string;
  render: (item: T, idx: number) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  id: string;
  data: T[];
  columns: Column<T>[];
  emptyState?: React.ReactNode;
}

export default function DataTable<T>({ id, data, columns, emptyState }: DataTableProps<T>) {
  return (
    <div id={id} className="w-full overflow-x-auto border border-[#F1F5F9] rounded-xl bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3.5 px-5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 px-6 text-center">
                {emptyState || <p className="text-sm text-[#94A3B8]">No data records found</p>}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-[#F8FAFC]/50 transition-colors"
                style={{ contentVisibility: 'auto' }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-4 px-5 text-[13px] text-[#374151] font-sans ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.render(item, rowIdx)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
