import '../src/config/localEnv';
import {put} from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';
import {prisma} from '../src/config/prisma';

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  throw new Error('BLOB_READ_WRITE_TOKEN is required. Run `vercel env pull` or add it to backend/.env.');
}

const mimeByExtension: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const uploadBuffer = async (pathname: string, buffer: Buffer, contentType: string) =>
  put(pathname, buffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType,
    token,
  });

const migrateUrl = async (value: string | null | undefined, prefix: string) => {
  if (!value || value.includes('.blob.vercel-storage.com')) return value;

  if (value.startsWith('data:image/')) {
    const match = value.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/s);
    if (!match) return value;
    const extension = match[1] === 'image/jpeg' ? '.jpg' : `.${match[1].split('/')[1]}`;
    const blob = await uploadBuffer(`${prefix}${extension}`, Buffer.from(match[2], 'base64'), match[1]);
    return blob.url;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return value;
  }
  if (!['localhost', '127.0.0.1'].includes(url.hostname)) return value;

  const filename = path.basename(url.pathname);
  const localPath = path.resolve(process.cwd(), 'uploads', 'images', filename);
  try {
    const buffer = await fs.readFile(localPath);
    const extension = path.extname(filename).toLowerCase();
    const blob = await uploadBuffer(`${prefix}${extension}`, buffer, mimeByExtension[extension] ?? 'image/jpeg');
    return blob.url;
  } catch {
    console.warn(`Skipped missing local file: ${localPath}`);
    return value;
  }
};

const main = async () => {
  const postImages = await prisma.image.findMany();
  for (const image of postImages) {
    const url = await migrateUrl(image.url, `migrated/posts/${image.id}`);
    if (url !== image.url) {
      await prisma.image.update({where: {id: image.id}, data: {url, publicId: url?.split('/').pop()}});
    }
  }

  const garageVehicles = await prisma.garageVehicle.findMany();
  for (const vehicle of garageVehicles) {
    const image = await migrateUrl(vehicle.image, `migrated/garage/${vehicle.id}-cover`);
    const images = await Promise.all(
      vehicle.images.map((url, index) => migrateUrl(url, `migrated/garage/${vehicle.id}-${index}`)),
    );
    await prisma.garageVehicle.update({
      where: {id: vehicle.id},
      data: {image: image ?? vehicle.image, images: images.filter((url): url is string => Boolean(url))},
    });
  }

  const users = await prisma.user.findMany({select: {id: true, avatar: true, bannerImage: true}});
  for (const user of users) {
    const avatar = await migrateUrl(user.avatar, `migrated/users/${user.id}-avatar`);
    const bannerImage = await migrateUrl(user.bannerImage, `migrated/users/${user.id}-banner`);
    if (avatar !== user.avatar || bannerImage !== user.bannerImage) {
      await prisma.user.update({where: {id: user.id}, data: {avatar, bannerImage}});
    }
  }

  console.log('Image migration completed.');
};

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
