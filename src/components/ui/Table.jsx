// src/components/ui/Table.jsx
import { useState, useMemo } from 'react';
import './Table.css';

export default function Table({
  columns = [],
  data = [],
  itemsPerPage = 10,
  loading = false,
  selectable = false,
  selectedRows = [],
  onRowSelect,
  onRowClick,
  emptyMessage = "No data available",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const tableData = Array.isArray(data) ? data : [];

  // Sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return tableData;
    return [...tableData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tableData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Select all
  const handleSelectAll = () => {
    if (!onRowSelect) return;
    const currentPageIds = paginatedData.map(row => row.id || row._id);
    if (selectedRows.length === currentPageIds.length) {
      onRowSelect([]);
    } else {
      onRowSelect(currentPageIds);
    }
  };

  const allSelected = paginatedData.length > 0 &&
    paginatedData.every(row => selectedRows.includes(row.id || row._id));

  // Loading state
  if (loading) {
    return (
      <div className="hospital-table-loading">
        <div className="hospital-table-spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  // Empty state
  if (!tableData.length) {
    return (
      <div className="hospital-table-empty">
        <div className="hospital-table-empty-icon">📋</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="hospital-table-wrapper">
      <div className="hospital-table-container">
        <table className="hospital-table">
          <thead>
            <tr>
              {selectable && (
                <th className="hospital-table-checkbox">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`hospital-table-header ${sortConfig.key === column.key ? 'sorted' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="hospital-table-header-content">
                    {column.label}
                    {column.sortable && (
                      <span className="hospital-table-sort-icon">
                        {sortConfig.key === column.key
                          ? (sortConfig.direction === 'asc' ? '▲' : '▼')
                          : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {columns.some(col => col.actions) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={row.id || row._id || index}
                className={`hospital-table-row ${selectedRows.includes(row.id || row._id) ? 'selected' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {selectable && (
                  <td className="hospital-table-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id || row._id)}
                      onChange={() => {
                        if (!onRowSelect) return;
                        if (selectedRows.includes(row.id || row._id)) {
                          onRowSelect(selectedRows.filter(id => id !== (row.id || row._id)));
                        } else {
                          onRowSelect([...selectedRows, row.id || row._id]);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${index + 1}`}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="hospital-table-cell">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {columns.some(col => col.actions) && (
                  <td className="hospital-table-actions">
                    {(() => {
                      const actionsCol = columns.find(col => col.actions);
                      const actions = typeof actionsCol.actions === 'function'
                        ? actionsCol.actions(row)
                        : actionsCol.actions;
                      return (actions || []).map((action, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className={`hospital-table-action hospital-table-action--${typeof action.variant === 'function' ? action.variant(row) : action.variant || 'primary'}`}
                          aria-label={typeof action.label === 'function' ? action.label(row) : action.label}
                        >
                          {action.icon || (typeof action.label === 'function' ? action.label(row) : action.label)}
                        </button>
                      ));
                    })()}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="hospital-table-pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="hospital-table-pagination-btn"
            aria-label="Previous page"
          >
            ‹
          </button>

          <div className="hospital-table-pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`hospital-table-pagination-page ${currentPage === page ? 'active' : ''}`}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="hospital-table-pagination-btn"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
