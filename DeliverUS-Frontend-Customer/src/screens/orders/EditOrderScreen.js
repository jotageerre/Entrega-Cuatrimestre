import React, { useEffect, useState, useContext } from 'react'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import { update, getOrderDetails } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons'
import OrderModal from '../../components/OrderModal'
import CancelEditModal from '../../components/CancelEditModal'

export default function EditOrderScreen ({ navigation, route }) {
  const { loggedInUser } = useContext(AuthorizationContext)
  const [restaurant, setRestaurant] = useState({})
  const [backendErrors, setBackendErrors] = useState()
  const [products, setProducts] = useState([])
  const [productQuantity, setProductQuantity] = useState(new Map())
  const [orderToBeConfirmed, setOrderToBeConfirmed] = useState(null)
  const [productsInOrder, setProducstInOrder] = useState([])
  const [cancelEditOrder, setCancelEditOrder] = useState(false)
  const [originalOrder, setOriginalOrder] = useState()
  const [address, setAddress] = useState('')

  // Este useEffect se ejecutará cada vez que cambie la ruta o el usuario conectado, es decir, que cuando la ruta o usuario
  // cambien volverá a solicitar los datos nuevamente
  useEffect(() => {
    fetchAll()
  }, [route, loggedInUser])

  // Este useEffect se ejecutará cada vez que el estado de orderToBeConfirmed cambie
  // 1 - Filtra los productos para obtener aquellos productos que tienen una cantidad mayor que cero
  // 2 - Establezco el estado de producstInOrder con la lista de productos filtrados
  // Garantiza que la lista de productos en el pedido se actualice cada vez que cambie el estado de orderToBeConfirmed,
  // lo que podría indicar un cambio en el pedido que requiere una actualizacion en la lista de productos seleccionados
  useEffect(() => {
    const productsNewOrder = products.filter(p => productQuantity.get(p.id) > 0)
    setProducstInOrder(productsNewOrder)
  }, [orderToBeConfirmed])

  const confirmOrder = async () => {
    // Creo una nueva matriz "productQuantityReshaped" a partir de "productQuantity" con las claves del productId y quantity.
    // Filtro solo los elementos cuya cantidad sea mayor a 0, es decir, solo los productos que se han seleccionado en el pedido
    const productQuantityReshaped = [...productQuantity].map(([productId, quantity]) => ({ productId, quantity }))
      .filter(element => element.quantity > 0)
    // Compruebo si hay al menos un producto seleccionado para el pedido. Si la longitud de "productQuantityReshaped" > 0 quiere decir
    // que hay productos seleccionados. Si hay productos seleccionados creo un objeto values que contiene el address ingresada en el usuario y la lista
    // de productos seleccionados. Luego llamo a setOrderToBeConfirmed(values) para establecer el estado de orderToBeConfirmed con dichos valores
    if (productQuantityReshaped.length > 0) {
      const values = {
        address,
        products: productQuantityReshaped
      }
      await setOrderToBeConfirmed(values)
    // Si no hay productos seleccionados muestro un mensaje de error para indicar al usuario que debe seleccionar al menos un producto para confirmar un producto
    // para confirmar un pedido. El tipo 'danger' indica un mensaje de error
    } else {
      showMessage({
        message: 'Select at least one product to confirm an order',
        type: 'danger',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
          <View style={styles.restaurantHeaderContainer}>
            <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
            <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
            <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
            <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
          </View>
        </ImageBackground>
        <Pressable
          onPress={ () => {
            if (loggedInUser) {
              confirmOrder()
            } else {
              showMessage({
                message: 'If you want to place an order you must be logged in',
                type: 'danger',
                style: GlobalStyles.flashStyle,
                titleStyle: GlobalStyles.flashTextStyle
              })
              navigation.navigate('Profile')
            }
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandGreenTap
                : GlobalStyles.brandGreen
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
          <MaterialCommunityIcons name='content-save-edit' color={'white'} size={20} />
              <TextRegular textStyle={styles.text}>
                Confirm
              </TextRegular>
          </View>
        </Pressable>
        <Pressable
          onPress={() => setCancelEditOrder(true)}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandPrimaryTap
                : GlobalStyles.brandPrimary
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <AntDesign name='back' color='white' size={20} />
            <TextRegular textStyle={styles.text}>
              Cancel edit and go back
            </TextRegular>
          </View>
        </Pressable>
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    return (
      // Utilizo el ImageCard para mostrar la imagen y el titulo del producto. Se le pasa la URI de la imagen del producto como "ImageUri"
      // Si el producto tiene una imagen "item.image" construyo la URI utilizando la base de la URL de la API y la URL de la imagen del producto
      // Si el producto no tiene la imagen, se utiliza una imagen predeterminada "defaultProductImage". El titulo del producto se establece con el
      // item.name
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>
          {
          // Muestro la descripcion del producto con un maximo de dos lineas
          item.description}
          </TextRegular>
        <TextSemiBold textStyle={styles.price}>
          {
          // Muestro el precio del producto con un formato de 2 decimales. El precio se convierte en cadena con el 'toFixed()'
          item.price.toFixed(2)}€
          </TextSemiBold>
        {
        // Si el producto está disponible muestro los botones para incrementar o decrementar la cantidad de producto.
        // Si el producto no está disponible no los muestro
        item.availability &&
            <View style={styles.actionButtonsContainer}>
              <Pressable
                onPress={() => {
                  if (productQuantity.get(item.id) > 0) {
                    const newProductQuantity = productQuantity.set(item.id, productQuantity.get(item.id) - 1)
                    setProductQuantity(newProductQuantity)
                    setProducts([...products])
                  }
                }
                }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandPrimaryTap
                      : GlobalStyles.brandPrimary
                  },
                  styles.actionButton
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='minus-circle' color={'white'} size={20} />
                </View>
              </Pressable>

              <View style={styles.quantityBorder}>
                <TextRegular textStyle={[{ justifyContent: 'space-around', alignSelf: 'center' }]}>
                  {productQuantity.get(item.id)}
                </TextRegular>
              </View>

              <Pressable
                onPress={() => {
                  const newProductQuantity = productQuantity.set(item.id, productQuantity.get(item.id) + 1)
                  setProductQuantity(newProductQuantity)
                  setProducts([...products])
                }
                }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandGreenTap
                      : GlobalStyles.brandGreen
                  },
                  styles.actionButton
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
                </View>
              </Pressable>
            </View>
        }
        {!item.availability &&
          <View style={styles.actionButtonsContainer}>
            <TextRegular textStyle={styles.availability}numberOfLines={6}>Not available</TextRegular>
          </View>
        }
      </ImageCard>
    )
  }

  // Para renderizar un mensaje cuando la lista de productos esté vacía
  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const fetchAll = async () => {
    try {
      // Obtengo los detalles del restaurante que espera a que se complete la solicitud antes de continuar la ejcucion
      const fetchedRestaurant = await getDetail(route.params.id)
      // Obtiene la lista de productos del restaurante desde los datos obtenidos
      const productos = fetchedRestaurant.products
      // Obtengo los detalles del pedido que espera a que se termine la solicitud antes de la ejecucion
      const fetchedOrder = await getOrderDetails(route.params.orderId)
      // Establezco la direccion del pedido
      setAddress(fetchedOrder.address)
      // Establezco los detalles originales del pedido
      setOriginalOrder(fetchedOrder)
      // Establezco los detalles del restaurante
      setRestaurant(fetchedRestaurant)
      // Establezco la lista de productos en el estado
      setProducts(productos)
      // Itera sobre la lista de productos del restaurante y establece la cantidad de cada producto a 0
      fetchedRestaurant.products.forEach(element => {
        setProductQuantity(productQuantity.set(element.id, 0))
      })
      // Itero sobre la lista de productos y establece la cantidad de cada producto en el estado
      fetchedOrder.products.forEach(p => {
        setProductQuantity(productQuantity.set(p.id, p.OrderProducts.quantity))
      })
    } catch (error) {
      // Si hay error en la ejecucion --> showMessage error
      showMessage({
        message: `There was an error while retrieving details. ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const updateOrder = async (values) => {
    // Limpio los errores del backend estableciendo a una lista vacía
    setBackendErrors([])
    try {
      // Actualizo la direccion en los valores de pedido con la direccion actual del estado
      values.address = address
      // Actualizo el pedido con el orderId y los nuevos valores, y espero a que termine la solicitud
      // para continuar con la ejecucion
      await update(route.params.orderId, values)
      // showMessage --> exito
      showMessage({
        message: 'Order succesfully updated',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      // Navego a la pantalla de los pedidos con la propiedad dirty false.
      navigation.navigate('OrdersScreen', { dirty: false })
    } catch (error) {
      // Muestro error en la consola
      console.log(error)
      // Establezco los errores de backend en el estado
      setBackendErrors(error.errors)
      // showMessage --> error
      showMessage({
        message: `Problems while updating the order: ${backendErrors}`,
        type: 'danger',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
    // ConfirmOrderModal: modal mostrado para confirmar pedido
    // CancelEditModal: modal mostrado para confirmar la cancielcacion de la edicion del pedido
    // FlatList: renderiza la lista de elementos que muestra los datos, una funcion que renderiza cada elemento de la lista
    // y una funcion para generar las claves unicas de cada elemento.
    <>
      <OrderModal
        shippingCosts={restaurant.shippingCosts}
        data={productsInOrder}
        quantities={productQuantity}
        isVisible={orderToBeConfirmed !== null}
        onCancel={() => setOrderToBeConfirmed(null)}
        onConfirm={() => {
          updateOrder(orderToBeConfirmed)
          setOrderToBeConfirmed(null)
        }}
        addr={address}
        setAddr={setAddress}
        >

      </OrderModal>
      <CancelEditModal
        isVisible={cancelEditOrder === true}
        onCancel={() => setCancelEditOrder(false)}
        onConfirm={() => {
          setCancelEditOrder(false)
          navigation.navigate('OrdersScreen', { dirty: false })
        }
        }>
      </CancelEditModal>
      <FlatList
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyProductsList}
          style={styles.container}
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
        />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '90%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'center',
    fontSize: 20,
    fontStyle: 'italic',
    marginRight: 70,
    color: 'red'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 5,
    padding: 10,
    alignSelf: 'end',
    flexDirection: 'row',
    width: '4%',
    margin: '1%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    width: '90%',
    alignSelf: 'center',
    marginTop: 30,
    justifyContent: 'flex-end'
  },
  quantityBorder: {
    border: 'solid',
    marginTop: 5,
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '4%',
    margin: '1%',
    justifyContent: 'space-around',
    alignSelf: 'center'
  }
})
