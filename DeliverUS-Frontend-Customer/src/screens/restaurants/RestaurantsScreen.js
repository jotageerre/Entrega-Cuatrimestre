/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, FlatList } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import { getRestaurants } from '../../api/RestaurantEndpoints'
import { showMessage } from 'react-native-flash-message'
import { get3MorePopularProducts } from '../../api/ProductEndpoints'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import defaultProductImage from '../../../assets/product.jpeg'

export default function RestaurantsScreen ({ navigation, route }) {
  // Inicializo los dos estados: restaurants y products
  // Restaurants almacena la lista de restaurantes
  // Products almacena la lista de productos
  const [restaurants, setRestaurants] = useState([])
  const [products, setProducts] = useState([])

  // Actualiza o monta el componente. Se ejecuta cada vez que cambia la ruta
  useEffect(() => {
    // Obtengo la lista de restaurantes con el getRestaurants, propiedad creada en el RestaurantEndpoints
    // Si tiene exito, actualiza el estado restaurants con los datos obtenidos.
    // Si falla: showMessage --> error
    const fetchRestaurantsDatos = async () => {
      try {
        const fetchedRestaurants = await getRestaurants()
        setRestaurants(fetchedRestaurants)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurants. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }

    fetchRestaurantsDatos(restaurants)

    // Intento conseguir los 3 productos mas populares utilizando get3MorePopularProducts, creada
    // en Produc
    async function fetchPopularProducts () {
      try {
        const fetchedProducts = await get3MorePopularProducts()
        setProducts(fetchedProducts)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving Products. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }

    fetchPopularProducts()
  }, [route])

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : restaurantLogo}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }

  const renderEmptyRestaurantsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retrieved.
      </TextRegular>
    )
  }

  const renderPopularProducts = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.restaurantId })
        }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {!item.availability &&
          <TextRegular textStyle={styles.availability }>Not available</TextRegular>
        }
      </ImageCard>
    )
  }

  const renderHeader = ({ item }) => {
    return (
    <>
      <TextSemiBold textStyle={styles.section_title}>
      Most popular products </TextSemiBold>
      <FlatList
        horizontal= {true}
        contentContainerStyle={[styles.container, styles.prod_mas_populares]}
        data={products}
        renderItem={renderPopularProducts}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyRestaurantsList}
      />
      <TextSemiBold textStyle={styles.section_title}>
      Restaurants </TextSemiBold>
    </>
    )
  }

  return (
      <FlatList
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.layout]}
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={r => r.id.toString()}
        ListEmptyComponent={renderEmptyRestaurantsList}
      />
  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  prod_mas_populares: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20
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
  section_title: {
    fontSize: 25,
    margin: 20,
    color: 'black',
    textAlign: 'center'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  }
})
