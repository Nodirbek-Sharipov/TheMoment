import React, {
	useEffect,
	useState,
	useContext,
} from 'react'
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	Alert,
} from 'react-native'
// import Shimmer from 'react-native-shimmer';
import firestore from '@react-native-firebase/firestore'
import {
	TouchableOpacity,
} from 'react-native-gesture-handler'
import {
	MainContext,
} from '../contexts/MainContext'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Avatar from './Avatar'
import Colors from '../constants/Colors'
FontAwesome.loadFont();

const HostList = ({ hostId = null, bookmarkId = null, navigation }) => {

	const usersCollection 			= firestore().collection('users')
	const bookmarksCollection 		= firestore().collection('bookmarks')

	const { appLanguage } 			= useContext(MainContext)

	const [host, setHost] 			= useState(null)
	const [confirmed, setConfirmed] = useState(false)
	const [deleting, setDeleting] 	= useState(false)
	const [deleted, setDeleted] 	= useState(false)

	useEffect(()=>{
		let isMounted = true;

		if(!host){
			usersCollection.where('uid', '==', hostId).get().then(res => {
				// can be undefined
				isMounted && setHost(res._docs[0]._data)
			}).catch(err => {});
		}

		return ()=>{
			isMounted = false
		} // Stop listening for updates whenever the component unmounts
	})

	const ShowHost = ()=>{
		navigation.navigate('ShowHost', {host: host})
	}

	const DeleteBookmark = (bid)=>{
		if(confirmed){
			// delete
			setDeleting(true)
			bookmarksCollection.doc(bid).delete().then(res => {
				setDeleting(false)
				setDeleted(true)
			}).catch(err => {
				setDeleting(false)
				Alert.alert(
					'Oops, something went wrong!',
					'Error deleting bookmark',
					[
						{text: 'OK', onPress: () => { }}
					],
					{ cancelable: false }
				)
			})
		}else{
			setConfirmed(true);
			setTimeout(()=> setConfirmed(false), 3000)
		}
	}

	return deleted ? (<></>) : (
		<View style={styles.card}>
			<View style={styles.iconWrap}>
				<TouchableOpacity onPress={ShowHost}>
					{/* <Shimmer animating={!host}> */}
						<Avatar source={null} radius={10} />
					{/* </Shimmer> */}
				</TouchableOpacity>
			</View>

			<View style={styles.bodyWrap}>
				<Text style={styles.barberShop}>{host ? host.placeName : lang[appLanguage].loading }</Text>
				<Text style={styles.barberName}>{host ? host.fullName : lang[appLanguage].loading }</Text>
			</View>

			<View style={styles.actionWrap}>
				{/* <Shimmer animating={!host}> */}
					<TouchableOpacity
						onPress={ ()=> DeleteBookmark(bookmarkId) }
						style={confirmed ? {...styles.actionBtn, backgroundColor: 'rgba(255,0,0,0.2)'} : styles.actionBtn}
					>
						{deleting ? (
							<ActivityIndicator
								size='small'
								color='#f00'
							/>
						) : (
							<FontAwesome
								name={confirmed ?'trash-o' : 'bookmark'}
								size={20}
								style={confirmed ? styles.iconDel : styles.icon}
							/>
						)}
					</TouchableOpacity>
				{/* </Shimmer> */}
			</View>
		</View>
	)
}

export default HostList

const lang = {
	en: {
		loading: 'Loading'
	},
	ru: {
		loading: 'Загружается'
	},
	uz: {
		loading: 'Yuklanmoqda'
	}
}

const styles = StyleSheet.create({
	card: {
		width: '90%',
		borderRadius: 10,
		height: 100,
		marginTop: 15,
		marginBottom: 15,
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
	iconWrap: {
		width: 100,
		height: 100,
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		paddingTop: 2,
		color: Colors.profileSolid
	},
	iconDel: {
		paddingTop: 2,
		color: '#f00',
	},
	bodyWrap: {
		flex: 1,
	},
	barberShop: {
		fontSize: 18,
		fontWeight: '300',
		paddingTop: 10,
		paddingLeft: 5,
	},
	barberName: {
		fontSize: 14,
		fontWeight: '300',
		paddingTop: 10,
		paddingLeft: 5,
	},
	actionWrap: {
		width: 60,
		height: 100,
		justifyContent: 'center',
		alignItems: 'center',
	},
	actionBtn: {
		backgroundColor: Colors.profileOpaque,
		borderRadius: 10,
		height: 40,
		paddingRight: 12,
		paddingLeft: 12,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
})