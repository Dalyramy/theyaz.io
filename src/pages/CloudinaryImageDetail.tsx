import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageDetails, searchImages } from '@/lib/cloudinary';
import ImageDetail from '@/components/gallery/ImageDetail';

interface CloudinaryImage {
  public_id: string;
  filename: string;
  created_at: string;
  width: number;
  height: number;
  secure_url: string;
  bytes: number;
  format: string;
  resource_type: string;
}

export default function CloudinaryImageDetail() {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [image, setImage] = useState<CloudinaryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allImages, setAllImages] = useState<CloudinaryImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (publicId) {
      fetchImageDetails();
    }
  }, [publicId]);

  const fetchImageDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // For now, using mock data since Cloudinary API requires server-side setup
      // In a real implementation, you'd call getImageDetails(publicId!)
      const mockImage: CloudinaryImage = {
        public_id: publicId || 'gallery/sample-1',
        filename: 'sample-image.jpg',
        created_at: new Date().toISOString(),
        width: 1920,
        height: 1080,
        secure_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
        bytes: 1024000,
        format: 'jpg',
        resource_type: 'image'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setImage(mockImage);

      // Also fetch all images for navigation
      const mockAllImages: CloudinaryImage[] = [
        {
          public_id: 'gallery/sample-1',
          filename: 'sample-1.jpg',
          created_at: new Date().toISOString(),
          width: 1920,
          height: 1080,
          secure_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
          bytes: 1024000,
          format: 'jpg',
          resource_type: 'image'
        },
        {
          public_id: 'gallery/sample-2',
          filename: 'sample-2.jpg',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          width: 1920,
          height: 1080,
          secure_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
          bytes: 2048000,
          format: 'jpg',
          resource_type: 'image'
        },
        {
          public_id: 'gallery/sample-3',
          filename: 'sample-3.jpg',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          width: 1920,
          height: 1080,
          secure_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center',
          bytes: 1536000,
          format: 'jpg',
          resource_type: 'image'
        }
      ];

      setAllImages(mockAllImages);
      
      // Find current image index
      const index = mockAllImages.findIndex(img => img.public_id === publicId);
      setCurrentIndex(index >= 0 ? index : 0);

    } catch (err) {
      setError('Failed to load image details. Please try again.');
      console.error('Error fetching image details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (allImages.length === 0) return;

    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
    } else {
      newIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
    }

    const nextImage = allImages[newIndex];
    if (nextImage) {
      navigate(`/gallery/${nextImage.public_id}`);
      setCurrentIndex(newIndex);
      setImage(nextImage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading image...</p>
        </div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Image Not Found</h2>
          <p className="text-neutral-400 mb-6">{error || 'The requested image could not be found.'}</p>
          <button
            onClick={() => navigate('/gallery')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <ImageDetail
      image={image}
      onNavigate={handleNavigate}
      hasPrev={allImages.length > 1}
      hasNext={allImages.length > 1}
    />
  );
} 