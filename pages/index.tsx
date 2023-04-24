import axiosInstance from '@/api'
import ChapterList from '@/components/chapter-list'
import { Chapter } from '@/schema/interfaces'
import { Reem_Kufi_Ink } from 'next/font/google'

const reemKufiInk = Reem_Kufi_Ink({
  weight: '400',
  subsets: ['arabic'],
})

export default function Home({ chapters }: { chapters: Chapter[] }) {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-10">
        <h2 className={`${reemKufiInk.className} text-6xl text-center pb-10`}>
          القرآن الکریم
        </h2>
        <ChapterList chapters={chapters} />
      </div>
    </main>
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
