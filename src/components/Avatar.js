import React from 'react'
import {
	Image,
	View,
	StyleSheet,
} from 'react-native'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
SimpleLineIcons.loadFont()

const Avatar = ({ size = 80, source = false, radius = 50 }) => {
	return (
		<View>
			{source ? (
				<Image
					style={{...styles.img, width: size, height: size, borderRadius: radius}}
					source={{uri: source}}
					resizeMode="contain"
				/>
			) : (
				<View style={{...styles.iconWrap, width: size, height: size, borderRadius: radius}}>
					<SimpleLineIcons
						name='user'
						size={20}
						style={styles.icon}
					/>
				</View>
			)}

		</View>
	)
}

export default Avatar;

const styles = StyleSheet.create({
	img: {
		borderWidth: 1,
		borderColor: '#999',
	},
	iconWrap: {
		display: 'flex',
		backgroundColor: '#eee',
		alignItems: 'center',
		justifyContent: 'center'
	},
	icon: {
		color: '#999',
	},
})