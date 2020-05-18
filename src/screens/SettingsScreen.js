import React, {
	useState,
	useEffect,
	useContext,
} from 'react'
import {
	View,
	Text,
	ActivityIndicator,
	StyleSheet,
	ScrollView,
	Switch,
	Picker,
	Alert,
	Platform,
} from 'react-native'
import firestore from '@react-native-firebase/firestore'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import {
	TouchableHighlight,
	TouchableOpacity,
} from 'react-native-gesture-handler'
import {
	readProfile,
	writeProfile,
	readLang,
	writeLang,
	readGpsSetting,
	writeGpsSetting,
} from '../helpers/db'
import {
	logOut,
} from '../helpers/auth'
import LangEnums from '../constants/LangEnums'
import {
	isSmallDevice,
} from '../constants/Layout'
import Colors from '../constants/Colors'
import {
	MainContext,
} from '../contexts/MainContext'


SimpleLineIcons.loadFont()
FontAwesome.loadFont()
Feather.loadFont()

const SettingsScreen = ({ navigation }) => {

	const isIos =  Platform.OS === 'ios'

	const usersCollection = firestore().collection('users')

	const context = useContext(MainContext)
	const { appLanguage } = context

	SettingsScreen.navigationOptions = {
		title: lang[appLanguage].title
	};

	const [user, setUser] = useState(null)

	const [language, setLanguage] = useState(appLanguage)

	const [langTemp, setLangTemp] = useState(appLanguage)

	const [langForm, setLangForm] = useState(false)

	const gpsPref = user ? (!Object.keys(user).includes('trackable') ? false : (user.trackable === null ? false : user.trackable)) : false;

	const [gps, setGps] = useState(null);

	const [gpsLoading, setGpsLoading] = useState(false)

	const toggleGps = () => {
		setGpsLoading(true)

		usersCollection.where('uid', '==', user.uid).get().then(res => {
			// can be undefined
			if(res && res._docs && res._docs[0] && res._docs[0]._data){
				const userId = res._docs[0].id
				firestore()
				.doc('users/'+userId)
				.set({
					trackable: !gps,
				}, { merge: true }).then(()=>{
					setGpsLoading(false)
					setGps(gps => !gps)
					writeProfile({...user, trackable: !gps})
					writeGpsSetting(!gps)
				}).catch(err=>{
					setGpsLoading(false)
					Alert.alert(
						lang[appLanguage].oops,
						lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
						[{text: 'OK'}],
					)
				})
			}else{
				// something is undefined
				setGpsLoading(false)
				Alert.alert(
					lang[appLanguage].oops,
					lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
					[{text: 'OK'}],
				)
			}
		}).catch(err => {
			setGpsLoading(false)
			Alert.alert(
				lang[appLanguage].oops,
				lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
				[{text: 'OK'}],
			)
		});
	}

	useEffect(()=>{

		let isMounted = true

		readProfile().then(prof=>{
			if(isMounted){
				(!user && prof !== null) && setUser(prof)
			}
		})

		readLang().then(lang=>{
			if(isMounted){
				!language && setLanguage(lang)
				!langTemp && setLangTemp(lang)
			}
		})

		readGpsSetting().then(result=>{
			if(isMounted){
				(gps === null && result !== null) && setGps(result)
				(gps === null && result === null) && setGps(gpsPref)
			}
		})


		return ()=>{
			isMounted = false
		}
	})

	const SetLang = (code)=>{
		// write code to local db
		writeLang(code)
		// set main language state
		setLanguage(code)
		// set context provider state
		context.setAppLanguage(code)
		// close lang form if ios
		isIos && setLangForm(false)
	}

	const Language = ()=>{
		isIos && setLangForm(true)
	}

	const CloseLang = ()=>{
		isIos && setLangForm(false)
	}

	const Contact = ()=>{
		navigation.navigate('Contact')
	}

	const AboutUs = ()=>{
		navigation.navigate('About')
	}

	const LogOut = ()=>{
		Alert.alert(
			lang[appLanguage].logout,
			'',
			[
				{text: lang[appLanguage].yes, style: 'destructive', onPress: ()=>{
					logOut()
					setTimeout(()=>{
						if(!context.isNewUser) context.toggleNewUser()
						if(context.isLoggedIn) context.toggleLogin()
					}, 500)
				}},
				{text: lang[appLanguage].no, style: 'cancel', onPress: ()=>{}}
			],
			{ cancelable: false }
		)
	}

	return (
		<View style={styles.bg}>
			<ScrollView>
				<ActivityIndicator size='small' style={{...styles.loader, display: !user ? 'flex': 'none'}} />

				{/* ===========================GENERAL=============================================== */}

				<Text style={styles.dividerTxt}>
					{ lang[appLanguage].general }
				</Text>

				<TouchableHighlight
					onPress={isIos && Language}
					disabled={isIos ? !language : true}
					underlayColor='#ccc'
				>
					<View style={{...styles.settingRow}}>
						<View style={styles.iconWrap}>
							<FontAwesome
								name='language'
								size={25}
								color={Colors.profileSolid}
							/>
						</View>
						<View style={styles.labelWrap}>
							<Text style={styles.labelTxt}>{ lang[appLanguage].language }</Text>
						</View>
						<View style={{...styles.actionWrap, width: 150}}>
							{language && (
								isIos ? (
									<Text style={{width: '100%', textAlign: 'right', marginRight: 10, fontSize: 16}}>{LangEnums.filter(lan => lan.Code === language)[0].DisplayName}</Text>
								) : (
									<Picker
										style={{width: 150, height: 60}}
										selectedValue={language}
										style={{ height: 60, width: 150 }}
										onValueChange={(itemValue, itemIndex) => SetLang(itemValue)}
									>
										{LangEnums.map(lang=>(
											<Picker.Item label={lang.DisplayName} value={lang.Code} key={lang.Code} />
										))}
									</Picker>
								)
							)}
						</View>
					</View>
				</TouchableHighlight>


				{/* ===========================Privacy=&=Security============================================= */}

				{ (user && Object.keys(user).includes('isHost') && user.isHost === false) && (
					<>
					<Text style={styles.dividerTxt}>
						{ lang[appLanguage].privacy }
					</Text>

					<TouchableHighlight
						onPress={()=>{ toggleGps() }}
						disabled={gpsLoading}
						underlayColor='#ccc'
					>
						<View style={styles.settingRow}>
							<View style={styles.iconWrap}>
								<SimpleLineIcons
									name='location-pin'
									size={25}
									color={Colors.profileSolid}
								/>
							</View>
							<View style={styles.labelWrap}>
								<Text style={styles.labelTxt}>{ lang[appLanguage].geolocation }</Text>
							</View>
							<View style={styles.actionWrap}>
								{(gpsLoading) ? (
									<ActivityIndicator size='small' color={Colors.profileSolid} />
								) : (
									<Switch
										trackColor={{ false: 'rgb(233,233,235)', true: Colors.profileSolid }}
										thumbColor={gps ? "#fff" : "#fff"}
										ios_backgroundColor='rgb(233,233,235)'
										onValueChange={toggleGps}
										value={gps}
									/>
								)}
							</View>
						</View>
					</TouchableHighlight>
					</>
				)}

				{/* ===========================MORE=============================================== */}

				<Text style={styles.dividerTxt}>
					{ lang[appLanguage].more }
				</Text>

				<TouchableHighlight
					onPress={Contact}
					underlayColor='#ccc'
				>
					<View style={{...styles.settingRow, borderBottomColor: 'rgb(233,233,235)', borderBottomWidth: 1}}>
						<View style={styles.iconWrap}>
							<SimpleLineIcons
								name='phone'
								size={25}
								color={Colors.profileSolid}
							/>
						</View>
						<View style={styles.labelWrap}>
							<Text style={styles.labelTxt}>{ lang[appLanguage].contactUs }</Text>
						</View>
					</View>
				</TouchableHighlight>

				<TouchableHighlight
					onPress={AboutUs}
					underlayColor='#ccc'
				>
					<View style={styles.settingRow}>
						<View style={styles.iconWrap}>
							<SimpleLineIcons
								name='info'
								size={25}
								color={Colors.profileSolid}
							/>
						</View>
						<View style={styles.labelWrap}>
							<Text style={styles.labelTxt}>{ lang[appLanguage].aboutUs }</Text>
						</View>
					</View>
				</TouchableHighlight>


				<TouchableHighlight
					onPress={LogOut}
					// disabled={!user}
					underlayColor='#ccc'
				>
					<View style={styles.settingRow}>
						<View style={styles.iconWrap}>
							<Feather
								name='log-out'
								size={25}
								color='#f00'
							/>
						</View>
						<View style={styles.labelWrap}>
							<Text style={{...styles.labelTxt, color: '#f00'}}>{ lang[appLanguage].logOut }</Text>
						</View>
					</View>
				</TouchableHighlight>

				<View style={styles.footer}>
					<Text style={{color:'#999'}}>
						Copyright - {new Date().getFullYear()}. The Moment
					</Text>
				</View>

			</ScrollView>
			{langForm && (
				<View style={styles.langSelect}>
					<View style={styles.actionSelect}>
						<TouchableOpacity
							onPress={CloseLang}
							style={styles.langCancel}
						>
							<Text style={{color: Colors.profileSolid}}>{ lang[appLanguage].cancel }</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={()=>{ SetLang(langTemp) }}
							style={styles.langDone}
						>
							<Text style={{color: '#fff'}}>{ lang[appLanguage].done }</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.wrapSelect}>
						<Picker
							selectedValue={langTemp}
							style={styles.iosPicker}
							onValueChange={(itemValue, itemIndex) => setLangTemp(itemValue)}
						>
							{LangEnums.map(lang=>(
								<Picker.Item label={lang.DisplayName} value={lang.Code} key={lang.Code} />
							))}
						</Picker>
					</View>
				</View>
			)}
		</View>
	)
}

const lang = {
	en: {
		title		: 'Settings',
		general 	: 'Genereal',
		privacy 	: 'Privacy & security',
		more 		: 'More',
		language 	: 'Language',
		geolocation : 'Share my location',
		contactUs 	: 'Contact us',
		aboutUs 	: 'About us',
		logOut 		: 'Log out',
		cancel 		: 'Cancel',
		done 		: 'Done',
		oops 		: 'Oops, something went wrong',
		noNetwork 	: 'Could not connect to internet ',
		logout		: 'Do you really want to log out? 😢',
		yes 		: 'Yes',
		no 			: 'No',
	},
	ru: {
		title		: 'Настройки',
		general 	: 'Общее',
		privacy 	: 'Конфиденциальность и безопасность',
		more 		: 'Больше',
		language 	: 'Язик',
		geolocation : 'Геолокации',
		contactUs 	: 'Связаться с нами',
		aboutUs 	: 'О нас',
		logOut 		: 'Выйти',
		cancel 		: 'Отмена',
		done 		: 'Выполнено',
		oops 		: 'Упс! Что-то пошло не так',
		noNetwork 	: 'Не удалось подключиться к интернету ',
		logout		: 'Вы действительно хотите выйти? 😢',
		yes 		: 'Да',
		no 			: 'Нет',
	},
	uz: {
		title		: 'Sozlamalar',
		general 	: 'Umumiy',
		privacy 	: 'Maxfiylik va xavfsizlik',
		more 		: 'Ko\'proq',
		language 	: 'Til',
		geolocation : 'Geolokatsiya',
		contactUs 	: 'Biz bilan bog\'lanish',
		aboutUs 	: 'Biz haqimizda',
		logOut 		: 'Chiqish',
		cancel 		: 'Bekor qilish',
		done 		: 'Bajarildi',
		oops 		: 'Xatolik yuz berdi',
		noNetwork 	: 'Internetga ulanib bo\'lmadi ',
		logout		: 'Chindan ham chiqishni xohlaysizmi? 😢',
		yes 		: 'Ha',
		no 			: 'Yo\'q',
	}
}

export default SettingsScreen

const styles = StyleSheet.create({
	langSelect: {
		width: '100%',
		height: 250,
		position: 'absolute',
		bottom: 0,
		flexDirection: 'column',
		backgroundColor: '#fff',
		borderTopColor: 'rgb(242,242,247)',
		borderTopWidth: 1,
	},
	actionSelect: {
		height: 50,
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
	langDone: {
		height: 30,
		paddingLeft: 20,
		paddingRight: 20,
		marginRight: 15,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
		backgroundColor: Colors.profileSolid,
	},
	langCancel: {
		height: 30,
		paddingLeft: 20,
		paddingRight: 20,
		marginRight: 15,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
	},
	wrapSelect: {
		height: 200,
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	iosPicker: {
		height: 200,
		width: '90%',
	},
	bg: {
		flex: 1,
		backgroundColor: 'rgb(242,242,247)',
	},
	loader: {
		paddingTop: 10,
		paddingBottom: 10,
	},
	dividerTxt: {
		paddingBottom: 15,
		paddingTop: 15,
		width: '100%',
		fontSize: 16,
		textAlign: 'left',
		paddingLeft: 20,
	},
	settingRow: {
		width: '100%',
		height: 60,
		backgroundColor: '#fff',
		flexDirection: 'row',
		paddingRight: isSmallDevice ? 5 : 20,
		paddingLeft: isSmallDevice ? 5 : 20,
		borderBottomColor: 'rgb(233,233,235)',
		borderBottomWidth: 1,
	},
	iconWrap: {
		height: 60,
		width: 60,
		justifyContent: "center",
		alignItems: 'center',
	},
	labelWrap: {
		flex: 1,
		height: 60,
		justifyContent: "center",
		alignItems: 'flex-start',
		flexDirection: 'column'
	},
	actionWrap: {
		height: 60,
		width: 60,
		justifyContent: "center",
		alignItems: 'center',
	},
	labelTxt: {
		fontSize: 16,
	},
	footer: {
		width: '100%',
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
	}
})