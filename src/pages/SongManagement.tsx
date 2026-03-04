import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Music,
  Loader2,
  Youtube,
  ExternalLink,
  Search
} from 'lucide-react';
import { Song } from '../types/database';

export default function SongManagement() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    youtube_url: '',
    thumbnail_url: '',
    order_index: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (data) setSongs(data);
    setLoading(false);
  };

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return '';
  };

  const handleOpenModal = (item?: Song) => {
    if (item) {
      setEditingSong(item);
      setFormData({
        title: item.title,
        artist: item.artist || '',
        youtube_url: item.youtube_url,
        thumbnail_url: item.thumbnail_url || '',
        order_index: item.order_index
      });
    } else {
      setEditingSong(null);
      setFormData({ 
        title: '', 
        artist: '', 
        youtube_url: '', 
        thumbnail_url: '',
        order_index: songs.length 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const thumbnail = formData.thumbnail_url || getYoutubeThumbnail(formData.youtube_url);
    const dataToSave = { ...formData, thumbnail_url: thumbnail };

    if (editingSong) {
      const { error } = await supabase
        .from('songs')
        .update(dataToSave)
        .eq('id', editingSong.id);
      if (error) {
        alert('Lỗi khi cập nhật bài hát: ' + error.message);
      } else {
        fetchSongs();
        setIsModalOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('songs')
        .insert([dataToSave]);
      if (error) {
        alert('Lỗi khi thêm bài hát: ' + error.message);
      } else {
        fetchSongs();
        setIsModalOpen(false);
      }
    }

    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài hát này?')) {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);
      if (!error) fetchSongs();
    }
  };

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Music className="w-6 h-6 text-emerald-600" />
            Quản lý Video nhạc Tây Bắc
          </h2>
          <p className="text-stone-500">Quản lý danh sách video âm nhạc hiển thị trên trang chủ</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-emerald-100"
        >
          <Plus className="w-5 h-5" />
          Thêm Video Nhạc
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-50 bg-stone-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm bài hát, ca sĩ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100">Video</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100">Thông tin bài hát</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100">Thứ tự</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredSongs.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-32 aspect-video rounded-lg overflow-hidden bg-stone-100 relative group/thumb">
                        <img src={item.thumbnail_url || getYoutubeThumbnail(item.youtube_url)} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                          <Youtube className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-stone-900">{item.title}</span>
                        <span className="text-sm text-stone-500">{item.artist || 'Chưa cập nhật ca sĩ'}</span>
                        <a href={item.youtube_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 mt-1">
                          {item.youtube_url} <ExternalLink className="w-2 h-2" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-stone-400">#{item.order_index}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSongs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-stone-400">
                      Chưa có video nhạc nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="text-xl font-bold">{editingSong ? 'Chỉnh sửa Video Nhạc' : 'Thêm Video Nhạc mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <Trash2 className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Tiêu đề bài hát</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="VD: Inh Lả Ơi"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Ca sĩ / Nghệ sĩ</label>
                  <input 
                    type="text" 
                    value={formData.artist}
                    onChange={e => setFormData({...formData, artist: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="VD: Nhiều nghệ sĩ"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Link Youtube</label>
                  <input 
                    type="url" 
                    value={formData.youtube_url}
                    onChange={e => setFormData({...formData, youtube_url: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Thứ tự hiển thị</label>
                    <input 
                      type="number" 
                      value={formData.order_index}
                      onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Link Thumbnail (Tùy chọn)</label>
                    <input 
                      type="url" 
                      value={formData.thumbnail_url}
                      onChange={e => setFormData({...formData, thumbnail_url: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Để trống để tự lấy từ Youtube"
                    />
                  </div>
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
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
