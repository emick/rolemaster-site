import { Icon } from '../components/Icon'

export function FormsPage() {
  const pdfUrl = `${import.meta.env.BASE_URL}hahmolomake.pdf`
  const sourceUrl = `${import.meta.env.BASE_URL}charactersheet.py`
  return (
    <section className="forms-page">
      <div className="page-intro">
        <p className="eyebrow">Tulostettavat materiaalit</p>
        <h1>Lomakkeet</h1>
      </div>
      <article className="form-download">
        <div className="form-copy">
          <p className="form-number">01</p>
          <h2>Hahmolomake</h2>
          <p>Yksisivuinen hahmolomake on vektorimuotoinen PDF, joten se tulostuu tarkkana missä koossa tahansa. Lomakkeen kentät voi täyttää suoraan PDF-lukijassa ennen tallentamista tai tulostamista.</p>
          <ul><li>Vektorimuotoinen PDF</li><li>Täytettävät lomakekentät</li><li>1 sivu</li></ul>
        </div>
        <div className="form-preview">
          <img src={`${import.meta.env.BASE_URL}hahmolomake-preview.png`} alt="Esikatselu suomenkielisestä hahmolomakkeesta" />
          <div className="form-actions">
            <a className="button primary" href={pdfUrl} download><Icon name="download" /> Lataa hahmolomake PDF</a>
            <a className="button secondary" href={sourceUrl} download><Icon name="download" /> Lataa Python-lähdekoodi</a>
          </div>
        </div>
      </article>
    </section>
  )
}
