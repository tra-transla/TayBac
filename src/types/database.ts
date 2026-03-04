export interface News {
  id: string;
  title: string;
  content: string;
  image_url: string;
  link: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string;
  external_link: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  categories?: { name: string };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  image_url: string;
  vtour_url: string;
  category_id: string;
  created_at: string;
  categories?: { name: string };
}

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  youtube_url: string;
  thumbnail_url: string;
  order_index: number;
  created_at: string;
}
