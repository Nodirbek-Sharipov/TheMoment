import {
	Dimensions,
	Platform,
} from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export const window = {
	width,
	height,
}

export const isSmallDevice = width < 375

export const screenHeight = height

export const screenWidth = width

export const isXOrAbove = (Platform.OS === 'ios' && height >= 812)

export const isIos = (Platform.OS === 'ios')


const Layout = ()=>({
	window,
	isSmallDevice,
	screenHeight,
	screenWidth,
	isXOrAbove,
	isIos,
})

export default Layout