import {
	createSwitchNavigator,
	createAppContainer,
} from 'react-navigation'

import LoginNavigator from './LoginNavigator'
import AppNavigator from './AppNavigator'

export const getRootNavigator = (loggedIn = false, isNew = true) => createAppContainer(
	createSwitchNavigator(
		{
			LoggedOut: {
				screen: LoginNavigator
			},
			LoggedIn: {
				screen: AppNavigator
			}
		},
		{
			initialRouteName: (loggedIn && !isNew) ? 'LoggedIn' : 'LoggedOut'
		}
	)
);