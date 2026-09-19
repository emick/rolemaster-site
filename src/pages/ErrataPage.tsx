import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { getErrata, errataKeys } from '../api/errata'
import { Icon } from '../components/Icon'

export function ErrataPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('haku') ?? ''
  const { data = [], isPending, isError } = useQuery({ queryKey: errataKeys.all, queryFn: getErrata })
  const normalized = query.trim().toLocaleLowerCase('fi')
  const filtered = data.filter((item) => [item.book, item.section, item.original, item.correction, String(item.page)].some((value) => value.toLocaleLowerCase('fi').includes(normalized)))

  function updateQuery(value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('haku', value)
    else next.delete('haku')
    setSearchParams(next, { replace: true })
  }

  return (
    <section className="errata-page">
      <div className="page-intro"><p className="eyebrow">Korjaukset ja täsmennykset</p><h1>Suomenkielisen laitoksen errata</h1><p>Tältä sivulta löydät kirjojen tunnetut painovirheet, korjaukset ja sääntötarkennukset.</p></div>
      <label className="search"><Icon name="search" /><span className="sr-only">Hae erratasta</span><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Hae kirjalla, sivulla tai hakusanalla…" /></label>
      {isPending && <p className="status">Ladataan korjauksia…</p>}
      {isError && <p className="status error">Errataa ei voitu ladata. Yritä myöhemmin uudelleen.</p>}
      {!isPending && !isError && filtered.length === 0 && (
        <div className="empty-state"><span>✓</span><h2>{query ? 'Ei hakutuloksia' : 'Ei julkaistuja korjauksia'}</h2><p>{query ? 'Kokeile toista hakusanaa tai tyhjennä haku.' : 'Tällä hetkellä tiedossa ei ole julkaistuja korjauksia. Sivu päivittyy, kun uusia huomioita vahvistetaan.'}</p></div>
      )}
      <div className="errata-list">
        {filtered.map((item) => <article key={item.id} className="erratum"><div className="erratum-meta"><strong>{item.book}</strong><span>Sivu {item.page}</span><span>{item.section}</span></div><div><p className="label">Painettu</p><p>{item.original}</p><p className="label correction">Korjaus</p><p>{item.correction}</p></div></article>)}
      </div>
    </section>
  )
}
