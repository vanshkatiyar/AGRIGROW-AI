import { useState, useEffect } from 'react';

// NOTE: These are high-quality, agriculture-themed images from Unsplash.
// You can replace these URLs with your own images if you have them in your /public folder.
const backgrounds = [
  { src: 'https://images.unsplash.com/photo-1499529112087-7cb3b7226cd2?auto=format&fit=crop&w=1920&q=80', alt: 'Lush green tea plantation field' },
  { src: 'https://images.unsplash.com/photo-1560493676-0407186f467b?auto=format&fit=crop&w=1920&q=80', alt: 'Golden wheat field under a blue sky' },
  { src: 'https://images.unsplash.com/photo-1625246333195-78d9c38AD449?auto=format&fit=crop&w=1920&q=80', alt: 'Tractor plowing a fertile field at sunset' }
];

export const BackgroundSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 8000); // Change image every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {backgrounds.map((bg, index) => (
        <div
          key={bg.src}
          className={`absolute inset-0 transition-opacity duration-2000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={bg.src}
            alt={bg.alt}
            className="w-full h-full object-cover animate-[kenburns_20s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}
    </div>
  );
};