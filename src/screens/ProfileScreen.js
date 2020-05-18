import React, {
	useContext,
	useState,
	useEffect,
	useCallback,
} from 'react'
import {
	StyleSheet,
	View,
	Text,
	Alert,
	ScrollView,
	RefreshControl,
} from 'react-native'
// import Shimmer from 'react-native-shimmer'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import {
	MainContext,
} from '../contexts/MainContext'
import Notch from '../components/Notch'
import Colors from '../constants/Colors'
import Avatar from '../components/Avatar'
import {
	TouchableOpacity,
} from 'react-native-gesture-handler'
import HostList from '../components/HostList'
import Feather from 'react-native-vector-icons/Feather'

import {
	readProfile,
	writeProfile,
	readBookmarks,
	writeBookmarks,
} from '../helpers/db'
import {
	isXOrAbove,
	isSmallDevice,
} from '../constants/Layout'

// SVGs
import Loading from '../assets/loading'
import Void from '../assets/void'

Feather.loadFont()

const dayIndex = new Date().getDay()

export default function ProfileScreen({ navigation }) {

	const usersCollection 			= firestore().collection('users')
	const bookmarksCollection 		= firestore().collection('bookmarks')

	const { appLanguage } 			= useContext(MainContext)

	const [loginUser, setLoginUser] = useState(null)
	const [user, setUser] 			= useState(null)
	const [needUser, setNeedUser]	= useState(true)
	const [loading, setLoading] 	= useState(true)
	const [bookmarks, setBookmarks]	= useState(null)

	const [renders, setRenders] = useState(0)

	const onRefresh = useCallback(() => {
		setLoading(true)
		setNeedUser(true)
	}, [loading, needUser])

	const shimmerAnimated = loading && needUser

	const fetchCurrentUser = ()=>{
		usersCollection.where('uid', '==', loginUser.uid).get().then(res => {
			// can be undefined
			if(res.docs[0] && res.docs[0].data()){
				const parsed = {
					id: res.docs[0].id,
					...res.docs[0].data(),
				}
				setNeedUser(false)
				setUser(parsed)
				writeProfile(parsed)
				setLoading(false)
			}
		}).catch(err => {
			setNeedUser(false)
			setLoading(false)
			Alert.alert(
				lang[appLanguage].oops,
				lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
				[{text: 'OK'}],
			)
		});
	}

	const fetchCurrentBookmarks = ()=>{
		bookmarksCollection.where('clientId', '==', loginUser.uid).get().then(res => {
			// can be undefined
			const parsed = res.docs.map(x => ({id: x.id, _data: {...x.data()}}))
			setBookmarks(parsed)
			writeBookmarks(parsed)
		}).catch(err => {
			Alert.alert(
				lang[appLanguage].oops,
				lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
				[{text: 'OK'}],
			)
		});
	}

	useEffect(()=>{

		setRenders(renders => renders + 1)

		let isMounted = true;

		const subscriber = auth().onAuthStateChanged(usr =>{
			if(!loginUser && isMounted) setLoginUser(usr) // get current login user {UID && NUMBER ONLY!!!} from the AUTH list
		});

		if(loginUser && shimmerAnimated){ // we gotta fetch user

			if(renders == 1){ // initial launch
				readProfile().then(profile => {
					if(profile){
						isMounted && setNeedUser(false)
						isMounted && setUser(profile)
						isMounted && setLoading(false)
					}else{
						fetchCurrentUser()
					}
				}).catch(err => {
					Alert.alert(
						lang[appLanguage].oops,
						lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
						[{text: 'OK'}],
					)
				})
			}else{
				fetchCurrentUser()
			}
		}

		if(loginUser && !bookmarks){ // we gotta fetch bookmarks
			readBookmarks().then(bkm=>{
				if(renders == 1){ // initial launch
					if(bkm){
						isMounted && setBookmarks(bkm)
					}else{
						fetchCurrentBookmarks()
					}
				}else{
					fetchCurrentBookmarks()
				}
			}).catch(err => {
				Alert.alert(
					lang[appLanguage].oops,
					lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
					[{text: 'OK'}],
				)
			})
		}

		if(loginUser && renders >= 1 && shimmerAnimated){
			fetchCurrentBookmarks()
		}

		return ()=>{
			isMounted = false
			return subscriber
		} // Stop listening for updates whenever the component unmounts
	}, [loginUser, user, needUser, loading, bookmarks])


	const EditProfileScreen = ()=> navigation.navigate('EditProfile')

	const SettingsScreen = ()=> navigation.navigate('Settings')

	const editSchedule = (num)=> {
		navigation.navigate('EditSchedule', {
			day: num,
			uid: user.uid,
			schedule: user.schedule,
		})
	}

	return (
		<View style={styles.container}>
			<Notch />
			<Text style={styles.profileLabel}>{ user ? (user.isHost ? user.placeName : lang[appLanguage].client) : lang[appLanguage].loading }</Text>
			<ScrollView
				contentContainerStyle={styles.scrollView}
				refreshControl={
					<RefreshControl refreshing={shimmerAnimated} onRefresh={onRefresh} />
				}
			>

				{/* <Shimmer animating={shimmerAnimated}> */}
					<View style={styles.profileInfo}>
						<View style={styles.avatarWrap}>
							<Avatar source={null} radius={10} />
						</View>
						<View style={styles.infoWrap}>
							<View style={{...styles.infoTxtWrap, alignItems: 'flex-end', flexDirection: 'row', paddingBottom: 5}}>
								<Text style={user ? styles.nameTxt : {...styles.nameTxt, ...styles.shimmerText}}>
									{user ? user.fullName : lang[appLanguage].fullName}
								</Text>
							</View>
							<View style={styles.infoTxtWrap}>
								<Text style={user ? styles.numberTxt : {...styles.numberTxt, ...styles.shimmerText}}>
									{user ? user.phoneNumber : lang[appLanguage].phone}
								</Text>
							</View>
						</View>
					</View>
				{/* </Shimmer> */}
				{/* <Shimmer animating={shimmerAnimated}> */}
					<View style={styles.profileActions}>
						<View style={styles.actionCols1}>
							<TouchableOpacity
								disabled={loading&&needUser}
								style={styles.actionBtnEdit}
								onPress={EditProfileScreen}
							>
								<>
								<Feather name='edit' size={20} style={styles.editIcon}/>
								<Text style={{color: Colors.profileSolid}}>{ lang[appLanguage].editProfile}</Text>
								</>
							</TouchableOpacity>
						</View>
						<View style={styles.actionCols2}>
							<TouchableOpacity
								onPress={SettingsScreen}
								disabled={loading&&needUser}
								style={styles.actionBtnSettings}
							>
								<Feather name='settings' size={20} style={{paddingTop: 2, color: Colors.profileSolid}}/>
							</TouchableOpacity>
						</View>
					</View>
				{/* </Shimmer> */}

				<View style={styles.hr} />

				<Text style={styles.dividerTxt}>{user && ( user.isHost ? lang[appLanguage].schedule : lang[appLanguage].bookmarks)}</Text>

				{(user && user.isHost === false) && (!bookmarks ? (
					<View style={styles.svgConteiner}>
						<Loading width='70%' height='50%'/>
						<Text style={styles.bmSubTitle}>{ lang[appLanguage].loading }</Text>
					</View>
				) : (bookmarks.length === 0) ? (
					<View style={styles.svgConteiner}>
						<Void width='70%' height='50%'/>
						<Text style={styles.bmSubTitle}>{ lang[appLanguage].noBookmark }</Text>
					</View>
				) : bookmarks.map(bm=>( // bm.id; bm._data.hostId
					<HostList
						key={bm.id}
						bookmarkId={bm.id}
						hostId={bm._data.hostId}
						navigation={navigation}
					/>
				)))}

				{(user && user.isHost === true) && (
				<View style={styles.scheduleWrap}>
					<View style={(dayIndex===1) ? {...styles.workDays, ...styles.bgShade, ...styles.activeDay} : {...styles.workDays, ...styles.bgShade}}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].monday }</Text>
						<View style={styles.hoursWrap}>
							<Text>{user.schedule.monday.start}-{user.schedule.monday.pause}</Text>
							<Text>{user.schedule.monday.resume}-{user.schedule.monday.finish}</Text>
						</View>
						<TouchableOpacity style={styles.editScheduleBtn} onPress={()=>editSchedule(1)}><Feather name='edit' size={20} style={styles.editIcon2}/></TouchableOpacity>
					</View>

					<View style={(dayIndex===2) ? {...styles.workDays, ...styles.activeDay} : styles.workDays}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].tuesday }</Text>
						<View style={styles.hoursWrap}>
							<Text>{user.schedule.tuesday.start}-{user.schedule.tuesday.pause}</Text>
							<Text>{user.schedule.tuesday.resume}-{user.schedule.tuesday.finish}</Text>
						</View>
						<TouchableOpacity style={styles.editScheduleBtn} onPress={()=>editSchedule(2)}><Feather name='edit' size={20} style={styles.editIcon2}/></TouchableOpacity>
					</View>

					<View style={(dayIndex===3) ? {...styles.workDays, ...styles.bgShade, ...styles.activeDay} : {...styles.workDays, ...styles.bgShade}}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].wednesday }</Text>
						<View style={styles.hoursWrap}>
							<Text>{user.schedule.wednesday.start}-{user.schedule.wednesday.pause}</Text>
							<Text>{user.schedule.wednesday.resume}-{user.schedule.wednesday.finish}</Text>
						</View>
						<TouchableOpacity style={styles.editScheduleBtn} onPress={()=>editSchedule(3)}><Feather name='edit' size={20} style={styles.editIcon2}/></TouchableOpacity>
					</View>

					<View style={(dayIndex===4) ? {...styles.workDays, ...styles.activeDay} : styles.workDays}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].thursday }</Text>
						<View style={styles.hoursWrap}>
							<Text>{user.schedule.thursday.start}-{user.schedule.thursday.pause}</Text>
							<Text>{user.schedule.thursday.resume}-{user.schedule.thursday.finish}</Text>
						</View>
						<TouchableOpacity style={styles.editScheduleBtn} onPress={()=>editSchedule(4)}><Feather name='edit' size={20} style={styles.editIcon2}/></TouchableOpacity>
					</View>

					<View style={(dayIndex===5) ? {...styles.workDays, ...styles.bgShade, ...styles.activeDay} : {...styles.workDays, ...styles.bgShade}}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].friday }</Text>
						<View style={styles.hoursWrap}>
							<Text>{user.schedule.friday.start}-{user.schedule.friday.pause}</Text>
							<Text>{user.schedule.friday.resume}-{user.schedule.friday.finish}</Text>
						</View>
						<TouchableOpacity style={styles.editScheduleBtn} onPress={()=>editSchedule(5)}><Feather name='edit' size={20} style={styles.editIcon2}/></TouchableOpacity>
					</View>

					<View style={(dayIndex===6) ? {...styles.workDays, ...styles.activeDay} : styles.workDays}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].saturday }</Text>
						<View style={styles.hoursWrap}>
							<Text>{user.schedule.saturday.start}-{user.schedule.saturday.pause}</Text>
							<Text>{user.schedule.saturday.resume}-{user.schedule.saturday.finish}</Text>
						</View>
						<TouchableOpacity style={styles.editScheduleBtn} onPress={()=>editSchedule(6)}><Feather name='edit' size={20} style={styles.editIcon2}/></TouchableOpacity>
					</View>

					<View style={(dayIndex===0) ? {...styles.workDays, ...styles.bgShade, ...styles.activeDay} : {...styles.workDays, ...styles.bgShade}}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].sunday }</Text>
						<View style={styles.hoursWrap}>
							<Text>{user.schedule.sunday.start}-{user.schedule.sunday.pause}</Text>
							<Text>{user.schedule.sunday.resume}-{user.schedule.sunday.finish}</Text>
						</View>
						<TouchableOpacity style={styles.editScheduleBtn} onPress={()=>editSchedule(0)}><Feather name='edit' size={20} style={styles.editIcon2}/></TouchableOpacity>
					</View>
				</View>
				)}
			</ScrollView>
		</View>
	);
}

ProfileScreen.navigationOptions = {
	headerShown: false,
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	scrollView: {
		alignItems: 'center',
	},
	profileLabel: {
		fontSize: 20,
		color: Colors.profileSolid,
		fontWeight: '300',
		paddingTop: isXOrAbove ? 30 : 20,
		paddingBottom: isSmallDevice ? 10 : 20,
		textAlign: 'center',
	},
	profileActions: {
		height: 60,
		width: isSmallDevice ? '95%' : "90%",
		justifyContent: "flex-end",
		alignItems: "center",
		flexDirection: "row",
		borderWidth: 1,
		borderColor: 'transparent',
	},
	actionCols1: {
		height: 60,
		justifyContent: 'flex-end',
		alignItems: 'center',
		flexDirection: 'row',
		paddingRight: 10,
	},
	actionCols2: {
		width: 60,
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	editIcon: {
		paddingTop: 2,
		color: Colors.profileSolid,
		paddingRight: 10,
	},
	actionBtnEdit: {
		backgroundColor: Colors.profileOpaque,
		borderRadius: 10,
		height: isSmallDevice ? 35 : 40,
		paddingRight: isSmallDevice ? 12 : 20,
		paddingLeft: isSmallDevice ? 12 : 20,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	actionBtnSettings: {
		backgroundColor: Colors.profileOpaque,
		borderRadius: 10,
		height: isSmallDevice ? 35 : 40,
		paddingRight: isSmallDevice ? 8 : 12,
		paddingLeft: isSmallDevice ? 8 : 12,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	profileInfo: {
		width: isSmallDevice ? '95%' : '90%',
		height: 100,
		flexDirection: 'row',
		borderWidth: 1,
		borderColor: 'transparent',
	},
	avatarWrap: {
		width: 100,
		height: 100,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	infoWrap: {
		height: 100,
		flex: 1,
		flexDirection: 'column',
	},
	infoTxtWrap: {
		display: 'flex',
		flex: 1,
	},
	nameTxt: {
		borderRadius: 10,
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 10,
		paddingRight: 10,
		fontSize: 16,
		fontWeight: '300',
		letterSpacing: 1.2,
	},
	numberTxt: {
		borderRadius: 10,
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 10,
		paddingRight: 10,
		fontSize: 15,
		fontWeight: '300',
	},
	shimmerText: {
		// color: '#eee',
		// backgroundColor: '#eee',
	},
	avaPlaceholder: {
		width: 80,
		height: 80,
		borderRadius: 10,
		backgroundColor: '#eee',
	},
	dividerTxt: {
		width: isSmallDevice ? '95%' : '90%',
		paddingBottom: 5,
		paddingTop: 20,
		paddingLeft: isSmallDevice ? 10 : 20,
		fontSize: 16,
		letterSpacing: 1.5,
	},
	hr: {
		width: isSmallDevice ? '95%' : '90%',
		borderTopWidth: 1,
		borderTopColor: '#eee',
	},
	svgConteiner: {
		width: '100%',
		height: 400,
		marginTop: 20,
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	bmSubTitle: {
		fontSize: 16,
		fontWeight: '200',
		color: Colors.profileSolid,
	},
	scheduleLabel: {
		width: '100%',
		paddingTop: 10,
		paddingBottom: 15,
		paddingLeft: 10,
	},
	workDays: {
		height: 40,
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	dayTitle: {
		width: 50,
		textAlign: 'center',
	},
	bgShade: {
		backgroundColor: '#eee',
	},
	activeDay: {
		borderWidth: 1,
		borderColor: Colors.profileSolid,
		backgroundColor: Colors.profileOpaque,
	},
	scheduleWrap: {
		paddingLeft: isSmallDevice ? 5 : 20,
		paddingRight: isSmallDevice ? 5 : 20,
		marginTop: isSmallDevice ? 5 : 10
	},
	hoursWrap: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		flex: 1
	},
	editScheduleBtn: {
		borderRadius: 5,
		flex: 1,
		paddingRight: 10,
		paddingLeft: 10,
		flexDirection: 'column',
		justifyContent: 'center',
	},
	editIcon2: {
		color: Colors.profileSolid,
	},
});

const lang = {
	en: {
		client 		: 'Client',
		loading 	: 'Loading',
		fullName 	: 'Full Name',
		phone 		: 'Phone',
		editProfile : 'Edit profile',
		schedule 	: 'Schedule',
		bookmarks 	: 'Bookmarks',
		noBookmark 	: 'No bookmarks to show',
		monday 		: 'Mon',
		tuesday 	: 'Tue',
		wednesday 	: 'Wed',
		thursday	: 'Thu',
		friday 		: 'Fri',
		saturday 	: 'Sat',
		sunday 		: 'Sun',
		oops		: 'Oops, something went wrong',
		noNetwork 	: 'Could not connect to internet ',
	},
	ru: {
		client 		: 'Клиент',
		loading 	: 'Загружается',
		fullName 	: 'ФИО',
		phone 		: 'Телефон',
		editProfile : 'Редактировать профиль',
		schedule 	: 'График',
		bookmarks 	: 'Закладки',
		noBookmark 	: 'Нет закладок для показа',
		monday 		: 'Пн',
		tuesday 	: 'Вт',
		wednesday 	: 'Ср',
		thursday	: 'Чт',
		friday 		: 'Пт',
		saturday 	: 'Сб',
		sunday 		: 'Вк',
		oops 		: 'Упс! Что-то пошло не так',
		noNetwork 	: 'Не удалось подключиться к интернету ',
	},
	uz: {
		client 		: 'Mijoz',
		loading 	: 'Yuklanmoqda',
		fullName 	: 'To\'liq ism',
		phone 		: 'Telefon',
		editProfile : 'Profilni tahrirlash',
		schedule 	: 'Ish vaqti',
		bookmarks 	: 'Saqlanganlar',
		noBookmark 	: 'Hech narsa yo\'q',
		monday 		: 'Du',
		tuesday 	: 'Se',
		wednesday 	: 'Ch',
		thursday	: 'Pa',
		friday 		: 'Ju',
		saturday 	: 'Sh',
		sunday 		: 'Ya',
		oops 		: 'Xatolik yuz berdi',
		noNetwork 	: 'Internetga ulanib bo\'lmadi ',
	}
}