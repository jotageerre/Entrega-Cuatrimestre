import React, { useContext, useEffect, useState } from 'react'
import { FlatList, ImageBackground, StyleSheet, View, Image } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getOrderDetails } from '../../api/OrderEndpoints'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import ImageCard from '../../components/ImageCard'
import defaultProductImage from '../../../assets/product.jpeg'

export default function OrderDetailScreen ({ navigation, route }) {
  const [order, setOrder] = useState(null)
  const { loggedInUser } = useContext(AuthorizationContext)

  function renderFechaHora (fecha) {
    const fechaObj = new Date(fecha)
    const dia = fechaObj.getDate()
    const mes = fechaObj.getMonth() + 1
    const anyo = fechaObj.getFullYear()
    const horas = fechaObj.getHours()
    const minutos = fechaObj.getMinutes()
    return `${dia}/${mes}/${anyo} ${horas}:${minutos}`
  }

  useEffect(() => {
    async function fetchOrderDetail () {
      try {
        const fetchedOrder = await getOrderDetails(route.params.orderId)
        setOrder(fetchedOrder)
      } catch (err) {
        showMessage({
          message: `There was an error while retrieving order details (id ${route.params.orderId}). ${err}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    console.log('entra')
    fetchOrderDetail()
  }, [route, loggedInUser])

  const renderHeader = () => {
    return (
      <View>
        <ImageBackground source={(order?.restaurant?.logo) ? { uri: process.env.API_BASE_URL + '/' + order?.restaurant.logo, cache: 'force-cache' } : undefined}>
          <View style = {styles.orderHeaderContainer}>
            <TextSemiBold textStyle = {styles.restaurantNameStyle}>{(order?.restaurant?.name) ? order?.restaurant.name : 'Restaurant Name'}</TextSemiBold>
            <Image style = {styles.image} source= {(order?.restaurant?.logo) ? { uri: process.env.API_BASE_URL + '/' + order?.restaurant.logo, cache: 'force-cache' } : undefined} ></Image>
            <TextRegular textStyle= {styles.description}>Order ID: <TextSemiBold>{order?.id}</TextSemiBold></TextRegular>
            <TextRegular textStyle={styles.description}>Status: <TextSemiBold textStyle={order.status === 'in process' ? { color: GlobalStyles.brandSecondary } : order.status === 'sent' ? { color: GlobalStyles.brandGreen } : order.status === 'delivered' ? { color: 'blue' } : { color: GlobalStyles.brandPrimary }}>{order.status}</TextSemiBold></TextRegular>
           <TextRegular textStyle= {styles.description}>Price: <TextSemiBold>{order?.price}€</TextSemiBold></TextRegular>
            <TextRegular textStyle= {styles.description}>Shipping Costs: <TextSemiBold>{order?.shippingCosts}€</TextSemiBold></TextRegular>
            <TextRegular textStyle= {styles.description}>Address: <TextSemiBold>{order?.address}</TextSemiBold></TextRegular>
            <TextRegular textStyle= {styles.description}>Order Created At: <TextSemiBold>{renderFechaHora(order?.createdAt)}</TextSemiBold></TextRegular>
          </View>
        </ImageBackground>
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
      imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
      title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        <TextRegular>Quantity: <TextSemiBold textStyle={styles.price}>{item.OrderProducts.quantity}</TextSemiBold></TextRegular>
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle = {styles.emptyList}>
        This Order has no products.
      </TextRegular>
    )
  }
  return (

    <>
    { order &&
    <FlatList
      ListEmptyComponent={renderEmptyProductsList}
      data={order?.products}
      renderItem={renderProduct}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={renderHeader}
    />
  }
  </>

  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  orderHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'

  },
  restaurantNameStyle: {
    fontSize: 20,
    color: 'white'

  },
  description: {
    color: 'white'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }

})
