import axiosInstance from '@/api'
import { Chapter, ChapterByVerse } from '@/schema/interfaces'
import { convertToArabic } from '@asipita/number-to-arabic'
import Head from 'next/head'
import { Reem_Kufi_Ink } from 'next/font/google'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChapterPickerItem } from '@/components/navbar'

type ReaderTheme = 'light' | 'sepia' | 'dark'
type ReaderMode = 'line' | 'page'
type ReaderSettings = {
  fontSize: number
  lineHeight: number
  theme: ReaderTheme
  mode: ReaderMode
}
type Bookmark = {
  chapterId: number
  chapterName: string
  chapterArabic: string
  verseNumber: number
  text: string
}
type ActiveVerseAction = {
  verseNumber: number
  text: string
  isBookmarked: boolean
}

const defaultSettings: ReaderSettings = {
  fontSize: 26,
  lineHeight: 1.55,
  theme: 'light',
  mode: 'line',
}

const bookmarksKey = 'digital-mushaf:bookmarks'
const lastReadKey = 'digital-mushaf:last-read'
const settingsKey = 'digital-mushaf:reader-settings'

export default function Chapter({
  chapter,
  chapterInfo,
  chapters,
}: {
  chapter: ChapterByVerse
  chapterInfo: Chapter
  chapters: ChapterPickerItem[]
}) {
  const router = useRouter()
  const { verses } = chapter
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [activeVerse, setActiveVerse] = useState(1)
  const [isCompactViewport, setIsCompactViewport] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeVerseAction, setActiveVerseAction] =
    useState<ActiveVerseAction | null>(null)
  const [jumpVerse, setJumpVerse] = useState('1')
  const longPressTimer = useRef<number | null>(null)
  const revelationPlace =
    chapterInfo.revelation_place[0].toUpperCase() + chapterInfo.revelation_place.slice(1)
  const previousChapter = chapterInfo.id > 1 ? chapterInfo.id - 1 : null
  const nextChapter = chapterInfo.id < 114 ? chapterInfo.id + 1 : null
  const currentBookmarks = useMemo(
    () =>
      bookmarks
        .filter((bookmark) => bookmark.chapterId === chapterInfo.id)
        .sort((a, b) => a.verseNumber - b.verseNumber),
    [bookmarks, chapterInfo.id],
  )
  const readerFontSize = isCompactViewport
    ? Math.min(settings.fontSize, settings.mode === 'page' ? 25 : 26)
    : settings.fontSize
  const minLineHeight = 1.35
  const maxLineHeight = isCompactViewport
    ? settings.mode === 'page'
      ? 1.75
      : 1.8
    : settings.mode === 'page'
      ? 1.75
      : 1.85
  const readerLineHeight = isCompactViewport
    ? Math.min(settings.lineHeight, maxLineHeight)
    : Math.min(settings.lineHeight, maxLineHeight)

  useEffect(() => {
    const storedSettings = window.localStorage.getItem(settingsKey)
    const storedBookmarks = window.localStorage.getItem(bookmarksKey)

    if (storedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) })
      } catch {
        window.localStorage.removeItem(settingsKey)
      }
    }

    if (storedBookmarks) {
      try {
        setBookmarks(JSON.parse(storedBookmarks))
      } catch {
        window.localStorage.removeItem(bookmarksKey)
      }
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)')
    const updateViewport = () => setIsCompactViewport(mediaQuery.matches)

    updateViewport()
    mediaQuery.addEventListener('change', updateViewport)

    return () => mediaQuery.removeEventListener('change', updateViewport)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme =
      settings.theme === 'light' ? '' : settings.theme
    window.localStorage.setItem(settingsKey, JSON.stringify(settings))

    return () => {
      document.documentElement.dataset.theme = ''
    }
  }, [settings])

  useEffect(() => {
    window.localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    window.localStorage.setItem(
      lastReadKey,
      JSON.stringify({
        chapterId: chapterInfo.id,
        chapterName: chapterInfo.name_complex,
        chapterArabic: chapterInfo.name_arabic,
        verseNumber: activeVerse,
        updatedAt: new Date().toISOString(),
      }),
    )
  }, [activeVerse, chapterInfo])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (!visibleEntry) return

        const verseNumber = Number(
          visibleEntry.target.getAttribute('data-verse-number'),
        )
        if (verseNumber) setActiveVerse(verseNumber)
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.5, 0.9] },
    )

    document
      .querySelectorAll<HTMLElement>('[data-verse-number]')
      .forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [chapterInfo.id])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target &&
        ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target.tagName)
      ) {
        return
      }

      if (event.key === 'ArrowLeft' && nextChapter) {
        router.push(`/${nextChapter}`)
      }

      if (event.key === 'ArrowRight' && previousChapter) {
        router.push(`/${previousChapter}`)
      }

      if (event.key === '/') {
        event.preventDefault()
        document.getElementById('jump-ayah')?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextChapter, previousChapter, router])

  const updateSettings = (partialSettings: Partial<ReaderSettings>) => {
    setSettings((currentSettings) => ({ ...currentSettings, ...partialSettings }))
  }

  const goToVerse = (verseNumber: number) => {
    const boundedVerse = Math.min(Math.max(verseNumber, 1), chapterInfo.verses_count)
    setJumpVerse(String(boundedVerse))
    document
      .getElementById(`ayah-${boundedVerse}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const toggleBookmark = (verseNumber: number, text: string) => {
    setBookmarks((currentBookmarks) => {
      const exists = currentBookmarks.some(
        (bookmark) =>
          bookmark.chapterId === chapterInfo.id &&
          bookmark.verseNumber === verseNumber,
      )

      if (exists) {
        return currentBookmarks.filter(
          (bookmark) =>
            bookmark.chapterId !== chapterInfo.id ||
            bookmark.verseNumber !== verseNumber,
        )
      }

      return [
        ...currentBookmarks,
        {
          chapterId: chapterInfo.id,
          chapterName: chapterInfo.name_complex,
          chapterArabic: chapterInfo.name_arabic,
          verseNumber,
          text,
        },
      ]
    })
  }

  const copyVerse = async (verseNumber: number, text: string) => {
    await navigator.clipboard?.writeText(
      `${text} (${chapterInfo.name_complex} ${verseNumber})`,
    )
  }

  const shareVerse = async (verseNumber: number, text: string) => {
    const url = `${window.location.origin}/${chapterInfo.id}#ayah-${verseNumber}`
    const shareText = `${text} (${chapterInfo.name_complex} ${verseNumber})`

    if (navigator.share) {
      await navigator.share({
        title: `${chapterInfo.name_complex} ${verseNumber}`,
        text: shareText,
        url,
      })
      return
    }

    await navigator.clipboard?.writeText(`${shareText} ${url}`)
  }

  const isVerseBookmarked = (verseNumber: number) =>
    bookmarks.some(
      (bookmark) =>
        bookmark.chapterId === chapterInfo.id &&
        bookmark.verseNumber === verseNumber,
    )

  const openVerseActions = (verseNumber: number, text: string) => {
    setActiveVerseAction({
      verseNumber,
      text,
      isBookmarked: isVerseBookmarked(verseNumber),
    })
  }

  const startVersePress = (verseNumber: number, text: string) => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current)
    longPressTimer.current = window.setTimeout(() => {
      openVerseActions(verseNumber, text)
    }, 450)
  }

  const cancelVersePress = () => {
    if (!longPressTimer.current) return
    window.clearTimeout(longPressTimer.current)
    longPressTimer.current = null
  }

  const handleActionBookmark = () => {
    if (!activeVerseAction) return
    toggleBookmark(activeVerseAction.verseNumber, activeVerseAction.text)
    setActiveVerseAction(null)
  }

  const handleActionCopy = async () => {
    if (!activeVerseAction) return
    await copyVerse(activeVerseAction.verseNumber, activeVerseAction.text)
    setActiveVerseAction(null)
  }

  const handleActionShare = async () => {
    if (!activeVerseAction) return
    await shareVerse(activeVerseAction.verseNumber, activeVerseAction.text)
    setActiveVerseAction(null)
  }

  return (
    <>
      <Head>
        <title>{`${chapterInfo.name_complex} | Digital Mushaf`}</title>
        <meta
          name="description"
          content={`Read ${chapterInfo.name_complex}, ${chapterInfo.translated_name.name}, in Arabic.`}
        />
      </Head>

      <main className="px-3 py-4 sm:px-6 sm:py-10">
        <article className="mx-auto max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="fixed bottom-4 left-4 z-30 rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--accent)] shadow-lg transition hover:border-[var(--accent)]"
            >
              Reader settings
            </button>
            <span className="text-sm text-[var(--muted)]">
              Ayah {activeVerse}/{chapterInfo.verses_count}
            </span>
          </div>

          <header className="mb-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-center shadow-sm sm:mb-6 sm:px-5">
            <p className="text-sm text-[var(--muted)]">
              {revelationPlace} . {chapterInfo.verses_count} ayahs
            </p>
            <h1
              className={`${reemKufiInk.className} mt-2 text-3xl leading-tight text-[var(--accent)] sm:text-5xl`}
            >
              {chapterInfo.name_arabic}
            </h1>
            <p className="mt-2 text-sm font-medium text-[var(--muted)]">
              {chapterInfo.name_complex} . {chapterInfo.translated_name.name}
            </p>
          </header>

          <section
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-4 shadow-sm sm:px-8 sm:py-10"
            dir="rtl"
            lang="ar"
          >
            {chapterInfo.bismillah_pre && <Basmallah />}

            {settings.mode === 'line' ? (
              <div className="space-y-1 sm:space-y-3">
                {verses.map((verse) => (
                  <Verse
                    key={verse.id}
                    id={`ayah-${verse.verse_number}`}
                    text={verse.text_uthmani}
                    verseNumber={verse.verse_number}
                    verse_number={convertToArabic(verse.verse_number)}
                    fontSize={readerFontSize}
                    lineHeight={readerLineHeight}
                    isBookmarked={bookmarks.some(
                      (bookmark) =>
                        bookmark.chapterId === chapterInfo.id &&
                        bookmark.verseNumber === verse.verse_number,
                    )}
                    onPressStart={() =>
                      startVersePress(verse.verse_number, verse.text_uthmani)
                    }
                    onPressEnd={cancelVersePress}
                  />
                ))}
              </div>
            ) : (
              <div
                className="text-right text-[var(--ink)]"
                style={{
                  lineHeight: readerLineHeight,
                  fontSize: readerFontSize,
                }}
              >
                {verses.map((verse) => (
                  <PageVerse
                    key={verse.id}
                    id={`ayah-${verse.verse_number}`}
                    text={verse.text_uthmani}
                    verseNumber={verse.verse_number}
                    verse_number={convertToArabic(verse.verse_number)}
                    isBookmarked={bookmarks.some(
                      (bookmark) =>
                        bookmark.chapterId === chapterInfo.id &&
                        bookmark.verseNumber === verse.verse_number,
                    )}
                    onPressStart={() =>
                      startVersePress(verse.verse_number, verse.text_uthmani)
                    }
                    onPressEnd={cancelVersePress}
                  />
                ))}
              </div>
            )}
          </section>
        </article>

        <SettingsOverlay
          activeVerse={activeVerse}
          chapterInfo={chapterInfo}
          currentBookmarks={currentBookmarks}
          lineHeightMax={maxLineHeight}
          lineHeightMin={minLineHeight}
          lineHeightValue={readerLineHeight}
          goToVerse={goToVerse}
          isOpen={settingsOpen}
          jumpVerse={jumpVerse}
          setIsOpen={setSettingsOpen}
          setJumpVerse={setJumpVerse}
          settings={settings}
          updateSettings={updateSettings}
        />

        <VerseActionSheet
          action={activeVerseAction}
          onBookmark={handleActionBookmark}
          onClose={() => setActiveVerseAction(null)}
          onCopy={handleActionCopy}
          onShare={handleActionShare}
        />
      </main>
    </>
  )
}

const reemKufiInk = Reem_Kufi_Ink({
  weight: '400',
  subsets: ['arabic'],
})

function Basmallah() {
  return (
    <div
      className={`${reemKufiInk.className} mb-5 mt-1 text-center text-2xl leading-relaxed text-[var(--accent)] sm:mb-8 sm:text-4xl`}
    >
      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
    </div>
  )
}

function SettingsOverlay({
  activeVerse,
  chapterInfo,
  currentBookmarks,
  lineHeightMax,
  lineHeightMin,
  lineHeightValue,
  goToVerse,
  isOpen,
  jumpVerse,
  setIsOpen,
  setJumpVerse,
  settings,
  updateSettings,
}: {
  activeVerse: number
  chapterInfo: Chapter
  currentBookmarks: Bookmark[]
  lineHeightMax: number
  lineHeightMin: number
  lineHeightValue: number
  goToVerse: (verseNumber: number) => void
  isOpen: boolean
  jumpVerse: string
  setIsOpen: (isOpen: boolean) => void
  setJumpVerse: (verseNumber: string) => void
  settings: ReaderSettings
  updateSettings: (partialSettings: Partial<ReaderSettings>) => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-6">
      <button
        type="button"
        aria-label="Close reader settings"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={() => setIsOpen(false)}
      />
      <aside className="relative ml-auto flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">Reader settings</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Ayah {activeVerse}/{chapterInfo.verses_count}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Close
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-4 py-4">
          <section>
            <h3 className="text-sm font-semibold text-[var(--ink)]">Layout</h3>
            <div className="mt-3 grid grid-cols-2 rounded-md border border-[var(--line)] bg-[var(--surface-strong)] p-1">
              <button
                type="button"
                onClick={() => updateSettings({ mode: 'line' })}
                className={`h-10 rounded text-sm font-semibold transition ${
                  settings.mode === 'line'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Line by line
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ mode: 'page' })}
                className={`h-10 rounded text-sm font-semibold transition ${
                  settings.mode === 'page'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                Page style
              </button>
            </div>
          </section>

          <section className="grid gap-4 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-3">
            <label className="block">
              <span className="text-xs font-medium text-[var(--muted)]">Theme</span>
              <select
                value={settings.theme}
                onChange={(event) =>
                  updateSettings({ theme: event.target.value as ReaderTheme })
                }
                className="mt-1 h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              >
                <option value="light">Light</option>
                <option value="sepia">Sepia</option>
                <option value="dark">Dark</option>
              </select>
            </label>

            <label className="block">
              <span className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
                <span>Font size</span>
                <span>{settings.fontSize}px</span>
              </span>
              <input
                type="range"
                min="20"
                max="36"
                value={settings.fontSize}
                onChange={(event) =>
                  updateSettings({ fontSize: Number(event.target.value) })
                }
                className="mt-2 w-full accent-[var(--accent)]"
              />
            </label>

            <label className="block">
              <span className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
                <span>Line height</span>
                <span>{lineHeightValue.toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={lineHeightMin}
                max={lineHeightMax}
                step="0.05"
                value={lineHeightValue}
                onChange={(event) =>
                  updateSettings({ lineHeight: Number(event.target.value) })
                }
                className="mt-2 w-full accent-[var(--accent)]"
              />
            </label>
          </section>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              goToVerse(Number(jumpVerse))
              setIsOpen(false)
            }}
            className="grid grid-cols-[1fr_auto] items-end gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-3"
          >
            <label>
              <span className="text-xs font-medium text-[var(--muted)]">
                Jump to ayah
              </span>
              <input
                id="jump-ayah"
                type="number"
                min="1"
                max={chapterInfo.verses_count}
                value={jumpVerse}
                onChange={(event) => setJumpVerse(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              />
            </label>
            <button
              type="submit"
              className="h-10 rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-white"
            >
              Go
            </button>
          </form>

          <section className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-3">
            <h3 className="text-sm font-semibold text-[var(--ink)]">Bookmarks</h3>
            {currentBookmarks.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {currentBookmarks.map((bookmark) => (
                  <button
                    type="button"
                    key={bookmark.verseNumber}
                    onClick={() => {
                      goToVerse(bookmark.verseNumber)
                      setIsOpen(false)
                    }}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-sm text-[var(--accent)] transition hover:border-[var(--accent)]"
                  >
                    {bookmark.verseNumber}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">No bookmarks yet.</p>
            )}
          </section>
        </div>
      </aside>
    </div>
  )
}

function VerseActionSheet({
  action,
  onBookmark,
  onClose,
  onCopy,
  onShare,
}: {
  action: ActiveVerseAction | null
  onBookmark: () => void
  onClose: () => void
  onCopy: () => void
  onShare: () => void
}) {
  if (!action) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Close ayah actions"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--ink)] shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Ayah {action.verseNumber}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--muted)]"
          >
            Close
          </button>
        </div>
        <p
          className="mt-3 max-h-32 overflow-hidden text-right text-lg leading-loose"
          dir="rtl"
        >
          {action.text}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onBookmark}
            className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
          >
            {action.isBookmarked ? 'Unsave' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--muted)]"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--muted)]"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  )
}

function Verse({
  id,
  text,
  verseNumber,
  verse_number,
  fontSize,
  lineHeight,
  isBookmarked,
  onPressEnd,
  onPressStart,
}: {
  id: string
  text: string
  verseNumber: number
  verse_number: string
  fontSize: number
  lineHeight: number
  isBookmarked: boolean
  onPressEnd: () => void
  onPressStart: () => void
}) {
  return (
    <div
      id={id}
      data-verse-number={verseNumber}
      onContextMenu={(event) => event.preventDefault()}
      onMouseDown={onPressStart}
      onMouseLeave={onPressEnd}
      onMouseUp={onPressEnd}
      onTouchCancel={onPressEnd}
      onTouchEnd={onPressEnd}
      onTouchStart={onPressStart}
      className="rounded-lg px-1 py-2 transition-colors target:bg-[var(--accent-soft)] sm:px-3 sm:py-3"
    >
      <p
        className="cursor-pointer select-none text-right text-[var(--ink)]"
        style={{ fontSize, lineHeight }}
      >
        {text}
        <span
          className={`mx-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs leading-none align-middle sm:mx-2 sm:h-9 sm:w-9 sm:text-sm ${
            isBookmarked
              ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'border-[var(--line)] bg-[var(--surface-strong)] text-[var(--accent)]'
          }`}
        >
          {verse_number}
        </span>
      </p>
    </div>
  )
}

function PageVerse({
  id,
  text,
  verseNumber,
  verse_number,
  isBookmarked,
  onPressEnd,
  onPressStart,
}: {
  id: string
  text: string
  verseNumber: number
  verse_number: string
  isBookmarked: boolean
  onPressEnd: () => void
  onPressStart: () => void
}) {
  return (
    <span
      id={id}
      data-verse-number={verseNumber}
      onContextMenu={(event) => event.preventDefault()}
      onMouseDown={onPressStart}
      onMouseLeave={onPressEnd}
      onMouseUp={onPressEnd}
      onTouchCancel={onPressEnd}
      onTouchEnd={onPressEnd}
      onTouchStart={onPressStart}
      className="scroll-mt-28 rounded-md target:bg-[var(--accent-soft)]"
    >
      {text}
      <span
        className={`mx-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs leading-none align-middle transition sm:mx-2 sm:h-9 sm:w-9 sm:text-sm ${
          isBookmarked
            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'border-[var(--line)] bg-[var(--surface-strong)] text-[var(--accent)] hover:border-[var(--accent)]'
        }`}
      >
        {verse_number}
      </span>
    </span>
  )
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }: { params: any }) {
  const {
    data: { chapter },
  } = await axiosInstance.get(
    `/chapters/${params.chapter}/?fields=text_uthmani`,
  )

  const { data } = await axiosInstance.get(
    `/verses/by_chapter/${params.chapter}/?fields=text_uthmani&page=1&per_page=all`,
  )

  const {
    data: { chapters },
  } = await axiosInstance.get('/chapters')

  return {
    props: {
      chapter: data,
      chapterInfo: chapter,
      chapters: chapters.map(({ id, name_complex }: Chapter) => ({
        id,
        name_complex,
      })),
    },
  }
}
