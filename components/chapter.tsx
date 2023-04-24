import Link from 'next/link'
import { Chapter } from '@/schema/interfaces'

export function Chapter({ surah }: { surah: Chapter }) {
  const {
    id,
    bismillah_pre,
    name_arabic,
    name_complex,
    pages,
    revelation_order,
    revelation_place,
    translated_name,
    verses_count,
  } = surah
  return (
    <Link href={`/${id}`}>
      <div className="border rounded flex items-center text-gray-600 transition-all duration-300 hover:cursor-pointer hover:shadow-sm hover:border-slate-600 group">
        <div className="px-2 basis-8 h-full flex items-center">{id}</div>
        <div className="flex flex-col flex-grow gap-1 px-2 py-2 border-l group-hover:border-l-slate-600 border-r group-hover:border-r-slate-600">
          <span className="font-semibold">{name_complex}</span>
          <span className="text-xs">{translated_name.name}</span>
        </div>

        <div className="flex flex-col gap-1 ml-auto py-2 px-2 w-1/5">
          <span className="text-sm font-semibold text-right">
            {name_arabic}
          </span>
          <span className="text-xs text-right">{verses_count} ayahs</span>
        </div>
      </div>
    </Link>
  )
}
