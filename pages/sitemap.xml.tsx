import { GetServerSideProps } from 'next'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://digital-mushaf.vercel.app'

const buildSitemap = () => {
  const now = new Date().toISOString()
  const chapterUrls = Array.from({ length: 114 }, (_, index) => {
    const chapterId = index + 1

    return `
  <url>
    <loc>${siteUrl}/${chapterId}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>${chapterUrls}
</urlset>`
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'text/xml')
  res.write(buildSitemap())
  res.end()

  return {
    props: {},
  }
}

export default function Sitemap() {
  return null
}
