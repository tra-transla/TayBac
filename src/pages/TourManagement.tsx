import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon,
  Loader2,
  MapPin,
  History,
  Trees,
  Palmtree,
  Church
} from 'lucide-react';
import { Tour, Category } from '../types/database';

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'History': return <History className="w-4 h-4" />;
    case 'Nature': return <Trees className="w-4 h-4" />;
    case 'Culture': return <Palmtree className="w-4 h-4" />;
    case 'Religion': return <Church className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

export default function TourManagement() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    vtour_url: '',
    category_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [toursRes, categoriesRes] = await Promise.all([
      supabase.from('tours').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name', { ascending: true })
    ]);
    
    if (toursRes.data) setTours(toursRes.data);
    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
      if (!formData.category_id && categoriesRes.data.length > 0) {
        setFormData(prev => ({ ...prev, category_id: categoriesRes.data[0].id }));
      }
    }
    setLoading(false);
  };

  const handleOpenModal = (item?: Tour) => {
    if (item) {
      setEditingTour(item);
      setFormData({
        name: item.name,
        description: item.description,
        image_url: item.image_url,
        vtour_url: item.vtour_url,
        category_id: item.category_id
      });
    } else {
      setEditingTour(null);
      setFormData({ 
        name: '', 
        description: '', 
        image_url: '', 
        vtour_url: '', 
        category_id: categories.length > 0 ? categories[0].id : '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingTour) {
      const { error } = await supabase
        .from('tours')
        .update(formData)
        .eq('id', editingTour.id);
      if (!error) fetchData();
    } else {
      const { error } = await supabase
        .from('tours')
        .insert([formData]);
      if (!error) fetchData();
    }

    setSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa điểm đến này?')) {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', id);
      if (!error) fetchData();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Quản lý Điểm đến</h2>
          <p className="text-stone-500">Thêm và cập nhật các tour tham quan ảo 360°</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all shadow-lg shadow-emerald-100"
        >
          <Plus className="w-5 h-5" />
          Thêm điểm đến
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden group">
              <div className="aspect-[4/3] relative bg-stone-100">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-stone-800 shadow-sm flex items-center gap-1.5">
                    <CategoryIcon category={item.categories?.name || 'Other'} />
                    {item.categories?.name || 'Chưa phân loại'}
                  </span>
                </div>
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
                <h3 className="font-bold text-lg text-stone-900 mb-2">{item.name}</h3>
                <p className="text-stone-500 text-sm line-clamp-2 mb-4">{item.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                  <a href={item.vtour_url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline text-xs flex items-center gap-1 font-semibold">
                    <ExternalLink className="w-3 h-3" /> Xem VTour
                  </a>
                </div>
              </div>
            </div>
          ))}
          {tours.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed border-stone-200">
              <p className="text-stone-400">Chưa có điểm đến nào được đăng tải.</p>
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
              <h3 className="text-xl font-bold">{editingTour ? 'Chỉnh sửa điểm đến' : 'Thêm điểm đến mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <Trash2 className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-stone-700 mb-2">Tên điểm đến</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Nhập tên..."
                    required
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-stone-700 mb-2">Danh mục</label>
                  <select 
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    required
                  >
                    <option value="" disabled>Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Mô tả</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  placeholder="Nhập mô tả ngắn..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Link ảnh đại diện</label>
                  <input 
                    type="url" 
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Link Virtual Tour (iframe)</label>
                  <input 
                    type="url" 
                    value={formData.vtour_url}
                    onChange={e => setFormData({...formData, vtour_url: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="https://..."
                    required
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
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu điểm đến'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
