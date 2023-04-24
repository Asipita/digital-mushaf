import { Chapter as IChapter } from '@/schema/interfaces'
import { Chapter } from './chapter'



export default function ChapterList({ chapters }: { chapters: IChapter[] }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-5">
      {chapters.map((surah) => (
        <Chapter surah={surah} key={surah.id} />
      ))}
    </section>
  )
}
