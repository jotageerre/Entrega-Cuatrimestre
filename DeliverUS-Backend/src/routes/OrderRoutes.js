import OrderController from '../controllers/OrderController.js'
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import * as OrderMiddleware from '../middlewares/OrderMiddleware.js'
import { Order } from '../models/models.js'
import * as OrderValidation from '../controllers/validation/OrderValidation.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'

const loadFileRoutes = function (app) {
  // TODO: Include routes for:
  // 1. Retrieving orders from current logged-in customer
  // 2. Creating a new order (only customers can create new orders)

  app.route('/orders')
    .get(
      isLoggedIn,
      hasRole('customer'),
      OrderController.indexCustomer
      //  OrderController.show
    )
    .post(
      isLoggedIn,
      hasRole('customer'),
      OrderMiddleware.checkRestaurantExists,
      OrderValidation.create,
      handleValidation,
      OrderController.create
    )
  app.route('/orders/:orderId/confirm')
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderIsPending,
      handleValidation,
      OrderController.confirm
    )
  app.route('/orders/:orderId/send')
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderCanBeSent,
      handleValidation,
      OrderController.send)

  app.route('/orders/:orderId/deliver')
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderCanBeDelivered,
      handleValidation,
      OrderController.deliver)

  // TODO: Include routes for:
  // 3. Editing order (only customers can edit their own orders)
  // 4. Remove order (only customers can remove their own orders)
  app.route('/orders/:orderId')
    .get(
      isLoggedIn,
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderVisible,
      OrderController.show)
    .put(
      isLoggedIn,
      hasRole('customer'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderCustomer,
      OrderMiddleware.checkOrderIsPending,
      OrderValidation.update,
      handleValidation,
      OrderController.update
    )
    .delete(
      isLoggedIn,
      hasRole('customer'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderCustomer,
      OrderMiddleware.checkOrderIsPending,
      handleValidation,
      OrderController.destroy
    )
}

export default loadFileRoutes
