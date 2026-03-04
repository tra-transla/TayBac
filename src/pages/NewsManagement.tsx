import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { News } from '../types/database';

export default function NewsManagement() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    link: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setNews(data);
    setLoading(false);
  };

  const handleOpenModal = (item?: News) => {
    if (item) {
      setEditingNews(item);
      setFormData({
        title: item.title,
        content: item.content,
        image_url: item.image_url,
        link: item.link
      });
    } else {
      setEditingNews(null);
      setFormData({ title: '', content: '', image_url: '', link: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingNews) {
      const { error } = await supabase
        .from('news')
        .update(formData)
        .eq('id', editingNews.id);
      if (!error) fetchNews();
    } else {
      const { error } = await supabase
        .from('news')
        .insert([formData]);
      if (!error) fetchNews();
    }

    setSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);
      if (!error) fetchNews();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Quản lý Tin tức</h2>
          <p className="text-stone-500">Cập nhật các tin tức mới nhất về du lịch Sơn La</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-lg shadow-emerald-100"
        >
          <Plus className="w-5 h-5" />
          Thêm tin mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {news.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex gap-6 items-center">
              <div className="w-32 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-stone-900 truncate">{item.title}</h3>
                <p className="text-stone-500 text-sm line-clamp-2 mt-1">{item.content}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline text-xs flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Xem bài viết
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenModal(item)}
                  className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {news.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-stone-200">
              <p className="text-stone-400">Chưa có tin tức nào được đăng tải.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingNews ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                <Trash2 className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Tiêu đề</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Nội dung tóm tắt</label>
                <textarea 
                  rows={3}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Link ảnh</label>
                  <input 
                    type="url" 
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Link bài viết</label>
                  <input 
                    type="url" 
                    value={formData.link}
                    onChange={e => setFormData({...formData, link: e.target.value})}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-stone-600 font-semibold"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2 bg-stone-900 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
