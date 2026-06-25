import { Helmet } from "react-helmet-async";

const SITE_URL = "https://fabric-threads-gallery.lovable.app";
const SITE_NAME = "آدم للأقمشة | ADAM Fabrics";

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
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export { SITE_NAME, SITE_URL };
export default Seo;
