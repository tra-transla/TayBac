import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Newspaper, 
  FileText, 
  LogOut, 
  User,
  Menu,
  X,
  ChevronRight,
  Navigation,
  MapPin,
  Tags
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: MapPin, label: 'Điểm đến', path: '/admin/tours' },
    { icon: Tags, label: 'Danh mục', path: '/admin/categories' },
    { icon: Newspaper, label: 'Tin tức', path: '/admin/news' },
    { icon: FileText, label: 'Bài viết', path: '/admin/posts' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-100 transition-transform duration-300 lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">ADMIN</h1>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Tây Bắc Tourist</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all group",
                  location.pathname === item.path 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  location.pathname === item.path ? "text-emerald-600" : "text-stone-400 group-hover:text-stone-600"
                )} />
                {item.label}
                {location.pathname === item.path && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-stone-50">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all group"
            >
              <LogOut className="w-5 h-5 text-stone-400 group-hover:text-red-500" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-stone-100 px-8 flex items-center justify-between sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-stone-50 rounded-xl lg:hidden"
          >
            {isSidebarOpen ? <X className="w-6 h-6 text-stone-500" /> : <Menu className="w-6 h-6 text-stone-500" />}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-stone-900">Admin User</p>
              <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 border border-stone-200">
              <User className="w-6 h-6" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
