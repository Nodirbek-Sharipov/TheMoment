import React, {
	useContext,
	useState,
	useCallback,
	useEffect,
} from 'react';
import {
	ScrollView,
	StyleSheet,
	View,
	Text,
	RefreshControl,
	FlatList,
} from 'react-native';
import {
	readProfile,
	writeProfile,
} from '../helpers/db'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import {
	MainContext,
} from '../contexts/MainContext';
import Notch from '../components/Notch';
import MeetingList from '../components/MeetingList';
import Colors from '../constants/Colors';
import {
	TouchableOpacity,
} from 'react-native-gesture-handler';
import {
	isSmallDevice,
	isXOrAbove,
} from '../constants/Layout'
// SVGs
import Empty from '../assets/empty'
import Loading from '../assets/loading'

Array.prototype.sortByDate = function(isHost){
	return this.filter(x => (isHost ? x.confirmed : true)).sort((a, b)=> a.date.toDate() - b.date.toDate())
}

Array.prototype.getActive = function(tab){
	return this.filter(x => (tab===1) ? x.date.toDate() > new Date() : x.date.toDate() < new Date())
}

export default function TasksScreen() {

	const meetingsCollection 		= firestore().collection('meetings')
	const usersCollection 			= firestore().collection('users')

	const { appLanguage } 			= useContext(MainContext)

	const [loginUser, setLoginUser] = useState(null)
	const [user, setUser]			= useState(null)
	const [loading, setLoading] 	= useState(true)
	const [meetings, setMeetings]	= useState(null)
	const [renders, setRenders]		= useState(0)
	const [tab, setTab]				= useState(1)

	const onRefresh = useCallback(() => {
		setLoading(true)
	}, [loading])

	useEffect(() => {
		setRenders(renders => renders + 1)
		let isMounted = true

		const subscriber = auth().onAuthStateChanged(usr =>{
			if(!loginUser && isMounted) setLoginUser(usr)
		})

		if(loading && user){
			// fetch meetings
			meetingsCollection.where(user.isHost ? 'hostId' : 'clientId', '==', loginUser.uid).get().then(res=>{
				const parsed = res.docs.map(doc => ({id: doc.id, ...doc.data()}))
				console.log(parsed)
				setMeetings(parsed)
				setLoading(false)
			}).catch(err => {
				setLoading(false)
				Alert.alert(
					lang[appLanguage].oops,
					lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
					[{text: 'OK'}],
				)
			})
		}

		const INIT = async () => {

			const profile 	= await readProfile()

			if(loginUser && loading){ // we gotta fetch user
				if(renders <= 2 && profile){ // initial launch
					isMounted && setUser(profile)
				}else{
					usersCollection.where('uid', '==', loginUser.uid).get().then(res => {
						// can be undefined
						if(isMounted){
							setUser(res._docs[0]._data)
							writeProfile(res._docs[0]._data)
						}
					}).catch(err => {
						Alert.alert(
							lang[appLanguage].oops,
							lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
							[{text: 'OK'}],
						)
					})
				}
			}

		}
		INIT()

		return () => {
			isMounted = false
			subscriber()
		}
	}, [loginUser, user, loading, meetings])

	return (
		<View style={styles.container}>
			<Notch />
			<Text style={styles.timelineTxt}>{ lang[appLanguage].yourTimeline }</Text>
			<ScrollView
				contentContainerStyle={(user && meetings) ? (meetings.sortByDate(user.isHost).getActive(tab).length) === 0 && {flex: 1} : {flex: 1}}
				refreshControl={ <RefreshControl refreshing={loading} onRefresh={onRefresh} /> }>

				{(user && meetings) ? (
					(meetings.sortByDate(user.isHost).getActive(tab).length === 0) ? (
						<View style={styles.svgEmpty}>
							<Empty width='70%' height='50%'/>
							<Text style={styles.emptyTxt}>{ lang[appLanguage].nothingHere }</Text>
						</View>
					) : (
						<FlatList
							contentContainerStyle={styles.flatList}
							data={ meetings.sortByDate(user.isHost).getActive(tab) }
							renderItem={({item}) => (
								<MeetingList meeting={item}/>
							)}
							keyExtractor={(item) => item.id}
						/>
					)
				) : (
					<View style={styles.svgEmpty}>
						<Loading width='70%' height='50%'/>
						<Text style={styles.emptyTxt}>{ lang[appLanguage].loading }</Text>
					</View>
				)}

			</ScrollView>
			<View style={styles.tabWrap}>
				<View style={styles.leftTabWrap}>
					<TouchableOpacity
						activeOpacity={1}
						onPress={()=>setTab(1)}
						style={(tab === 1) ? {...styles.leftTab, backgroundColor: Colors.profileSolid} : styles.leftTab}>
						<Text style={(tab===1) ? {color: '#fff'} : {color: Colors.profileSolid}}>{ lang[appLanguage].current }</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.rightTabWrap}>
					<TouchableOpacity
						activeOpacity={1}
						onPress={()=>setTab(2)}
						style={(tab === 2) ? {...styles.rightTab, backgroundColor: Colors.profileSolid} : styles.rightTab}>
						<Text style={(tab===2) ? {color: '#fff'} : {color: Colors.profileSolid}}>{ lang[appLanguage].past }</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

TasksScreen.navigationOptions = {
	headerShown: false,
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	svgEmpty: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyTxt: {
		fontSize: 18,
		fontWeight: '900',
		color: Colors.profileOpaque,
	},
	flatList: {
		width: '100%',
		alignItems: 'center',
	},
	timelineTxt: {
		fontSize: 20,
		color: Colors.profileSolid,
		fontWeight: '300',
		paddingTop: isXOrAbove ? 30 : 20,
		paddingBottom: 20,
		textAlign: 'center',
	},
	tabWrap: {
		width: '100%',
		height: isSmallDevice ? 50 : 60,
		flexDirection: 'row',
	},
	leftTabWrap: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
	leftTab: {
		borderWidth: 2,
		borderRightWidth: 1,
		borderColor: Colors.profileSolid,
		height: isSmallDevice ? 35 : 40,
		width: isSmallDevice ? 130 : 150,
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	rightTabWrap: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	rightTab: {
		borderWidth: 2,
		borderLeftWidth: 1,
		borderColor: Colors.profileSolid,
		height: isSmallDevice ? 35 : 40,
		width: isSmallDevice ? 130 : 150,
		borderTopRightRadius: 10,
		borderBottomRightRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	activeTab: {
		backgroundColor: Colors.profileOpaque,
	},
})

const lang = {
	en: {
		yourTimeline 	: 'Your timeline',
		current			: 'Current',
		past 			: 'Past',
		loading			: 'Loading',
		nothingHere		: 'Nothing here',
		done 			: 'Done!',
		oops 			: 'Oops, something went wrong',
		noNetwork 		: 'Could not connect to internet ',
	},
	ru: {
		yourTimeline 	: 'Ваш график',
		current			: 'Текущий',
		past 			: 'Прошлое',
		loading			: 'Загружается',
		nothingHere 	: 'Здесь ничего нет',
		done 			: 'Выполнено!',
		oops 			: 'Упс! Что-то пошло не так',
		noNetwork 		: 'Не удалось подключиться к интернету ',
	},
	uz: {
		yourTimeline 	: 'Sizning yumushlaringiz',
		current			: 'Hozirgi',
		past 			: 'O\'tmish',
		loading			: 'Yuklanmoqda',
		nothingHere		: 'Hech narsa yo\'q',
		done 			: 'Bajarildi!',
		oops 			: 'Xatolik yuz berdi',
		noNetwork 		: 'Internetga ulanib bo\'lmadi ',
	}
}
