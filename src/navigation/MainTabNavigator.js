import React from 'react'
import {
	Platform,
	StyleSheet,
	View,
	Animated,
} from 'react-native'
import {
	createStackNavigator,
} from 'react-navigation-stack'
import {
	createBottomTabNavigator,
} from 'react-navigation-tabs'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {
	isSmallDevice,
	isXOrAbove,
} from '../constants/Layout'
import Colors from '../constants/Colors'

Feather.loadFont();
AntDesign.loadFont();

import HomeScreen from '../screens/HomeScreen'
import TasksScreen from '../screens/TasksScreen'
import ProfileScreen from '../screens/ProfileScreen'
import SettingsScreen from '../screens/SettingsScreen'
import AboutScreen from '../screens/static/AboutScreen'
import ContactScreen from '../screens/static/ContactScreen'
import EditProfileScreen from '../screens/EditProfileScreen'
import ShowHostScreen from '../screens/ShowHostScreen'
import AcceptClientScreen from '../screens/AcceptClientScreen'

const isAnimated = false

const config = Platform.select({
	web: { headerMode: 'screen' },
	default: {},
});

const style = StyleSheet.create({
	buttonStyle: {
		height: isXOrAbove ? 40 : 35, // 35 or 40
		paddingRight: 12,
		paddingLeft: 12,
		borderRadius: 10, // 25
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	labelStyle: {
		// right: 'auto',
		fontSize: 12,
		paddingLeft: 8,
	},
})

const { labelStyle, buttonStyle } = style

const tabBarOptions = {
	showLabel: false,
	style: {
		paddingRight: isSmallDevice ? 0 : 20 ,
		paddingLeft: isSmallDevice ? 0 : 20,
		paddingTop: isXOrAbove ? 10 : 0,
	},
}

let HomeTextAnim = new Animated.Value(0)
let TasksTextAnim = new Animated.Value(0)
let ProfileTextAnim = new Animated.Value(0)

const AnimationDuration = 250

// =======================================================
// ==				HOME NAVIGATOR						==
// =======================================================
const HomeStack = createStackNavigator(
	{
		Home: HomeScreen,
		ShowHost: ShowHostScreen,
		AcceptClient: AcceptClientScreen,
	},
	config
)

HomeStack.navigationOptions = {
	tabBarLabel: 'Home',
	tabBarIcon: ({ focused }) => (
		<View style={{...buttonStyle, backgroundColor: focused ? Colors.profileOpaque : 'transparent'}}>
			<AntDesign
				name='home'
				size={25}
				color={focused ? Colors.profileSolid : Colors.tabIconDefault}
			/>
			{ (focused && isAnimated) && (()=>{
				Animated.timing(HomeTextAnim, {
					toValue: 12,
					duration: AnimationDuration,
					useNativeDriver: false,
				}).start()
				setTimeout(()=>{
					HomeTextAnim = new Animated.Value(0)
				}, AnimationDuration);
			})() }
			{ focused && (<Animated.Text style={{...labelStyle, color: focused ? Colors.profileSolid : Colors.tabIconDefault, fontSize: isAnimated ? HomeTextAnim : 12}}>Home</Animated.Text>)}
		</View>
	),
	tabBarOptions,
}
HomeStack.path = 'home'

// =======================================================
// ==				TASK NAVIGATOR						==
// =======================================================
const TasksStack = createStackNavigator(
	{
		Tasks: TasksScreen,
	},
	config
)

TasksStack.navigationOptions = {
	tabBarLabel: 'Tasks',
	tabBarIcon: ({ focused }) => (
		<View style={{...buttonStyle, backgroundColor: focused ? Colors.profileOpaque : 'transparent'}}>
			<Feather
				name='list'
				size={25}
				color={focused ? Colors.profileSolid : Colors.tabIconDefault}
			/>
			{ (focused && isAnimated) && (()=>{
				Animated.timing(TasksTextAnim, {
					toValue: 12,
					duration: AnimationDuration,
					useNativeDriver: false,
				}).start()
				setTimeout(()=>{
					TasksTextAnim = new Animated.Value(0)
				}, AnimationDuration);
			})() }
			{ focused && (<Animated.Text style={{...labelStyle, color: focused ? Colors.profileSolid : Colors.tabIconDefault, fontSize: isAnimated ? TasksTextAnim : 12}}>Tasks</Animated.Text>)}
		</View>
	),
	tabBarOptions,
}
TasksStack.path = 'tasks'

// =======================================================
// ==				PROFILE NAVIGATOR					==
// =======================================================
const ProfileStack = createStackNavigator(
	{
		Profile: ProfileScreen,
		EditProfile: EditProfileScreen,
		Settings: SettingsScreen,
		About: AboutScreen,
		Contact: ContactScreen,
		ShowHost: ShowHostScreen,
	},
	config
)

ProfileStack.navigationOptions = {
	tabBarLabel: 'Profile',
	tabBarIcon: ({ focused }) => (
		<View style={{...buttonStyle, backgroundColor: focused ? Colors.profileOpaque : 'transparent'}}>
			<Feather
				name='user'
				size={25}
				color={focused ? Colors.profileSolid : Colors.tabIconDefault}
			/>
			{ (focused && isAnimated) && (()=>{
				Animated.timing(ProfileTextAnim, {
					toValue: 12,
					duration: AnimationDuration,
					useNativeDriver: false,
				}).start()
				setTimeout(()=>{
					ProfileTextAnim = new Animated.Value(0)
				}, AnimationDuration);
			})() }
			{ focused && (<Animated.Text style={{...labelStyle, color: focused ? Colors.profileSolid : Colors.tabIconDefault, fontSize: isAnimated ? ProfileTextAnim : 12}}>Profile</Animated.Text>)}
		</View>
	),
	tabBarOptions,
}

ProfileStack.path = 'profile'

const tabNavigator = createBottomTabNavigator({
	HomeStack,
	TasksStack,
	ProfileStack,
})

tabNavigator.path = ''

export default tabNavigator
