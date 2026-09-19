export type Erratum = {
  id: string
  book: string
  page: number
  section: string
  published: string
  original: string
  correction: string
  explanation?: string
  category: 'errata' | 'minor'
}
