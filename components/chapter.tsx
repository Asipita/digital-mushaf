import Link from 'next/link'
import { Chapter } from '@/schema/interfaces'

export function Chapter({ surah }: { surah: Chapter }) {
  const {
    id,
    name_arabic,
    name_complex,
    pages,
    revelation_order,
    revelation_place,
    translated_name,
    verses_count,
  } = surah

  const firstPage = pages[0]
  const lastPage = pages[pages.length - 1]
  const pageLabel =
    firstPage === lastPage ? `Page ${firstPage}` : `Pages ${firstPage}-${lastPage}`

  return (
    <Link
      href={`/${id}`}
      className="group block rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--ink)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--page-bg)]"
    >
      <article className="grid min-h-32 grid-cols-[2.5rem_1fr_auto] gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface-strong)] text-sm font-semibold text-[var(--muted)]">
          {id}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold">{name_complex}</h3>
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium capitalize text-[var(--accent)]">
              {revelation_place}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">{translated_name.name}</p>
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
            <span>{verses_count} ayahs</span>
            <span>{pageLabel}</span>
            <span>Revelation {revelation_order}</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl leading-none text-[var(--accent)]">{name_arabic}</p>
        </div>
      </article>
    </Link>
  )
}
