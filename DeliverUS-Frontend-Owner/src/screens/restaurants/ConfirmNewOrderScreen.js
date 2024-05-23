import React, { useEffect, useState } from 'react'
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import * as yup from 'yup'
import { ErrorMessage, Formik } from 'formik'






const [initialRestaurantValues, setInitialRestaurantValues] = useState({ address: null, postalCode: null })
  const validationSchema = yup.object().shape({

    address: yup
      .string()
      .max(255, 'Address too long')
      .required('Address is required'),
    postalCode: yup
      .string()
      .max(255, 'Postal code too long')
      .required('Postal code is required')
  })