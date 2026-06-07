'use client'

export function PrintButton() {
  return (
    <button
      className="btn btn-primary"
      onClick={() => window.print()}
      style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}
    >
      🖨 Drucken / PDF
    </button>
  )
}
