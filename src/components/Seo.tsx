import { Helmet } from "react-helmet-async";

const SITE_URL = "https://fabric-threads-gallery.lovable.app";
const SITE_NAME = "آدم للأقمشة | ADAM Fabrics";
const DEFAULT_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/CabnAHWV3XRF58S380ChlYpjPEo1/social-images/social-1781520448251-adam_logo_transparent.webp";

interface SeoProps {
  title: string;
  description: string;
  /** Route path beginning with "/", e.g. "/gallery". */
  path: string;
  type?: "website" | "product" | "article";
  image?: string;
}

const Seo = ({ title, description, path, type = "website", image }: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_IMAGE;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export { SITE_NAME, SITE_URL };
export default Seo;
