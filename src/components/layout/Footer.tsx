export function Footer() {
  const links = ['Principles', 'Privacy Archive', 'Apex Insights']
  return (
    <footer className="mt-auto w-full border-t border-outline-variant/50 bg-surface py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-[13px] leading-[18px] text-on-surface-variant sm:flex-row sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xl font-bold leading-7 text-on-surface">Summit</span>
          <span>© 2026 All rights reserved. Life milestone architectural system.</span>
        </div>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <a key={link} className="transition-colors hover:text-primary" href="#">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
