import { Chapter } from './chapter'

export interface Chapter {
  id: number
  revelation_place: string
  revelation_order: number
  bismillah_pre: boolean
  name_complex: string
  name_arabic: string
  verses_count: number
  pages: Array<number>
  translated_name: {
    language_name: string
    name: string
  }
}

export default function ChapterList({ chapters }: { chapters: Chapter[] }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-5">
      {chapters.map((surah: Chapter) => (
        <Chapter surah={surah} key={surah.id} />
      ))}
    </section>
  )
}
