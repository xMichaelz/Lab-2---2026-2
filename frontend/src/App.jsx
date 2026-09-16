import { NavLink, Route, Routes } from 'react-router-dom'
import CustomersPage from './pages/CustomersPage'
import TransferPage from './pages/TransferPage'
import HistoryPage from './pages/HistoryPage'

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">◈</span>
          <div>
            <h1>NovaBank</h1>
            <p>Lab 1 · Arquitectura Soft.</p>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Clientes
          </NavLink>
          <NavLink to="/transfer" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Transferir
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Historial
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <p>Dashboard cozy · gris oscuro</p>
        </div>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<CustomersPage />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
