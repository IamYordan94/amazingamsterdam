// Photo upload and storage service
// In a real application, this would integrate with cloud storage like AWS S3, Cloudinary, etc.

export interface PhotoUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export class PhotoService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  static validatePhoto(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    return { isValid: true };
  }

  static async uploadPhoto(file: File): Promise<PhotoUploadResult> {
    const validation = this.validatePhoto(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      // In a real application, you would:
      // 1. Upload to cloud storage (AWS S3, Cloudinary, etc.)
      // 2. Generate a unique filename
      // 3. Resize/optimize the image
      // 4. Return the public URL

      // For demo purposes, we'll create a mock upload
      const mockResult: PhotoUploadResult = {
        url: `https://example.com/photos/${Date.now()}-${file.name}`,
        publicId: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        width: 1920,
        height: 1080,
      };

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return mockResult;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw new Error('Failed to upload photo');
    }
  }

  static async deletePhoto(publicId: string): Promise<void> {
    try {
      // In a real application, you would delete from cloud storage
      console.log(`Deleting photo: ${publicId}`);
    } catch (error) {
      console.error('Photo deletion error:', error);
      throw new Error('Failed to delete photo');
    }
  }

  static generateThumbnailUrl(url: string, width: number = 300, height: number = 200): string {
    // In a real application, you would use cloud storage's image transformation features
    // For demo purposes, return the original URL
    return url;
  }

  static async compressPhoto(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return file; // Return original file in server environment
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}
