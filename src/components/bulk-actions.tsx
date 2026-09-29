"use client";

interface BulkActionsProps {
  selectedIds: string[];
  totalItems: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMarkSpam: () => void;
  loading?: boolean;
}

export function BulkActions({
  selectedIds,
  totalItems,
  onSelectAll,
  onDeselectAll,
  onArchive,
  onDelete,
  onMarkSpam,
  loading
}: BulkActionsProps) {
  if (totalItems === 0) return null;

  const selectedCount = selectedIds.length;
  const allSelected = selectedCount === totalItems && totalItems > 0;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.75rem 1rem",
      background: selectedCount > 0 ? "#eff6ff" : "#f9fafb",
      border: `1px solid ${selectedCount > 0 ? "#3b82f6" : "#e5e7eb"}`,
      borderRadius: "0.5rem",
      marginBottom: "1rem"
    }}>
      {/* Selection info */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <label style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: "500",
          color: "#374151"
        }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={allSelected ? onDeselectAll : onSelectAll}
            disabled={loading}
            style={{
              width: "18px",
              height: "18px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          />
          {allSelected ? `All ${totalItems} selected` : `Select All (${totalItems})`}
        </label>

        {selectedCount > 0 && (
          <>
            <div style={{
              height: "24px",
              width: "1px",
              background: "#d1d5db"
            }} />
            <span style={{ fontSize: "0.875rem", color: "#3b82f6", fontWeight: "600" }}>
              {selectedCount} selected
            </span>
            <button
              onClick={onDeselectAll}
              disabled={loading}
              style={{
                padding: "0.25rem 0.5rem",
                background: "transparent",
                color: "#6b7280",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                textDecoration: "underline"
              }}
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Bulk actions */}
      {selectedCount > 0 && (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={onArchive}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem"
            }}
          >
            📁 Archive ({selectedCount})
          </button>
          <button
            onClick={onMarkSpam}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem"
            }}
          >
            🚩 Mark Spam
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem"
            }}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}
