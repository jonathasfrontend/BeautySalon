'use client';

import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useRef } from 'react';
import { getInitials } from '@/lib/utils';
import { CustomLink } from '../ui/Link';
import { Button } from '../ui/Button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearch from './GlobalSearch';

export default function Header() {
  const { theme, toggleTheme } = useUIStore();
  const { user } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left Side */}
      {/* <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        > */}
        <SidebarTrigger className="hover:bg-muted transition-colors" />
      {/* </Button> */}

      <GlobalSearch />

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="icon"
          className="hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-7 h-7 text-muted-foreground" />
          ) : (
            <Sun className="w-7 h-7 text-muted-foreground" />
          )}
        </Button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Menu */}
        <CustomLink
          href="/settings/profile"
          variant="ghost"
          size="lg"
          className="px-3 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-medium text-sm">
            {user && getInitials(user.name)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-muted-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.role?.name}</p>
          </div>
        </CustomLink>
      </div>
    </header>
  );
}
