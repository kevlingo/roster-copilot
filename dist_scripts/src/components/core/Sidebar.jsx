import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCircle, Trophy, Brain, } from 'lucide-react';
var NavItem = function (_a) {
    var href = _a.href, icon = _a.icon, text = _a.text, active = _a.active;
    return (<Link href={href} className={"flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ".concat(active
            ? 'bg-primary text-primary-content'
            : 'hover:bg-base-200')}>
      <div className="w-5 h-5">{icon}</div>
      <span className="font-medium">{text}</span>
    </Link>);
};
var Sidebar = function (_a) {
    var currentLeagueId = _a.currentLeagueId;
    var pathname = usePathname();
    // Fallback to first league route if no league is selected
    var leagueId = currentLeagueId || 'default';
    var navItems = [
        {
            href: '/dashboard',
            icon: <LayoutDashboard size={20}/>,
            text: 'Dashboard',
            active: pathname === '/dashboard'
        },
        {
            href: "/league/".concat(leagueId, "/roster"),
            icon: <UserCircle size={20}/>,
            text: 'My Team',
            active: pathname.includes("/league/".concat(leagueId, "/roster"))
        },
        {
            href: "/league/".concat(leagueId, "/waivers"),
            icon: <Users size={20}/>,
            text: 'Players',
            active: pathname.includes("/league/".concat(leagueId, "/waivers"))
        },
        {
            href: "/league/".concat(leagueId, "/standings"),
            icon: <Trophy size={20}/>,
            text: 'League',
            active: pathname.includes("/league/".concat(leagueId, "/standings"))
        },
        {
            href: '/copilot/digest',
            icon: <Brain size={20}/>,
            text: 'AI Copilot Hub',
            active: pathname.includes('/copilot/digest')
        },
    ];
    return (<aside className="w-64 h-full bg-base-100 border-r border-base-300 flex flex-col">
      <div className="p-4 border-b border-base-300">
        <h1 className="text-xl font-bold">Roster Copilot</h1>
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(function (item) { return (<NavItem key={item.href} href={item.href} icon={item.icon} text={item.text} active={item.active}/>); })}
      </nav>
      
      <div className="p-4 border-t border-base-300">
        <div className="text-sm text-base-content/70">
          <p>Hackathon PoC</p>
        </div>
      </div>
    </aside>);
};
export default Sidebar;
