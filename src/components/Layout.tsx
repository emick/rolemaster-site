import { NavLink, Outlet } from 'react-router-dom'
import { Icon } from './Icon'

export function Layout() {
  return (
    <div className="site">
      <header className="topbar">
        <NavLink className="brand" to="/" aria-label="Suomenkieliset Rolemaster-lisämateriaalit – etusivu">
          <span className="brand-mark"><span>FI</span></span>
          <span><strong>Lisämateriaalit</strong><small>Rolemasterin suomenkieliseen laitokseen</small></span>
        </NavLink>
        <nav aria-label="Päänavigaatio">
          <NavLink to="/">Etusivu</NavLink>
          <NavLink to="/errata">Errata</NavLink>
          <NavLink to="/lomakkeet">Lomakkeet</NavLink>
          <a className="github-link" href="https://github.com/emick/rolemaster-site" target="_blank" rel="noreferrer" aria-label="GitHub">
            <Icon name="github" size={21} />
          </a>
        </nav>
      </header>
      <main><Outlet /></main>
    </div>
  )
}
