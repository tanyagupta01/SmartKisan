// utils/compress-image.js
export function resizeAndCompress(dataUrl, maxWidth = 512, maxHeight = 512, quality = 0.6) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      // More aggressive resizing for faster processing
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Disable image smoothing for faster processing
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Use WebP if supported, otherwise JPEG with lower quality
      const isWebPSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      
      let compressed;
      if (isWebPSupported) {
        compressed = canvas.toDataURL('image/webp', quality);
      } else {
        compressed = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(compressed);
    };
    img.src = dataUrl;
  });
}

// Alternative aggressive compression for very fast processing
export function fastCompress(dataUrl, maxSize = 256, quality = 0.5) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Square crop for consistent processing
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      
      canvas.width = maxSize;
      canvas.height = maxSize;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x, y, size, size, 0, 0, maxSize, maxSize);
      
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.src = dataUrl;
  });
}
