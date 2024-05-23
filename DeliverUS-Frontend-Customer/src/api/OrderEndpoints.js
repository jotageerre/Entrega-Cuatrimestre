import { get, put, post, destroy } from './helpers/ApiRequestsHelper'

function create (data) {
  return post('orders', data)
}

function getAll () {
  return get('orders')
}

function getOrderDetails (id) {
  return get(`orders/${id}`)
}

function update (id, values) {
  return put(`orders/${id}`, values)
}
function borrar (id) {
  return destroy(`orders/${id}`)
}

export { getAll, getOrderDetails, update, create, borrar }
