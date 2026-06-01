import { Chapter } from '@/schema/interfaces'
import { Reem_Kufi_Ink } from 'next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/router'

export type ChapterPickerItem = Pick<Chapter, 'id' | 'name_complex'>

const reemKufiInk = Reem_Kufi_Ink({
  weight: '400',
  subsets: ['arabic'],
})
export function Navbar({
  chapterInfo,
  chapters = [],
}: {
  chapterInfo: Chapter | undefined
  chapters?: ChapterPickerItem[]
}) {
  const router = useRouter()

  if (!chapterInfo) return null

  const previousChapter = chapterInfo.id > 1 ? chapterInfo.id - 1 : null
  const nextChapter = chapterInfo.id < 114 ? chapterInfo.id + 1 : null
  const revelationPlace =
    chapterInfo.revelation_place[0].toUpperCase() + chapterInfo.revelation_place.slice(1)

  return (
    <nav className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur">
      <section className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2 sm:min-h-16 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-3 sm:px-6">
        <Link
          href="/"
          className="rounded-md border border-[var(--line)] px-2.5 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] sm:px-3"
        >
          Index
        </Link>

        <div className="min-w-0 text-center">
          <div className="flex min-w-0 items-center justify-center gap-2">
            <span
              className={`${reemKufiInk.className} truncate text-xl text-[var(--accent)] sm:text-2xl`}
            >
              {chapterInfo.name_arabic}
            </span>
            <span className="hidden h-5 w-px bg-[var(--line)] sm:block" />
            <small className="truncate text-sm font-medium text-[var(--muted)] sm:text-base">
              {chapterInfo.translated_name.name}
            </small>
          </div>
          <div className="mt-1 hidden justify-center gap-3 text-xs text-[var(--muted)] sm:flex">
            <span>{chapterInfo.verses_count} ayahs</span>
            <span>{revelationPlace}</span>
          </div>
        </div>

        {chapters.length > 0 && (
          <label className="col-span-3 row-start-2 block sm:col-span-1 sm:col-start-3 sm:row-start-auto">
            <span className="sr-only">Choose surah</span>
            <select
              value={chapterInfo.id}
              onChange={(event) => router.push(`/${event.target.value}`)}
              className="h-9 w-full rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] sm:w-44 lg:w-56"
            >
              {chapters.map((chapter) => (
                <option value={chapter.id} key={chapter.id}>
                  {chapter.id}. {chapter.name_complex}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex justify-end gap-1.5 sm:gap-2">
          {previousChapter ? (
            <Link
              href={`/${previousChapter}`}
              className="rounded-md border border-[var(--line)] px-2.5 py-2 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] sm:px-3"
            >
              Prev
            </Link>
          ) : (
            <span className="rounded-md border border-[var(--line)] px-2.5 py-2 text-sm font-medium text-[var(--muted)] opacity-40 sm:px-3">
              Prev
            </span>
          )}

          {nextChapter ? (
            <Link
              href={`/${nextChapter}`}
              className="rounded-md bg-[var(--accent)] px-2.5 py-2 text-sm font-medium text-white transition hover:bg-[#185946] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] sm:px-3"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-md bg-[var(--accent)] px-2.5 py-2 text-sm font-medium text-white opacity-40 sm:px-3">
              Next
            </span>
          )}
        </div>
      </section>
    </nav>
  )
}
