import React from 'react'
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import Avatar from './Avatar'
import Colors from '../constants/Colors'

export default function FeedItem({ host, navigation, disabled = false }) {

	const ShowHost = ()=>{
		navigation.navigate('ShowHost', {host: host})
	}

	return (
		<TouchableOpacity
			disabled={disabled}
			onPress={ShowHost}
			style={styles.button}>
			<View style={styles.card}>
				<View style={styles.avatarWrap}>
					<Avatar size={80} radius={10} source={false} />
				</View>
				<View style={styles.bodyWrap}>
					<Text style={styles.placeName}>{ host.placeName }</Text>
					<Text style={styles.fullName}>{ host.fullName }</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	button: {
		width: '90%',
		marginTop: 15,
		marginBottom: 15,
	},
	card: {
		height: 100,
		width: '100%',
		borderRadius: 10,
		flexDirection: 'row',
		backgroundColor: '#fff',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	avatarWrap: {
		width: 100,
		height: 100,
		alignItems: 'center',
		justifyContent: 'center',
	},
	bodyWrap: {
		flex: 1,
		height: 100,
		alignItems: 'center',
		justifyContent: 'center',
	},
	placeName: {
		color: Colors.profileSolid,
		width: '100%',
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 10,
		paddingRight: 10,
		marginBottom: 10,
		fontSize: 18,
		fontWeight: '400',

	},
	fullName: {
		color: '#000',
		width: '100%',
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 10,
		paddingRight: 10,
		fontSize: 16,
		fontWeight: '300'
	},
})