import axiosInstance from '@/api'
import ChapterList, { Chapter } from '@/components/chapter-list'

export default function Home({ chapters }: { chapters: Chapter[] }) {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-10">
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
