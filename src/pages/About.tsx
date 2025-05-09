import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Separator } from '@/components/ui/separator';
import InstagramEmbed from '@/components/social/InstagramEmbed';
import FacebookEmbed from '@/components/social/FacebookEmbed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Mail, 
  Instagram, 
  Facebook, 
  ExternalLink,
  Heart,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container py-12 px-4 sm:px-6 lg:px-8 container-type-inline container-query">
        {/* Hero Section */}
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16 prose dark:prose-invert"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-6">
            About theyaz.io
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Capturing moments, creating memories, and sharing stories through the lens.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Mission Section */}
          <motion.section 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden hover-lift rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="hidden sm:block">
                    <Heart className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Welcome to theyaz.io! This is a space where I share my passion for photography and the stories behind each image. Through my lens, I try to capture the beauty, emotion, and unique perspectives of the world around us.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Photography Section */}
          <motion.section 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="overflow-hidden hover-lift rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="hidden sm:block">
                    <Camera className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Photography Style</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Each photo represents a moment in time, a story waiting to be told, or an emotion I wanted to preserve. From breathtaking landscapes to candid street photography, my collection spans various genres and techniques, all captured with the power of modern mobile photography.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-6">
                      <h3 className="font-medium mb-3">Equipment & Process</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          iPhone 16 Pro Max
                        </li>
                        <li className="flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          48MP Main Camera with ProRAW
                        </li>
                        <li className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Minimal post-processing to preserve authenticity
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Social Media Section */}
          <motion.section 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <ExternalLink className="w-6 h-6 text-secondary" />
              Connect & Follow
            </h2>
            
            <Tabs defaultValue="instagram" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </TabsTrigger>
                <TabsTrigger value="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </TabsTrigger>
              </TabsList>
              <TabsContent value="instagram">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-6">Check out my latest Instagram posts</p>
                    <InstagramEmbed 
                      postUrl="https://www.instagram.com/p/CyHksZcMYY2/"
                      caption="Featured work from theyaz.io"
                      className="mx-auto"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="facebook">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-6">Follow me on Facebook for updates</p>
                    <FacebookEmbed 
                      postUrl="https://www.facebook.com/facebook/posts/10153231379946729"
                      className="mx-auto"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.section>

          {/* Contact Section */}
          <motion.section 
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="overflow-hidden hover-lift rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="hidden sm:block">
                    <Mail className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      I'm always interested in collaboration opportunities, print requests, or just chatting about photography. Let's connect and create something amazing together.
                    </p>
                    <Button className="hover-lift">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Me
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Quote Section */}
          <motion.div 
            className="text-center prose dark:prose-invert"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <blockquote className="text-xl italic text-muted-foreground">
              "Photography is the story I fail to put into words."
              <footer className="text-sm mt-2">— Destin Sparks</footer>
            </blockquote>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default About;
