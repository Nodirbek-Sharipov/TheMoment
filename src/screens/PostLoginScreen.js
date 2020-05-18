import React, {
	useState,
	useEffect,
	useContext,
} from 'react'
import {
	StyleSheet,
	View,
	Text,
	Alert,
	TextInput,
	ScrollView,
	ActivityIndicator,
} from 'react-native'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Notch from '../components/Notch'
import LoadingScreen from './LoadingScreen'
import {
	SetUid,
	RemoveUid,
} from '../helpers/auth'
import {
	writeProfile,
} from '../helpers/db'
import {
	TouchableHighlight,
} from 'react-native-gesture-handler'
import Colors from '../constants/Colors'
import Barber from '../assets/barber'
import {
	MainContext,
} from '../contexts/MainContext'
import {
	isSmallDevice,
} from '../constants/Layout'
import DefaultSchedule from '../constants/DefaultSchedule'

MaterialCommunityIcons.loadFont()

const PostLoginScreen = ({ navigation })=>{

	const usersCollection = firestore().collection('users')

	const state = useContext(MainContext)
	const { appLanguage } = state

	const [loading, setLoading] 		= useState(true)
	const [loginUser, setLoginUser] 	= useState(null)
	const [user, setUser] 				= useState(null)
	const [isHost, setIsHost]			= useState(null)
	const [fullName, setName]			= useState('')
	const [barbershop, setBarbershop] 	= useState('')

	const [miniLoading, setMiniLoading] = useState(false)
	const [step, setSteps]				= useState(1) // 1-Client/Barber; 2-Name; 3-Barbershop name
	const [attempts, setAttempts]		= useState(1)

	const SET_STATE = ()=>{
		SetUid(loginUser.uid)
		writeProfile(user)
		setTimeout(()=>{
			if(state.isLoggedIn !== true) state.toggleLogin()
			if(state.isNewUser === true) state.toggleNewUser()
		}, 500)
	}

	const back = ()=>{
		if(step > 1){
			setSteps(step => step - 1)
			setMiniLoading(false)
		}
	}

	const nextStep = ()=>{

		if(step === 1) setSteps(2) // barber or client selected, ask for name

		if(step === 2) (isHost ? setSteps(3) : submitForm()) // ask for barbershop name

		if(step === 3) submitForm()

	}

	function submitForm(){
		if(!miniLoading){
			setMiniLoading(true)
			// take user, add extra fields, create document in users collection
			const NewUser = {
				uid: loginUser.uid,
				phoneNumber: loginUser.phoneNumber,
				isHost: isHost,
				fullName: fullName.trim(),
				placeName: isHost ? barbershop.trim() : null,
				schedule: DefaultSchedule,
			}
			const { uid } = loginUser;

			setTimeout(() => {
				CreateUser(NewUser)
			}, 500);
		}
	}

	async function CreateUser(usr){
		const result = usersCollection.add(usr)
		if(result){
			// can be undefined
			SET_STATE()
			setMiniLoading(true)
			setLoading(true)
		}else{
			setMiniLoading(false)
			Alert.alert(
				lang[appLanguage].oops,
				lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
				[{text: 'OK'}],
			)
		}
	}

	const onChangeText = text => {
		if(step === 2) setName(text)
		if(step === 3) setBarbershop(text)
	}

	const retry = ()=> setAttempts(a => a + 1)

	useEffect(()=>{

		let isMounted = true

		const subscriber = auth().onAuthStateChanged(usr =>{
			if(!loginUser && isMounted) setLoginUser(usr)
		});

		if(loginUser && loginUser.uid && !user){
			usersCollection.where('uid', '==', loginUser.uid).get().then(res => {
				if(isMounted){
					// can be undefined
					if(res && res.docs && res.docs[0] && res.docs[0].data()){
						const data = {
							id: res.docs[0].id,
							...res.docs[0].data()
						}
						setUser(data)
						if(Object.keys(data).includes('isHost') && data.isHost !== null){
							// existing user
							// write UID to local db just in case
							SET_STATE() // has to redirect to home page
							setMiniLoading(true)
							setLoading(true)
						}else{
							// new user
							// remove local db tokens (could be left from previous login users)
							RemoveUid()
							setLoading(false)
						}
					}else{
						setUser({})
						setLoading(false)
					}
				}
			}).catch(err => {
				Alert.alert(
					lang[appLanguage].oops,
					lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
					[{text: 'OK', onPress: () => { retry() }}],
					{ cancelable: false }
				)

			});
		}

		return ()=>{
			isMounted = false
			return subscriber
		}
	}) // , [loginUser, user, step, miniLoading, attempts]

	return loading ? (<LoadingScreen />) : (
		<View style={styles.bg}>
			<Notch />
			<View style={styles.innerView}>

				{step === 1 && (
					<View style={styles.topRow}>
						<Text style={styles.whoAreYou}>{ lang[appLanguage].setupAccount }</Text>
						<Barber width='80%' height='60%' />
					</View>
				)}

				<View style={styles.middleRow}>
					<Text style={styles.whoAreYou}>
						{(step === 1) ? lang[appLanguage].whoAreYou : (step === 2) ? lang[appLanguage].fullName : lang[appLanguage].placeName}
					</Text>
				</View>

				<View style={styles.optionWrapper}>
					<View style={(step === 1) ? styles.choiceWrap : {...styles.choiceWrap, justifyContent: 'flex-start'}}>
					{(step === 1) ? (
						<>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={Colors.profileOpaque}
							style={(isHost !== null && isHost === true) ? {...styles.optionBtn, ...styles.activeBtn} : styles.optionBtn}
							onPress={ ()=> setIsHost(true) } >
							<>
							<MaterialCommunityIcons
								name='check-all'
								size={20}
								style={(isHost !== null && isHost === true) ? {...styles.checkIcon, color: Colors.profileSolid} : styles.checkIcon} />
							<Text style={(isHost !== null && isHost === true) ? {...styles.btnTxt, color: Colors.profileSolid} : styles.btnTxt}>{ lang[appLanguage].barber }</Text>
							</>
						</TouchableHighlight>
						<TouchableHighlight
							activeOpacity={1}
							underlayColor={Colors.profileOpaque}
							style={(isHost !== null && isHost === false) ? {...styles.optionBtn, ...styles.activeBtn} : styles.optionBtn}
							onPress={ ()=> setIsHost(false) } >
							<>
							<MaterialCommunityIcons
								name='check-all'
								size={20}
								style={(isHost !== null && isHost === false) ? {...styles.checkIcon, color: Colors.profileSolid} : styles.checkIcon} />
							<Text style={(isHost !== null && isHost === false) ? {...styles.btnTxt, color: Colors.profileSolid} : styles.btnTxt}>{ lang[appLanguage].client }</Text>
							</>
						</TouchableHighlight>
						</>
					) : (
						<>
						<ScrollView scrollEnabled={false} style={{width: '80%'}}>
							<TextInput
								editable={!miniLoading}
								returnKeyType='done'
								style={styles.textInput}
								onChangeText={text => onChangeText(text)}
								value={(step === 2) ? fullName : (step === 3) ? barbershop : ''}
							/>
						</ScrollView>

						</>
					)}

					</View>
					<View style={styles.continueWrap}>
						{(step > 1) && (
							<TouchableHighlight
								onPress={ ()=> back() }
								activeOpacity={1}
								underlayColor='#fff'
								style={styles.prevBtn} >
								<>
								<MaterialCommunityIcons
										name='arrow-left'
										size={20}
										style={styles.prevIcon}/>
								<Text style={styles.backTxt}>{ lang[appLanguage].back }</Text>
								</>
							</TouchableHighlight>
						)}

						{(isHost !== null) && (
							<TouchableHighlight
								onPress={()=> nextStep() }
								activeOpacity={1}
								underlayColor={Colors.profileOpaque}
								style={styles.continueBtn}
								disabled={(step === 2 && fullName.length <= 3) ? true : (step === 3 && barbershop.length <= 3) ? true : false}>
								{miniLoading ? (
									<>
										<ActivityIndicator size='small' color='#fff' />
									</>
								) : (
									<>
									<Text style={styles.continueTxt}>
										{(isHost === true && step === 3) ? lang[appLanguage].save : (isHost === false && step === 2)? lang[appLanguage].save : lang[appLanguage].continue }
									</Text>
									<MaterialCommunityIcons
										name={(step === 2 && isHost === false) ? 'check-all' : (step === 3 && isHost === true) ? 'check-all' : 'arrow-right'}
										size={20}
										style={styles.nextIcon}/>
									</>
								)}
							</TouchableHighlight>
						)}
					</View>
				</View>
			</View>
		</View>
	)
}

PostLoginScreen.navigationOptions = {
	headerShown: false,
}

export default PostLoginScreen

const styles = StyleSheet.create({
	bg: {
		flex: 1,
		backgroundColor: "#fff",
	},
	innerView: {
		display: "flex",
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	topRow: {
		display: 'flex',
		flex: 0.8,
		alignItems: "center",
		justifyContent: "space-around",
		width: '100%',
	},
	middleRow: {
		height: 80,
		width: '100%',
		alignItems: "center",
		justifyContent: "center",
	},
	whoAreYou: {
		fontSize: 20,
		color: Colors.profileSolid,
		letterSpacing: 1.5,
		fontWeight: '500',
	},
	optionWrapper: {
		display: 'flex',
		flex: 1.2,
		alignItems: "center",
		justifyContent: "center",
		width: '100%',
	},
	choiceWrap: {
		display: 'flex',
		flex: 1,
		alignItems: "center",
		justifyContent: "space-around",
		width: '100%',
	},
	continueWrap: {
		display: 'flex',
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-end",
		width: '100%',
		bottom: 30,
	},
	optionBtn: {
		alignSelf: 'flex-start',
		borderBottomWidth: 5,
		borderRadius: 15,
		height: isSmallDevice ? 50 : 80,
		width: isSmallDevice ? 200 : 300,
		display: 'flex',
		alignItems: "center",
		justifyContent: "center",
		flexDirection: 'row',
		borderColor: 'silver',
	},
	activeBtn: {
		borderColor: Colors.profileSolid,
		backgroundColor: Colors.profileOpaque,
	},
	checkIcon: {
		color: 'transparent',
		marginRight: 20,
		marginLeft: -40,
	},
	btnTxt: {
		fontSize: 16,
		color: 'silver',
		fontWeight: '600',
		letterSpacing: 1.5,
	},
	prevBtn: {
		display: 'flex',
		alignItems: "center",
		justifyContent: "center",
		alignSelf: 'flex-end',
		flexDirection: 'row',
		borderRadius: 10,
		height: isSmallDevice ? 50 : 60,
		width: isSmallDevice ? 250 : 300,
		backgroundColor: '#fff',
		bottom: 5,
	},
	continueBtn: {
		display: 'flex',
		alignItems: "center",
		justifyContent: "center",
		alignSelf: 'flex-end',
		flexDirection: 'row',
		borderRadius: 10,
		height: isSmallDevice ? 50 : 60,
		width: isSmallDevice ? 250 : 300,
		backgroundColor: Colors.profileSolid,
	},
	continueTxt: {
		color: '#fff',
		fontSize: 18,
		letterSpacing: 1.5,
		fontWeight: '500',
	},
	backTxt: {
		color: Colors.profileSolid,
		fontSize: 18,
		letterSpacing: 1.5,
		fontWeight: '500',
	},
	nextIcon: {
		color: '#fff',
		marginLeft: 20,
		marginRight: -40,
		paddingTop: 5,
		fontWeight: '600',
	},
	prevIcon: {
		color: Colors.profileSolid,
		marginLeft: -40,
		marginRight: 20,
		paddingTop: 5,
		fontWeight: '600',
	},
	textInput: {
		borderWidth: 2,
		borderColor: Colors.profileSolid,
		width: '99%',
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 20,
		paddingRight: 20,
		borderRadius: 10,
	},
})

const lang = {
	en: {
		setupAccount : 'Set up your account',
		whoAreYou : 'Who are you?',
		fullName : 'Your full name:',
		placeName : 'Your barbershop name',
		barber : 'Barber',
		client : 'Client',
		back : 'Back',
		save : 'Save',
		continue : 'Continue',
		oops : 'Oops, something went wrong',
		noNetwork : 'Could not connect to internet ',
	},
	ru: {
		setupAccount : 'Настройте свой аккаунт',
		whoAreYou : 'Кто ты?',
		fullName : 'Ваше полное имя:',
		placeName : 'Название парикмахерской:',
		barber : 'Парикмахер',
		client : 'Клиент',
		back : 'Назад',
		save : 'Сохранить',
		continue : 'Продолжить',
		oops : 'Упс! Что-то пошло не так',
		noNetwork : 'Не удалось подключиться к интернету ',
	},
	uz: {
		setupAccount : 'Hisob qaydnomangizni o\'rnating',
		whoAreYou : 'Kimsiz?',
		fullName : 'To\'liq ismingiz:',
		placeName : 'Sartaroshxonangiz nomi:',
		barber : 'Sartarosh',
		client : 'Mijoz',
		back : 'Orqaga',
		save : 'Saqlash',
		continue : 'Davom etish',
		oops : 'Xatolik yuz berdi',
		noNetwork : 'Internetga ulanib bo\'lmadi ',
	},
}