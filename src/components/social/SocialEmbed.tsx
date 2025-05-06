
import { useState } from 'react';
import FacebookEmbed from './FacebookEmbed';
import InstagramEmbed from './InstagramEmbed';
import { EmbedType } from '@/lib/socialEmbedUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SocialEmbedProps {
  type: EmbedType;
  url: string;
  title?: string;
  description?: string;
  width?: number;
  showText?: boolean;
  className?: string;
}

const SocialEmbed = ({
  type,
  url,
  title,
  description,
  width = 500,
  showText = true,
  className = '',
}: SocialEmbedProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`overflow-hidden ${className}`}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-0 pt-2">
        {type === EmbedType.FACEBOOK && (
          <FacebookEmbed 
            postUrl={url} 
            width={width} 
            showText={showText} 
            caption={description}
          />
        )}
        {type === EmbedType.INSTAGRAM && (
          <InstagramEmbed 
            postUrl={url} 
            caption={description}
            maxWidth={width} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SocialEmbed;
