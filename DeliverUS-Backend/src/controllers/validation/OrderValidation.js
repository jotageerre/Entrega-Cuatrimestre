import { check } from 'express-validator'
import { Product, Restaurant, Order } from '../../models/models.js'

const checkRestaurantExists = async (value, { req }) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (restaurant !== null) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('Resturant not found in database'))
    }
  } catch (error) {
    return Promise.reject(new Error(error))
  }
}

// comprueba que todos los productos pertenezcan al mismo restaurante
const checkSameRestaurant = async (value, { req }) => {
  try {
    const orderRestaurantId = parseInt(req.body.restaurantId)
    const products = await Product.findAll({
      where: {
        id: req.body.products.map(x => x.productId)
      },
      attributes: ['restaurantId']
    })
    if (products.some(x => x.restaurantId !== orderRestaurantId)) { // busco si algun producto tiene diferente restaurantId
      return Promise.reject(new Error('Products do not belong to the same restaurant'))
    } else {
      return Promise.resolve()
    }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

// comprueba que los productos estén disponibles
const checkDisponibilidad = async (value, { req }) => {
  try {
    const products = req.body.products
    const productsIds = products.map(product => product.productId) // obtengo los ids de los productos
    const productsInDb = await Product.findAll( // obtengo los productos que estén disponibles
      {
        where: {
          id: productsIds,
          availability: true
        }
      })
    if (productsInDb.length !== req.body.products.length) { // si no son los mismos lanzo error
      return Promise.reject(new Error('Some products are not available'))
    } else {
      return Promise.resolve()
    }
  } catch (error) {
    return Promise.reject(new Error(error))
  }
}

// comprueba que el pedido esté aún pendiente
const checkPending = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId) // obtengo el pedido con id pasada por parámetros
    if (order.status === 'pending') { // compruebo que esté pendiente
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('Order is not in pending state'))
    }
  } catch (error) {
    return Promise.reject(new Error(error))
  }
}

const checkOriginalRestaurant = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId) // obtengo el pedido
    const products = req.body.products
    const productsIds = products.map(product => product.productId)
    const productsDb = await Product.findAll({ // obtengo los productos de la base de datos con id igual al obtenido en la peticion
      where: {
        id: productsIds
      },
      attributes: ['restaurantId']
    })
    if (productsDb.some(x => x.restaurantId !== order.restaurantId)) { // comprueba si algún producto de la base de datos tenga restaurantId diferente al de la peticion
      return Promise.reject(new Error('Products do not belong to the same restaurant'))
    } else {
      return Promise.resolve()
    }
  } catch (error) {
    return Promise.reject(new Error(error))
  }
}

// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant

const create = [
  // 1
  check('restaurantId').exists().isInt().toInt(),
  check('restaurantId').custom(checkRestaurantExists),
  check('address').exists().isString(),
  // 2
  check('products').exists().isArray({ min: 1 }).toArray(),
  check('products.*.quantity').isInt({ min: 1 }).toInt(),
  check('products.*.productId').exists().isInt().toInt(),
  // 3
  check('products').custom(checkDisponibilidad),
  // 4
  check('products').custom(checkSameRestaurant)
]

// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.

const update = [
  // 1
  check('restaurantId').not().exists(),
  check('address').exists().isString(),
  // 2
  check('products').exists().isArray({ min: 1 }),
  check('products.*.quantity').exists().isInt({ min: 1 }).toInt(),
  check('products.*.productId').exists().isInt({ min: 1 }).toInt(),
  // 3
  check('products').exists().custom(checkDisponibilidad),
  // 4
  check('products').exists().custom(checkOriginalRestaurant),
  // 5
  check('orderId').exists().custom(checkPending)
]

export { create, update }
