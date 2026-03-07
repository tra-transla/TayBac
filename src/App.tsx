import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ReactPlayer from 'react-player';
import { 
  MapPin, 
  Info, 
  X, 
  Maximize2, 
  ChevronRight, 
  History, 
  Trees, 
  Palmtree, 
  Church,
  ExternalLink,
  Menu,
  Navigation,
  LayoutDashboard,
  Newspaper,
  FileText,
  Calendar,
  ArrowRight,
  Eye,
  EyeOff,
  Youtube,
  Music,
  Mountain,
  Sun,
  SkipBack,
  SkipForward,
  Play,
  Pause
} from 'lucide-react';
import { TOUR_LOCATIONS, TourLocation } from './data/tours';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { News, Post } from './types/database';

// Admin Pages
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import NewsManagement from './pages/NewsManagement';
import PostManagement from './pages/PostManagement';
import TourManagement from './pages/TourManagement';
import CategoryManagement from './pages/CategoryManagement';
import SlideManagement from './pages/SlideManagement';
import SongManagement from './pages/SongManagement';
import { ProtectedRoute } from './components/ProtectedRoute';

function LandingPage() {
  const [selectedTour, setSelectedTour] = useState<any | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const Player = ReactPlayer as any;

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    
    // 1. Try standard regex for various formats
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) return match[2];
    
    // 2. Handle shorts, live, etc.
    const altMatch = url.match(/(?:shorts|live|v|embed)\/([a-zA-Z0-9_-]{11})/);
    if (altMatch) return altMatch[1];

    // 3. Handle direct ID or simple strings
    const trimmed = url.trim();
    if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) return trimmed;
    
    // 4. Fallback: try to find any 11-char string that looks like an ID
    const lastPart = trimmed.split(/[\/\=]/).pop();
    if (lastPart && lastPart.length === 11) return lastPart;

    return null;
  };

  const getYoutubeUrl = (url: string) => {
    const id = getYoutubeId(url);
    return id ? `https://www.youtube.com/watch?v=${id}` : url;
  };

  useEffect(() => {
    setIsPlayerReady(false);
    
    // Safety timeout: if player doesn't report ready within 5 seconds, 
    // assume it's ready to try and force playback
    const timer = setTimeout(() => {
      if (isPlaying) {
        setIsPlayerReady(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentSongIndex]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    async function fetchData() {
      setLoading(true);
      const [newsRes, postsRes, toursRes, categoriesRes, slidesRes, songsRes] = await Promise.all([
        supabase.from('news').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('posts').select('*, categories(name)').order('created_at', { ascending: false }).limit(4),
        supabase.from('tours').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('slides').select('*').eq('is_active', true).order('order_index', { ascending: true }),
        supabase.from('songs').select('*').order('order_index', { ascending: true })
      ]);
      
      if (newsRes.data) setNews(newsRes.data);
      if (postsRes.data) setPosts(postsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (slidesRes.data) setSlides(slidesRes.data);
      if (songsRes.data) setSongs(songsRes.data);
      
      if (toursRes.data && toursRes.data.length > 0) {
        setTours(toursRes.data);
      } else {
        // Fallback to hardcoded tours if DB is empty
        setTours(TOUR_LOCATIONS.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          image_url: t.imageUrl,
          vtour_url: t.vtourUrl,
          category: t.category
        })));
      }
      setLoading(false);
    }
    
    fetchData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    if (currentPage > 1) {
      document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  const filteredTours = filter 
    ? tours.filter(t => (t.categories?.name || t.category) === filter)
    : tours;

  const totalPages = Math.ceil(filteredTours.length / ITEMS_PER_PAGE);
  const paginatedTours = filteredTours.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "glass shadow-sm py-3" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="https://iili.io/qCZnJef.png" 
              alt="Tây Bắc Tourist Logo" 
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to icons if image is missing
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="logo-fallback hidden relative w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 overflow-hidden">
              <Sun className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 opacity-50" />
              <Mountain className="w-6 h-6 relative z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-blue-500/30" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none uppercase">TÂY BẮC TOURIST</h1>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Virtual Tours</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setFilter(filter === cat.name ? null : cat.name)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-emerald-600",
                    filter === cat.name ? "text-emerald-600" : "text-stone-600"
                  )}
                >
                  {cat.name}
                </button>
              ))
            ) : (
              ['Lịch sử', 'Thiên nhiên', 'Văn hóa', 'Tôn giáo'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setFilter(filter === cat ? null : cat)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-emerald-600",
                    filter === cat ? "text-emerald-600" : "text-stone-600"
                  )}
                >
                  {cat}
                </button>
              ))
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600"
              title="Admin Login"
            >
              <LayoutDashboard className="w-6 h-6" />
            </Link>
            <button className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <Menu className="w-6 h-6 text-stone-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            {slides.length > 0 ? (
              <motion.div
                key={slides[currentSlide].id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={slides[currentSlide].image_url} 
                  alt={slides[currentSlide].title || "Tây Bắc Landscape"} 
                  className="w-full h-full object-cover brightness-50"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ) : (
              <img 
                src="https://picsum.photos/seed/sonla-hero/1920/1080" 
                alt="Tây Bắc Landscape" 
                className="w-full h-full object-cover brightness-50"
                referrerPolicy="no-referrer"
              />
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-stone-50" />
        </div>

        <div className="relative z-10 max-w-4xl px-6 text-center">
          <motion.div
            key={slides.length > 0 ? slides[currentSlide].id : 'default'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm border border-emerald-500/30">
              Khám phá vùng đất Tây Bắc
            </span>
            <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
              {slides.length > 0 && slides[currentSlide].title ? (
                <span dangerouslySetInnerHTML={{ __html: slides[currentSlide].title.replace(/\n/g, '<br />') }} />
              ) : (
                <>Hành trình Di sản <br /><span className="italic">Tây Bắc - Việt Nam</span></>
              )}
            </h2>
            <p className="text-lg text-stone-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              {slides.length > 0 && slides[currentSlide].subtitle ? slides[currentSlide].subtitle : "Trải nghiệm vẻ đẹp hùng vĩ của núi rừng, chiều sâu lịch sử và bản sắc văn hóa độc đáo qua công nghệ tham quan ảo 360 độ."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-2 group"
              >
                Bắt đầu khám phá
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "w-12 h-1 rounded-full transition-all duration-500",
                  currentSlide === idx ? "bg-emerald-500" : "bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* Tours Grid */}
      <section id="tours" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h3 className="text-3xl font-serif mb-2">Điểm Đến Nổi Bật</h3>
            <p className="text-stone-500">Chọn một địa danh để bắt đầu chuyến tham quan ảo</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setFilter(null)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                filter === null ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
              )}
            >
              Tất cả
            </button>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setFilter(filter === cat.name ? null : cat.name)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                    filter === cat.name ? "bg-emerald-600 text-white" : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
                  )}
                >
                  <CategoryIcon category={cat.name} />
                  {cat.name}
                </button>
              ))
            ) : (
              ['Lịch sử', 'Thiên nhiên', 'Văn hóa', 'Tôn giáo'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setFilter(filter === cat ? null : cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                    filter === cat ? "bg-emerald-600 text-white" : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
                  )}
                >
                  <CategoryIcon category={cat} />
                  {cat}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedTours.map((tour, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              key={tour.id}
              className="group cursor-pointer"
              onClick={() => setSelectedTour(tour)}
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-4 shadow-lg shadow-stone-200">
                <img 
                  src={tour.image_url || tour.imageUrl} 
                  alt={tour.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="text-white flex items-center gap-2 font-medium">
                    <Maximize2 className="w-5 h-5" />
                    Xem 360° Tour
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-stone-800 shadow-sm flex items-center gap-1.5">
                    <CategoryIcon category={tour.categories?.name || tour.category} />
                    {tour.categories?.name || tour.category}
                  </span>
                </div>
              </div>
              <h4 className="text-xl font-bold mb-2 group-hover:text-emerald-700 transition-colors">{tour.name}</h4>
              <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed">{tour.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-stone-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                    currentPage === page 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                      : "text-stone-500 hover:bg-stone-100"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-stone-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* News Section */}
      {news.length > 0 && (
        <section className="bg-stone-100 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-3xl font-serif mb-2">Tin Tức Mới Nhất</h3>
                <p className="text-stone-500 text-sm">Cập nhật những thông tin mới nhất về du lịch Tây Bắc</p>
              </div>
              <Newspaper className="w-10 h-10 text-stone-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image_url || 'https://picsum.photos/seed/news/800/600'} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString('vi-VN')}
                    </div>
                    <h4 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-stone-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                      {item.content}
                    </p>
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm hover:gap-3 transition-all"
                      >
                        Đọc thêm <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts Section */}
      {posts.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-3xl font-serif mb-2">Bài Viết Khám Phá</h3>
                <p className="text-stone-500 text-sm">Những chia sẻ chi tiết về hành trình trải nghiệm</p>
              </div>
              <FileText className="w-10 h-10 text-stone-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post, index) => (
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  key={post.id}
                  className="flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden border border-stone-100 group hover:shadow-lg transition-all"
                >
                  <div className="md:w-2/5 aspect-square md:aspect-auto overflow-hidden">
                    <img 
                      src={post.image_url || 'https://picsum.photos/seed/post/800/600'} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="md:w-3/5 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {post.categories?.name || 'Khám phá'}
                      </span>
                      <div className="w-1 h-1 bg-stone-300 rounded-full" />
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                        {new Date(post.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold mb-4 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-stone-500 text-sm line-clamp-4 mb-6 leading-relaxed">
                      {post.content}
                    </p>
                    {post.external_link && (
                      <a 
                        href={post.external_link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-stone-900 font-bold text-sm flex items-center gap-2 hover:text-emerald-600 transition-colors"
                      >
                        Xem chi tiết <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
{/* Music Videos Section */}
      {songs.length > 0 && (
        <section className="py-24 bg-stone-50 text-stone-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-emerald-600 text-3xl md:text-4xl font-serif font-bold uppercase tracking-[0.2em] mb-3">Âm vang núi rừng</h2>
                <div className="h-1 w-20 bg-emerald-600 rounded-full" />
              </div>
              <p className="text-stone-500 text-sm max-w-md leading-relaxed">
                Lắng nghe những giai điệu đậm chất đại ngàn, hòa mình vào không gian văn hóa đặc sắc của các dân tộc vùng cao.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row bg-white border border-stone-200 overflow-hidden rounded-[2.5rem] shadow-xl h-[600px]">
              {/* Sidebar (Left) */}
              <div className="lg:w-96 flex flex-col border-r border-stone-100 bg-stone-50/30">
                <div className="p-8 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold text-stone-900">Music Player</h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      {songs.length} TRACKS
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">YOUR PLAYLIST</p>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
                  {songs.map((song, index) => (
                    <button
                      key={song.id}
                      onClick={() => {
                        setCurrentSongIndex(index);
                        setIsPlayerReady(false);
                        setIsPlaying(true);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left mb-2 group",
                        currentSongIndex === index 
                          ? "bg-emerald-50 text-emerald-700" 
                          : "hover:bg-stone-100 text-stone-500 hover:text-stone-900"
                      )}
                    >
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-stone-100">
                        <img 
                          src={song.thumbnail_url || (getYoutubeId(song.youtube_url) ? `https://img.youtube.com/vi/${getYoutubeId(song.youtube_url)}/mqdefault.jpg` : '')} 
                          alt={song.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {currentSongIndex === index && isPlaying && (
                          <div className="absolute inset-0 bg-emerald-600/10 flex items-center justify-center">
                            <Music className="w-5 h-5 text-emerald-600 animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "text-[13px] font-bold truncate leading-tight mb-1",
                          currentSongIndex === index ? "text-stone-900" : ""
                        )}>{song.title}</h4>
                        <p className="text-stone-400 text-[10px] truncate uppercase tracking-widest font-medium">{song.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Now Playing Bar (Bottom Left) */}
                <div className="p-6 bg-white border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                  <div className="mb-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">NOW PLAYING</p>
                    <h4 className="text-sm font-bold text-stone-900 truncate">{songs[currentSongIndex]?.title}</h4>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">{songs[currentSongIndex]?.artist}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length)}
                        className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-emerald-600/20"
                      >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                      </button>
                      <button 
                        onClick={() => setCurrentSongIndex((prev) => (prev + 1) % songs.length)}
                        className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-600"
                        animate={{ width: isPlaying ? "100%" : "0%" }}
                        transition={{ duration: 180, ease: "linear" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Player Area (Right) */}
              <div className="flex-1 flex flex-col bg-stone-100/50">
                <div className="flex-1 relative group overflow-hidden bg-stone-100">
                  {songs[currentSongIndex] && (
                    <Player
                      url={getYoutubeUrl(songs[currentSongIndex].youtube_url)}
                      width="100%"
                      height="100%"
                      playing={isPlaying && isPlayerReady}
                      volume={1}
                      controls={true}
                      onReady={() => {
                        console.log("Player is ready for:", songs[currentSongIndex]?.title);
                        setIsPlayerReady(true);
                      }}
                      onStart={() => {
                        console.log("Playback started");
                        setIsPlayerReady(true);
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setCurrentSongIndex((prev) => (prev + 1) % songs.length)}
                      onError={(e: any) => {
                        console.error("Player Error for URL:", getYoutubeUrl(songs[currentSongIndex]?.youtube_url), e);
                        setIsPlayerReady(true); // Hide loader even on error
                      }}
                      config={{
                        youtube: {
                          playerVars: { 
                            autoplay: 1,
                            modestbranding: 1,
                            rel: 0,
                            playsinline: 1,
                            enablejsapi: 1,
                            widget_referrer: window.location.href
                          }
                        }
                      }}
                    />
                  )}
                  
                  {!isPlayerReady && isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-100 z-10">
                      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tour Viewer Modal */}
      <AnimatePresence>
        {selectedTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <div 
              className="absolute inset-0 bg-stone-900/95 backdrop-blur-xl" 
              onClick={() => setSelectedTour(null)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl h-full max-h-[90vh] bg-black rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-start pointer-events-none">
                <AnimatePresence>
                  {showInfo && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="pointer-events-auto bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-md"
                    >
                      <h2 className="text-xl font-bold text-white mb-1">{selectedTour.name}</h2>
                      <div className="flex items-center gap-2 text-stone-300 text-xs mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>Vùng đất Tây Bắc, Việt Nam</span>
                      </div>
                      <p className="text-stone-400 text-xs leading-relaxed hidden md:block">
                        {selectedTour.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex gap-2 pointer-events-auto">
                  <button 
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all border border-white/20"
                    title={showInfo ? "Ẩn thông tin" : "Hiện thông tin"}
                  >
                    {showInfo ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                  <button 
                    onClick={() => setSelectedTour(null)}
                    className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all border border-white/20"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Iframe Container */}
              <div className="flex-1 w-full bg-stone-900 relative">
                <iframe 
                  src={selectedTour.vtour_url || selectedTour.vtourUrl}
                  className="w-full h-full border-none"
                  title={selectedTour.name}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
                
                {/* Loading State Placeholder */}
                <div className="absolute inset-0 -z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-stone-400 text-sm font-medium">Đang tải Tour 360°...</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-stone-900 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="text-stone-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4" />
                    Thông tin chi tiết
                  </button>
                </div>
                <div className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">
                  Powered by VietnamInfo
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img 
                src="https://iili.io/qCZnJef.png" 
                alt="Tây Bắc Tourist Logo" 
                className="w-14 h-14 object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="logo-fallback hidden relative w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white overflow-hidden">
                <Sun className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 opacity-50" />
                <Mountain className="w-6 h-6 relative z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-blue-500/30" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight uppercase">TÂY BẮC TOURIST</h2>
            </div>
            <p className="text-stone-400 max-w-md leading-relaxed mb-8">
              Trang web cung cấp trải nghiệm tham quan ảo các di tích lịch sử, danh lam thắng cảnh tại vùng đất Tây Bắc. Nhằm quảng bá hình ảnh du lịch địa phương đến với du khách trong và ngoài nước.
            </p>
            <div className="flex gap-4">
              {/* Social icons could go here */}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-emerald-500">Liên kết</h4>
            <ul className="space-y-4 text-stone-400">
              <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điểm đến</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tin tức du lịch</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-emerald-500">Thông tin</h4>
            <ul className="space-y-4 text-stone-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>Vùng đất Tây Bắc, Việt Nam</span>
              </li>
              <li>Nguồn dữ liệu: vietnaminfo.net</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-stone-500 text-sm">
          <p>© {new Date().getFullYear()} Tây Bắc Tourist Virtual Tours. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const CategoryIcon = ({ category }: { category: string }) => {
  const normalized = category?.toLowerCase() || '';
  if (normalized.includes('lịch sử') || normalized.includes('history')) return <History className="w-4 h-4" />;
  if (normalized.includes('thiên nhiên') || normalized.includes('nature')) return <Trees className="w-4 h-4" />;
  if (normalized.includes('văn hóa') || normalized.includes('culture')) return <Palmtree className="w-4 h-4" />;
  if (normalized.includes('tôn giáo') || normalized.includes('religion')) return <Church className="w-4 h-4" />;
  return <MapPin className="w-4 h-4" />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="tours" element={<TourManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="slides" element={<SlideManagement />} />
        <Route path="songs" element={<SongManagement />} />
        <Route path="news" element={<NewsManagement />} />
        <Route path="posts" element={<PostManagement />} />
      </Route>
    </Routes>
  );
}
