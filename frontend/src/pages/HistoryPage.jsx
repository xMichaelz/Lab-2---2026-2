import { useCallback, useEffect, useState } from 'react'
import { getCustomers } from '../api/customers'
import { getTransactionsByAccount } from '../api/transactions'
import { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import Loading from '../components/Loading'
import { formatCurrency, formatDateTime } from '../utils/format'

export default function HistoryPage() {
  const [customers, setCustomers] = useState([])
  const [accountNumber, setAccountNumber] = useState('')
  const [transactions, setTransactions] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState('')

  const loadCustomers = useCallback(async () => {
    setLoadingCustomers(true)
    setError('')
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los clientes.'))
    } finally {
      setLoadingCustomers(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const loadHistory = async (selectedAccount = accountNumber) => {
    if (!selectedAccount) {
      setTransactions([])
      return
    }

    setLoadingHistory(true)
    setError('')
    try {
      const data = await getTransactionsByAccount(selectedAccount)
      setTransactions(data)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cargar el historial.'))
      setTransactions([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleAccountChange = async (event) => {
    const value = event.target.value
    setAccountNumber(value)
    await loadHistory(value)
  }

  if (loadingCustomers) {
    return (
      <section className="page fade-in">
        <Loading label="Cargando clientes..." />
      </section>
    )
  }

  return (
    <section className="page fade-in">
      <header className="page-header">
        <div>
          <p className="eyebrow">Vista 3</p>
          <h2>Historial</h2>
          <p className="subtitle">Consulta movimientos enviados y recibidos por cuenta.</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => loadHistory()}
          disabled={!accountNumber || loadingHistory}
        >
          Actualizar
        </button>
      </header>

      <Alert type="error" message={error} onClose={() => setError('')} />

      <article className="card">
        <label className="inline-label">
          Selecciona una cuenta
          <select value={accountNumber} onChange={handleAccountChange}>
            <option value="">Elige un cliente</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.accountNumber}>
                {customer.firstName} {customer.lastName} · {customer.accountNumber}
              </option>
            ))}
          </select>
        </label>
      </article>

      <article className="card">
        <h3>Movimientos</h3>
        {!accountNumber ? (
          <div className="empty-state">
            <p>Selecciona una cuenta para ver su historial.</p>
          </div>
        ) : loadingHistory ? (
          <Loading label="Cargando historial..." />
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>Esta cuenta aún no tiene transacciones.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Monto</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isSent = tx.senderAccountNumber === accountNumber
                  return (
                    <tr key={tx.id}>
                      <td>{formatDateTime(tx.timestamp)}</td>
                      <td>{tx.senderAccountNumber}</td>
                      <td>{tx.receiverAccountNumber}</td>
                      <td>{formatCurrency(tx.amount)}</td>
                      <td>
                        <span className={`chip ${isSent ? 'chip-sent' : 'chip-received'}`}>
                          {isSent ? 'ENVIADO' : 'RECIBIDO'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  )
}
