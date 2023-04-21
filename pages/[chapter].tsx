import axiosInstance from '@/api'
import { ChapterByVerse } from '@/schema/interfaces'
import {convertToArabic} from '@asipita/number-to-arabic'



export default function Chapter({ chapter }: { chapter: ChapterByVerse }) {
  const { verses } = chapter
  return (
    <main className="min-h-screen flex items-center p-5 sm:p-10">
      <section
        className="max-w-2xl mx-auto border-l border-r border-t"
        dir="rtl"
        lang="ar"
      >
        {verses.map((verse) => (
          <div key={verse.id} className="flex items-center gap-2 p-2 border-b">
            <span className="text-lg">{verse.text_uthmani}</span>
            <span className="border p-2 rounded-full bg-slate-200 text-gray-500">
              {convertToArabic(verse.verse_number)}
            </span>
          </div>
        ))}
      </section>
    </main>
  )
}

export async function getStaticPaths() {
  const {
    data: { chapters },
  } = await axiosInstance.get('/chapters')

  return {
    paths: chapters.map(({ id }: { id: number }) => ({
      params: { chapter: id.toString() },
    })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }: { params: any }) {
  const { data } = await axiosInstance.get(
    `/verses/by_chapter/${params.chapter}/?fields=text_uthmani&page=1&per_page=all`,
  )
  return {
    props: {
      chapter: data,
    },
  }
}
