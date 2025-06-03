import React from 'react';
import Link from 'next/link';
import { User, LogOut, Moon, Sun } from 'lucide-react';
var Header = function (_a) {
    var _b = _a.username, username = _b === void 0 ? 'User' : _b, onLogout = _a.onLogout, onToggleTheme = _a.onToggleTheme, _c = _a.isDarkTheme, isDarkTheme = _c === void 0 ? false : _c;
    return (<header className="h-16 bg-base-100 border-b border-base-300 px-4 flex items-center justify-between">
      <div className="flex items-center md:hidden">
        <label htmlFor="drawer-toggle\" className="btn btn-square btn-ghost drawer-button">
          <svg xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24\" className="inline-block w-5 h-5 stroke-current">
            <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth="2\" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </label>
      </div>
      
      <div className="flex-1">
        {/* League selector could go here */}
      </div>
      
      <div className="flex items-center gap-2">
        <button onClick={onToggleTheme} className="btn btn-ghost btn-circle" aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}>
          {isDarkTheme ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
        
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost gap-2">
            <span className="hidden md:inline">{username}</span>
            <User size={20}/>
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <Link href="/copilot/profile">Profile</Link>
            </li>
            <li>
              <button onClick={onLogout}>
                <LogOut size={16}/>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>);
};
export default Header;
