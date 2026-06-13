import '../src/config/localEnv';
import {prisma} from '../src/config/prisma';

const MARKET_MARKER = 'CARHUB_DAILY_MARKET_V1';

const europeanMakes = new Set([
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Volkswagen',
  'Volvo',
  'Peugeot',
  'Renault',
  'Porsche',
  'Land Rover',
  'Bentley',
  'Ferrari',
  'Lamborghini',
  'McLaren',
  'Aston Martin',
]);

const brandPriceRanges = new Map<string, [number, number]>([
  ['Honda', [418, 2399]],
  ['Bentley', [18000, 19548]],
  ['MG', [399, 869]],
  ['Land Rover', [2959, 10760]],
  ['BMW', [1899, 10990]],
  ['Toyota', [479, 4370]],
  ['Ford', [603, 2439]],
  ['Hyundai', [426, 1500]],
  ['Kia', [359, 1980]],
  ['Mercedes-Benz', [1599, 10950]],
  ['Mitsubishi', [380, 1365]],
  ['Lexus', [2130, 9610]],
  ['VinFast', [352, 4600]],
  ['Suzuki', [252, 639]],
  ['Nissan', [539, 970]],
]);

const parsePriceMillions = (value: string) =>
  Number(value.replace(/\D/g, '')) / 1_000_000;

const main = async () => {
  const listings = await prisma.vehicleListing.findMany({
    where: {description: {startsWith: `[${MARKET_MARKER}:`}},
    include: {vehicle: true},
  });

  const priceViolations = listings.flatMap((listing) => {
    const range = brandPriceRanges.get(listing.vehicle.make);
    const price = parsePriceMillions(listing.price);
    return range && (price < range[0] || price > range[1])
      ? [{title: listing.title, make: listing.vehicle.make, price, range}]
      : [];
  });
  const europeanModels = new Set(
    listings
      .filter((listing) => europeanMakes.has(listing.vehicle.make))
      .map((listing) => `${listing.vehicle.make} ${listing.vehicle.model}`),
  );

  const result = {
    total: listings.length,
    uniqueTitles: new Set(listings.map((listing) => listing.title)).size,
    europeanModels: europeanModels.size,
    europeanListings: listings.filter((listing) => europeanMakes.has(listing.vehicle.make)).length,
    exotics: listings.filter((listing) => listing.category === 'Exotics').length,
    priceViolations,
    oldDemoCopy: listings.filter((listing) => /demo|dữ liệu mẫu/i.test(listing.description)).length,
    missingDisclosure: listings.filter(
      (listing) => !listing.description.includes('không phải tin rao trực tiếp'),
    ).length,
    missingImageSource: listings.filter(
      (listing) => !listing.description.includes('Nguồn ảnh: https://'),
    ).length,
  };

  console.log(JSON.stringify(result, null, 2));

  if (
    result.total !== 150 ||
    result.uniqueTitles !== 150 ||
    result.europeanModels < 50 ||
    result.exotics < 5 ||
    result.priceViolations.length ||
    result.oldDemoCopy ||
    result.missingDisclosure ||
    result.missingImageSource
  ) {
    throw new Error('Daily content audit failed.');
  }
};

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
