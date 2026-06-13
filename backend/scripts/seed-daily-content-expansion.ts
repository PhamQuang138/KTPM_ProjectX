import '../src/config/localEnv';
import {PostStatus} from '@prisma/client';
import {prisma} from '../src/config/prisma';

const COMMUNITY_MARKER = 'CARHUB_DAILY_COMMUNITY_V1';
const MARKET_MARKER = 'CARHUB_DAILY_MARKET_V1';
const LEGACY_COMMUNITY_MARKER = 'CARHUB_COMMUNITY_SEED_V2';
const COMMUNITY_POST_COUNT = 45;
const MARKET_LISTING_COUNT = 100;

const locations = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Nghệ An',
  'Khánh Hòa',
  'Lâm Đồng',
];

const postIdeas = [
  ['Các yếu tố ảnh hưởng giá Toyota Vios đã qua sử dụng', 'Giá rao bán xe đã qua sử dụng thường khác nhau theo phiên bản, lịch sử bảo dưỡng, số kilomet và hiện trạng thực tế. Người mua nên so sánh các xe cùng đời, cùng phiên bản và kiểm tra độc lập trước khi quyết định.'],
  ['Honda City cũ đang được quan tâm vì điều gì?', 'City có không gian đủ dùng, vô-lăng nhẹ và mức tiêu thụ nhiên liệu hợp lý. Khi xem xe nên kiểm tra gầm, cao su chân máy, lịch thay dầu hộp số và tình trạng lốp.'],
  ['So sánh nhanh Accent và Vios cho người mua lần đầu', 'Accent có nhiều trang bị và thiết kế trẻ, còn Vios nổi bật về độ phổ biến và thanh khoản. Nên lái thử trên đúng tuyến đường đi làm hằng ngày trước khi chọn.'],
  ['Giá xăng biến động ảnh hưởng cách chọn xe ra sao?', 'Người đi nhiều trong đô thị đang chú ý hơn tới mức tiêu thụ thực tế, chi phí bảo dưỡng và khả năng giữ giá thay vì chỉ nhìn công suất động cơ.'],
  ['Kinh nghiệm mua xe trả góp không vượt ngân sách', 'Ngoài tiền trả trước cần tính bảo hiểm, phí đăng ký, lãi vay, nhiên liệu, gửi xe và bảo dưỡng. Khoản trả xe hằng tháng không nên làm mất quỹ dự phòng của gia đình.'],
  ['Có nên mua xe từng chạy dịch vụ?', 'Xe dịch vụ không mặc định là xe xấu, nhưng cần kiểm tra số kilomet, nội thất, hệ thống treo, điều hòa và lịch sử bảo dưỡng kỹ hơn. Giá phải phản ánh đúng cường độ sử dụng.'],
  ['Cách so sánh SUV đô thị cỡ nhỏ', 'Creta, Seltos, HR-V, Corolla Cross và Xforce khác nhau về kích thước, hệ truyền động và trang bị theo từng phiên bản. Nên đối chiếu thông số từ hãng và lái thử thay vì xếp hạng chung cho mọi nhu cầu.'],
  ['Khi nào nên thay lốp dù gai vẫn còn?', 'Lốp có thể lão hóa, nứt hông hoặc biến dạng dù độ sâu gai vẫn đạt. Cần xem ngày sản xuất, độ mòn lệch và cảm giác rung ở tốc độ cao.'],
  ['Kiểm tra ắc quy trước mùa mưa', 'Khởi động chậm, đèn yếu và điện áp sạc không ổn định là các dấu hiệu nên kiểm tra. Cọc bình cần sạch, siết chắc và không có lớp oxy hóa dày.'],
  ['Xe bị ngập nước có thể nhận biết thế nào?', 'Hãy quan sát mùi ẩm, bùn ở ray ghế, dây an toàn, hốc bánh dự phòng và giắc điện. Nên quét lỗi toàn bộ hệ thống tại xưởng độc lập trước khi mua.'],
  ['Cách tính tổng chi phí sử dụng xe điện phổ thông', 'Giá mua chỉ là một phần của bài toán. Người dùng cần tính thêm phương án sạc, quãng đường thực tế, điều kiện bảo hành pin, bảo hiểm và giá trị bán lại dự kiến.'],
  ['Hybrid có thực sự tiết kiệm khi đi cao tốc?', 'Hybrid phát huy lợi thế rõ nhất khi thường xuyên giảm tốc và tái tạo năng lượng. Trên cao tốc ổn định, chênh lệch tiêu thụ có thể nhỏ hơn kỳ vọng.'],
  ['Những lỗi thường gặp khi tự rửa xe tại nhà', 'Dùng một khăn cho toàn bộ xe, rửa dưới nắng gắt và lau khô bằng khăn bẩn dễ tạo xước xoáy. Nên dùng phương pháp hai xô và khăn riêng cho mâm.'],
  ['Phanh phát tiếng kêu có luôn nguy hiểm?', 'Tiếng kêu có thể do bụi, bề mặt đĩa hoặc má phanh gần hết. Nếu kèm rung vô-lăng, lệch xe hoặc hành trình bàn đạp bất thường thì cần kiểm tra ngay.'],
  ['Mua sedan hay SUV khi gia đình có trẻ nhỏ?', 'SUV thuận tiện khi đặt ghế trẻ em và chở đồ, còn sedan thường êm, tiết kiệm và dễ mua hơn trong cùng ngân sách. Không gian thực tế quan trọng hơn thông số quảng cáo.'],
  ['Các yếu tố ảnh hưởng giá Mazda CX-5 đã qua sử dụng', 'Giá rao bán CX-5 phụ thuộc vào đời xe, phiên bản, số kilomet, lịch sử bảo dưỡng và tình trạng thân vỏ. Cần so sánh xe cùng cấu hình và kiểm tra thực tế trước khi định giá.'],
  ['Ford Ranger cũ: nên kiểm tra gì trước tiên?', 'Cần xem gầm, hệ dẫn động, thùng xe, dấu hiệu kéo tải nặng và lịch thay dầu. Với xe từng đi công trường, kiểm tra kỹ hệ thống treo và khung chassis.'],
  ['Mitsubishi Xpander có phù hợp chạy gia đình?', 'Điểm mạnh là không gian bảy chỗ, chi phí sử dụng dễ dự đoán và bán lại tương đối thuận lợi. Hãy lái thử khi đủ tải để đánh giá sức kéo và độ ồn.'],
  ['Cách đọc lịch sử bảo dưỡng của một chiếc xe cũ', 'Đừng chỉ nhìn số lần vào xưởng. Hãy đối chiếu kilomet, hạng mục thay thế, thời gian giữa các lần bảo dưỡng và các sửa chữa lớn bất thường.'],
  ['Bảo hiểm thân vỏ có đáng mua với xe cũ?', 'Giá trị phụ thuộc vào tuổi xe, điều kiện đỗ, tần suất sử dụng và khả năng tự chịu rủi ro. Cần đọc kỹ mức miễn thường và điều khoản sửa chữa chính hãng.'],
  ['Xe rung khi chạy 80 đến 100 km/h', 'Nguyên nhân thường gặp gồm mất cân bằng bánh, lốp biến dạng, mâm cong hoặc chi tiết gầm mòn. Cân bằng động là bước kiểm tra đơn giản đầu tiên.'],
  ['Điều hòa ô tô lâu mát vào buổi trưa', 'Có thể do lọc gió bẩn, dàn nóng kém thông thoáng, quạt yếu hoặc thiếu môi chất. Không nên chỉ nạp gas mà bỏ qua kiểm tra rò rỉ.'],
  ['Cách chọn xe 7 chỗ phổ thông', 'Innova Cross, Xpander, BR-V, Veloz Cross và Stargazer phục vụ các nhu cầu khác nhau về không gian, tải, tiện nghi và vận hành. Thông số và số chỗ sử dụng thoải mái cần được kiểm tra theo từng phiên bản.'],
  ['Có nên phủ ceramic cho xe sử dụng hằng ngày?', 'Ceramic giúp dễ vệ sinh và tăng độ bóng nhưng không chống được đá văng hay mọi vết xước. Chất lượng xử lý bề mặt trước khi phủ rất quan trọng.'],
  ['Camera 360 có cần thiết cho xe nhỏ?', 'Xe nhỏ vẫn hưởng lợi khi đi ngõ hẹp hoặc đỗ sát lề. Tuy nhiên chất lượng hình ảnh, độ trễ và cách căn chỉnh quan trọng hơn việc chỉ có tính năng.'],
  ['Cảnh báo điểm mù hoạt động như thế nào?', 'Hệ thống dùng radar hoặc cảm biến để nhận biết phương tiện ở vùng khó quan sát. Người lái vẫn phải kiểm tra gương và quay đầu khi chuyển làn.'],
  ['Kinh nghiệm lái xe đường đèo an toàn', 'Giữ số phù hợp, dùng phanh động cơ, không rà phanh liên tục và nhường đường đúng nơi. Trước chuyến đi cần kiểm tra lốp, phanh và nước làm mát.'],
  ['Lốp tiết kiệm nhiên liệu có đánh đổi độ bám?', 'Hợp chất và thiết kế lốp ảnh hưởng lực cản lăn, độ ồn và độ bám ướt. Nên chọn đúng nhu cầu thay vì chỉ nhìn một chỉ số quảng cáo.'],
  ['Giá phụ tùng có nên là tiêu chí mua xe?', 'Một mẫu xe có giá mua hấp dẫn nhưng phụ tùng hiếm hoặc thời gian chờ lâu có thể gây bất tiện. Hãy hỏi trước giá các hạng mục hao mòn phổ biến.'],
  ['Xe ít đi có cần bảo dưỡng đúng hạn?', 'Dầu, cao su, ắc quy và nhiên liệu vẫn lão hóa theo thời gian. Xe ít sử dụng nên được vận hành đủ nhiệt và kiểm tra theo cả thời gian lẫn kilomet.'],
  ['Nên chọn màu xe nào để dễ bán lại?', 'Trắng, đen, bạc và xám thường có tệp người mua rộng. Màu nổi bật tạo cá tính nhưng có thể cần nhiều thời gian hơn khi bán lại.'],
  ['Cách so sánh hatchback đô thị đã qua sử dụng', 'Morning, Grand i10, Wigo và Brio có kích thước nhỏ, phù hợp môi trường đô thị. Giá trị một chiếc xe cụ thể còn phụ thuộc phiên bản, lịch sử sử dụng, bảo dưỡng và hiện trạng kiểm tra.'],
  ['Động cơ turbo cần thói quen sử dụng gì?', 'Dùng đúng dầu, thay lọc đúng hạn và tránh tải nặng khi máy chưa đạt nhiệt độ. Sau hành trình nặng nên cho hệ thống ổn định theo khuyến cáo nhà sản xuất.'],
  ['Hộp số CVT có bền không?', 'CVT có thể bền nếu dùng đúng dầu, đúng lịch và tránh kéo tải vượt thiết kế. Cảm giác vòng tua cao khi tăng tốc không nhất thiết là dấu hiệu hỏng.'],
  ['Dấu hiệu hệ thống treo cần kiểm tra', 'Xe phát tiếng gõ, nghiêng nhiều, lốp mòn lệch hoặc mất ổn định qua gờ là các dấu hiệu thường gặp. Cần kiểm tra cả giảm xóc, cao su và rotuyn.'],
  ['Các tiêu chí chọn xe bán tải cho gia đình', 'Ngoài khả năng tải, người mua nên kiểm tra không gian hàng ghế sau, trang bị an toàn, bán kính quay đầu và độ êm. Kích thước xe là yếu tố cần cân nhắc khi thường xuyên đi phố.'],
  ['Nên mua phiên bản tiêu chuẩn hay cao cấp?', 'Phiên bản tiêu chuẩn tiết kiệm chi phí đầu vào, nhưng một số tính năng an toàn và tiện nghi khó nâng cấp về sau. Hãy chọn theo trang bị thật sự dùng mỗi ngày.'],
  ['Các giấy tờ cần kiểm tra khi mua xe cá nhân', 'Đăng ký, đăng kiểm, phạt nguội, bảo hiểm và giấy tờ chủ sở hữu cần thống nhất. Hợp đồng mua bán phải ghi rõ hiện trạng và trách nhiệm hai bên.'],
  ['Xe có lịch sử sơn lại có đáng ngại?', 'Sơn lại do trầy xước nhẹ khác hoàn toàn sửa chữa kết cấu sau va chạm. Cần xem keo chỉ, mối hàn, khe cửa và đo độ dày sơn nếu có thiết bị.'],
  ['Kinh nghiệm chọn ghế trẻ em cho ô tô', 'Chọn theo cân nặng, chiều cao, chuẩn an toàn và vị trí ISOFIX của xe. Ghế tốt nhưng lắp sai vẫn không bảo vệ đúng thiết kế.'],
  ['Bản tin giao thông và chuẩn bị cho kỳ nghỉ dài', 'Trước hành trình nên kiểm tra tuyến đường, điểm dừng, thời tiết, áp suất lốp và bộ dụng cụ khẩn cấp. Tránh cố lái khi buồn ngủ.'],
  ['Có nên nâng cấp đèn LED cho xe đời cũ?', 'Cần bảo đảm chóa đèn phù hợp, đường cắt đúng và không gây chói. Nâng công suất tùy tiện có thể ảnh hưởng dây điện và an toàn người đi ngược chiều.'],
  ['Mùi xăng trong cabin xuất phát từ đâu?', 'Có thể liên quan nắp bình, đường ống, kim phun hoặc hệ thống thu hồi hơi nhiên liệu. Đây là dấu hiệu không nên trì hoãn kiểm tra.'],
  ['Cách chuẩn bị xe trước khi bán', 'Rửa xe, dọn nội thất, tập hợp hóa đơn bảo dưỡng và chụp rõ cả ưu lẫn khuyết điểm giúp tăng độ tin cậy và giảm thời gian trao đổi.'],
  ['Kinh nghiệm lái thử xe cũ trong 20 phút', 'Hãy thử khởi động nguội, đánh lái hết góc, đi qua gờ, phanh từ nhiều tốc độ và kiểm tra các thiết bị điện. Không nên chỉ chạy một vòng ngắn quanh showroom.'],
] as const;

interface DailyVehicle {
  make: string;
  model: string;
  wikipediaPage: string;
  imageUrl?: string;
  imageSourcePage?: string;
  year: number;
  price: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  mileage: number;
  specs: string[];
}

const dailyVehicles: DailyVehicle[] = [
  {make: 'Toyota', model: 'Vios', wikipediaPage: 'Toyota Vios', year: 2022, price: 480, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 32000, specs: []},
  {
    make: 'Toyota',
    model: 'Corolla Altis',
    wikipediaPage: 'Toyota Corolla (E210)',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/2021%20Toyota%20Corolla%20Altis%201.8%20Sport.jpg',
    imageSourcePage: 'https://commons.wikimedia.org/wiki/File:2021_Toyota_Corolla_Altis_1.8_Sport.jpg',
    year: 2021,
    price: 650,
    bodyType: 'Sedan',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    mileage: 38000,
    specs: [],
  },
  {make: 'Toyota', model: 'Corolla Cross', wikipediaPage: 'Toyota Corolla Cross', year: 2022, price: 760, bodyType: 'Crossover', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 27000, specs: []},
  {make: 'Toyota', model: 'Camry', wikipediaPage: 'Toyota Camry', year: 2021, price: 980, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 41000, specs: []},
  {make: 'Toyota', model: 'Fortuner', wikipediaPage: 'Toyota Fortuner', year: 2022, price: 1050, bodyType: 'SUV', fuelType: 'Diesel', transmission: 'Automatic', mileage: 36000, specs: []},
  {make: 'Toyota', model: 'Innova Cross', wikipediaPage: 'Toyota Innova', year: 2023, price: 760, bodyType: 'MPV', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 18000, specs: []},
  {make: 'Honda', model: 'City', wikipediaPage: 'Honda City', year: 2022, price: 520, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 29000, specs: []},
  {make: 'Honda', model: 'Civic', wikipediaPage: 'Honda Civic (eleventh generation)', year: 2022, price: 720, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 25000, specs: []},
  {make: 'Honda', model: 'CR-V', wikipediaPage: 'Honda CR-V', year: 2021, price: 850, bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 42000, specs: []},
  {make: 'Honda', model: 'HR-V', wikipediaPage: 'Honda HR-V', year: 2023, price: 680, bodyType: 'Crossover', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 16000, specs: []},
  {make: 'Hyundai', model: 'Grand i10', wikipediaPage: 'Hyundai i10', year: 2022, price: 350, bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 34000, specs: []},
  {make: 'Hyundai', model: 'Accent', wikipediaPage: 'Hyundai Accent', year: 2022, price: 470, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 31000, specs: []},
  {make: 'Hyundai', model: 'Creta', wikipediaPage: 'Hyundai Creta', year: 2023, price: 620, bodyType: 'Crossover', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 19000, specs: []},
  {make: 'Hyundai', model: 'Tucson', wikipediaPage: 'Hyundai Tucson', year: 2022, price: 780, bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 28000, specs: []},
  {make: 'Hyundai', model: 'Santa Fe', wikipediaPage: 'Hyundai Santa Fe', year: 2021, price: 920, bodyType: 'SUV', fuelType: 'Diesel', transmission: 'Automatic', mileage: 47000, specs: []},
  {make: 'Kia', model: 'Morning', wikipediaPage: 'Kia Picanto', year: 2022, price: 340, bodyType: 'Hatchback', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 30000, specs: []},
  {make: 'Kia', model: 'Soluto', wikipediaPage: 'Kia Pegas', year: 2021, price: 330, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 44000, specs: []},
  {make: 'Kia', model: 'K3', wikipediaPage: 'Kia Forte', year: 2022, price: 560, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 26000, specs: []},
  {make: 'Kia', model: 'Seltos', wikipediaPage: 'Kia Seltos', year: 2022, price: 610, bodyType: 'Crossover', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 33000, specs: []},
  {make: 'Kia', model: 'Sportage', wikipediaPage: 'Kia Sportage', year: 2023, price: 820, bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 17000, specs: []},
  {make: 'Kia', model: 'Carnival', wikipediaPage: 'Kia Carnival', year: 2022, price: 1100, bodyType: 'MPV', fuelType: 'Diesel', transmission: 'Automatic', mileage: 39000, specs: []},
  {make: 'Mazda', model: 'Mazda2', wikipediaPage: 'Mazda2', year: 2021, price: 420, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 37000, specs: []},
  {make: 'Mazda', model: 'Mazda3', wikipediaPage: 'Mazda3', year: 2022, price: 580, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 28000, specs: []},
  {make: 'Mazda', model: 'CX-5', wikipediaPage: 'Mazda CX-5', year: 2022, price: 720, bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 30000, specs: []},
  {make: 'Mazda', model: 'CX-8', wikipediaPage: 'Mazda CX-8', year: 2021, price: 850, bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 45000, specs: []},
  {make: 'Mitsubishi', model: 'Attrage', wikipediaPage: 'Mitsubishi Attrage', year: 2022, price: 390, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 35000, specs: []},
  {make: 'Mitsubishi', model: 'Xpander', wikipediaPage: 'Mitsubishi Xpander', year: 2022, price: 560, bodyType: 'MPV', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 36000, specs: []},
  {make: 'Mitsubishi', model: 'Xforce', wikipediaPage: 'Mitsubishi Xforce', year: 2024, price: 650, bodyType: 'Crossover', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 6000, specs: []},
  {make: 'Ford', model: 'Territory', wikipediaPage: 'Ford Territory (China)', year: 2023, price: 760, bodyType: 'SUV', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 18000, specs: []},
  {make: 'Ford', model: 'Ranger', wikipediaPage: 'Ford Ranger', year: 2022, price: 800, bodyType: 'Pickup', fuelType: 'Diesel', transmission: 'Automatic', mileage: 42000, specs: []},
  {make: 'Ford', model: 'Everest', wikipediaPage: 'Ford Everest', year: 2022, price: 1100, bodyType: 'SUV', fuelType: 'Diesel', transmission: 'Automatic', mileage: 39000, specs: []},
  {make: 'Nissan', model: 'Almera', wikipediaPage: 'Nissan Almera', year: 2022, price: 450, bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', mileage: 30000, specs: []},
  {make: 'Nissan', model: 'Navara', wikipediaPage: 'Nissan Navara', year: 2021, price: 680, bodyType: 'Pickup', fuelType: 'Diesel', transmission: 'Automatic', mileage: 51000, specs: []},
  {make: 'Suzuki', model: 'XL7', wikipediaPage: 'Suzuki XL7', year: 2023, price: 560, bodyType: 'MPV', fuelType: 'Hybrid', transmission: 'Automatic', mileage: 15000, specs: []},
  {make: 'VinFast', model: 'VF 6', wikipediaPage: 'VinFast VF 6', year: 2024, price: 680, bodyType: 'Crossover', fuelType: 'Electric', transmission: 'Automatic', mileage: 8000, specs: []},
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price * 1_000_000);

interface WikipediaImage {
  imageUrl: string;
  sourcePage: string;
}

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const loadWikipediaImages = async (): Promise<Map<string, WikipediaImage>> => {
  const requestedTitles = dailyVehicles.map((item) => item.wikipediaPage);
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    redirects: '1',
    prop: 'pageimages',
    piprop: 'original',
    titles: requestedTitles.join('|'),
  });
  const endpoint = `https://en.wikipedia.org/w/api.php?${params.toString()}`;

  let payload: any;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(endpoint, {
      headers: {'User-Agent': 'CarHubAccuracyAudit/1.0 (demo data verification)'},
    });
    if (response.ok) {
      payload = await response.json();
      break;
    }
    if (response.status !== 429 || attempt === 5) {
      throw new Error(`Không thể tải ảnh đã kiểm chứng từ Wikipedia: HTTP ${response.status}.`);
    }
    await sleep(attempt * 10_000);
  }

  const aliases = new Map<string, string>();
  for (const item of payload.query?.normalized ?? []) aliases.set(item.from, item.to);
  for (const item of payload.query?.redirects ?? []) aliases.set(item.from, item.to);
  const resolveTitle = (title: string) => {
    let resolved = title;
    for (let index = 0; index < 4 && aliases.has(resolved); index += 1) {
      resolved = aliases.get(resolved)!;
    }
    return resolved;
  };

  const pages = new Map<string, any>(
    Object.values(payload.query?.pages ?? {}).map((page: any) => [page.title, page]),
  );
  const result = new Map<string, WikipediaImage>();
  for (const item of dailyVehicles) {
    if (item.imageUrl && item.imageSourcePage) {
      result.set(item.wikipediaPage, {
        imageUrl: item.imageUrl,
        sourcePage: item.imageSourcePage,
      });
      continue;
    }
    const resolvedTitle = resolveTitle(item.wikipediaPage);
    const page = pages.get(resolvedTitle);
    if (!page?.original?.source) {
      throw new Error(`Không tìm thấy ảnh đại diện đúng dòng xe: ${item.wikipediaPage}.`);
    }
    result.set(item.wikipediaPage, {
      imageUrl: page.original.source,
      sourcePage: `https://en.wikipedia.org/wiki/${encodeURIComponent(resolvedTitle.replace(/ /g, '_'))}`,
    });
  }
  return result;
};

const main = async () => {
  const demoAccounts = await prisma.user.findMany({
    where: {email: {endsWith: '@carhub-demo.com'}},
    orderBy: {createdAt: 'asc'},
  });
  const accounts = demoAccounts.length
    ? demoAccounts
    : await prisma.user.findMany({where: {role: 'ADMIN'}, orderBy: {createdAt: 'asc'}});
  if (!accounts.length) throw new Error('Cần ít nhất một tài khoản để tạo dữ liệu.');

  // Resolve and verify every model image before deleting any existing seed data.
  const verifiedImages = await loadWikipediaImages();

  await prisma.post.deleteMany({
    where: {
      OR: [
        {summary: {startsWith: `[${COMMUNITY_MARKER}:`}},
        {summary: {startsWith: `[${LEGACY_COMMUNITY_MARKER}:`}},
      ],
    },
  });

  const posts = [];
  for (let index = 0; index < COMMUNITY_POST_COUNT; index += 1) {
    const [title, content] = postIdeas[index];
    const author = accounts[index % accounts.length];
    const createdAt = new Date(Date.now() - (index % 30) * 86400000 - (index % 12) * 3600000);
    posts.push(await prisma.post.create({
      data: {
        title,
        content: `${content}\n\nBạn đang sử dụng mẫu xe nào và có trải nghiệm thực tế gì về chủ đề này?`,
        summary: `[${COMMUNITY_MARKER}:${String(index + 1).padStart(2, '0')}] Nội dung cộng đồng đa chủ đề.`,
        status: PostStatus.PUBLISHED,
        authorId: author.id,
        createdAt,
      },
    }));
  }

  for (let index = 0; index < posts.length; index += 1) {
    const post = posts[index];
    const likeCount = 3 + (index % 12);
    const userIds = Array.from(
      {length: Math.min(likeCount, accounts.length)},
      (_, offset) => accounts[(index + offset + 1) % accounts.length].id,
    );
    await prisma.postLike.createMany({
      data: [...new Set(userIds)].map((userId) => ({postId: post.id, userId})),
      skipDuplicates: true,
    });
    if (index % 2 === 0 && accounts.length > 1) {
      await prisma.postComment.create({
        data: {
          postId: post.id,
          userId: accounts[(index + 7) % accounts.length].id,
          content: index % 4 === 0
            ? 'Chủ đề này rất thực tế, mình cũng đang quan tâm và sẽ kiểm tra thêm.'
            : 'Cảm ơn chia sẻ. Trải nghiệm sử dụng hằng ngày đúng là quan trọng hơn thông số.',
          createdAt: new Date(post.createdAt.getTime() + 45 * 60000),
        },
      });
    }
  }

  if (demoAccounts.length) {
    const demoAccountIds = demoAccounts.map((account) => account.id);
    await prisma.vehicleListing.deleteMany({where: {sellerId: {in: demoAccountIds}}});
    await prisma.garageVehicle.deleteMany({where: {ownerId: {in: demoAccountIds}}});
  } else {
    await prisma.vehicleListing.deleteMany({
      where: {description: {startsWith: `[${MARKET_MARKER}:`}},
    });
    await prisma.garageVehicle.deleteMany({
      where: {description: {startsWith: `[${MARKET_MARKER}:`}},
    });
  }

  for (let index = 0; index < MARKET_LISTING_COUNT; index += 1) {
    const item = dailyVehicles[index % dailyVehicles.length];
    const generation = Math.floor(index / dailyVehicles.length);
    const owner = accounts[(index + 11) % accounts.length];
    const verifiedImage = verifiedImages.get(item.wikipediaPage)!;
    const location = locations[index % locations.length];
    const year = item.year - generation * 2;
    const mileage = item.mileage + generation * 18000 + (index % 5) * 900;
    const price = Math.round(item.price * (generation === 0 ? 1 : generation === 1 ? 0.9 : 0.82));
    const title = `${year} ${item.make} ${item.model}`;
    const marker = `[${MARKET_MARKER}:${String(index + 1).padStart(2, '0')}]`;
    const description = [
      marker,
      'TIN DỮ LIỆU DEMO - không phải xe thật đang được một cá nhân rao bán.',
      `${title}, địa điểm mô phỏng: ${location}. Giá hiển thị là giá rao giả lập để kiểm thử giao diện, không phải bản tin giá thị trường.`,
      `Thông tin mô phỏng: odo ${mileage.toLocaleString('vi-VN')} km, kiểu xe ${item.bodyType}, nhiên liệu ${item.fuelType}, hộp số ${item.transmission}.`,
      `Ảnh đại diện đúng dòng ${item.make} ${item.model} lấy từ Wikipedia/Wikimedia Commons; màu sắc, đời xe hoặc phiên bản trong ảnh có thể khác dữ liệu mô phỏng.`,
      `Nguồn ảnh: ${verifiedImage.sourcePage}`,
    ].join('\n\n');

    const garageVehicle = await prisma.garageVehicle.create({
      data: {
        title,
        description,
        image: verifiedImage.imageUrl,
        images: [verifiedImage.imageUrl],
        condition: mileage < 10000 ? 'New' : 'Used',
        make: item.make,
        model: item.model,
        year,
        mileage,
        bodyType: item.bodyType,
        fuelType: item.fuelType,
        transmission: item.transmission,
        specs: item.specs,
        status: 'Active Listing',
        ownerId: owner.id,
      },
    });

    await prisma.vehicleListing.create({
      data: {
        title,
        description,
        price: formatPrice(price),
        location,
        category: 'Daily',
        status: 'Active Listing',
        sellerId: owner.id,
        vehicleId: garageVehicle.id,
        createdAt: new Date(Date.now() - (index % 45) * 86400000 - (index % 8) * 3600000),
      },
    });
  }

  const [postCount, uniquePostTitles, listingCount, uniqueListingTitles] = await Promise.all([
    prisma.post.count({where: {summary: {startsWith: `[${COMMUNITY_MARKER}:`}}}),
    prisma.post.findMany({
      where: {summary: {startsWith: `[${COMMUNITY_MARKER}:`}},
      distinct: ['title'],
      select: {title: true},
    }),
    prisma.vehicleListing.count({where: {description: {startsWith: `[${MARKET_MARKER}:`}}}),
    prisma.vehicleListing.findMany({
      where: {description: {startsWith: `[${MARKET_MARKER}:`}},
      distinct: ['title'],
      select: {title: true},
    }),
  ]);

  if (postCount !== COMMUNITY_POST_COUNT || uniquePostTitles.length !== COMMUNITY_POST_COUNT) {
    throw new Error(`Dữ liệu bài cộng đồng không đạt yêu cầu: ${postCount} bài, ${uniquePostTitles.length} tiêu đề riêng.`);
  }
  if (listingCount !== MARKET_LISTING_COUNT || uniqueListingTitles.length !== MARKET_LISTING_COUNT) {
    throw new Error(`Dữ liệu chợ xe không đạt yêu cầu: ${listingCount} tin, ${uniqueListingTitles.length} tiêu đề riêng.`);
  }

  console.log(`Đã tạo ${postCount} bài cộng đồng với ${uniquePostTitles.length} tiêu đề không trùng.`);
  console.log(`Đã tạo ${listingCount} tin xe phổ thông với ${uniqueListingTitles.length} tiêu đề không trùng.`);
};

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
