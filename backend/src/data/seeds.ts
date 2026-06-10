import {Article, CommunityPost, GarageVehicle, VehicleListing} from '../types/domain';
import {vehicleImageSeeds} from './vehicleImages';

const now = new Date().toISOString();

const getImage = (id: string) => vehicleImageSeeds.find((image) => image.id === id)?.imageUrl ?? '';

export const communityPostsSeed: CommunityPost[] = [
  {
    id: 'post-restoration-fuchs',
    author: {
      id: 'user-marcus-thorne',
      name: 'Marcus Thorne',
      handle: 'mthorne_rs',
      avatar: 'https://i.pravatar.cc/100?u=mt',
      isVerified: true,
      isProUser: true,
    },
    type: 'garage',
    content:
      'The final piece of the puzzle arrived today for the 1974 2.7 RS project. These period-correct Fuchs wheels are everything.',
    image: getImage('img-classic-gt-heritage'),
    timestamp: '12m ago',
    likes: 245,
    comments: 34,
    shares: 3,
    category: 'Restoration',
    tags: ['Porsche911', 'RestoMod', 'Vintage'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'post-corvette-listing-share',
    author: {
      id: 'user-elena-rossi',
      name: 'Elena Rossi',
      handle: 'elena_f1',
      avatar: 'https://i.pravatar.cc/100?u=er',
      isVerified: true,
    },
    type: 'marketplace',
    content: 'Helping a friend move this beautiful Stingray. Handling is razor sharp.',
    timestamp: '1h ago',
    likes: 1205,
    comments: 56,
    shares: 11,
    category: 'Hot Deals',
    tags: ['Corvette', 'Stingray'],
    marketplaceListing: {
      title: 'Chevrolet Corvette Stingray Z51',
      price: '$75,000',
      image: getImage('img-corvette-stingray-z51'),
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'post-road-trip-cotswolds',
    author: {
      id: 'user-drive-daily',
      name: 'DriveDaily',
      handle: 'daily_alpha',
      avatar: 'https://i.pravatar.cc/100?u=dd',
    },
    type: 'story',
    content: 'Spent the weekend lost in the Cotswolds. No GPS, just a map and the internal combustion engine.',
    images: [getImage('img-porsche-911-964-red'), getImage('img-enthusiast-banner')],
    timestamp: '3h ago',
    likes: 890,
    comments: 12,
    shares: 6,
    category: 'Road Trip',
    tags: ['Exploring', 'Cotswolds', 'Escape'],
    createdAt: now,
    updatedAt: now,
  },
];

export const vehicleListingsSeed: VehicleListing[] = [
  {
    id: 'vehicle-porsche-911-carrera-rs',
    image: getImage('img-porsche-911-964-red'),
    images: [getImage('img-porsche-911-964-red')],
    price: '$145,000',
    title: '1972 Porsche 911 Carrera RS',
    location: 'Los Angeles, CA',
    seller: {
      id: 'seller-heritage-motors',
      name: 'Heritage Motors',
      avatar: 'https://i.pravatar.cc/100?u=heritage',
      isVerified: true,
    },
    condition: 'Used',
    timestamp: '2H AGO',
    specs: ['Air-cooled', 'Manual', 'Matching Numbers'],
    category: 'Classics',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'vehicle-bmw-m3-e30-evo',
    image: getImage('img-bmw-m3-e30'),
    images: [getImage('img-bmw-m3-e30')],
    price: '$95,000',
    title: 'BMW M3 (E30) Evolution II',
    location: 'Munich, Germany',
    seller: {
      id: 'seller-bavarian-classics',
      name: 'Bavarian Classics',
      avatar: 'https://i.pravatar.cc/100?u=bavarian',
      isVerified: true,
    },
    condition: 'Used',
    timestamp: '4H AGO',
    specs: ['S14 Engine', 'Homologation Special', 'Original Paint'],
    category: 'Classics',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'vehicle-land-rover-defender',
    image: getImage('img-land-rover-defender'),
    images: [getImage('img-land-rover-defender')],
    price: '$65,000',
    title: 'Land Rover Defender',
    location: 'Austin, TX',
    seller: {
      id: 'seller-trail-garage',
      name: 'Trail Garage',
      avatar: 'https://i.pravatar.cc/100?u=trail',
      isVerified: true,
    },
    condition: 'Used',
    timestamp: '1D AGO',
    specs: ['4x4', 'Overland Build', 'Manual'],
    category: 'Daily',
    createdAt: now,
    updatedAt: now,
  },
];

export const garageVehiclesSeed: GarageVehicle[] = [
  {
    id: 'garage-gt-heritage',
    ownerId: 'user-alex-rivera',
    image: getImage('img-classic-gt-heritage'),
    images: [getImage('img-classic-gt-heritage')],
    title: '1974 GT Heritage',
    role: 'Restoration Project',
    status: 'In Garage',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'garage-vanguard-s',
    ownerId: 'user-alex-rivera',
    image: getImage('img-vanguard-s'),
    images: [getImage('img-vanguard-s')],
    title: '2023 Vanguard S',
    role: 'Daily Driver',
    status: 'Active Listing',
    createdAt: now,
    updatedAt: now,
  },
];

export const articlesSeed: Article[] = [
  {
    id: 'article-kiem-tra-xe-cu',
    title: '10 bước kiểm tra xe cũ trước khi xuống tiền',
    excerpt: 'Quy trình thực tế giúp người mua đánh giá giấy tờ, thân vỏ, động cơ và lịch sử sử dụng của một chiếc xe đã qua sử dụng.',
    content: `Mua xe cũ không chỉ là chọn một mẫu xe đẹp và thương lượng được mức giá hợp lý. Người mua cần kiểm tra đồng thời giấy tờ, tình trạng kỹ thuật và dấu hiệu sửa chữa để tránh các chi phí lớn sau khi nhận xe.

Bước đầu tiên là đối chiếu số khung, số máy, đăng ký và thông tin chủ xe. Các dữ liệu này phải thống nhất. Nếu người bán không phải chủ xe, cần làm rõ giấy ủy quyền hoặc hồ sơ mua bán trước đó.

Tiếp theo, hãy quan sát thân vỏ dưới ánh sáng tự nhiên. Khe hở giữa nắp ca-pô, cửa và cốp nên đều nhau. Màu sơn lệch tông, vết hàn mới hoặc lớp keo chỉ bị thay đổi có thể cho thấy xe từng va chạm.

Khoang động cơ nên được kiểm tra khi máy còn nguội. Hãy chú ý mức dầu, nước làm mát, dấu rò rỉ và tiếng động bất thường lúc khởi động. Khói xả có màu xanh hoặc trắng kéo dài là tín hiệu cần kiểm tra sâu hơn.

Trong cabin, độ mòn của vô-lăng, ghế lái và bàn đạp phải hợp lý với số kilomet hiển thị. Một chiếc xe báo quãng đường thấp nhưng nội thất mòn nhiều có thể đã bị điều chỉnh công-tơ-mét.

Khi lái thử, hãy đi cả đường chậm và đường có tốc độ cao hơn. Xe cần giữ hướng ổn định, hộp số chuyển cấp mượt, phanh không rung và hệ thống treo không phát tiếng gõ.

Cuối cùng, nên đưa xe tới xưởng độc lập để quét lỗi và kiểm tra gầm. Chi phí kiểm tra nhỏ hơn rất nhiều so với việc sửa động cơ, hộp số hoặc hệ thống điện sau khi mua.`,
    author: 'Ban biên tập CarHub',
    date: 'June 8, 2026',
    readTime: '7 phút đọc',
    image: getImage('img-porsche-911-964-red'),
    category: 'Kinh nghiệm',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'article-cham-soc-xe-mua-he',
    title: 'Chăm sóc ô tô mùa nóng: những hạng mục không nên bỏ qua',
    excerpt: 'Lốp, hệ thống làm mát, điều hòa và ắc quy đều chịu tải cao khi nhiệt độ tăng; đây là cách kiểm tra từng hạng mục.',
    content: `Nhiệt độ cao làm tăng áp suất lốp, giảm hiệu quả làm mát và khiến nhiều chi tiết cao su lão hóa nhanh hơn. Một lần kiểm tra ngắn trước chuyến đi dài có thể giúp tránh tình trạng xe quá nhiệt hoặc mất điều hòa giữa đường.

Áp suất lốp cần được đo khi lốp nguội và điều chỉnh theo thông số của nhà sản xuất trên khung cửa hoặc sách hướng dẫn. Không nên xả bớt hơi chỉ vì thấy lốp nóng sau khi chạy, bởi áp suất tăng trong quá trình vận hành là hiện tượng bình thường.

Nước làm mát phải nằm giữa hai vạch quy định khi động cơ nguội. Nếu mức nước giảm liên tục, cần kiểm tra rò rỉ thay vì chỉ châm thêm. Tuyệt đối không mở nắp két nước khi động cơ đang nóng.

Điều hòa yếu có thể xuất phát từ lọc gió bẩn, dàn nóng bị che kín hoặc lượng môi chất không phù hợp. Việc chỉ nạp thêm gas mà không tìm nguyên nhân rò rỉ thường không giải quyết được vấn đề lâu dài.

Ắc quy cũng dễ suy giảm trong môi trường nóng. Hãy kiểm tra cọc bình, điện áp sạc và khả năng đề máy. Nếu xe ít sử dụng, nên khởi động và vận hành đủ lâu hoặc dùng bộ duy trì điện phù hợp.

Cuối cùng, đừng để các vật dễ cháy nổ, pin dự phòng hoặc bình xịt áp suất trong cabin dưới nắng. Tấm che kính và việc đỗ xe ở nơi thông thoáng giúp bảo vệ nội thất, nhưng không thay thế cho kiểm tra kỹ thuật định kỳ.`,
    author: 'Ban kỹ thuật CarHub',
    date: 'June 5, 2026',
    readTime: '6 phút đọc',
    image: getImage('img-ev-editorial'),
    category: 'Bảo dưỡng',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'article-chon-xe-hybrid',
    title: 'Xe hybrid phù hợp với ai trong điều kiện sử dụng đô thị?',
    excerpt: 'Phân tích ưu điểm, giới hạn và chi phí sử dụng để người mua biết khi nào hệ truyền động hybrid thực sự mang lại lợi ích.',
    content: `Xe hybrid kết hợp động cơ đốt trong với mô-tơ điện để giảm mức tiêu thụ nhiên liệu, đặc biệt trong điều kiện thường xuyên tăng giảm tốc. Vì vậy, người di chuyển nhiều trong thành phố thường nhận thấy lợi ích rõ hơn người chủ yếu chạy đường trường ổn định.

Ở tốc độ thấp, mô-tơ điện có thể hỗ trợ hoặc đảm nhiệm việc di chuyển trong thời gian ngắn. Khi phanh, hệ thống thu hồi một phần năng lượng để nạp lại pin. Quá trình này giúp giảm lượng nhiên liệu bị lãng phí trong giao thông đông đúc.

Người mua vẫn cần xem xét giá bán ban đầu, không gian hành lý và chính sách bảo hành pin. Một số mẫu xe bố trí bộ pin dưới sàn hoặc ghế sau nên ảnh hưởng không đáng kể, trong khi các thiết kế cũ có thể làm giảm thể tích khoang chứa đồ.

Hybrid không đồng nghĩa với việc hoàn toàn không cần bảo dưỡng động cơ. Xe vẫn có dầu máy, nước làm mát và nhiều hạng mục cơ khí thông thường. Điểm khác biệt là hệ thống điện áp cao phải được kiểm tra bởi kỹ thuật viên có thiết bị và quy trình phù hợp.

Nếu quãng đường hằng ngày ngắn, thường xuyên đi phố và chưa thuận tiện lắp sạc tại nhà, hybrid là lựa chọn đáng cân nhắc. Nếu phần lớn hành trình là cao tốc hoặc người dùng có thể sạc ổn định mỗi ngày, cần so sánh thêm với xe xăng tiết kiệm hoặc xe điện trước khi quyết định.`,
    author: 'Nhóm phân tích CarHub',
    date: 'June 2, 2026',
    readTime: '8 phút đọc',
    image: getImage('img-vanguard-s'),
    category: 'Tư vấn',
    createdAt: now,
    updatedAt: now,
  },
];
