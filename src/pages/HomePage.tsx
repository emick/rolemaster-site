import { Link } from 'react-router-dom'
import { OpenRoll } from '../components/OpenRoll'
import { Icon } from '../components/Icon'

export function HomePage() {
  return (
    <section className="home-split">
      <div className="home-intro">
        <p className="eyebrow">Epävirallisia lisämateriaaleja</p>
        <h1>Lisämateriaalit</h1>
        <p className="lead">Harrastajien tekemiä suomenkielisiä lomakkeita, korjauksia ja muita täydennyksiä Rolemaster-pelipöytään.</p>
      </div>
      <div className="home-dice"><OpenRoll /></div>
      <div className="home-cards">
        <Link className="feature-card red" to="/lomakkeet"><span className="card-number">01</span><Icon name="download" size={30} /><h3>Lomakkeet</h3><p>Suomenkielisiä, tulostettavia ja sähköisesti täytettäviä lomakkeita pelikerran tueksi.</p><span className="card-link">Selaa lomakkeita <Icon name="arrow" /></span></Link>
        <Link className="feature-card" to="/errata"><span className="card-number">02</span><Icon name="book" size={30} /><h3>Errata</h3><p>Suomenkielisen laitoksen korjaukset ja täsmennykset kirja- ja sivuviitteineen.</p><span className="card-link">Selaa korjauksia <Icon name="arrow" /></span></Link>
      </div>
    </section>
  )
}
