import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  MoveUp,
  MoveDown,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Slide } from '../types/database';

export default function SlideManagement() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    order_index: 0,
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('slides')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (data) setSlides(data);
    setLoading(false);
  };

  const handleOpenModal = (item?: Slide) => {
    if (item) {
      setEditingSlide(item);
      setFormData({
        title: item.title || '',
        subtitle: item.subtitle || '',
        image_url: item.image_url,
        order_index: item.order_index,
        is_active: item.is_active
      });
    } else {
      setEditingSlide(null);
      setFormData({ 
        title: '', 
        subtitle: '', 
        image_url: '', 
        order_index: slides.length,
        is_active: true 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingSlide) {
      const { error } = await supabase
        .from('slides')
        .update(formData)
        .eq('id', editingSlide.id);
      if (error) {
        alert('Lỗi khi cập nhật slide: ' + error.message);
      } else {
        fetchSlides();
        setIsModalOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('slides')
        .insert([formData]);
      if (error) {
        alert('Lỗi khi thêm slide: ' + error.message);
      } else {
        fetchSlides();
        setIsModalOpen(false);
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa slide này?')) {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', id);
      if (!error) fetchSlides();
    }
  };

  const toggleActive = async (slide: Slide) => {
    const { error } = await supabase
      .from('slides')
      .update({ is_active: !slide.is_active })
      .eq('id', slide.id);
    if (!error) fetchSlides();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Quản lý Slide ảnh nền</h2>
          <p className="text-stone-500">Quản lý các hình ảnh trình chiếu tại trang chủ</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-lg shadow-emerald-100"
        >
          <Plus className="w-5 h-5" />
          Thêm Slide
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((item) => (
            <div key={item.id} className={`bg-white rounded-[2rem] border ${item.is_active ? 'border-stone-100' : 'border-red-100 opacity-75'} shadow-sm overflow-hidden group relative`}>
              <div className="aspect-video relative bg-stone-100">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
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
                <div className="absolute bottom-4 left-4">
                  <button 
                    onClick={() => toggleActive(item)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                      item.is_active ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {item.is_active ? 'Đang hiển thị' : 'Đã ẩn'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-stone-900 line-clamp-1">{item.title || 'Không có tiêu đề'}</h3>
                  <span className="text-xs font-mono text-stone-400">#{item.order_index}</span>
                </div>
                <p className="text-stone-500 text-sm line-clamp-2">{item.subtitle || 'Không có phụ đề'}</p>
              </div>
            </div>
          ))}
          {slides.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-stone-200">
              <p className="text-stone-400">Chưa có slide nào được tạo.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="text-xl font-bold">{editingSlide ? 'Chỉnh sửa Slide' : 'Thêm Slide mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <Trash2 className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-stone-700 mb-2">Link hình ảnh</label>
                  <input 
                    type="url" 
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề chính</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="VD: Hành trình Di sản"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-stone-700 mb-2">Phụ đề</label>
                  <input 
                    type="text" 
                    value={formData.subtitle}
                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="VD: Tây Bắc - Việt Nam"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-stone-700 mb-2">Thứ tự hiển thị</label>
                  <input 
                    type="number" 
                    value={formData.order_index}
                    onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="col-span-2 md:col-span-1 flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.is_active}
                      onChange={e => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-stone-700">Hiển thị slide này</span>
                  </label>
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
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
