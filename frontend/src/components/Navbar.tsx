'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Video, Settings, Film } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-105">
            <Film className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            AutoVideo
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              pathname === '/'
                ? 'bg-slate-900 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>Studio</span>
          </Link>
          
          <Link
            href="/admin"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              pathname === '/admin'
                ? 'bg-slate-900 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
