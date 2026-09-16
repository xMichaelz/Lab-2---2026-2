import { useCallback, useEffect, useState } from 'react'
import { getCustomers } from '../api/customers'
import { transferMoney } from '../api/transactions'
import { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import Loading from '../components/Loading'
import { formatCurrency } from '../utils/format'

const emptyForm = {
  senderAccountNumber: '',
  receiverAccountNumber: '',
  amount: '',
}

export default function TransferPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updatedBalances, setUpdatedBalances] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar las cuentas.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const findCustomer = (accountNumber) =>
    customers.find((customer) => customer.accountNumber === accountNumber)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setUpdatedBalances(null)
    setSubmitting(true)

    try {
      const payload = {
        senderAccountNumber: form.senderAccountNumber,
        receiverAccountNumber: form.receiverAccountNumber,
        amount: Number(form.amount),
      }

      await transferMoney(payload)
      const refreshed = await getCustomers()
      setCustomers(refreshed)

      const sender = refreshed.find((c) => c.accountNumber === payload.senderAccountNumber)
      const receiver = refreshed.find((c) => c.accountNumber === payload.receiverAccountNumber)

      setUpdatedBalances({
        sender,
        receiver,
        amount: payload.amount,
      })
      setSuccess('Transferencia realizada correctamente.')
      setForm(emptyForm)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo completar la transferencia.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="page fade-in">
        <Loading label="Cargando cuentas..." />
      </section>
    )
  }

  return (
    <section className="page fade-in">
      <header className="page-header">
        <div>
          <p className="eyebrow">Vista 2</p>
          <h2>Transferencia</h2>
          <p className="subtitle">Mueve dinero entre cuentas de forma segura.</p>
        </div>
      </header>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="grid-two">
        <article className="card">
          <h3>Nueva transferencia</h3>
          {customers.length < 2 ? (
            <div className="empty-state">
              <p>Se necesitan al menos dos clientes para transferir.</p>
              <span>Registra más cuentas en la vista Clientes.</span>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <label>
                Cuenta origen
                <select
                  name="senderAccountNumber"
                  value={form.senderAccountNumber}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona cuenta origen</option>
                  {customers.map((customer) => (
                    <option key={`sender-${customer.id}`} value={customer.accountNumber}>
                      {customer.firstName} {customer.lastName} · {customer.accountNumber} ·{' '}
                      {formatCurrency(customer.balance)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Cuenta destino
                <select
                  name="receiverAccountNumber"
                  value={form.receiverAccountNumber}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona cuenta destino</option>
                  {customers.map((customer) => (
                    <option key={`receiver-${customer.id}`} value={customer.accountNumber}>
                      {customer.firstName} {customer.lastName} · {customer.accountNumber} ·{' '}
                      {formatCurrency(customer.balance)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Monto
                <input
                  name="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </label>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Procesando...' : 'Transferir'}
              </button>
            </form>
          )}
        </article>

        <article className="card">
          <h3>Resumen</h3>
          {form.senderAccountNumber || form.receiverAccountNumber ? (
            <div className="preview-list">
              {form.senderAccountNumber && (
                <div className="preview-item">
                  <span>Origen</span>
                  <strong>
                    {findCustomer(form.senderAccountNumber)?.firstName}{' '}
                    {findCustomer(form.senderAccountNumber)?.lastName}
                  </strong>
                  <p>{formatCurrency(findCustomer(form.senderAccountNumber)?.balance)}</p>
                </div>
              )}
              {form.receiverAccountNumber && (
                <div className="preview-item">
                  <span>Destino</span>
                  <strong>
                    {findCustomer(form.receiverAccountNumber)?.firstName}{' '}
                    {findCustomer(form.receiverAccountNumber)?.lastName}
                  </strong>
                  <p>{formatCurrency(findCustomer(form.receiverAccountNumber)?.balance)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>Selecciona las cuentas para ver el resumen.</p>
            </div>
          )}

          {updatedBalances && (
            <div className="result-box">
              <h4>Saldos actualizados</h4>
              <p>
                {updatedBalances.sender?.firstName}: {formatCurrency(updatedBalances.sender?.balance)}
              </p>
              <p>
                {updatedBalances.receiver?.firstName}:{' '}
                {formatCurrency(updatedBalances.receiver?.balance)}
              </p>
              <p className="muted">Monto transferido: {formatCurrency(updatedBalances.amount)}</p>
            </div>
          )}
        </article>
      </div>
    </section>
  )
}
