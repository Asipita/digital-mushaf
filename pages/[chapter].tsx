import axiosInstance from '@/api'
import { convertToArabic } from '@/utils'

interface Verse {
  id: number
  chapter_id: number
  verse_number: number
  verse_key: string
  verse_index: number
  text_uthmani: string
  text_uthmani_simple: string
  text_imlaei: string
  text_imlaei_simple: string
  text_indopak: string
  text_uthmani_tajweed: string
  juz_number: number
  hizb_number: number
  rub_number: number
  sajdah_type: null
  sajdah_number: null
  page_number: number
  image_url: string
  image_width: number
  words: Word[]
}

interface Word {
  id: number
  position: number
  text_uthmani: string
  text_indopak: string
  text_imlaei: string
  verse_key: string
  page_number: number
  line_number: number
  audio_url: string
  location: string
  char_type_name: string
  code_v1: string
  translation: {
    text: string
    language_name: string
  }
  transliteration: {
    text: string
    language_name: string
  }
}

interface Pagination {
  per_page: number
  current_page: number
  next_page: number
  total_pages: number
  total_records: number
}

interface ChapterByVerse {
  verses: Verse[]
  pagination: Pagination
}

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
