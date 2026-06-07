export function PageBg({ src, hero = false }: { src: string; hero?: boolean }) {
  return (
    <>
      <div
        className="page-bg-img"
        style={{ backgroundImage: `url(${src})` }}
      />
      <div
        className="page-bg-overlay"
        style={hero ? { background: 'var(--hero-overlay)', backdropFilter: 'none' } : undefined}
      />
    </>
  )
}
