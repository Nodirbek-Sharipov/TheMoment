import React, {
	useState,
	useEffect,
	useContext,
} from 'react'
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	Alert,
} from 'react-native'
import firestore from '@react-native-firebase/firestore'
// import Shimmer from 'react-native-shimmer'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../constants/Colors'
import {
	isSmallDevice,
} from '../constants/Layout'
import {
	readFeed,
	readProfile,
} from '../helpers/db'
import {
	TouchableOpacity
} from 'react-native-gesture-handler'
import {
	MainContext,
} from '../contexts/MainContext'

String.prototype.nullify = function(){
	return this.length < 2 ? '0'+this : this
}

String.prototype.truncate = function(){
	return this.length > 30 ? this.substr(0, 30)+'...' : this
}


const MeetingList = ({ meeting })=>{

	const { appLanguage } = useContext(MainContext)

	let {id, clientId, hostId, clientNotes, hostNotes, confirmed, date} = meeting
	date = date.toDate()

	const [user, setUser] = useState(null)
	const [deleting, setDeleting] = useState(false)
	const [deleted, setDeleted] = useState(false)


	// host code
	const [profile, setProfile] = useState(null)
	// host code

	useEffect(()=>{
		let isMounted = true

		if(profile){
			if(!user && profile.isHost === false){
				readFeed().then(result => {
					if(result && result.filter(x => x.uid === hostId).length > 0){
						isMounted && setUser(result.filter(x => x.uid === hostId)[0])
					}else{
						firestore()
						.collection('users')
						.where('uid', '==', hostId)
						.get()
						.then(doc=>{
							const parsed = doc.docs.map(item => ({id: item.id, ...item.data()}))
							isMounted && setUser(parsed[0])
						}).catch(err => {
							Alert.alert(
								lang[appLanguage].oops,
								lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
								[{text: 'OK'}],
							)
						})
					}
				})
			}

			if(!user && profile.isHost === true){
				firestore()
				.collection('users')
				.where('uid', '==', clientId)
				.get()
				.then(doc=>{
					const parsed = doc.docs.map(item => ({id: item.id, ...item.data()}))
					isMounted && setUser(parsed[0])
				}).catch(err => {
					Alert.alert(
						lang[appLanguage].oops,
						lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
						[{text: 'OK'}],
					)
				})
			}
		}

		if(!profile){
			readProfile().then(p=>{
				isMounted && setProfile(p)
			})
		}

		return ()=>{
			isMounted = false
		}
	})

	const del = ()=>{
		setDeleting(true)
		firestore().doc('meetings/'+id).delete().then(()=>{
			setDeleting(false)
			setDeleted(true)
		}).catch(err => {
			setDeleting(false)
			Alert.alert(
				lang[appLanguage].oops,
				lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
				[{text: 'OK'}],
			)
		})
	}

	const DeleteConfirm = ()=>{
		Alert.alert(
			lang[appLanguage].confirmDel,
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

	return deleted ? (<></>) : (
		// <Shimmer style={{width: '100%'}} animating={!user}>
			<View style={styles.container}>
				<View style={styles.card}>
					<View style={styles.leftPad}>
						<TouchableOpacity
							disabled={deleting}
							onPress={DeleteConfirm}
							style={styles.delBtn}
						>
							{deleting ? (
								<ActivityIndicator
									size='small'
									color='#f00'
								/>
							) : (
								<FontAwesome
									name='trash-o'
									size={20}
									style={{color: '#f00'}}
								/>
							)}
						</TouchableOpacity>
					</View>
					<View style={styles.rightPad}>
						<Text style={styles.timeTxt}>{date.getHours()}:{String(date.getMinutes()).nullify()} - {String(date.getDate()).nullify()}.{String(date.getMonth()+1).nullify()}.{date.getFullYear()} {confirmed ? lang[appLanguage].confirmed : lang[appLanguage].waiting}</Text>
						<View style={styles.cont}>
							<View style={styles.txts}>
								<Text style={styles.subTxt}>{user && ((profile && profile.isHost === false) ? user.placeName.truncate() : user.fullName.truncate())}</Text>
								<Text style={styles.subTxt}>{user && user.phoneNumber}</Text>
								<Text style={styles.subTxt}>{profile && (profile.isHost === false ? lang[appLanguage].host + hostNotes.truncate() : lang[appLanguage].you + hostNotes.truncate())}</Text>
								<Text style={styles.subTxt}>{profile && (profile.isHost === false ? lang[appLanguage].you + clientNotes.truncate() : lang[appLanguage].client + clientNotes.truncate())}</Text>
							</View>
						</View>
					</View>
				</View>
			</View>
		// </Shimmer>
	)
}

export default MeetingList

const styles = StyleSheet.create({
	cont: {
		flexDirection: 'row'
	},
	txts: {
		flex: 1,
	},
	actions: {
		width: 60,
		alignItems: 'center',
	},
	delBtn: {
		borderRadius: 10,
		width: 50,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgb(247,206,205)',
	},

	container: {
		height: 180,
		width: '100%',
		paddingLeft: isSmallDevice ? 35 : 50,
		paddingRight: isSmallDevice ? 10 : 25,
		borderWidth: 0.1,
		borderColor: 'transparent',
	},
	card: {
		width: '100%',
		height: 180,
		borderLeftWidth: 2,
		borderLeftColor: Colors.profileOpaque,
		flexDirection: 'row',

	},
	leftPad: {
		height: 180,
		width: 50,
		marginLeft: -25,
	},
	rightPad: {
		flex: 1,
	},
	timeTxt: {
		fontSize: 18,
		color: Colors.profileSolid,
		fontWeight: '300',
		paddingTop: 15,
		paddingBottom: 15,
		paddingLeft: 20,
	},
	subTxt: {
		paddingLeft: 20,
		paddingBottom: 5,
	}
})

const lang = {
	en: {
		confirmed 	: 'Confirmed',
		waiting 	: 'Waiting',
		host 		: 'Host: ',
		you 		: 'You: ',
		client 		: 'Client',
		done 		: 'Done!',
		oops 		: 'Oops, something went wrong',
		noNetwork 	: 'Could not connect to internet ',
		yes 		: 'Yes',
		no 			: 'No',
		confirmDel 	: 'Do you really want to cancel reservation?',
	},
	ru: {
		confirmed 	: 'Подтвердил',
		waiting 	: 'Ожидание',
		host 		: 'Хозяин: ',
		you 		: 'Вы: ',
		client 		: 'Клиент: ',
		done 		: 'Выполнено!',
		oops 		: 'Упс! Что-то пошло не так',
		noNetwork 	: 'Не удалось подключиться к интернету ',
		yes 		: 'Да',
		no 			: 'Нет',
		confirmDel 	: 'Вы действительно хотите отменить бронирование?',
	},
	uz: {
		confirmed 	: 'Tasdiqlandi',
		waiting 	: 'Kutilmoqda',
		host 		: 'Mezbon: ',
		you 		: 'Siz: ',
		client 		: 'Mijoz: ',
		done 		: 'Bajarildi!',
		oops 		: 'Xatolik yuz berdi',
		noNetwork 	: 'Internetga ulanib bo\'lmadi ',
		yes 		: 'Ha',
		no 			: 'Yo\'q',
		confirmDel 	: 'Siz haqiqatdan ham bronlashni bekor qilmoqchimisiz?',
	}
}