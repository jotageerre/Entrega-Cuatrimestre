import React, { useEffect, useState } from 'react'
import { ScrollView, Modal, FlatList, Pressable, StyleSheet, View, TextInput } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import TextSemiBold from './TextSemibold'
import * as GlobalStyles from '../styles/GlobalStyles'
import TextRegular from './TextRegular'
import defaultProductImage from '../../assets/product.jpeg'
import ImageCard from './ImageCard'

export default function ConfirmOrderModal (props) {
  const [productsPrice, setProductPrice] = useState(0)
  const [shippingCost, setShippingCost] = useState()

  useEffect(() => {
    let prodPrice = 0
    for (const product of props.data) {
      prodPrice += props.quantities.get(product.id) * product.price
    }
    setProductPrice(prodPrice)
    if (prodPrice > 10) {
      setShippingCost(0)
    } else {
      setShippingCost(props.shippingCosts)
    }
  }, [props.data])

  const renderProduct = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
        title={item.name}
      >
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        <TextRegular>Quantity: <TextSemiBold textStyle={styles.price}>{props.quantities.get(item.id)}</TextSemiBold></TextRegular>
        <TextRegular>Total: <TextSemiBold textStyle={styles.price}>{props.quantities.get(item.id) * item.price} €</TextSemiBold></TextRegular>
      </ImageCard>
    )
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular>
        This order has no products.
      </TextRegular>
    )
  }

  return (
    <Modal
    presentationStyle='overFullScreen'
    animationType='slide'
    transparent={true}
    visible={props.isVisible}
    onRequestClose={props.onCancel}>
    <ScrollView>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TextSemiBold textStyle={{ fontSize: 15 }}>Order summary</TextSemiBold>
          {props.children}
          <FlatList
          ListEmptyComponent={renderEmptyProductsList}
          data={props.data}
          style={styles.container}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          />

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <TextRegular textStyle={{ fontSize: 15 }}>Address: </TextRegular>

            <TextInput
                style={{
                  marginTop: 10,
                  marginLeft: 10,
                  marginBottom: 10,
                  borderColor: 'black',
                  borderWidth: 2,
                  padding: 2
                }}
                name='Address'
                placeholder='Address'
                onChangeText={props.setAddr}
                value={props.addr}
            />
          </View>

          <TextSemiBold textStyle={{ fontSize: 15 }}>Product price: {productsPrice} €</TextSemiBold>

          <TextSemiBold textStyle={{ fontSize: 15 }}>Shipping costs: {shippingCost} €</TextSemiBold>
          <TextSemiBold textStyle={{ fontSize: 15 }}>Total price: {productsPrice + shippingCost} €</TextSemiBold>

          <Pressable
              onPress={props.onConfirm}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandGreenTap
                    : GlobalStyles.brandGreen
                },
                styles.actionButton
              ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='check' color={'white'} size={20}/>
              <TextRegular textStyle={styles.text}>
                Confirm order
              </TextRegular>
            </View>
          </Pressable>
          <Pressable
              onPress={props.onCancel}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed
                    ? GlobalStyles.brandPrimaryTap
                    : GlobalStyles.brandPrimary
                },
                styles.actionButton
              ]}>
            <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
              <MaterialCommunityIcons name='close' color={'white'} size={20}/>
              <TextRegular textStyle={styles.text}>
                Cancel
              </TextRegular>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.75,
    shadowRadius: 4,
    elevation: 5,
    width: '90%'
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
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  container: {
    flex: 1
  }
})
