import { useCallback, useEffect, useMemo, useState } from 'react'
import { createCustomer, getCustomers } from '../api/customers'
import { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import Loading from '../components/Loading'
import { formatCurrency } from '../utils/format'

const emptyForm = {
  firstName: '',
  lastName: '',
  accountNumber: '',
  balance: '',
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(emptyForm)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los clientes.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const totalBalance = useMemo(
    () => customers.reduce((sum, customer) => sum + Number(customer.balance || 0), 0),
    [customers],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccess('')
    setError('')
    setSubmitting(true)

    try {
      await createCustomer({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        accountNumber: form.accountNumber.trim(),
        balance: Number(form.balance),
      })
      setSuccess('Cliente creado correctamente.')
      setForm(emptyForm)
      await loadCustomers()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo crear el cliente.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page fade-in">
      <header className="page-header">
        <div>
          <p className="eyebrow">Vista 1</p>
          <h2>Clientes</h2>
          <p className="subtitle">Consulta y registro de cuentas bancarias.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={loadCustomers} disabled={loading}>
          Actualizar
        </button>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Clientes</span>
          <strong>{customers.length}</strong>
        </article>
        <article className="stat-card">
          <span>Saldo total</span>
          <strong>{formatCurrency(totalBalance)}</strong>
        </article>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="grid-two">
        <article className="card">
          <h3>Nuevo cliente</h3>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
            </label>
            <label>
              Apellido
              <input name="lastName" value={form.lastName} onChange={handleChange} required />
            </label>
            <label>
              Número de cuenta
              <input name="accountNumber" value={form.accountNumber} onChange={handleChange} required />
            </label>
            <label>
              Saldo inicial
              <input
                name="balance"
                type="number"
                min="0"
                step="1"
                value={form.balance}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Crear cliente'}
            </button>
          </form>
        </article>

        <article className="card">
          <h3>Listado de clientes</h3>
          {loading ? (
            <Loading label="Cargando clientes..." />
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <p>No hay clientes registrados todavía.</p>
              <span>Crea el primero con el formulario.</span>
            </div>
          ) : (
            <div className="customer-grid">
              {customers.map((customer) => (
                <article key={customer.id} className="customer-card">
                  <div className="customer-top">
                    <h4>
                      {customer.firstName} {customer.lastName}
                    </h4>
                    <span className="badge">#{customer.id}</span>
                  </div>
                  <p className="account">Cuenta {customer.accountNumber}</p>
                  <p className="balance">{formatCurrency(customer.balance)}</p>
                </article>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}
