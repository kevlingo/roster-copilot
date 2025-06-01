import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Trophy,
  Brain,
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, text, active }) => {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-primary text-primary-content' 
        : 'hover:bg-base-200'
    }`}>
      <div className="w-5 h-5">{icon}</div>
      <span className="font-medium">{text}</span>
    </Link>
  );
};

interface SidebarProps {
  currentLeagueId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentLeagueId }) => {
  const pathname = usePathname();
  
  // Fallback to first league route if no league is selected
  const leagueId = currentLeagueId || 'default';
  
  const navItems = [
    { 
      href: '/dashboard', 
      icon: <LayoutDashboard size={20} />, 
      text: 'Dashboard',
      active: pathname === '/dashboard'
    },
    { 
      href: `/league/${leagueId}/roster`, 
      icon: <UserCircle size={20} />, 
      text: 'My Team',
      active: pathname.includes(`/league/${leagueId}/roster`)
    },
    { 
      href: `/league/${leagueId}/waivers`, 
      icon: <Users size={20} />, 
      text: 'Players',
      active: pathname.includes(`/league/${leagueId}/waivers`)
    },
    { 
      href: `/league/${leagueId}/standings`, 
      icon: <Trophy size={20} />, 
      text: 'League',
      active: pathname.includes(`/league/${leagueId}/standings`)
    },
    { 
      href: '/copilot/digest', 
      icon: <Brain size={20} />, 
      text: 'AI Copilot Hub',
      active: pathname.includes('/copilot/digest')
    },
  ];

  return (
    <aside className="w-64 h-full bg-base-100 border-r border-base-300 flex flex-col">
      <div className="p-4 border-b border-base-300">
        <h1 className="text-xl font-bold">Roster Copilot</h1>
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem 
            key={item.href}
            href={item.href}
            icon={item.icon}
            text={item.text}
            active={item.active}
          />
        ))}
      </nav>
      
      <div className="p-4 border-t border-base-300">
        <div className="text-sm text-base-content/70">
          <p>Hackathon PoC</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;