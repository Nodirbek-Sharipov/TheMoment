import { createStackNavigator } from 'react-navigation-stack'
import { createAppContainer } from 'react-navigation'

import WelcomeScreen from '../screens/WelcomeScreen'
import LoginScreen from "../screens/LoginScreen"
import PostLoginScreen from '../screens/PostLoginScreen'

const AuthRouter = createStackNavigator({
	WelcomeScreen: {
		screen: WelcomeScreen,
		navigationOptions: {
			title: "Welcome to The Moment"
		}
	},
	LoginScreen: {
		screen: LoginScreen,
		navigationOptions: {
			title: "Log In"
		}
	},
	PostLoginScreen: {
		screen: PostLoginScreen,
		navigationOptions: {
			title: "Set up your account"
		}
	}
},
{
	headerMode: 'none',
	navigationOptions: {
		headerShown: false,
	},
	initialRouteName: 'WelcomeScreen'
})

const LoginNavigator = createAppContainer(AuthRouter)

export default LoginNavigator