import '../src/config/localEnv';
import {PostStatus} from '@prisma/client';
import {prisma} from '../src/config/prisma';

const ACCOUNT_COUNT = 45;
const COMMUNITY_MARKER = 'CARHUB_COMMUNITY_SEED_V2';
const MARKET_MARKER = 'CARHUB_ASIA_EXTRA_V1';
const COMMUNITY_POST_COUNT = 36;
const MARKET_LISTING_COUNT = 30;

const asianMakes = [
  'Toyota',
  'Lexus',
  'Honda',
  'Hyundai',
  'Kia',
  'Genesis',
  'Mazda',
  'Subaru',
  'Mitsubishi',
  'Nissan',
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

const postIdeas = [
  {
    title: 'Kinh nghiệm kiểm tra xe cũ trước khi xuống tiền',
    content: 'Mình thường kiểm tra lịch sử bảo dưỡng, độ mòn lốp, gầm xe và chạy thử ở cả tốc độ thấp lẫn đường trường. Quan trọng nhất là đối chiếu số khung, số máy và nhờ một garage độc lập kiểm tra.',
  },
  {
    title: 'Đi phố hằng ngày nên chọn hybrid hay xe xăng?',
    content: 'Nếu chủ yếu di chuyển trong thành phố, hybrid cho mức tiêu thụ nhiên liệu khá dễ chịu và không cần thay đổi thói quen sạc. Xe xăng vẫn hợp với người cần chi phí mua ban đầu thấp và thường xuyên đi xa.',
  },
  {
    title: 'Chia sẻ lịch chăm xe cuối tuần',
    content: 'Cuối tuần mình kiểm tra áp suất lốp, nước làm mát, dầu máy và vệ sinh lọc gió điều hòa. Những việc nhỏ nhưng làm đều giúp xe ổn định hơn rất nhiều.',
  },
  {
    title: 'SUV Nhật hay SUV Hàn trong tầm giá gia đình?',
    content: 'Xe Nhật thường được đánh giá cao về độ bền và khả năng giữ giá. Xe Hàn lại có nhiều trang bị, thiết kế mới và bảo hành tốt. Mình nghĩ nên lái thử cả hai trước khi quyết định.',
  },
  {
    title: 'Một chuyến đi dài và vài điều rút ra',
    content: 'Sau chuyến đi hơn 600 km, mình thấy adaptive cruise và cảnh báo điểm mù thực sự hữu ích. Trước khi đi nên cân bằng lốp, kiểm tra phanh và chuẩn bị bộ vá lốp dự phòng.',
  },
  {
    title: 'Có nên mua xe hiệu suất cao để sử dụng hằng ngày?',
    content: 'Xe hiệu suất cao đem lại cảm xúc tốt nhưng chi phí lốp, phanh, nhiên liệu và bảo dưỡng đều cao hơn. Nếu dùng hằng ngày, hãy ưu tiên một chiếc có chế độ lái êm và hệ thống treo thích ứng.',
  },
  {
    title: 'Mẹo chụp ảnh xe đẹp bằng điện thoại',
    content: 'Hãy chụp vào sáng sớm hoặc cuối chiều, giữ đường chân trời thẳng và tránh góc quá rộng làm méo thân xe. Một bộ ảnh nên có đủ ngoại thất, nội thất, khoang máy và các khuyết điểm thực tế.',
  },
  {
    title: 'Thảo luận về xe điện tại Việt Nam',
    content: 'Điểm mình quan tâm nhất là phạm vi thực tế, tốc độ sạc và vị trí trạm sạc trên hành trình thường dùng. Với người có chỗ sạc tại nhà, trải nghiệm sở hữu xe điện thuận tiện hơn đáng kể.',
  },
  {
    title: 'Bảo dưỡng hộp số tự động đúng cách',
    content: 'Nên theo lịch của nhà sản xuất, dùng đúng loại dầu và kiểm tra rò rỉ định kỳ. Khi chuyển số có độ trễ, rung hoặc tiếng lạ thì nên kiểm tra sớm thay vì tiếp tục sử dụng.',
  },
  {
    title: 'Những trang bị an toàn mình ưu tiên khi mua xe',
    content: 'Camera lùi, cân bằng điện tử, cảnh báo điểm mù và phanh khẩn cấp tự động là các trang bị mình ưu tiên. Công suất hấp dẫn, nhưng an toàn mới là thứ được dùng mỗi ngày.',
  },
  {
    title: 'Xe coupe có thực sự bất tiện?',
    content: 'Coupe ít chỗ hơn và cửa dài hơn, nhưng đổi lại tư thế lái cùng thiết kế rất cuốn hút. Nếu thường chỉ đi một hoặc hai người thì sự bất tiện không lớn như nhiều người nghĩ.',
  },
  {
    title: 'Kinh nghiệm thương lượng khi xem xe',
    content: 'Mình luôn ghi lại các hạng mục cần thay thế, tham khảo giá xe tương đương và đưa ra mức giá dựa trên chi phí sửa chữa thực tế. Trao đổi rõ ràng giúp cả người mua lẫn người bán tiết kiệm thời gian.',
  },
];

const formatPrice = (price: string, index: number) => {
  const numeric = Number(price.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return price;
  const adjusted = numeric * (0.91 + (index % 7) * 0.018);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(adjusted);
};

const main = async () => {
  const accounts = await prisma.user.findMany({
    where: {email: {endsWith: '@carhub-demo.com'}},
    orderBy: {email: 'asc'},
    take: ACCOUNT_COUNT,
  });
  if (accounts.length < ACCOUNT_COUNT) {
    throw new Error(`Cần ${ACCOUNT_COUNT} tài khoản demo, hiện chỉ có ${accounts.length}.`);
  }

  const sourceListings = await prisma.vehicleListing.findMany({
    where: {
      status: 'Active Listing',
      NOT: {description: {startsWith: `[${MARKET_MARKER}:`}},
      vehicle: {is: {make: {in: asianMakes}}},
    },
    include: {vehicle: true},
    orderBy: {createdAt: 'asc'},
  });
  const usableSources = sourceListings.filter((listing) => listing.vehicle?.image);
  if (usableSources.length < 12) {
    throw new Error('Chưa đủ dữ liệu xe châu Á để tạo nội dung bổ sung.');
  }

  await prisma.post.deleteMany({
    where: {summary: {startsWith: `[${COMMUNITY_MARKER}:`}},
  });

  const createdPosts = [];
  for (let index = 0; index < COMMUNITY_POST_COUNT; index += 1) {
    const author = accounts[index % accounts.length];
    const idea = postIdeas[index % postIdeas.length];
    const source = usableSources[index % usableSources.length];
    const secondarySource = usableSources[(index + 7) % usableSources.length];
    const imageMode = index % 3;
    const images = imageMode === 0
      ? []
      : [
          {
            url: source.vehicle!.image,
            caption: source.title,
          },
          ...(imageMode === 2
            ? [{url: secondarySource.vehicle!.image, caption: secondarySource.title}]
            : []),
        ];
    const createdAt = new Date(Date.now() - (index % 14) * 86400000 - (index % 9) * 3600000);

    const post = await prisma.post.create({
      data: {
        title: idea.title,
        content: `${idea.content}\n\nMọi người đang sử dụng dòng xe nào và có kinh nghiệm gì muốn chia sẻ thêm?`,
        summary: `[${COMMUNITY_MARKER}:${index + 1}] Bài cộng đồng từ tài khoản demo.`,
        status: PostStatus.PUBLISHED,
        authorId: author.id,
        createdAt,
        images: images.length ? {create: images} : undefined,
      },
    });
    createdPosts.push(post);
  }

  for (let index = 0; index < createdPosts.length; index += 1) {
    const post = createdPosts[index];
    const likeCount = 2 + (index % 9);
    const likerIds = Array.from({length: likeCount}, (_, offset) => accounts[(index + offset + 3) % accounts.length].id);
    await prisma.postLike.createMany({
      data: [...new Set(likerIds)].map((userId) => ({postId: post.id, userId})),
      skipDuplicates: true,
    });

    if (index % 2 === 0) {
      await prisma.postComment.create({
        data: {
          postId: post.id,
          userId: accounts[(index + 11) % accounts.length].id,
          content: index % 4 === 0
            ? 'Thông tin rất hữu ích, mình cũng đang tìm hiểu chủ đề này.'
            : 'Cảm ơn bạn đã chia sẻ kinh nghiệm thực tế.',
          createdAt: new Date(post.createdAt.getTime() + 3600000),
        },
      });
    }
  }

  await prisma.vehicleListing.deleteMany({
    where: {description: {startsWith: `[${MARKET_MARKER}:`}},
  });
  await prisma.garageVehicle.deleteMany({
    where: {description: {startsWith: `[${MARKET_MARKER}:`}},
  });

  for (let index = 0; index < MARKET_LISTING_COUNT; index += 1) {
    const source = usableSources[index % usableSources.length];
    const sourceVehicle = source.vehicle!;
    const owner = accounts[(index + 9) % accounts.length];
    const yearOffset = (index % 3) - 1;
    const year = Math.max(1990, Math.min(new Date().getFullYear(), (sourceVehicle.year ?? 2021) + yearOffset));
    const title = `${year} ${sourceVehicle.make} ${sourceVehicle.model}`;
    const marker = `[${MARKET_MARKER}:${index + 1}]`;
    const mileage = Math.max(500, (sourceVehicle.mileage ?? 25000) + (index - 12) * 650);
    const location = locations[index % locations.length];
    const description = [
      marker,
      `${title} đang được rao bán tại ${location}. Xe có thông tin rõ ràng và có thể hẹn kiểm tra trực tiếp.`,
      `Odo khoảng ${mileage.toLocaleString('vi-VN')} km, kiểu xe ${sourceVehicle.bodyType ?? 'Khác'}, nhiên liệu ${sourceVehicle.fuelType ?? 'Gasoline'}, hộp số ${sourceVehicle.transmission ?? 'Automatic'}.`,
      `Trang bị đáng chú ý: ${sourceVehicle.specs.slice(0, 4).join(', ') || 'trang bị tiêu chuẩn theo xe'}.`,
      'Người mua có thể nhắn trực tiếp cho người bán để hỏi lịch sử sử dụng, bảo dưỡng và thương lượng giá.',
    ].join('\n\n');

    const garageVehicle = await prisma.garageVehicle.create({
      data: {
        title,
        description,
        image: sourceVehicle.image,
        images: sourceVehicle.images.length ? sourceVehicle.images : [sourceVehicle.image],
        condition: index % 11 === 0 ? 'New' : 'Used',
        make: sourceVehicle.make,
        model: sourceVehicle.model,
        year,
        mileage: index % 11 === 0 ? Math.min(mileage, 1500) : mileage,
        bodyType: sourceVehicle.bodyType,
        fuelType: sourceVehicle.fuelType,
        transmission: sourceVehicle.transmission,
        specs: sourceVehicle.specs,
        status: 'Active Listing',
        ownerId: owner.id,
      },
    });

    await prisma.vehicleListing.create({
      data: {
        title,
        description,
        price: formatPrice(source.price, index),
        location,
        category: source.category,
        status: 'Active Listing',
        sellerId: owner.id,
        vehicleId: garageVehicle.id,
      },
    });
  }

  const [postCount, listingCount] = await Promise.all([
    prisma.post.count({where: {summary: {startsWith: `[${COMMUNITY_MARKER}:`}}}),
    prisma.vehicleListing.count({where: {description: {startsWith: `[${MARKET_MARKER}:`}}}),
  ]);
  console.log(`Đã tạo ${postCount} bài feed, trong đó ${Math.floor(postCount / 3)} bài không có ảnh.`);
  console.log(`Đã tạo ${listingCount} tin xe châu Á bổ sung, tái sử dụng ảnh Blob hiện có.`);
};

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
