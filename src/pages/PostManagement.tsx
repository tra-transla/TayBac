import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon,
  Loader2,
  FileText
} from 'lucide-react';
import { Post } from '../types/database';

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    external_link: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleOpenModal = (item?: Post) => {
    if (item) {
      setEditingPost(item);
      setFormData({
        title: item.title,
        content: item.content,
        image_url: item.image_url,
        external_link: item.external_link
      });
    } else {
      setEditingPost(null);
      setFormData({ title: '', content: '', image_url: '', external_link: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingPost) {
      const { error } = await supabase
        .from('posts')
        .update(formData)
        .eq('id', editingPost.id);
      if (!error) fetchPosts();
    } else {
      const { error } = await supabase
        .from('posts')
        .insert([formData]);
      if (!error) fetchPosts();
    }

    setSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      if (!error) fetchPosts();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Quản lý Bài viết</h2>
          <p className="text-stone-500">Quản lý các bài viết chi tiết về các điểm du lịch</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-lg shadow-emerald-100"
        >
          <Plus className="w-5 h-5" />
          Thêm bài viết
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden group">
              <div className="aspect-video relative bg-stone-100">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(item)}
                    className="p-2 bg-white text-stone-700 hover:text-emerald-600 rounded-xl shadow-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-white text-stone-700 hover:text-red-600 rounded-xl shadow-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-500 text-sm line-clamp-3 mb-4">{item.content}</p>
                <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                  <span className="text-xs text-stone-400 font-mono">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  {item.external_link && (
                    <a href={item.external_link} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline text-xs flex items-center gap-1 font-semibold">
                      <ExternalLink className="w-3 h-3" /> Link chi tiết
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-stone-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-50 rounded-2xl text-stone-300 mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-stone-400">Chưa có bài viết nào được đăng tải.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="text-xl font-bold">{editingPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <Trash2 className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề bài viết</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Nhập tiêu đề..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Nội dung bài viết</label>
                <textarea 
                  rows={6}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  placeholder="Nhập nội dung chi tiết..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">URL Hình ảnh</label>
                  <input 
                    type="url" 
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Link liên kết ngoài</label>
                  <input 
                    type="url" 
                    value={formData.external_link}
                    onChange={e => setFormData({...formData, external_link: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 text-stone-600 font-bold hover:text-stone-900 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-100 transition-all"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
