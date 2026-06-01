'use client'

import { Chapter as IChapter } from '@/schema/interfaces'
import { Chapter } from './chapter'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type RevelationFilter = 'all' | 'makkah' | 'madinah'
type SortMode = 'mushaf' | 'revelation' | 'verses'
type LastRead = {
  chapterId: number
  chapterName: string
  chapterArabic: string
  verseNumber?: number
  updatedAt: string
}

const filterOptions: { label: string; value: RevelationFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Makkah', value: 'makkah' },
  { label: 'Madinah', value: 'madinah' },
]

const sortOptions: { label: string; value: SortMode }[] = [
  { label: 'Mushaf order', value: 'mushaf' },
  { label: 'Revelation', value: 'revelation' },
  { label: 'Verse count', value: 'verses' },
]

export default function ChapterList({ chapters }: { chapters: IChapter[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<RevelationFilter>('all')
  const [sort, setSort] = useState<SortMode>('mushaf')
  const [lastRead, setLastRead] = useState<LastRead | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem('digital-mushaf:last-read')
    if (!stored) return

    try {
      setLastRead(JSON.parse(stored))
    } catch {
      window.localStorage.removeItem('digital-mushaf:last-read')
    }
  }, [])

  const visibleChapters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return chapters
      .filter((chapter) => {
        if (filter !== 'all' && chapter.revelation_place !== filter) return false
        if (!normalizedQuery) return true

        return [
          chapter.id.toString(),
          chapter.name_arabic,
          chapter.name_complex,
          chapter.translated_name.name,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort((a, b) => {
        if (sort === 'revelation') return a.revelation_order - b.revelation_order
        if (sort === 'verses') return b.verses_count - a.verses_count
        return a.id - b.id
      })
  }, [chapters, filter, query, sort])

  return (
    <section>
      {lastRead && (
        <Link
          href={`/${lastRead.chapterId}`}
          className="mb-4 grid gap-3 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] p-4 text-[var(--ink)] transition hover:shadow-md sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--accent)]">
              Continue reading
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-lg font-semibold">{lastRead.chapterName}</span>
              <span className="text-2xl text-[var(--accent)]">{lastRead.chapterArabic}</span>
              {lastRead.verseNumber && (
                <span className="text-sm text-[var(--muted)]">
                  Ayah {lastRead.verseNumber}
                </span>
              )}
            </div>
          </div>
          <span className="rounded-md bg-[var(--accent)] px-4 py-2 text-center text-sm font-semibold text-white">
            Resume
          </span>
        </Link>
      )}

      <div className="mb-6 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="block">
            <span className="sr-only">Search chapters</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search surah, number, or translation"
              className="h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            />
          </label>

          <div className="flex rounded-md border border-[var(--line)] bg-[var(--surface-strong)] p-1">
            {filterOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`h-9 rounded px-3 text-sm font-medium transition ${
                  filter === option.value
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="sr-only">Sort chapters</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="h-11 w-full rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] lg:w-44"
            >
              {sortOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mb-3 text-sm text-[var(--muted)]">
        Showing {visibleChapters.length} of {chapters.length} surahs
      </div>

      {visibleChapters.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleChapters.map((surah) => (
            <Chapter surah={surah} key={surah.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
          No surahs match your search.
        </div>
      )}
    </section>
  )
}
