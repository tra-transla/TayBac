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
  created_at: string;
  updated_at: string;
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
  category: string;
  created_at: string;
}
