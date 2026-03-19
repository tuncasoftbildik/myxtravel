'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface SidebarProps {
  title: string
  subtitle?: string
  navItems: NavItem[]
  accentColor?: string
}

export function Sidebar({ title, subtitle, navItems, accentColor = '#2563eb' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Logo / Başlık */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div
          className="text-lg font-bold truncate"
          style={{ color: accentColor }}
        >
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Alt bilgi */}
      <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-500">
        XTurizm v0.1
      </div>
    </aside>
  )
}
