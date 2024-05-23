import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import { getDetail } from '../../api/RestaurantEndpoints'
import { create } from '../../api/OrderEndpoints'
import InputItem from '../../components/InputItem'
import ConfirmOrderModal from '../../components/ConfirmOrderModal'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import { Formik } from 'formik'
import TextError from '../../components/TextError'
import defaultProductImage from '../../../assets/product.jpeg'

export default function RestaurantOrderScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState()
  const [restaurant, setRestaurant] = useState({})
  const [cont, setCont] = useState({})
  const [confirmOrder, setConfirmOrder] = useState(null)

  function updateCont (id, cantidad) {
    const contCopy = { ...cont }
    if (contCopy[id] === isNaN) {
      contCopy[id] = 1
    } else if (cantidad === 0) {
      contCopy[id] = cantidad
    } else {
      if (cantidad === 1) {
        contCopy[id] += 1
      } else {
        if (cantidad === -1) {
          contCopy[id] -= 1
        }
        if (contCopy[id] < 0) {
          contCopy[id] = 0
        }
      }
    }
    setCont(contCopy)
  }

  function startCont () {
    const newCont = {}
    restaurant.products.forEach(product => { newCont[product.id] = 0 })
    setCont(newCont)
  }

  useEffect(() => {
    fetchRestaurantDetail()
  }, [route])

  useEffect(() => {
    if (restaurant && restaurant.products) {
      startCont()
    }
  }, [restaurant])

  const initialOrderValues = { address: null, restaurantId: null, products: null }
  const validationSchema = yup.object().shape({
    address: yup
      .string()
      .max(255, 'Address too long')
      .required('Address is required'),
    restaurantId: yup
      .number()
      .required('RestaurantId is required'),
    products: yup.array(yup.object({
      productId: yup
        .number()
        .required('Product id is required'),
      quantity: yup
        .number()
        .required('Quantity is required')
    }))
  })

  const createOrder = async (values) => {
    setBackendErrors([])
    try {
      await create(values)
      showMessage({
        message: 'Order succesfully created',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('RestaurantsScreen', { dirty: true })
      navigation.navigate('OrdersScreen', { dirty: true })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
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
      </View>
    )
  }

  const renderProduct = ({ item }) => {
    const id = item.id
    if (!item.availability) {
      return (null)
    } else {
      return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {!item.availability &&
          <TextRegular textStyle={styles.availability }>Not available</TextRegular>
        }
        <View style={styles.actionButtonsContainer}>
          <Pressable
            onPressIn={() => { updateCont(id, -1) }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandPrimary
                  : GlobalStyles.brandPrimaryTap
              },
              styles.button
            ]}>
              <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='minus-circle' color={'white'} size={20} />
            </View>
            </Pressable>

            <View style={styles.quantityBorder}>
            <TextRegular textStyle={[{ justifyContent: 'space-around', alignSelf: 'center' }]}>{cont[id]}</TextRegular>
            </View>

            <Pressable
              onPressIn={() => { updateCont(id, 1) }}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandGreenTap
                    : GlobalStyles.brandGreen
                },
                styles.button
              ]}>

              <View style={[{ flex: 1, flexDirection: 'colum', alignItems: 'center' }]}>
                <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
              </View>

            </Pressable>

        </View>
      </ImageCard>
      )
    }
  }

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const loadCleanProducts = async (onSuccess) => {
    const old = { ...cont }
    const clean = []
    for (let i = 0; i < Object.keys(old).length; i++) {
      const key = Object.keys(old)[i]
      const cleanTransaction = {
        productId: null,
        quantity: null
      }
      if (old[key] !== 0) {
        cleanTransaction.productId = key
        cleanTransaction.quantity = old[key]
        clean.push(cleanTransaction)
      }
    }
    if (!clean.canceled) {
      if (onSuccess) {
        onSuccess(clean)
      }
    }
  }

  return (

      <Formik
        validationSchema={validationSchema}
        initialValues={initialOrderValues}
        onSubmit={createOrder}>
        {({ handleSubmit, setFieldValue, values }) => (
          <ScrollView>

            <FlatList
               ListHeaderComponent={renderHeader}
               />
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: '90%' }}>
              <Pressable
                    onPressIn={() => { setFieldValue('restaurantId', restaurant.id) } }
                    onPressOut={() => loadCleanProducts(async (result) => {
                      setFieldValue('products', result)
                      setConfirmOrder(1)
                    })}
                    style={({ pressed }) => [
                      {
                        backgroundColor: pressed
                          ? GlobalStyles.brandGreenTap
                          : GlobalStyles.brandGreen
                      },
                      styles.confirmed_button
                    ]}>
                    <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                      <MaterialCommunityIcons name='content-save-edit' color={'white'} size={20} />
                      <TextRegular textStyle={styles.text}>
                        Confirm
                      </TextRegular>
                    </View>
                  </Pressable>

                <InputItem
                  name='address'
                  label='Address:' />
                {backendErrors &&
                  backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)}

                <FlatList
                  ListEmptyComponent={renderEmptyProductsList}
                  style={styles.container}
                  data={restaurant.products}
                  renderItem={renderProduct}
                  keyExtractor={item => item.id.toString()} />
                <View style={{ alignItems: 'center' }}>

                  <ConfirmOrderModal
                    isVisible={confirmOrder !== null}
                    onCancel={() => setConfirmOrder(null)}
                    onConfirm={handleSubmit}>
                    <TextRegular>Do you want confirm the order?</TextRegular>
                  </ConfirmOrderModal>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </Formik>
  )
}

const styles = StyleSheet.create({
  confirmed_button: {
    borderRadius: 8,
    height: 40,
    marginTop: 20,
    marginRight: 12,
    marginLeft: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '100%'
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    marginRight: 12,
    marginLeft: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '6%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
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
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  description: {
    color: 'white'
  },
  imagePicker: {
    height: 40,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 80
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    width: '60%',
    alignSelf: 'end',
    marginTop: 15,
    justifyContent: 'flex-end'
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
  quantityBorder: {
    border: 'solid',
    marginTop: 17,
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '7%',
    margin: '1%',
    justifyContent: 'space-around',
    alignSelf: 'center'
  }
})
