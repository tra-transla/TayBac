export interface TourLocation {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  vtourUrl: string;
  category: 'Lịch sử' | 'Thiên nhiên' | 'Văn Hoá' | 'Tôn giáo';
}

export const TOUR_LOCATIONS: TourLocation[] = [
  {
    id: 'son-la-prison',
    name: 'Di tích Nhà tù Sơn La',
    description: 'Nơi minh chứng cho tinh thần bất khuất của các chiến sĩ cách mạng Việt Nam trong thời kỳ kháng chiến chống Pháp.',
    imageUrl: 'https://picsum.photos/seed/prison/800/600',
    vtourUrl: 'https://sonlacity.vietnaminfo.net/vtours/nhatusonla/index.html',
    category: 'Lịch sử'
  },
  {
    id: 'northwest-square',
    name: 'Quảng trường Tây Bắc',
    description: 'Trung tâm văn hóa, chính trị của thành phố Sơn La với tượng đài Bác Hồ với đồng bào các dân tộc Tây Bắc.',
    imageUrl: 'https://picsum.photos/seed/square/800/600',
    vtourUrl: 'https://sonlacity.vietnaminfo.net/DataFiles/Tour3D/2/',
    category: 'Văn Hoá'
  },
  {
    id: 'le-thai-tong-temple',
    name: 'Đền thờ Vua Lê Thái Tông',
    description: 'Công trình kiến trúc tâm linh tưởng nhớ vị vua anh minh đã có công dẹp loạn tại vùng biên cương Tây Bắc.',
    imageUrl: 'https://picsum.photos/seed/temple/800/600',
    vtourUrl: 'https://sonlacity.vietnaminfo.net/vtours/denvualethaitong/index.html',
    category: 'Tôn giáo'
  },
  {
    id: 'son-la-museum',
    name: 'Bảo tàng Sơn La',
    description: 'Nơi lưu giữ và trưng bày hàng ngàn hiện vật quý giá về lịch sử và văn hóa các dân tộc tỉnh Sơn La.',
    imageUrl: 'https://picsum.photos/seed/museum/800/600',
    vtourUrl: 'https://sonlacity.vietnaminfo.net/vtours/baotang/index.html',
    category: 'Lịch sử'
  },
  {
    id: 'ban-moong',
    name: 'Bản Moòng',
    description: 'Điểm du lịch cộng đồng nổi tiếng với suối khoáng nóng và những nét văn hóa đặc sắc của dân tộc Thái.',
    imageUrl: 'https://picsum.photos/seed/village/800/600',
    vtourUrl: 'https://sonlacity.vietnaminfo.net/vtours/banmoong/index.html',
    category: 'Văn Hoá'
  },
  {
    id: 'ban-chanh-lake',
    name: 'Hồ Bản Chanh',
    description: 'Không gian xanh mát, yên bình với mặt hồ phẳng lặng, là nơi lý tưởng để thư giãn và ngắm cảnh.',
    imageUrl: 'https://picsum.photos/seed/lake/800/600',
    vtourUrl: 'https://sonlacity.vietnaminfo.net/vtours/hobanchanh/index.html',
    category: 'Thiên nhiên'
  }
];
