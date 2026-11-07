interface SiteHeaderProps {
  onLogoClick?: () => void
}

export function SiteHeader({ onLogoClick }: SiteHeaderProps) {
  return (
    <header className="brand-gradient sticky top-0 z-30 shadow-md shadow-brand/20">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <button type="button" onClick={onLogoClick} className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="SheSTEM 2026 — inicio">
          <img src="/brand/logo-shestem-sm.png" alt="SheSTEM 2026" className="h-7 w-auto sm:h-8" width={369} height={84} />
        </button>
        <span className="hidden text-sm font-medium text-white/85 sm:block">Generador de flyers</span>
      </div>
    </header>
  )
}
