import api from './client'

export async function getCustomers() {
  const { data } = await api.get('/customers')
  return data
}

export async function createCustomer(customer) {
  const { data } = await api.post('/customers', customer)
  return data
}
