import { get } from './helpers/ApiRequestsHelper'

function getProductsDetails () {
  return get('/products')
}

function getProductCategories () {
  return get('productCategories')
}

function get3MorePopularProducts () {
  return get('/products/popular')
}

export { getProductCategories, get3MorePopularProducts, getProductsDetails }
