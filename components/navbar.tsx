import { Chapter } from '@/schema/interfaces'
import { Reem_Kufi_Ink } from 'next/font/google'

const reemKufiInk = Reem_Kufi_Ink({
  weight: '400',
  subsets: ['arabic'],
})
export function Navbar({ chapterInfo }: { chapterInfo: Chapter | undefined }) {
  if (!chapterInfo) return null

  return (
    <nav className="">
      <section className="max-w-2xl border-b px-4 h-16 mx-auto flex items-center justify-center">
        {chapterInfo && (
          <div className="flex gap-[2px] items-center">
            <span className={`${reemKufiInk.className} text-2xl px-2 border-r`}>
              {chapterInfo.name_arabic}
            </span>
            <small className="text-neutral-400 px-2 text-base">
              {chapterInfo.translated_name.name}
            </small>
          </div>
        )}
      </section>
    </nav>
  )
}
