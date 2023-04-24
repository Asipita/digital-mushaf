import { Navbar } from '@/components/navbar'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  console.log({ pageProps })
  return (
    <section className="min-h-screen">
      <Navbar chapterInfo={pageProps.chapterInfo}/>
      <Component {...pageProps} />
    </section>
  )
}
