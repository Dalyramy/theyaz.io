import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import PeaceWatermark from '@/components/ui/PeaceWatermark';
import GradientText from '@/components/ui/GradientText';
import { 
  Camera, 
  Mail, 
  ExternalLink,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Award,
  Globe,
  Palette,
  Sparkles
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const About = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <Navbar />
      
      {/* Peace Sign Background Watermark */}
      <PeaceWatermark />

      <main className="container mx-auto pb-8 px-2 sm:px-4 flex flex-col gap-6">
        {/* Hero Section */}
        <motion.div 
          className="max-w-2xl mx-auto text-center mb-10 sm:mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Photography Portfolio
            </Badge>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 break-words">
              <GradientText variant="brand" className="text-3xl sm:text-5xl md:text-6xl">
                {t('about.title')} theyaz.io
              </GradientText>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t('about.description')}
            </p>
          </div>
          

        </motion.div>

        <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
          {/* Mission Section */}
          <motion.section 
            className="mb-8 sm:mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden hover-lift rounded-2xl border-border w-full">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-6 h-6 text-primary" />
                  <CardTitle className="text-lg sm:text-2xl">Our Mission</CardTitle>
                </div>
                <p className="text-muted-foreground">
                  Capturing the essence of life through photography
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                  Welcome to theyaz.io! This is a space where I share my passion for photography and the stories behind each image. Through my lens, I try to capture the beauty, emotion, and unique perspectives of the world around us. Every photograph tells a story, and every story deserves to be shared.
                </p>
              </CardContent>
            </Card>
          </motion.section>

          {/* Photography Section */}
          <motion.section 
            className="mb-8 sm:mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {/* Style Card */}
              <Card className="overflow-hidden hover-lift rounded-2xl border-border">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Palette className="w-6 h-6 text-primary" />
                    <CardTitle className="text-lg sm:text-2xl">Photography Style</CardTitle>
                  </div>
                  <p className="text-muted-foreground">
                    A blend of artistic vision and technical precision
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-base sm:text-lg">
                    Each photo represents a moment in time, a story waiting to be told, or an emotion I wanted to preserve. From breathtaking landscapes to candid street photography, my collection spans various genres and techniques, all captured with the power of modern mobile photography.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Landscape</Badge>
                      <Badge variant="outline">Street</Badge>
                      <Badge variant="outline">Portrait</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Equipment Card */}
              <Card className="overflow-hidden hover-lift rounded-2xl border-border">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-6 h-6 text-primary" />
                    <CardTitle className="text-lg sm:text-2xl">Equipment & Process</CardTitle>
                  </div>
                  <p className="text-muted-foreground">
                    Professional tools for exceptional results
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">iPhone 16 Pro Max</div>
                        <div className="text-sm text-muted-foreground">Primary Camera</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Camera className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">48MP Main Camera</div>
                        <div className="text-sm text-muted-foreground">ProRAW Format</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Minimal Processing</div>
                        <div className="text-sm text-muted-foreground">Preserve Authenticity</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Social Media Section */}
          <motion.section 
            className="mb-8 sm:mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="overflow-hidden hover-lift rounded-2xl border-border w-full">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-6 h-6 text-primary" />
                  <CardTitle className="text-lg sm:text-2xl">Connect & Follow</CardTitle>
                </div>
                <p className="text-muted-foreground">
                  Stay updated with my latest work and behind-the-scenes content
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-center py-8">
                  Social media integrations have been removed. Please check back for updates!
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Contact Section */}
          <motion.section 
            className="mb-8 sm:mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="overflow-hidden hover-lift rounded-2xl border-border w-full">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-6 h-6 text-primary" />
                  <CardTitle className="text-lg sm:text-2xl">Get in Touch</CardTitle>
                </div>
                <p className="text-muted-foreground">
                  Let's collaborate and create something amazing together
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-base sm:text-lg">
                      I'm always interested in collaboration opportunities, print requests, or just chatting about photography. Whether you're looking for custom photography services, want to discuss a project, or simply want to share your thoughts on my work, I'd love to hear from you.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Collaborations</Badge>
                        <Badge variant="outline">Print Requests</Badge>
                        <Badge variant="outline">Consultations</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Button className="w-full hover-lift min-h-[44px]">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                      Available for freelance work and collaborations
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Quote Section */}
          <motion.div 
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Card className="overflow-hidden hover-lift rounded-2xl border-border bg-gradient-to-r from-primary/5 to-secondary/5 w-full">
              <CardContent className="p-4 sm:p-8">
                <blockquote className="text-base sm:text-xl italic text-muted-foreground">
                  "Photography is the story I fail to put into words."
                  <footer className="text-xs sm:text-sm mt-4 font-medium text-foreground">— Destin Sparks</footer>
                </blockquote>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default About;
