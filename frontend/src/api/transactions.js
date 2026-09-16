import api from './client'

export async function transferMoney(payload) {
  const { data } = await api.post('/transactions', payload)
  return data
}

export async function getTransactionsByAccount(accountNumber) {
  const { data } = await api.get(`/transactions/account/${accountNumber}`)
  return data
}
