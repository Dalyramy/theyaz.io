import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Users, 
  Image as ImageIcon,
  Play,
  Star,
  Eye,
  Upload,
  Gallery
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

interface FeaturedPhoto {
  id: string;
  title: string;
  image_url: string;
  photographer: string;
  likes: number;
  views: number;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featuredPhotos, setFeaturedPhotos] = useState<FeaturedPhoto[]>([]);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalUsers: 0,
    totalLikes: 0,
    totalViews: 0
  });

  useEffect(() => {
    // Mock featured photos
    const mockFeaturedPhotos: FeaturedPhoto[] = [
      {
        id: '1',
        title: 'Mountain Serenity',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        photographer: 'Sarah Chen',
        likes: 1247,
        views: 8900
      },
      {
        id: '2',
        title: 'Urban Dreams',
        image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        photographer: 'Marcus Rodriguez',
        likes: 892,
        views: 5600
      },
      {
        id: '3',
        title: 'Ocean Waves',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
        photographer: 'Emma Thompson',
        likes: 1567,
        views: 12000
      }
    ];

    setFeaturedPhotos(mockFeaturedPhotos);
    setStats({
      totalPhotos: 2847,
      totalUsers: 156,
      totalLikes: 45230,
      totalViews: 189400
    });
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge variant="secondary" className="mb-4 text-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Discover Amazing Photography
              </Badge>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-6 leading-tight"
            >
              ⴳⴰⵍⵍⴻⵔⵢ
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto"
            >
              Explore a curated collection of stunning photography from talented artists around the world
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto"
                onClick={() => navigate('/gallery')}
              >
                <Gallery className="w-5 h-5 mr-2" />
                Explore Gallery
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              {!user && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 h-auto"
                  onClick={() => navigate('/login')}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stats.totalPhotos.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Photos Shared</div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Active Artists</div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stats.totalLikes.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Likes Given</div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                {stats.totalViews.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Views</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Photos Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Photography
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover the most loved and viewed photos from our community
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {featuredPhotos.map((photo, index) => (
              <motion.div key={photo.id} variants={fadeInUp}>
                <Card className="group overflow-hidden hover-lift rounded-2xl border-border transition-all duration-300 hover:shadow-xl">
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                    <img
                      src={photo.image_url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" variant="secondary" className="rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-1">
                      {photo.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      by {photo.photographer}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{photo.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{photo.views}</span>
                        </div>
                      </div>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Share Your Vision?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join our community of photographers and share your unique perspective with the world
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto"
                onClick={() => navigate('/upload')}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Your Photos
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 h-auto"
                onClick={() => navigate('/gallery')}
              >
                <Camera className="w-5 h-5 mr-2" />
                Browse Gallery
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 