import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Newspaper, 
  FileText, 
  Users, 
  Eye,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MapPin,
  Tags
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    newsCount: 0,
    postsCount: 0,
    toursCount: 0,
    categoriesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [newsRes, postsRes, toursRes, categoriesRes] = await Promise.all([
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('tours').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        newsCount: newsRes.count || 0,
        postsCount: postsRes.count || 0,
        toursCount: toursRes.count || 0,
        categoriesCount: categoriesRes.count || 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cards = [
    { label: 'Tổng điểm đến', value: stats.toursCount, icon: MapPin, color: 'bg-emerald-600', trend: '+4' },
    { label: 'Tổng danh mục', value: stats.categoriesCount, icon: Tags, color: 'bg-indigo-500', trend: '+2' },
    { label: 'Tổng tin tức', value: stats.newsCount, icon: Newspaper, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Tổng bài viết', value: stats.postsCount, icon: FileText, color: 'bg-purple-500', trend: '+5%' },
  ];

  return (
    <div className="p-8">
      <div className="mb-10">
        <h2 className="text-3xl font-serif font-bold text-stone-900">Chào mừng trở lại!</h2>
        <p className="text-stone-500 mt-1">Đây là tổng quan về hoạt động quản lý du lịch Tây Bắc.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl text-white shadow-lg", card.color)}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {card.trend}
              </span>
            </div>
            <h3 className="text-stone-500 text-sm font-semibold mb-1">{card.label}</h3>
            <p className="text-3xl font-bold text-stone-900">{loading ? '...' : card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-stone-900">Hoạt động gần đây</h3>
            <button className="text-emerald-600 text-sm font-bold flex items-center gap-1">
              Xem tất cả <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-stone-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Admin đã cập nhật bài viết "Nhà tù Sơn La"</p>
                  <p className="text-xs text-stone-400 mt-1">2 giờ trước • Quản lý bài viết</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-900 p-8 rounded-[2rem] text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-bold mb-4">Mẹo quản trị</h3>
            <p className="text-stone-400 leading-relaxed mb-6">
              Hãy thường xuyên cập nhật hình ảnh chất lượng cao và nội dung mô tả chi tiết để thu hút nhiều du khách khám phá tour ảo hơn.
            </p>
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition-all">
              Tìm hiểu thêm
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
