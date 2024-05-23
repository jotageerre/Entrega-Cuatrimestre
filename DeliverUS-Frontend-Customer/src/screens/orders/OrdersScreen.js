import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Pressable, View } from 'react-native'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { borrar, getAll } from '../../api/OrderEndpoints'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { FlatList } from 'react-native-web'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import DeleteModal from '../../components/DeleteModal'

export default function OrdersScreen ({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)

  function renderFechaHora (fecha) {
    const fechaObjeto = new Date(fecha)
    const dia = fechaObjeto.getDate()
    const mes = fechaObjeto.getMonth() + 1
    const anyo = fechaObjeto.getFullYear()
    const horas = fechaObjeto.getHours()
    const minutos = fechaObjeto.getMinutes()
    return `${dia}/${mes}/${anyo} ${horas}:${minutos}`
  }

  async function fetchOrders () {
    try {
      const fetchedOrders = await getAll()
      fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurants. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const removeOrder = async (order) => {
    // Para borrar los pedidos elimino las ordenes por su id con el destroy del ApiRequestsHelper, busco los pedidos y pongo el
    // setOrderToBeDeleted en null. Posteriormente pongo un mensaje de exito si ha funcionado. Sin embargo, en caso de error
    // enseño un mensaje remarcando que dicho pedido (OrderId) no ha podido ser borrado.
    try {
      await borrar(order.id)
      await fetchOrders()
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.id} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.id} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  useEffect(() => {
    // Si el usuario está logeado busca las pedidos, sino hago un set de las pedidos
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route, orders])

  const renderOrder = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : restaurantLogo}
        title={item.restaurant.name}
        // Me meto en el OrderDetail con la id del pedido
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { orderId: item.id })
          // A continuacion pongo el estatus que si está en proceso me pone el estilo GlobalStyles.brandSecondary, si está enviado
          // pone el estilo GlobalStyles.brandGreen, si ha llegado lo pongo en azul, si no se cumple ninguno de los estatus pongo
          // GlobalStyles.brandPrimary
        }}
      >
        <TextRegular>Status: <TextSemiBold textStyle={item.status === 'in process' ? { color: GlobalStyles.brandSecondary } : item.status === 'sent' ? { color: GlobalStyles.brandGreen } : item.status === 'delivered' ? { color: GlobalStyles.brandBlue } : { color: GlobalStyles.brandPrimary }}>{item.status}</TextSemiBold></TextRegular>
        <TextRegular>Price: <TextSemiBold>{item.price}€</TextSemiBold></TextRegular>
        <TextRegular>Order placed on: <TextSemiBold>{renderFechaHora(item.createdAt)}</TextSemiBold></TextRegular>
        {item.status === 'pending' &&
        // Me meto en el EditOrderScreen cuando pulso el boton para editar el pedido id (orderId) del restaurante (restaurant.id)
        <View style={styles.actionButtonsContainer}>
          <Pressable
           onPress={() => navigation.navigate('EditOrderScreen', { orderId: item.id, id: item.restaurant.id })}
            // Si el boton está presionado cambia su estilo
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              },
              styles.actionButton
              // A continuacion el dibujo del Edit y del Delete (MaterialCommunityIcons), detalles tontos :)
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='pencil-box-multiple-outline' color={'white'} size={20}/>
              <TextRegular textStyle={styles.text}>
                Edit
              </TextRegular>
            </View>
          </Pressable>

          <Pressable
            onPress={() => { setOrderToBeDeleted(item) }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimaryTap
                  : GlobalStyles.brandPrimary
              },
              styles.actionButton
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='trash-can' color={'white'} size={20}/>
              <TextRegular textStyle={styles.text}>
                Delete
              </TextRegular>
            </View>
          </Pressable>
        </View>}

      </ImageCard>
    )
  }

  const renderEmptyOrdersList = () => {
    return (
      // En caso de que no esté logeado sale esto en pantalla, con un boton en logged in que te lleva a la pagina del perfil para registrarte
      <TextRegular textStyle={ styles.not_logged_in}>
        No orders were retrieved. Are you
        <TextSemiBold
        textStyle={ styles.not_logged_in}
        onPress={() => { navigation.navigate('Profile') }}> logged in?</TextSemiBold>
      </TextRegular>
    )
  }

  return (
    // FlatList para mostrar la lista de pedidos
    // DeleteModal para confirmar la eliminación de un pedido
    <>
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={renderEmptyOrdersList}
        />
        <DeleteModal
          isVisible={orderToBeDeleted !== null}
          onCancel={() => setOrderToBeDeleted(null)}
          onConfirm={() => removeOrder(orderToBeDeleted)}>
          <TextRegular>The products of this order will be deleted as well</TextRegular>
        </DeleteModal>
      </>
  )
}

const styles = StyleSheet.create({
  not_logged_in: {
    fontSize: 20,
    marginTop: 100,
    textAlign: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'relative',
    width: '90%'
  }
})
