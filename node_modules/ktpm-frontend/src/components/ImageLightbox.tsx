import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import {useEffect} from 'react';

interface ImageLightboxProps {
  images: string[];
  activeIndex: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
  alt: string;
}

export default function ImageLightbox({images, activeIndex, onChange, onClose, alt}: ImageLightboxProps) {
  useEffect(() => {
    if (activeIndex == null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange((activeIndex - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') onChange((activeIndex + 1) % images.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, images.length, onChange, onClose]);

  if (activeIndex == null || !images[activeIndex]) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button type="button" onClick={onClose} className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" title="Đóng">
        <X className="h-5 w-5" />
      </button>
      {images.length > 1 && (
        <>
          <button type="button" onClick={(event) => {event.stopPropagation(); onChange((activeIndex - 1 + images.length) % images.length);}} className="absolute left-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 md:left-8" title="Ảnh trước">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button type="button" onClick={(event) => {event.stopPropagation(); onChange((activeIndex + 1) % images.length);}} className="absolute right-3 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 md:right-8" title="Ảnh sau">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      <img src={images[activeIndex]} alt={`${alt} ${activeIndex + 1}`} onClick={(event) => event.stopPropagation()} className="max-h-[88vh] max-w-[90vw] object-contain" />
      <div className="absolute bottom-5 rounded-full bg-black/60 px-4 py-2 text-xs text-white">
        {activeIndex + 1} / {images.length}
      </div>
    </div>
  );
}
