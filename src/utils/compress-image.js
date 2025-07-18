// utils/image.js
export function resizeAndCompress(dataUrl, maxWidth = 800, maxHeight = 600, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      // compute new dimensions preserving aspect ratio
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width  = width * ratio;
      height = height * ratio;

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // get compressed JPEG dataURL
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.src = dataUrl;
  });
}
