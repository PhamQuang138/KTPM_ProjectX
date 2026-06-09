import '../src/config/localEnv';
import {prisma} from '../src/config/prisma';

type VehicleMetadata = {
  make: string;
  model: string;
  year: number | null;
  mileage: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
};

const isDryRun = process.argv.includes('--dry-run');
const currentYear = new Date().getFullYear();

const knownMakes = [
  'Mercedes-Benz',
  'Aston Martin',
  'Land Rover',
  'Rolls-Royce',
  'Alfa Romeo',
  'Lamborghini',
  'Mitsubishi',
  'Chevrolet',
  'Volkswagen',
  'VinFast',
  'Hyundai',
  'Genesis',
  'Ferrari',
  'Porsche',
  'Toyota',
  'Nissan',
  'Subaru',
  'Lexus',
  'Honda',
  'Mazda',
  'Audi',
  'BMW',
  'Ford',
  'Kia',
  'Tesla',
  'Volvo',
  'Jeep',
  'Dodge',
  'McLaren',
  'Bentley',
];

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const includesAny = (value: string, keywords: string[]) =>
  keywords.some((keyword) => value.includes(keyword));

const inferMake = (title: string, existing?: string | null) => {
  const normalizedTitle = normalizeText(title);
  const matched = knownMakes.find((make) => normalizedTitle.includes(normalizeText(make)));
  if (matched) return matched;

  const cleanExisting = existing?.trim();
  if (cleanExisting) return cleanExisting;

  return 'Khác';
};

const inferModel = (title: string, make: string, existing?: string | null) => {
  const titleWithoutYear = title.replace(/\b(18|19|20)\d{2}\b/, '').trim();
  const makePattern = new RegExp(make.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const fromTitle = titleWithoutYear.replace(makePattern, '').trim();
  const cleanExisting = existing?.trim();

  if (fromTitle) return fromTitle;
  if (cleanExisting && normalizeText(cleanExisting) !== normalizeText(make)) return cleanExisting;
  return 'Không xác định';
};

const inferBodyType = (searchable: string, existing?: string | null) => {
  if (includesAny(searchable, ['convertible', 'cabriolet', 'roadster', 'mx-5', 'mui tran'])) return 'Convertible';
  if (includesAny(searchable, ['pickup', 'truck', 'ban tai', 'ranger', 'hilux', 'triton'])) return 'Pickup';
  if (includesAny(searchable, ['ioniq 5', 'ev6', 'crossover'])) return 'Crossover';
  if (includesAny(searchable, ['hatchback', 'prius', 'type r'])) return 'Hatchback';
  if (
    includesAny(searchable, [
      'suv',
      'dbx',
      'x5',
      'g-class',
      'land cruiser',
      'pajero',
      'sportage',
      'santa fe',
      'cr-v',
      'cx-5',
    ])
  ) {
    return 'SUV';
  }
  if (
    includesAny(searchable, [
      'sedan',
      'amg sedan',
      'luxury sedan',
      'a8',
      '320d',
      'accord',
      'civic',
      'wrx',
      'g70',
      'g80',
      'e-class',
      'm3',
    ])
  ) {
    return 'Sedan';
  }
  return existing?.trim() || 'Coupe';
};

const inferFuelType = (searchable: string, existing?: string | null) => {
  if (includesAny(searchable, ['electric', 'electrified', 'ev6', 'ioniq 5', 'dien'])) return 'Electric';
  if (includesAny(searchable, ['hybrid', 'prius'])) return 'Hybrid';
  if (includesAny(searchable, ['diesel', '320d', 'dau'])) return 'Diesel';
  return existing?.trim() || 'Gasoline';
};

const inferTransmission = (searchable: string, existing?: string | null) => {
  if (includesAny(searchable, ['manual', 'so san'])) return 'Manual';
  if (includesAny(searchable, ['automatic', 'pdk', 'dual-clutch', 'electric', 'so tu dong'])) return 'Automatic';
  return existing?.trim() || 'Automatic';
};

const inferYear = (title: string, existing?: number | null) => {
  if (existing && existing >= 1886 && existing <= currentYear + 1) return existing;
  const parsed = Number(title.match(/\b((?:18|19|20)\d{2})\b/)?.[1]);
  return parsed >= 1886 && parsed <= currentYear + 1 ? parsed : null;
};

const buildMetadata = (vehicle: {
  title: string;
  description: string | null;
  condition: string;
  make: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  bodyType: string | null;
  fuelType: string | null;
  transmission: string | null;
  specs: string[];
}): VehicleMetadata => {
  const make = inferMake(vehicle.title, vehicle.make);
  const model = inferModel(vehicle.title, make, vehicle.model);
  const searchable = normalizeText(
    [vehicle.title, vehicle.description, make, model, ...vehicle.specs].filter(Boolean).join(' '),
  );

  return {
    make,
    model,
    year: inferYear(vehicle.title, vehicle.year),
    mileage: vehicle.mileage != null && vehicle.mileage >= 0
      ? vehicle.mileage
      : vehicle.condition === 'New'
        ? 0
        : 25000,
    bodyType: inferBodyType(searchable, vehicle.bodyType),
    fuelType: inferFuelType(searchable, vehicle.fuelType),
    transmission: inferTransmission(searchable, vehicle.transmission),
  };
};

const main = async () => {
  const vehicles = await prisma.garageVehicle.findMany({
    include: {_count: {select: {listings: true}}},
    orderBy: {createdAt: 'asc'},
  });
  const unlinkedListings = await prisma.vehicleListing.count({where: {vehicleId: null}});
  const changes: Array<{id: string; title: string; before: object; after: VehicleMetadata}> = [];

  for (const vehicle of vehicles) {
    const metadata = buildMetadata(vehicle);
    const before = {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      bodyType: vehicle.bodyType,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
    };
    if (JSON.stringify(before) === JSON.stringify(metadata)) continue;

    changes.push({id: vehicle.id, title: vehicle.title, before, after: metadata});
    if (!isDryRun) {
      await prisma.garageVehicle.update({
        where: {id: vehicle.id},
        data: metadata,
      });
    }
  }

  const makes = new Map<string, number>();
  for (const vehicle of vehicles) {
    const make = buildMetadata(vehicle).make;
    makes.set(make, (makes.get(make) ?? 0) + 1);
  }
  const [astonMartinListings, dieselListings, crossoverListings, recentSuvListings] = await Promise.all([
    prisma.vehicleListing.count({
      where: {status: {not: 'Hidden'}, vehicle: {is: {make: {equals: 'Aston Martin', mode: 'insensitive'}}}},
    }),
    prisma.vehicleListing.count({
      where: {status: {not: 'Hidden'}, vehicle: {is: {fuelType: {equals: 'Diesel', mode: 'insensitive'}}}},
    }),
    prisma.vehicleListing.count({
      where: {status: {not: 'Hidden'}, vehicle: {is: {bodyType: {equals: 'Crossover', mode: 'insensitive'}}}},
    }),
    prisma.vehicleListing.count({
      where: {
        status: {not: 'Hidden'},
        vehicle: {is: {bodyType: {equals: 'SUV', mode: 'insensitive'}, year: {gte: 2020}}},
      },
    }),
  ]);

  console.log(`Chế độ: ${isDryRun ? 'kiểm tra, chưa ghi DB' : 'đã cập nhật DB'}`);
  console.log(`Tổng xe Garage: ${vehicles.length}`);
  console.log(`Xe cần chuẩn hóa: ${changes.length}`);
  console.log(`Tin chợ chưa liên kết Garage: ${unlinkedListings}`);
  console.log(
    `Theo hãng: ${[...makes.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([make, count]) => `${make}=${count}`)
      .join(', ')}`,
  );
  console.log(
    `Kiểm tra bộ lọc: Aston Martin=${astonMartinListings}, Diesel=${dieselListings}, Crossover=${crossoverListings}, SUV từ 2020=${recentSuvListings}`,
  );

  for (const change of changes.slice(0, 20)) {
    console.log(`- ${change.title}: ${JSON.stringify(change.before)} -> ${JSON.stringify(change.after)}`);
  }
  if (changes.length > 20) console.log(`... và ${changes.length - 20} xe khác.`);
};

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
