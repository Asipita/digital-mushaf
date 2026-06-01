import { Navbar } from '@/components/navbar'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <section className="min-h-screen bg-[var(--page-bg)] text-[var(--ink)] transition-colors">
      <Navbar chapterInfo={pageProps.chapterInfo} chapters={pageProps.chapters} />
      <Component {...pageProps} />
    </section>
  )
}
