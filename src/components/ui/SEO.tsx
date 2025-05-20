import { Helmet } from 'react-helmet';

export default function SEO({ title, description, image }: { title: string, description?: string, image?: string }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
    </Helmet>
  );
} 