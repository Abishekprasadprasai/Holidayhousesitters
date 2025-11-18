import { useEffect, useState } from 'react';
import clientPhoto1 from '@/assets/client-photo-1.jpg';
import clientPhoto2 from '@/assets/client-photo-2.jpg';
import clientPhoto3 from '@/assets/client-photo-3.jpg';

const photos = [clientPhoto1, clientPhoto3];

export const ClientPhotosCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-large">
      {photos.map((photo, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={photo}
            alt={index === 0 ? 'Happy dogs enjoying playtime together' : `Happy client with their pet ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to photo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
