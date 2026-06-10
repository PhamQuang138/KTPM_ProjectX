import '../src/config/localEnv';
import {put} from '@vercel/blob';
import {prisma} from '../src/config/prisma';

const ACCOUNT_COUNT = 45;
const CATALOG_MARKER = 'CARHUB_ASIA_CATALOG_V1';

type Category = 'Daily' | 'Exotics' | 'Classics' | 'Projects';
type Condition = 'New' | 'Used' | 'Project';

interface CatalogVehicle {
  pexelsId: number;
  make: string;
  model: string;
  year: number;
  price: number;
  category: Category;
  condition: Condition;
  bodyType: string;
  fuelType: string;
  transmission: string;
  mileage: number;
  specs: string[];
}

const vehicle = (
  pexelsId: number,
  make: string,
  model: string,
  year: number,
  price: number,
  bodyType: string,
  specs: string[],
  options: Partial<Pick<CatalogVehicle, 'category' | 'condition' | 'fuelType' | 'transmission' | 'mileage'>> = {},
): CatalogVehicle => ({
  pexelsId,
  make,
  model,
  year,
  price,
  bodyType,
  specs,
  category: options.category ?? 'Daily',
  condition: options.condition ?? 'Used',
  fuelType: options.fuelType ?? 'Gasoline',
  transmission: options.transmission ?? 'Automatic',
  mileage: options.mileage ?? 18000 + (pexelsId % 47000),
});

const catalog: CatalogVehicle[] = [
  vehicle(18029607, 'Toyota', 'Land Cruiser', 2022, 92000, 'SUV', ['4WD', '7 seats', 'Adaptive cruise']),
  vehicle(2974623, 'Toyota', 'Land Cruiser Classic', 1989, 48000, 'SUV', ['4WD', 'Restored', 'Collector vehicle'], {category: 'Classics', transmission: 'Manual', mileage: 128000}),
  vehicle(18029630, 'Toyota', 'Land Cruiser Prado', 2021, 68000, 'SUV', ['4WD', 'Leather interior', '360 camera']),
  vehicle(18029645, 'Toyota', 'Land Cruiser VX', 2023, 105000, 'SUV', ['4WD', 'Premium package', 'Low mileage'], {condition: 'New', mileage: 2800}),
  vehicle(14415166, 'Toyota', 'Prius', 2020, 28000, 'Hatchback', ['Hybrid', 'Fuel efficient', 'Driver assistance'], {fuelType: 'Hybrid'}),
  vehicle(12330348, 'Toyota', 'Supra MK4', 1998, 89000, 'Coupe', ['Turbo', 'JDM', 'Tuned suspension'], {category: 'Classics', condition: 'Project', transmission: 'Manual', mileage: 96000}),
  vehicle(4062474, 'Toyota', 'GR Supra', 2021, 72000, 'Coupe', ['Turbocharged', 'Performance package', 'Rear-wheel drive'], {category: 'Exotics'}),

  vehicle(7687300, 'Lexus', 'Sports Coupe', 2021, 79000, 'Coupe', ['Luxury interior', 'Performance brakes', 'Premium audio'], {category: 'Exotics'}),

  vehicle(16387777, 'Honda', 'Accord', 2020, 32000, 'Sedan', ['Turbo', 'Honda Sensing', 'Leather seats']),
  vehicle(16350076, 'Honda', 'Accord Sport', 2021, 35000, 'Sedan', ['Sport package', 'LED headlights', 'Premium wheels']),
  vehicle(20619143, 'Honda', 'Civic Tuned', 2019, 29000, 'Sedan', ['Carbon hood', 'Aftermarket wheels', 'Lowered suspension'], {category: 'Projects', transmission: 'Manual'}),
  vehicle(17364001, 'Honda', 'Civic Type R Style', 2020, 41000, 'Hatchback', ['Rear spoiler', 'Sport exhaust', 'Performance tires'], {category: 'Projects', transmission: 'Manual'}),
  vehicle(9331804, 'Honda', 'Civic Classic', 1996, 18000, 'Sedan', ['JDM', 'Modified', 'Car meet build'], {category: 'Classics', transmission: 'Manual', mileage: 142000}),

  vehicle(1519192, 'Hyundai', 'Santa Fe', 2020, 36000, 'SUV', ['All-wheel drive', 'Panoramic roof', 'Family SUV']),
  vehicle(17920198, 'Hyundai', 'Ioniq 5', 2023, 47000, 'Crossover', ['Fast charging', 'Vehicle-to-load', 'Digital cockpit'], {condition: 'New', fuelType: 'Electric', mileage: 3500}),
  vehicle(11194877, 'Hyundai', 'Ioniq 5 N-Line', 2022, 51000, 'Crossover', ['Electric performance', 'Sport seats', 'Advanced safety'], {fuelType: 'Electric'}),
  vehicle(26180142, 'Hyundai', 'Ioniq 5 AWD', 2024, 54000, 'Crossover', ['Dual motor', 'All-wheel drive', 'Fast charging'], {condition: 'New', fuelType: 'Electric', mileage: 1200}),
  vehicle(20787788, 'Hyundai', 'Ioniq 5 Long Range', 2023, 50000, 'Crossover', ['Long range battery', 'Heat pump', 'Smart cruise'], {fuelType: 'Electric'}),

  vehicle(27286179, 'Kia', 'Sportage', 2022, 35000, 'SUV', ['Family SUV', 'LED lighting', 'Lane assist']),
  vehicle(27284257, 'Kia', 'Sportage AWD', 2021, 33000, 'SUV', ['All-wheel drive', 'Roof rails', 'Rear camera']),
  vehicle(26576259, 'Kia', 'EV6', 2023, 52000, 'Crossover', ['800V charging', 'Electric', 'Digital cockpit'], {fuelType: 'Electric'}),
  vehicle(13928476, 'Kia', 'EV6 GT-Line', 2022, 57000, 'Crossover', ['Dual motor', 'GT-Line', 'Fast charging'], {category: 'Exotics', fuelType: 'Electric'}),
  vehicle(5633405, 'Kia', 'Sportage Adventure', 2020, 30000, 'SUV', ['Roof rack', 'Outdoor package', 'All-terrain tires']),

  vehicle(11262462, 'Genesis', 'G80 Electrified', 2023, 74000, 'Sedan', ['Electric luxury', 'Premium interior', 'Advanced safety'], {fuelType: 'Electric'}),
  vehicle(11159145, 'Genesis', 'G70', 2022, 53000, 'Sedan', ['Sport sedan', 'Rear-wheel drive', 'Brembo brakes']),
  vehicle(15012606, 'Genesis', 'X Concept', 2024, 125000, 'Coupe', ['Concept design', 'Electric GT', 'Luxury cabin'], {category: 'Exotics', condition: 'New', fuelType: 'Electric', mileage: 200}),
  vehicle(11254040, 'Genesis', 'G80 Sport', 2022, 67000, 'Sedan', ['Luxury sedan', 'Sport package', 'Premium audio']),
  vehicle(29952735, 'Genesis', 'G80 Electrified LWB', 2024, 92000, 'Sedan', ['Long wheelbase', 'Executive seats', 'Electric'], {condition: 'New', fuelType: 'Electric', mileage: 500}),

  vehicle(17974812, 'Mazda', 'MX-5', 2021, 34000, 'Convertible', ['Roadster', 'Rear-wheel drive', 'Lightweight'], {transmission: 'Manual'}),
  vehicle(20507720, 'Mazda', 'MX-5 RF', 2020, 36000, 'Convertible', ['Retractable roof', 'Skyactiv', 'Sport suspension'], {transmission: 'Manual'}),
  vehicle(21419352, 'Mazda', 'MX-5 Tuned', 2019, 32000, 'Convertible', ['Aftermarket wheels', 'Rear spoiler', 'Track setup'], {category: 'Projects', transmission: 'Manual'}),

  vehicle(22039932, 'Subaru', 'WRX', 2021, 39000, 'Sedan', ['AWD', 'Turbo', 'Custom livery'], {category: 'Projects', transmission: 'Manual'}),
  vehicle(16110681, 'Subaru', 'WRX STI', 2020, 47000, 'Sedan', ['AWD', 'Turbo', 'Rear wing'], {category: 'Exotics', transmission: 'Manual'}),
  vehicle(22039930, 'Subaru', 'WRX Street Build', 2019, 36000, 'Sedan', ['Hood scoop', 'Lowered', 'Performance wheels'], {category: 'Projects', transmission: 'Manual'}),
  vehicle(22039934, 'Subaru', 'WRX Track Pair', 2018, 35000, 'Sedan', ['Track setup', 'AWD', 'Tuned engine'], {category: 'Projects', transmission: 'Manual'}),
  vehicle(17594697, 'Subaru', 'WRX Premium', 2022, 42000, 'Sedan', ['AWD', 'Turbo', 'Driver assistance'], {transmission: 'Manual'}),
  vehicle(22039958, 'Subaru', 'WRX Limited', 2021, 44000, 'Sedan', ['AWD', 'Sport seats', 'Premium audio'], {transmission: 'Manual'}),

  vehicle(18207339, 'Mitsubishi', 'Pajero', 2018, 31000, 'SUV', ['4WD', 'Diesel', 'Off-road package'], {fuelType: 'Diesel'}),
  vehicle(18207365, 'Mitsubishi', 'Pajero Sport', 2019, 35000, 'SUV', ['4WD', 'Roof rack', 'All-terrain tires'], {fuelType: 'Diesel'}),

  vehicle(12920631, 'Nissan', '370Z', 2018, 37000, 'Coupe', ['V6', 'Rear-wheel drive', 'Sport exhaust'], {category: 'Exotics', transmission: 'Manual'}),
  vehicle(27395011, 'Nissan', '370Z Heritage', 2019, 42000, 'Coupe', ['V6', 'Heritage color', 'Performance wheels'], {category: 'Exotics'}),
  vehicle(17357666, 'Nissan', '370Z Nismo Style', 2020, 48000, 'Coupe', ['Nismo aero', 'Sport suspension', 'Rear-wheel drive'], {category: 'Exotics', transmission: 'Manual'}),
  vehicle(36417258, 'Nissan', '370Z Track Build', 2017, 45000, 'Coupe', ['Track setup', 'Rear spoiler', 'Tuned V6'], {category: 'Projects', transmission: 'Manual'}),
  vehicle(27684621, 'Nissan', '350Z', 2006, 26000, 'Coupe', ['V6', 'JDM', 'Rear-wheel drive'], {category: 'Classics', transmission: 'Manual', mileage: 112000}),
  vehicle(19253949, 'Nissan', '370Z Urban Edition', 2018, 39000, 'Coupe', ['V6', 'Custom wheels', 'Premium audio'], {category: 'Exotics'}),
  vehicle(26448051, 'Nissan', '350Z Show Car', 2007, 33000, 'Coupe', ['Custom paint', 'Show build', 'Modified suspension'], {category: 'Projects', transmission: 'Manual'}),

  vehicle(13990556, 'BMW', 'M3', 2021, 82000, 'Sedan', ['Twin-turbo', 'M performance', 'Rear-wheel drive'], {category: 'Exotics'}),
  vehicle(26936254, 'BMW', 'M4 Competition', 2022, 94000, 'Coupe', ['M Competition', 'Carbon package', 'Adaptive suspension'], {category: 'Exotics'}),
  vehicle(3581833, 'BMW', 'M4', 2020, 76000, 'Coupe', ['Twin-turbo', 'M sport seats', 'Rear-wheel drive'], {category: 'Exotics'}),
  vehicle(27353884, 'BMW', 'M4 Touring Setup', 2021, 86000, 'Coupe', ['Performance package', 'Adaptive suspension', 'Premium audio'], {category: 'Exotics'}),
  vehicle(22225510, 'BMW', 'M4 Individual', 2023, 108000, 'Coupe', ['Individual paint', 'Carbon roof', 'M brakes'], {category: 'Exotics', condition: 'New', mileage: 1800}),
  vehicle(19909381, 'BMW', 'X5 xDrive', 2021, 72000, 'SUV', ['xDrive', 'Panoramic roof', 'Driver assistance']),
  vehicle(9846162, 'BMW', 'M4 Coastal Edition', 2019, 70000, 'Coupe', ['M performance', 'Sport exhaust', 'Rear spoiler'], {category: 'Exotics'}),
  vehicle(9846158, 'BMW', 'M4 Performance', 2020, 78000, 'Coupe', ['M brakes', 'Sport suspension', 'Premium wheels'], {category: 'Exotics'}),

  vehicle(17233277, 'Mercedes-Benz', 'E-Class', 2021, 66000, 'Sedan', ['Luxury sedan', 'MBUX', 'Driver assistance']),
  vehicle(15610277, 'Mercedes-Benz', 'G-Class', 2022, 168000, 'SUV', ['4MATIC', 'Luxury SUV', 'Off-road package'], {category: 'Exotics'}),
  vehicle(20534677, 'Mercedes-Benz', 'G-Class Urban', 2021, 155000, 'SUV', ['4MATIC', 'Premium interior', '360 camera'], {category: 'Exotics'}),
  vehicle(17418619, 'Mercedes-Benz', 'G-Class AMG Line', 2023, 185000, 'SUV', ['AMG Line', '4MATIC', 'Performance exhaust'], {category: 'Exotics'}),
  vehicle(19597726, 'Mercedes-Benz', 'G-Class Adventure', 2020, 145000, 'SUV', ['4WD', 'Off-road mode', 'Luxury package'], {category: 'Exotics'}),
];

const locations = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Nha Trang',
  'Bình Dương',
  'Đồng Nai',
];

const pexelsImageUrl = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200&q=72`;
const pexelsPageUrl = (id: number) => `https://www.pexels.com/photo/${id}/`;
const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(price);

const uploadPhoto = async (item: CatalogVehicle) => {
  const sourceUrl = pexelsImageUrl(item.pexelsId);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return sourceUrl;

  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Không thể tải ảnh Pexels ${item.pexelsId}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const slug = `${item.make}-${item.model}-${item.pexelsId}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const blob = await put(`marketplace-asia/${slug}.jpg`, buffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'image/jpeg',
  });
  return blob.url;
};

const main = async () => {
  const accounts = await prisma.user.findMany({
    where: {email: {endsWith: '@carhub-demo.com'}},
    orderBy: {email: 'asc'},
    take: ACCOUNT_COUNT,
  });
  if (accounts.length !== ACCOUNT_COUNT) {
    throw new Error(`Cần đủ ${ACCOUNT_COUNT} tài khoản clone, hiện chỉ tìm thấy ${accounts.length}.`);
  }

  const oldVehicles = await prisma.garageVehicle.findMany({
    where: {description: {contains: `[${CATALOG_MARKER}:`}},
    select: {id: true, description: true, image: true},
  });
  const previousImages = new Map<number, string>();
  for (const oldVehicle of oldVehicles) {
    const match = oldVehicle.description?.match(new RegExp(`\\[${CATALOG_MARKER}:(\\d+)\\]`));
    if (match) previousImages.set(Number(match[1]), oldVehicle.image);
  }

  await prisma.vehicleListing.deleteMany({
    where: {description: {contains: `[${CATALOG_MARKER}:`}},
  });
  await prisma.garageVehicle.deleteMany({
    where: {description: {contains: `[${CATALOG_MARKER}:`}},
  });

  const accountBrands = new Map(accounts.map((account) => [account.id, new Set(account.focusBrands)]));

  for (let index = 0; index < catalog.length; index += 1) {
    const item = catalog[index];
    const owner = accounts[index % accounts.length];
    const title = `${item.year} ${item.make} ${item.model}`;
    const location = locations[index % locations.length];
    const imageUrl = previousImages.get(item.pexelsId) ?? await uploadPhoto(item);
    const marker = `[${CATALOG_MARKER}:${item.pexelsId}]`;
    const description = [
      marker,
      `${title} được đăng bởi thành viên demo của CarHub để mở rộng dữ liệu chợ xe.`,
      `Xe thuộc nhóm ${item.bodyType}, tình trạng ${item.condition.toLowerCase()}, đã đi khoảng ${item.mileage.toLocaleString('vi-VN')} km.`,
      `Thông tin chính: ${item.specs.join(', ')}. Nhiên liệu ${item.fuelType}, hộp số ${item.transmission}.`,
      'Có thể kiểm tra xe, giấy tờ và lịch sử bảo dưỡng trước khi giao dịch. Giá có thể thương lượng trực tiếp qua tin nhắn.',
      `Nguồn ảnh tham khảo Pexels: ${pexelsPageUrl(item.pexelsId)}`,
    ].join('\n\n');

    const garageVehicle = await prisma.garageVehicle.create({
      data: {
        title,
        description,
        image: imageUrl,
        images: [imageUrl],
        condition: item.condition,
        make: item.make,
        model: item.model,
        year: item.year,
        mileage: item.mileage,
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
        price: formatPrice(item.price),
        location,
        category: item.category,
        status: 'Active Listing',
        sellerId: owner.id,
        vehicleId: garageVehicle.id,
      },
    });

    accountBrands.get(owner.id)?.add(item.make);
    console.log(`[${index + 1}/${catalog.length}] ${title}`);
  }

  await Promise.all(
    accounts.map((account) =>
      prisma.user.update({
        where: {id: account.id},
        data: {focusBrands: [...(accountBrands.get(account.id) ?? [])]},
      }),
    ),
  );

  console.log(`Đã tạo ${catalog.length} tin chợ xe bổ sung từ ${new Set(catalog.map((item) => item.make)).size} hãng.`);
};

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
