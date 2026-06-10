import {apiRequest} from './api';

export interface UploadedImage {
  url: string;
  path: string;
  publicId?: string;
  filename: string;
  mimetype: string;
  size: number;
}

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể đọc ảnh này.'));
    };
    image.src = objectUrl;
  });

export const prepareImageFile = async (file: File): Promise<File> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Vui lòng chọn ảnh JPG, JPEG, PNG hoặc WEBP.');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Ảnh gốc phải có dung lượng tối đa 8MB.');
  }

  const image = await loadImage(file);
  const scale = Math.min(1, 1920 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${baseName}.webp`, {type: 'image/webp'});
};

export const uploadImage = async (file: File): Promise<UploadedImage> => {
  const preparedFile = await prepareImageFile(file);
  const formData = new FormData();
  formData.append('image', preparedFile);
  return apiRequest<UploadedImage>('/uploads/images', {method: 'POST', body: formData});
};
