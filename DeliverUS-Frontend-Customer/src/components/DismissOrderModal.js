/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
// import React, { useContext } from 'react'
import { StyleSheet, FlatList } from 'react-native'
// import { Pressable, View } from 'react-native'
import { getAllRestaurantsClient } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
// import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import { get3MorePopularProducts } from '../../api/ProductEndpoints'
import defaultProductImage from '../../../assets/product.jpeg'

export default function RestaurantsScreen ({ navigation, route }) {
  // TODO: Create a state for storing the restaurants.
  const [restaurants, setRestaurants] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    // TODO: Fetch all restaurants and set them to state.
    //      Notice that it is not required to be logged in.
    async function fetchRestaurants () {
      try {
        const fetchedRestaurants = await getAllRestaurantsClient()
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

    // TODO: set restaurants to state
    fetchRestaurants()

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
    return (<>
      <TextSemiBold textStyle={styles.section_title}>
      Popular products </TextSemiBold>
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
  section_title: {
    fontSize: 30,
    marginTop: 40,
    textAlign: 'center',
    fontWeight: 600
  },
  prod_mas_populares: {
    justifyContent: 'space-around'
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5
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
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  availability: {
    textAlign: 'center',
    fontSize: 20,
    fontStyle: 'italic',
    marginRight: 70,
    color: 'red'
  }
})
