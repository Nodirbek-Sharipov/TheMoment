import React, {
	useEffect,
	useState,
	useContext,
	useCallback,
} from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	View,
	RefreshControl,
	FlatList,
	Alert,
} from 'react-native'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
// import Shimmer from 'react-native-shimmer'
import {
	readFeed,
	writeFeed,
	readProfile,
} from '../helpers/db'
import {
	MainContext,
} from '../contexts/MainContext'
import Notch from '../components/Notch'
import {
	TextInput,
} from 'react-native-gesture-handler';
import Colors from '../constants/Colors'
import FeedItem from '../components/FeedItem'
import ClientList from '../components/ClientList'
import {
	isXOrAbove, isSmallDevice,
} from '../constants/Layout'
// SVGs
import Empty from '../assets/empty'
import Loading from '../assets/loading'

Array.prototype.searchObjects = function(search){
	return this.filter(obj => obj.fullName.toLowerCase().includes(search.toLowerCase()) || obj.placeName.toLowerCase().includes(search.toLowerCase()))
}

const HomeScreen = ({ navigation })=>{

	const meetingsCollection 		= firestore().collection('meetings')
	const usersCollection 			= firestore().collection('users')
	const { appLanguage } 			= useContext(MainContext)

	const [profile, setProfile] 	= useState(null)
	const [loginUser, setLoginUser] = useState(null)
	const [feed, setFeed] 			= useState(null)
	const [search, setSearch] 		= useState('')
	const [loading, setLoading] 	= useState(false)
	const [meetings, setMeetings] 	= useState(null)
	const [renders, setRenders]		= useState(0)

	const loadFeed = () => {
		setLoading(true)
		usersCollection
		.where('isHost', '==', true)
		.get()
		.then(res => {
			const parsed = res.docs.map(doc => ({id: doc.id, ...doc.data()}))
			writeFeed(parsed)
			setFeed(parsed)
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

	const onRefresh = useCallback(loadFeed, [loading, feed, profile])

	const onType = (txt)=>{
		setSearch(txt)
	}
	// client code


	const loadMeetings = ()=>{
		setLoading(true)
		meetingsCollection
		.where('hostId', '==', loginUser.uid)
		.where('confirmed', '==', false)
		.get()
		.then(res=>{
			const parsed = res.docs.map(doc => ({id: doc.id, ...doc.data()}))
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

	const refreshClients = useCallback(loadMeetings, [loading, meetings, profile])


	useEffect(()=>{

		let isMounted = true
		setRenders(renders => renders + 1)

		const subscriber = auth().onAuthStateChanged(usr =>{
			if(!loginUser && isMounted) setLoginUser(usr)
		})

		if(!profile && renders <= 2){
			readProfile().then(p=>{
				if(p && isMounted){
					setProfile(p)
				}
				if(!p && loginUser){
					usersCollection
					.where('uid', '==', loginUser.uid)
					.get()
					.then(res=>{
						const parsed = res.docs.map(x => ({id: x.id, ...x.data()}))[0]
						isMounted && setProfile(parsed)
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

		if(profile && renders <= 2){
			if(profile.isHost === false){
				// client code
				if(feed === null){ // initial render
					readFeed().then(fd => {
						if(isMounted){
							if(!fd){
								loadFeed()
							}else{
								setFeed(fd)
							}
						}
					})
				}
			}
			if(profile.isHost === true){
				// host code
				loadMeetings()
			}
		}

		if(profile && profile.isHost === false && loading){
			loadFeed()
		}

		if(loading && loginUser){
			loadMeetings()
		}

		console.log(profile)

		return () => {
			isMounted = false
			subscriber()
		}
	}, [profile, loginUser, feed, search, loading, meetings]) // , [feed, search, loading]

	return (
		<View style={styles.container}>
			<Notch />
			{(profile && profile.isHost === false) && (
				<View style={styles.searchWrap}>
					<TextInput
						placeholder={lang[appLanguage].search}
						style={styles.searchBar}
						value={search}
						onChangeText={text => onType(text)}
					/>
				</View>
			)}
			{(profile && profile.isHost === true) && (
				<Text style={styles.timelineTxt}>{ lang[appLanguage].serviceRequests }</Text>
			)}
			<ScrollView
				contentContainerStyle={profile && ((profile.isHost === false) ? ((!feed || feed.searchObjects(search).length === 0) && {flex: 1}) : ((!meetings || meetings.length === 0) && {flex: 1}))}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={()=>{
							if(profile){
								if(profile.isHost === false){
									onRefresh()
								}
								if(profile.isHost === true){
									refreshClients()
								}
							}
						}}
					/>
				}
			>


			{/* =============================================================== */}
			{/* ===================== CLIENT COMPONENTS ======================= */}
			{/* =============================================================== */}

			{(profile && profile.isHost === false) && (feed === null ? (
				<View style={styles.svgEmpty}>
					<Loading width='70%' height='50%'/>
					{/* <Shimmer> */}
						<Text style={styles.emptyTxt}>{ lang[appLanguage].loading }</Text>
					{/* </Shimmer> */}
				</View>
			) : (feed.searchObjects(search).length === 0) ? (
				<View style={styles.svgEmpty}>
					<Empty width='70%' height='50%'/>
					<Text style={styles.emptyTxt}>{ lang[appLanguage].nothingHere }</Text>
				</View>
			) : (
				<FlatList
					contentContainerStyle={styles.flatList}
					data={ feed.searchObjects(search) }
					renderItem={({item}) => (
						<FeedItem host={item} navigation={navigation} />
					)}
					keyExtractor={(item) => item.id}
				/>
			))}

			{/* =============================================================== */}
			{/* ===================== HOST COMPONENTS ========================= */}
			{/* =============================================================== */}

			{(profile && profile.isHost === true) && (meetings === null ? (
				<View style={styles.svgEmpty}>
					<Loading width='70%' height='50%'/>
					{/* <Shimmer> */}
						<Text style={styles.emptyTxt}>{ lang[appLanguage].loading }</Text>
					{/* </Shimmer> */}
				</View>
			) : (meetings.length === 0) ? (
				<View style={styles.svgEmpty}>
					<Empty width='70%' height='50%'/>
					<Text style={styles.emptyTxt}>{ lang[appLanguage].nothingHere }</Text>
				</View>
			) : (
				<FlatList
					contentContainerStyle={styles.flatList}
					data={ meetings }
					renderItem={({item}) => (
						<ClientList meeting={item} navigation={navigation} />
					)}
					keyExtractor={(item) => item.id}
				/>
			))}

			</ScrollView>
		</View>
	)
}

HomeScreen.navigationOptions = {
	headerShown: false,
};

export default HomeScreen

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	searchWrap: {
		width: '100%',
		height: isSmallDevice ? 60 : 80,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingLeft: isSmallDevice ? 15 : 30,
		paddingRight: isSmallDevice ? 15 : 30,
	},
	searchBar: {
		fontSize: isSmallDevice ? 16 : 18,
		flex: 1,
		paddingTop: isSmallDevice ? 10 : 15,
		paddingBottom: isSmallDevice ? 10 : 15,
		paddingLeft: 20,
		paddingRight: 20,
		borderRadius: 10,
		backgroundColor: '#fff',
		letterSpacing: 1.5,

		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
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

});

const lang = {
	en: {
		search 			: 'Search...',
		serviceRequests : 'Service requests',
		loading			: 'Loading',
		nothingHere 	: 'Nothing here',
		done 			: 'Done!',
		oops 			: 'Oops, something went wrong',
		noNetwork 		: 'Could not connect to internet ',
	},
	ru: {
		search 			: 'Поиск...',
		serviceRequests : 'Запросы на обслуживание',
		loading			: 'Загружается',
		nothingHere 	: 'Здесь ничего нет',
		done 			: 'Выполнено!',
		oops 			: 'Упс! Что-то пошло не так',
		noNetwork 		: 'Не удалось подключиться к интернету ',
	},
	uz: {
		search 			: 'Qidiruv...',
		serviceRequests : 'Xizmat so\'rovlari',
		loading			: 'Yuklanmoqda',
		nothingHere 	: 'Hech narsa yo\'q',
		done 			: 'Bajarildi!',
		oops 			: 'Xatolik yuz berdi',
		noNetwork 		: 'Internetga ulanib bo\'lmadi ',
	}
}