import React, { Component } from 'react'
import App from './App'
import MainContextProvider from './src/contexts/MainContext'

import 'react-native-gesture-handler'
import {AppRegistry} from 'react-native'
import {name as appName} from './app.json'

const AppWrap = () => (
	<MainContextProvider>
		<App />
	</MainContextProvider>
)

AppRegistry.registerComponent(appName, () => AppWrap);