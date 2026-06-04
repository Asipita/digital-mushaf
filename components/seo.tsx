import Head from 'next/head'

const siteName = 'Digital Mushaf'
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://digital-mushaf.vercel.app'
const defaultDescription =
  'Browse, resume, and read the Quran in a focused digital mushaf.'
const defaultImage = '/og-image.png'

type SeoProps = {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
}

const absoluteUrl = (path: string) =>
  path.startsWith('http') ? path : `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`

export function Seo({
  title = siteName,
  description = defaultDescription,
  path = '/',
  image = defaultImage,
  type = 'website',
}: SeoProps) {
  const pageTitle = title === siteName ? siteName : `${title} | ${siteName}`
  const canonicalUrl = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      <meta name="theme-color" content="#1f6f5b" />
      <link rel="canonical" href={canonicalUrl} />

      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${siteName} Quran reader preview`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  )
}
