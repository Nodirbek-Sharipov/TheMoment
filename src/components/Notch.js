import React from 'react'
import {
	StatusBar,
	Platform,
	View,
	Text,
} from 'react-native'
import {
	isIos,
	isXOrAbove,
} from '../constants/Layout'

const notchHeight = isIos ? (isXOrAbove ? 40 : 20) : 0; // StatusBar.currentHeight

export default function Notch() {
	return (
		<View style={{height: notchHeight}}></View>
	)
}
