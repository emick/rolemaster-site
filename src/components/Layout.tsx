import { NavLink, Outlet } from 'react-router-dom'

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
        </nav>
      </header>
      <main><Outlet /></main>
    </div>
  )
}
