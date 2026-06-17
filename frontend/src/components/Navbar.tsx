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
          <img 
            src="/logo.jpg" 
            alt="PDR-Edits Logo" 
            className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-orange-500/20 border border-orange-500/20 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="bg-gradient-to-r from-amber-100 via-orange-200 to-blue-200 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            PDR Edits Auto Video
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              pathname === '/'
                ? 'bg-slate-900 text-orange-400'
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
                ? 'bg-slate-900 text-orange-400'
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
