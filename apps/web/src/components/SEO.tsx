import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({ 
  title = "Click India Capital | Expert Loan Advisory", 
  description = "Get expert guidance on personal, business, home, and vehicle loans with over 25 years of lending experience in India.",
  image = "https://www.clickindiacapital.in/hero-bg.png",
  url = "https://www.clickindiacapital.in"
}: SEOProps) {
  const fullTitle = title.includes("Click India") ? title : `${title} | Click India Capital`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Theme Color */}
      <meta name="theme-color" content="#2563eb" />
    </Helmet>
  );
}
