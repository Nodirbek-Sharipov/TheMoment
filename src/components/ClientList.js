import React, {
	useEffect,
	useState,
	useContext,
} from 'react'
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Alert,
} from 'react-native'
import {
	MainContext,
} from '../contexts/MainContext'
import Colors from '../constants/Colors'
import firestore from '@react-native-firebase/firestore'

String.prototype.nullify = function(){
	return this.length < 2 ? '0'+this : this
}

String.prototype.truncate = function(){
	return this.length > 30 ? this.substr(0, 30)+'...' : this
}

const ClientList = ({ meeting, navigation })=>{

	const { appLanguage } = useContext(MainContext)

	let {id, clientId, hostId, clientNotes, hostNotes, confirmed, date} = meeting
	date = date.toDate()

	const [client, setClient] = useState(null)
	const [loading, setLoading] = useState(false)
	const [deleted, setDeleted] = useState(false)

	useEffect(()=>{
		let isMounted = true

		if(!client){
			firestore()
			.collection('users')
			.where('uid', '==', clientId)
			.get()
			.then(doc=>{
				const parsed = doc.docs.map(item => ({id: item.id, ...item.data()}))
				isMounted && setClient(parsed[0])
			}).catch(err => {
				Alert.alert(
					lang[appLanguage].oops,
					lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
					[{text: 'OK'}],
				)
			})
		}

		return ()=>{
			isMounted = false
		}
	})

	const del = ()=>{
		setLoading(true)
		firestore().doc('meetings/'+id).delete().then(()=>{
			setLoading(false)
			setDeleted(true)
		}).catch(err => {
			setLoading(false)
			Alert.alert(
				lang[appLanguage].oops,
				lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
				[{text: 'OK'}],
			)
		})
	}

	const DeleteConfirm = ()=>{
		Alert.alert(
			lang[appLanguage].rejectConfirm,
			'',
			[
				{text: lang[appLanguage].yes, style: 'destructive', onPress: ()=>{
					del()
				}},
				{text: lang[appLanguage].no, style: 'cancel', onPress: ()=>{}}
			],
			{ cancelable: false }
		)
	}

	const accept = ()=>{
		navigation.navigate('AcceptClient', {meeting: meeting})
	}

	return deleted ? (<></>) : (
			<TouchableOpacity
				activeOpacity={1}
				style={styles.button}
			>
				<View style={styles.card}>
					<View style={styles.bodyWrap}>
						<Text style={styles.placeName}>{date.getHours()}:{String(date.getMinutes()).nullify()} - {String(date.getDate()).nullify()}.{String(date.getMonth()+1).nullify()}.{date.getFullYear()}</Text>
						<Text style={styles.fullName}>{ client ? client.fullName.truncate() : lang[appLanguage].loading }</Text>
						<Text style={styles.fullName}>{ client ? client.phoneNumber : lang[appLanguage].loading }</Text>
						<Text style={styles.fullName}>{ clientNotes.truncate() }</Text>
					</View>
				</View>
				<View style={styles.actions}>
					<View style={styles.row}>
						<TouchableOpacity
							disabled={loading}
							onPress={DeleteConfirm}
							style={styles.reject}>
							<Text style={{color: '#f00'}}>{	lang[appLanguage].reject }</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.row}>
						<TouchableOpacity
							disabled={loading}
							onPress={accept}
							style={styles.accept}>
							<Text style={{color: Colors.profileSolid}}>{ lang[appLanguage].accept }</Text>
						</TouchableOpacity>
					</View>
				</View>
			</TouchableOpacity>
	)
}

export default ClientList

const styles = StyleSheet.create({
	actions: {
		flex: 1,
		height: 50,
		flexDirection: 'row',
	},
	row: {
		flex: 1,
		paddingLeft: 10,
		paddingRight: 10,
		paddingBottom: 10,
		paddingTop: 10,
		flexDirection: 'row',
	},
	reject: {
		flex: 1,
		backgroundColor: 'rgba(255,0,0,0.2)',
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	accept: {
		flex: 1,
		backgroundColor: Colors.profileOpaque,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},

	button: {
		width: '90%',
		marginTop: 10,
		marginBottom: 10,
		height: 160,

		borderRadius: 10,
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

	card: {
		height: 100,
		width: '100%',
		flexDirection: 'row',
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
		paddingTop: 15,
		paddingBottom: 2,
		paddingLeft: 20,
		paddingRight: 10,
		fontSize: 16,
		fontWeight: '400',
	},
	fullName: {
		color: '#000',
		width: '100%',
		paddingTop: 2,
		paddingBottom: 2,
		paddingLeft: 20,
		paddingRight: 10,
		fontSize: 16,
		fontWeight: '300'
	},
})

const lang = {
	en: {
		loading : 'Loading',
		reject : 'Reject',
		accept : 'Accept',
		done : 'Done!',
		oops : 'Oops, something went wrong',
		noNetwork : 'Could not connect to internet ',
		yes 		: 'Yes',
		no 			: 'No',
		rejectConfirm : 'Do you really want to reject the request?',
	},
	ru: {
		loading : 'Загружается',
		reject : 'Отклонять',
		accept : 'Принимать',
		done : 'Выполнено!',
		oops : 'Упс! Что-то пошло не так',
		noNetwork : 'Не удалось подключиться к интернету ',
		yes 		: 'Да',
		no 			: 'Нет',
		rejectConfirm : 'Вы действительно хотите отклонить запрос?',
	},
	uz: {
		loading : 'Yuklanmoqda',
		reject : 'Rad qilish',
		accept : 'Qabul qilish',
		done : 'Bajarildi!',
		oops : 'Xatolik yuz berdi',
		noNetwork : 'Internetga ulanib bo\'lmadi ',
		yes 		: 'Ha',
		no 			: 'Yo\'q',
		rejectConfirm : 'Siz haqiqatan ham so\'rovni rad etmoqchimisiz?',
	}
}