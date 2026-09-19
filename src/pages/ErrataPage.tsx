import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { getErrata, errataKeys } from '../api/errata'
import { Icon } from '../components/Icon'

export function ErrataPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('haku') ?? ''
  const category = searchParams.get('tyyppi') ?? 'kaikki'
  const book = searchParams.get('kirja') ?? 'kaikki'
  const sort = searchParams.get('jarjestys') ?? 'sivu-nouseva'
  const { data = [], isPending, isError } = useQuery({ queryKey: errataKeys.all, queryFn: getErrata })
  const normalized = query.trim().toLocaleLowerCase('fi')
  const books = [...new Set(data.map((item) => item.book))].sort((a, b) => a.localeCompare(b, 'fi'))
  const filtered = data.filter((item) => {
    const matchesCategory = category === 'kaikki' || (category === 'pienet' ? item.category === 'minor' : item.category === 'errata')
    const matchesBook = book === 'kaikki' || item.book === book
    const matchesQuery = [item.book, item.section, item.original, item.correction, item.explanation ?? '', String(item.page)].some((value) => value.toLocaleLowerCase('fi').includes(normalized))
    return matchesCategory && matchesBook && matchesQuery
  }).sort((a, b) => {
    if (sort === 'sivu-laskeva') return b.page - a.page || a.section.localeCompare(b.section, 'fi')
    if (sort === 'aakkoset') return a.section.localeCompare(b.section, 'fi') || a.page - b.page
    return a.page - b.page || a.section.localeCompare(b.section, 'fi')
  })

  function updateQuery(value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('haku', value)
    else next.delete('haku')
    setSearchParams(next, { replace: true })
  }

  function updateCategory(value: string) {
    const next = new URLSearchParams(searchParams)
    if (value === 'kaikki') next.delete('tyyppi')
    else next.set('tyyppi', value)
    setSearchParams(next, { replace: true })
  }

  function updateOption(name: string, value: string, defaultValue: string) {
    const next = new URLSearchParams(searchParams)
    if (value === defaultValue) next.delete(name)
    else next.set(name, value)
    setSearchParams(next, { replace: true })
  }

  return (
    <section className="errata-page">
      <div className="page-intro"><p className="eyebrow">Korjaukset ja täsmennykset</p><h1>Suomenkielisen laitoksen errata</h1><p>Tältä sivulta löydät kirjojen tunnetut painovirheet, korjaukset ja sääntötarkennukset.</p></div>
      <div className="errata-tools">
        <label className="search"><Icon name="search" /><span className="sr-only">Hae erratasta</span><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Hae kirjalla, sivulla tai hakusanalla…" /></label>
        <div className="errata-filters" role="group" aria-label="Suodata korjauksia">
          {[['kaikki', 'Kaikki'], ['varsinaiset', 'Varsinaiset virheet'], ['pienet', 'Pienet virheet']].map(([value, label]) => (
            <button key={value} type="button" className={category === value ? 'active' : ''} aria-pressed={category === value} onClick={() => updateCategory(value)}>{label}</button>
          ))}
        </div>
        <div className="errata-selects">
          <label><span>Kirja</span><select value={book} onChange={(event) => updateOption('kirja', event.target.value, 'kaikki')}><option value="kaikki">Kaikki kirjat</option>{books.map((title) => <option key={title} value={title}>{title}</option>)}</select></label>
          <label><span>Järjestä</span><select value={sort} onChange={(event) => updateOption('jarjestys', event.target.value, 'sivu-nouseva')}><option value="sivu-nouseva">Sivu: pienimmästä suurimpaan</option><option value="sivu-laskeva">Sivu: suurimmasta pienimpään</option><option value="aakkoset">Aihe: aakkosjärjestys</option></select></label>
        </div>
      </div>
      {isPending && <p className="status">Ladataan korjauksia…</p>}
      {isError && <p className="status error">Errataa ei voitu ladata. Yritä myöhemmin uudelleen.</p>}
      {!isPending && !isError && filtered.length === 0 && (
        <div className="empty-state"><span>✓</span><h2>{query ? 'Ei hakutuloksia' : 'Ei julkaistuja korjauksia'}</h2><p>{query ? 'Kokeile toista hakusanaa tai tyhjennä haku.' : 'Tällä hetkellä tiedossa ei ole julkaistuja korjauksia. Sivu päivittyy, kun uusia huomioita vahvistetaan.'}</p></div>
      )}
      <div className="errata-list">
        {filtered.map((item) => <article key={item.id} className="erratum"><div className="erratum-meta"><strong>{item.book}</strong><span className="erratum-page">Sivu {item.page}</span><span>{item.section}</span>{item.category === 'minor' && <span className="erratum-kind">Pieni virhe</span>}</div><div><p className="label">Painettu</p><p>{item.original}</p><p className="label correction">Korjaus</p><p>{item.correction}</p>{item.explanation && <><p className="label explanation">Perustelu</p><p>{item.explanation}</p></>}</div></article>)}
      </div>
    </section>
  )
}
