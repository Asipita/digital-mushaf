import axiosInstance from '@/api'
import { Chapter, ChapterByVerse } from '@/schema/interfaces'
import { convertToArabic } from '@asipita/number-to-arabic'
import { Reem_Kufi_Ink } from 'next/font/google'
export default function Chapter({
  chapter,
  chapterInfo,
}: {
  chapter: ChapterByVerse
  chapterInfo: Chapter
}) {
  const { verses } = chapter
  return (
    <main className="min-h-screen flex items-center p-5 sm:p-10">
      <div className="w-fit mx-auto">
        {chapterInfo.bismillah_pre && <Basmallah />}
        <section
          className="max-w-2xl mx-auto border-l border-r border-t"
          dir="rtl"
          lang="ar"
        >
          {verses.map((verse) => (
            <Verse
              key={verse.id}
              text={verse.text_uthmani}
              verse_number={convertToArabic(verse.verse_number)}
            />
          ))}
        </section>
      </div>
    </main>
  )
}

const reemKufiInk = Reem_Kufi_Ink({
  weight: '400',
  subsets: ['arabic'],
})

function Basmallah() {
  return (
    <div className={`${reemKufiInk.className} text-4xl text-center mt-2 mb-5`}>
      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
    </div>
  )
}

function Verse({ text, verse_number }: { text: string; verse_number: string }) {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <span className="text-lg">{text}</span>
      <span className="border p-2 rounded-full bg-slate-200 text-gray-500">
        {verse_number}
      </span>
    </div>
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
  const {
    data: { chapter },
  } = await axiosInstance.get(`/chapters/${params.chapter}`)

  const { data } = await axiosInstance.get(
    `/verses/by_chapter/${params.chapter}/?fields=text_uthmani&page=1&per_page=all`,
  )

  return {
    props: {
      chapter: data,
      chapterInfo: chapter,
    },
  }
}
