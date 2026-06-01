import axiosInstance from '@/api'
import ChapterList from '@/components/chapter-list'
import { Chapter } from '@/schema/interfaces'
import Head from 'next/head'
import { Reem_Kufi_Ink } from 'next/font/google'

const reemKufiInk = Reem_Kufi_Ink({
  weight: '400',
  subsets: ['arabic'],
})

export default function Home({ chapters }: { chapters: Chapter[] }) {
  return (
    <>
      <Head>
        <title>Digital Mushaf</title>
        <meta
          name="description"
          content="Browse and read the Quran in a focused digital mushaf."
        />
      </Head>

      <main className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
          <header className="mb-8 text-center">
            <h1
              className={`${reemKufiInk.className} text-5xl leading-tight text-[var(--accent)] sm:text-7xl`}
            >
              القرآن الکریم
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              A focused place to browse, resume, and read each surah.
            </p>
          </header>

          <ChapterList chapters={chapters} />
        </div>
      </main>
    </>
  )
}

export async function getStaticProps() {
  const {
    data: { chapters },
  } = await axiosInstance.get('/chapters')

  return {
    props: {
      chapters,
    },
  }
}
