"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  loading 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Show 5 page numbers at a time
    
    if (totalPages <= showPages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range if at start or end
      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add page numbers
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1rem",
      background: "#f9fafb",
      borderRadius: "0.5rem",
      border: "1px solid #e5e7eb",
      marginTop: "1rem"
    }}>
      {/* Items info */}
      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> items
      </div>

      {/* Page controls */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          style={{
            padding: "0.5rem 0.75rem",
            background: currentPage === 1 || loading ? "#e5e7eb" : "white",
            color: currentPage === 1 || loading ? "#9ca3af" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            cursor: currentPage === 1 || loading ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
            fontWeight: "500"
          }}
        >
          ← Previous
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} style={{ padding: "0.5rem", color: "#9ca3af" }}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              disabled={loading}
              style={{
                padding: "0.5rem 0.75rem",
                background: currentPage === page ? "#3b82f6" : "white",
                color: currentPage === page ? "white" : "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: currentPage === page ? "600" : "400",
                minWidth: "40px"
              }}
            >
              {page}
            </button>
          )
        ))}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          style={{
            padding: "0.5rem 0.75rem",
            background: currentPage === totalPages || loading ? "#e5e7eb" : "white",
            color: currentPage === totalPages || loading ? "#9ca3af" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            cursor: currentPage === totalPages || loading ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
            fontWeight: "500"
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
