import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AuthorizationContext } from '../../context/AuthorizationContext'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [quantities, setQuantity] = useState([])
  const [precio, setPrecio] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    async function fetchRestaurantDetail () {
      try {
        const fetchedRestaurant = await getDetail(route.params.id)
        const cantidad = fetchedRestaurant.products.map(x => 0)
        setQuantity(cantidad)
        setPrecio(cantidad)
        setRestaurant(fetchedRestaurant)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurants. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }
    fetchRestaurantDetail()
  }, [loggedInUser, route])

  const renderHeader = () => {
    return (
      <>
      <>
      <View>
      <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
        <View style={styles.restaurantHeaderContainer}>
          <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
          <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
          <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
          <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
        </View>
      </ImageBackground>
      </View>
      </>
        {loggedInUser &&
          <Pressable
            onPress={() => navigation.navigate('RestaurantOrderScreen', { quantities, price: precio, id: route.params.id })}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandGreenTap
                  : GlobalStyles.brandGreen
              },
              styles.button
            ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
              <TextRegular textStyle={styles.text}>
                Create order
              </TextRegular>
            </View>
          </Pressable>
          }
      </>
    )
  }

  const renderProduct = ({ item, index }) => {
    return (
    <View style={{ flex: 5, padding: 10 }}>
    <ImageCard
    imageUri={item.image
      ? {
          uri: process.env.API_BASE_URL + '/' +
    item.image
        }
      : undefined}
    title={item.name}
    >
    <TextRegular numberOfLines={2}>{item.description}</TextRegular>
    <TextSemiBold
    textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
    </ImageCard>
    </View>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  return (
      <FlatList
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyProductsList}
          style={styles.container}
          data={restaurant.products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
        />
  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 25
  },
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
    width: '80%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
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
    position: 'absolute',
    width: '90%'
  }
})
