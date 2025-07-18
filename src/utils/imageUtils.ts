// src/utils/imageUtils.ts

export interface ProcessedImage {
  file: File;
  dataUrl: string;
  base64: string;
}

export const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SPOTIFY_IMAGE_SIZE = 640; // Spotify recommends 640x640 minimum

export const validateImageFile = (file: File): string | null => {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return 'Please upload a JPG, PNG, or WebP image file.';
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return 'Image size must be less than 10MB.';
  }
  
  return null;
};

export const processImageFile = async (file: File): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate square crop dimensions
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        
        // Set canvas size to Spotify requirements
        canvas.width = SPOTIFY_IMAGE_SIZE;
        canvas.height = SPOTIFY_IMAGE_SIZE;
        
        // Draw cropped and resized image
        ctx?.drawImage(
          img,
          x, y, size, size, // Source crop
          0, 0, SPOTIFY_IMAGE_SIZE, SPOTIFY_IMAGE_SIZE // Destination
        );
        
        // Convert to blob and data URL
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to process image'));
              return;
            }
            
            const processedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            const base64 = dataUrl.split(',')[1];
            
            resolve({
              file: processedFile,
              dataUrl,
              base64,
            });
          },
          'image/jpeg',
          0.8 // Compression quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};