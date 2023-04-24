export interface Verse {
  id: number;
  chapter_id: number;
  verse_number: number;
  verse_key: string;
  verse_index: number;
  text_uthmani: string;
  text_uthmani_simple: string;
  text_imlaei: string;
  text_imlaei_simple: string;
  text_indopak: string;
  text_uthmani_tajweed: string;
  juz_number: number;
  hizb_number: number;
  rub_number: number;
  sajdah_type: null;
  sajdah_number: null;
  page_number: number;
  image_url: string;
  image_width: number;
  words: Word[];
}

export interface Word {
  id: number;
  position: number;
  text_uthmani: string;
  text_indopak: string;
  text_imlaei: string;
  verse_key: string;
  page_number: number;
  line_number: number;
  audio_url: string;
  location: string;
  char_type_name: string;
  code_v1: string;
  translation: {
    text: string;
    language_name: string;
  };
  transliteration: {
    text: string;
    language_name: string;
  };
}

export interface Pagination {
  per_page: number;
  current_page: number;
  next_page: number;
  total_pages: number;
  total_records: number;
}

export interface ChapterByVerse {
  verses: Verse[];
  pagination: Pagination;
}

export interface Chapter {
  id: number;
  revelation_place: "makkah" | "madinah";
  revelation_order: number;
  bismillah_pre: boolean;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: Array<number>;
  translated_name: {
    language_name: string;
    name: string;
  };
}
