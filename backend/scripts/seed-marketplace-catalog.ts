import '../src/config/localEnv';
import {put} from '@vercel/blob';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import {prisma} from '../src/config/prisma';

const PASSWORD = 'Matkhau123@';
const ACCOUNT_COUNT = 45;
const OUTPUT_PATH = path.resolve(process.cwd(), 'generated', 'marketplace-seed-accounts.txt');

interface CarPhoto {
  pexelsId: number;
  make: string;
  model: string;
  year: number;
  category: 'Exotics' | 'Classics' | 'Daily' | 'Projects';
  condition: 'New' | 'Used' | 'Project';
  price: number;
  location: string;
  specs: string[];
}

const photos: CarPhoto[] = [
  {pexelsId: 27530033, make: 'Ferrari', model: 'Sports Car', year: 2022, category: 'Exotics', condition: 'Used', price: 285000, location: 'Ho Chi Minh City', specs: ['V8', 'Automatic', 'Rear-wheel drive']},
  {pexelsId: 27759894, make: 'Ferrari', model: 'Classic Coupe', year: 1988, category: 'Classics', condition: 'Used', price: 340000, location: 'Hanoi', specs: ['Collector car', 'Manual', 'Italian classic']},
  {pexelsId: 11629649, make: 'Ferrari', model: 'Grand Tourer', year: 2020, category: 'Exotics', condition: 'Used', price: 265000, location: 'Da Nang', specs: ['V8', 'Low mileage', 'Full service history']},
  {pexelsId: 15824801, make: 'Lamborghini', model: 'Supercar', year: 2021, category: 'Exotics', condition: 'Used', price: 410000, location: 'Ho Chi Minh City', specs: ['V10', 'Carbon package', 'All-wheel drive']},
  {pexelsId: 8237006, make: 'Lamborghini', model: 'Performance Coupe', year: 2019, category: 'Exotics', condition: 'Used', price: 375000, location: 'Nha Trang', specs: ['V10', 'Sport exhaust', 'Ceramic brakes']},
  {pexelsId: 3802510, make: 'Lamborghini', model: 'Custom Coupe', year: 2018, category: 'Exotics', condition: 'Used', price: 360000, location: 'Hanoi', specs: ['Custom wheels', 'Performance package', 'All-wheel drive']},
  {pexelsId: 9814982, make: 'Lamborghini', model: 'Aventador', year: 2017, category: 'Exotics', condition: 'Used', price: 495000, location: 'Ho Chi Minh City', specs: ['V12', 'Carbon ceramic brakes', 'Front lift']},
  {pexelsId: 9814983, make: 'Lamborghini', model: 'Aventador', year: 2018, category: 'Exotics', condition: 'Used', price: 520000, location: 'Da Nang', specs: ['V12', 'White exterior', 'All-wheel drive']},
  {pexelsId: 26955904, make: 'Lamborghini', model: 'Diablo', year: 1997, category: 'Classics', condition: 'Used', price: 610000, location: 'Hanoi', specs: ['V12', 'Classic supercar', 'Manual']},
  {pexelsId: 8664307, make: 'Lamborghini', model: 'Matte Black Coupe', year: 2020, category: 'Exotics', condition: 'Used', price: 430000, location: 'Ho Chi Minh City', specs: ['Matte finish', 'LED lighting', 'Premium interior']},
  {pexelsId: 6166025, make: 'Porsche', model: '911', year: 2016, category: 'Exotics', condition: 'Used', price: 165000, location: 'Hanoi', specs: ['Flat-six', 'PDK', 'Sport Chrono']},
  {pexelsId: 5952099, make: 'Nissan', model: 'GT-R', year: 2017, category: 'Exotics', condition: 'Used', price: 128000, location: 'Ho Chi Minh City', specs: ['Twin turbo V6', 'All-wheel drive', 'Bose audio']},
  {pexelsId: 11026047, make: 'Nissan', model: 'GT-R', year: 2019, category: 'Exotics', condition: 'Used', price: 145000, location: 'Da Nang', specs: ['Twin turbo V6', 'Performance tires', 'Launch control']},
  {pexelsId: 8060365, make: 'Nissan', model: 'Skyline GT-R', year: 2002, category: 'Classics', condition: 'Used', price: 185000, location: 'Hanoi', specs: ['Japanese import', 'Manual', 'Collector condition']},
  {pexelsId: 14667498, make: 'Mercedes-Benz', model: 'AMG Sedan', year: 2021, category: 'Daily', condition: 'Used', price: 112000, location: 'Ho Chi Minh City', specs: ['AMG package', 'Premium sound', 'Driver assistance']},
  {pexelsId: 355977, make: 'Mercedes-Benz', model: 'Luxury Sedan', year: 2018, category: 'Daily', condition: 'Used', price: 78000, location: 'Hanoi', specs: ['Leather interior', 'LED headlights', 'Automatic']},
  {pexelsId: 6131009, make: 'Mercedes-Benz', model: 'Performance SUV', year: 2020, category: 'Daily', condition: 'Used', price: 105000, location: 'Da Nang', specs: ['All-wheel drive', 'Panoramic roof', 'Adaptive cruise']},
  {pexelsId: 18099076, make: 'Audi', model: 'A8', year: 2020, category: 'Daily', condition: 'Used', price: 97000, location: 'Ho Chi Minh City', specs: ['Quattro', 'Luxury package', 'Virtual cockpit']},
  {pexelsId: 18688731, make: 'BMW', model: '320d', year: 2019, category: 'Daily', condition: 'Used', price: 52000, location: 'Hanoi', specs: ['Diesel', 'Automatic', 'Rear-wheel drive']},
  {pexelsId: 12330348, make: 'Toyota', model: 'Supra', year: 1998, category: 'Classics', condition: 'Project', price: 89000, location: 'Ho Chi Minh City', specs: ['Turbo', 'Tuned', 'Project car']},
  {pexelsId: 4062474, make: 'Toyota', model: 'Supra', year: 2020, category: 'Exotics', condition: 'Used', price: 72000, location: 'Da Nang', specs: ['Turbocharged', 'Automatic', 'Performance package']},
  {pexelsId: 17710784, make: 'Toyota', model: 'Supra Tuned', year: 2021, category: 'Projects', condition: 'Used', price: 86000, location: 'Hanoi', specs: ['Custom wheels', 'Tuned suspension', 'Sport exhaust']},
  {pexelsId: 12630854, make: 'Ford', model: 'Mustang Convertible', year: 1967, category: 'Classics', condition: 'Used', price: 98000, location: 'Da Lat', specs: ['Classic V8', 'Convertible', 'Restored']},
  {pexelsId: 25286661, make: 'Ford', model: 'Mustang GT', year: 2021, category: 'Exotics', condition: 'Used', price: 76000, location: 'Ho Chi Minh City', specs: ['V8', 'Performance pack', 'Manual']},
  {pexelsId: 14658072, make: 'Ford', model: 'Mustang Classic', year: 1969, category: 'Classics', condition: 'Used', price: 115000, location: 'Hanoi', specs: ['American muscle', 'V8', 'Collector vehicle']},
  {pexelsId: 17027187, make: 'Chevrolet', model: 'Corvette Classic', year: 1967, category: 'Classics', condition: 'Used', price: 138000, location: 'Ho Chi Minh City', specs: ['V8', 'Classic sports car', 'Restored']},
  {pexelsId: 20044580, make: 'Chevrolet', model: 'Corvette Convertible', year: 1972, category: 'Classics', condition: 'Used', price: 126000, location: 'Da Nang', specs: ['Convertible', 'V8', 'Collector condition']},
  {pexelsId: 14809179, make: 'Chevrolet', model: 'Corvette', year: 1982, category: 'Classics', condition: 'Used', price: 69000, location: 'Hanoi', specs: ['V8', 'Automatic', 'Original interior']},
  {pexelsId: 18108309, make: 'Chevrolet', model: 'Corvette C8', year: 2023, category: 'Exotics', condition: 'Used', price: 135000, location: 'Ho Chi Minh City', specs: ['Mid-engine V8', 'Dual-clutch', 'Performance seats']},
  {pexelsId: 6952780, make: 'Aston Martin', model: 'Sports Coupe', year: 2020, category: 'Exotics', condition: 'Used', price: 235000, location: 'Hanoi', specs: ['V8', 'Luxury interior', 'Sport exhaust']},
  {pexelsId: 9145484, make: 'Aston Martin', model: 'DBX', year: 2022, category: 'Daily', condition: 'Used', price: 245000, location: 'Ho Chi Minh City', specs: ['Luxury SUV', 'All-wheel drive', 'Panoramic roof']},
];

const pexelsImageUrl = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600`;
const pexelsPageUrl = (id: number) => `https://www.pexels.com/photo/${id}/`;

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(price);

const uploadPhoto = async (photo: CarPhoto) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return pexelsImageUrl(photo.pexelsId);

  const response = await fetch(pexelsImageUrl(photo.pexelsId));
  if (!response.ok) throw new Error(`Cannot download Pexels photo ${photo.pexelsId}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const blob = await put(`marketplace-seed/${photo.make.toLowerCase().replace(/\W+/g, '-')}-${photo.pexelsId}.jpg`, buffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'image/jpeg',
  });
  return blob.url;
};

const main = async () => {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const uploadedPhotos = new Map<number, string>();
  const accountLines = [
    'CARHUB MARKETPLACE DEMO ACCOUNTS',
    `Generated: ${new Date().toISOString()}`,
    `Common password: ${PASSWORD}`,
    '',
  ];

  for (let index = 0; index < ACCOUNT_COUNT; index += 1) {
    const number = String(index + 1).padStart(2, '0');
    const photo = photos[index % photos.length];
    const email = `seller${number}@carhub-demo.com`;
    const name = `${photo.make} Owner ${number}`;
    const title = `${photo.year} ${photo.make} ${photo.model}`;
    const price = photo.price + Math.floor(index / photos.length) * 2500;

    let imageUrl = uploadedPhotos.get(photo.pexelsId);
    if (!imageUrl) {
      imageUrl = await uploadPhoto(photo);
      uploadedPhotos.set(photo.pexelsId, imageUrl);
    }

    const user = await prisma.user.upsert({
      where: {email},
      update: {
        password: passwordHash,
        name,
        avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`,
        location: photo.location,
        focusBrands: [photo.make],
      },
      create: {
        email,
        password: passwordHash,
        name,
        avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`,
        location: photo.location,
        focusBrands: [photo.make],
      },
    });

    await prisma.vehicleListing.deleteMany({where: {sellerId: user.id}});
    await prisma.garageVehicle.deleteMany({where: {ownerId: user.id}});

    const description = [
      `${title} được đăng bởi chủ xe demo của CarHub.`,
      `Tình trạng: ${photo.condition}. Xe có hồ sơ bảo dưỡng và giấy tờ để người mua kiểm tra.`,
      `Thông số nổi bật: ${photo.specs.join(', ')}.`,
      'Người mua có thể dùng nút Liên hệ để trao đổi trực tiếp với người bán về lịch xem xe, lịch sử bảo dưỡng và giá.',
      `Nguồn ảnh tham khảo Pexels: ${pexelsPageUrl(photo.pexelsId)}`,
    ].join('\n\n');

    const vehicle = await prisma.garageVehicle.create({
      data: {
        title,
        description,
        image: imageUrl,
        images: [imageUrl],
        condition: photo.condition,
        make: photo.make,
        model: photo.model,
        year: photo.year,
        mileage: photo.condition === 'New' ? 0 : 25000 + index * 700,
        bodyType: photo.model.includes('SUV') ? 'SUV' : photo.model.includes('Sedan') ? 'Sedan' : photo.model.includes('Convertible') ? 'Convertible' : 'Coupe',
        fuelType: 'Gasoline',
        transmission: photo.specs.includes('Manual') ? 'Manual' : 'Automatic',
        specs: photo.specs,
        status: 'Active Listing',
        ownerId: user.id,
      },
    });

    await prisma.vehicleListing.create({
      data: {
        title,
        description,
        price: formatPrice(price),
        location: photo.location,
        category: photo.category,
        status: 'Active Listing',
        sellerId: user.id,
        vehicleId: vehicle.id,
      },
    });

    accountLines.push(`${number}. ${email} | ${PASSWORD} | ${title}`);
    console.log(`[${index + 1}/${ACCOUNT_COUNT}] ${title}`);
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), {recursive: true});
  await fs.writeFile(OUTPUT_PATH, `${accountLines.join('\r\n')}\r\n`, 'utf8');
  console.log(`Created ${ACCOUNT_COUNT} marketplace accounts.`);
  console.log(`Credentials: ${OUTPUT_PATH}`);
};

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
