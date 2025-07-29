import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart, Download } from 'lucide-react';

interface CloudinaryImage {
  public_id: string;
  filename: string;
  created_at: string;
  width: number;
  height: number;
  secure_url: string;
}

interface PhotoListProps {
  images: CloudinaryImage[];
  loading?: boolean;
}

export default function PhotoList({ images, loading = false }: PhotoListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <motion.div 
            key={index} 
            className="animate-pulse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="bg-muted rounded-xl h-64 w-full"></div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-muted-foreground text-lg mb-4">No images found</div>
        <p className="text-muted-foreground">Upload some images to get started</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image, index) => (
        <Photo key={image.public_id} image={image} index={index} />
      ))}
    </div>
  );
}

interface PhotoProps {
  image: CloudinaryImage;
  index: number;
}

function Photo({ image, index }: PhotoProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link 
        to={`/gallery/${encodeURIComponent(image.public_id)}`} 
        className="group block"
      >
        <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 border border-border">
          {/* Image Loading State */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse rounded-xl" />
          )}
          
          <img
            src={image.secure_url}
            className={`w-full h-64 object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-110`}
            alt={image.filename || image.public_id.split('/').pop() || 'Gallery image'}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Hover Actions */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Heart className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Download className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Image Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="font-semibold text-sm truncate">
              {image.filename || image.public_id.split('/').pop()}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(image.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
} 