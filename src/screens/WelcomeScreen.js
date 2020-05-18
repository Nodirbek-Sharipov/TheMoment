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
} from 'react-native'
import {
	TouchableOpacity,
} from 'react-native-gesture-handler'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
SimpleLineIcons.loadFont()
import {
	RemoveUid,
	NewUserCheck,
	SignedInCheck,
} from '../helpers/auth'
import Notch from '../components/Notch'
import Carousel from '../components/Carousel'
import WelcomeSlides from '../components/WelcomeSlides'
import Colors from '../constants/Colors'
import LoadingScreen from './LoadingScreen'
import {
	isSmallDevice,
} from '../constants/Layout'
import {
	MainContext,
} from '../contexts/MainContext'

export default function WelcomeScreen({ navigation }) {

	const NextScreen 		= ()=>{ navigation.navigate('LoginScreen') }

	const { appLanguage } 	= useContext(MainContext)

	const [done, setDone] 	= useState(false)

	useEffect(() => {
		let isMounted = true

		SignedInCheck().then(signed => {
			NewUserCheck().then(isnew => {

				if(signed && isnew) navigation.navigate('PostLoginScreen') // resume sign up process

				if(!signed){
					RemoveUid() // clear USER_KEY from local db
					isMounted && setDone(true) // stop loading screen
				}

			}).catch(err => {
				Alert.alert(
					lang[appLanguage].oops,
					'UID' + (__DEV__ ? err : ''),
					[{text: 'OK'}],
				)
			})
		}).catch(err => {
			Alert.alert(
				lang[appLanguage].oops,
				'LOGIN' + (__DEV__ ? err : ''),
				[{text: 'OK'}],
			)
		});

		return ()=>{
			isMounted = false
		}

	}, [done])

	return (!done) ? (<LoadingScreen />) : (
		<View style={styles.bg}>
			<Notch />
			<View style={styles.container}>
				<Text style={styles.headerText}>The Moment</Text>
				<Carousel
					style='card'
					isFlat={true}
					items={WelcomeSlides}
				/>
				<TouchableOpacity
					style={styles.btnStart}
					onPress={ ()=> NextScreen() }
				>
					<Text style={styles.btnTxt}>{ lang[appLanguage].start }</Text>
					<SimpleLineIcons
						name='rocket'
						size={20}
						color={Colors.profileSolid}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
}

WelcomeScreen.navigationOptions = {
	headerShown: false,
};

const styles = StyleSheet.create({
	bg: {
		flex: 1,
		backgroundColor: "#fff",
	},
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'space-around',
		padding: 10,
	},
	headerText: {
		color: '#bbb',
		fontSize: 30,
		fontWeight: '900',
	},
	btnStart: {
		width: 150,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: isSmallDevice ? 10 : 15,
		paddingBottom: isSmallDevice ? 10 : 15,
		borderRadius: 10,
		backgroundColor: Colors.profileOpaque,
	},
	btnTxt: {
		color: Colors.profileSolid,
		marginRight: 10,
		fontSize: 16,
	},
})

const lang = {
	en: {
		start : 'START',
		done : 'Done!',
		oops : 'Oops, something went wrong',
		noNetwork : 'Could not connect to internet ',
	},
	ru: {
		start : 'СТАРТ',
		done : 'Выполнено!',
		oops : 'Упс! Что-то пошло не так',
		noNetwork : 'Не удалось подключиться к интернету ',
	},
	uz: {
		start : 'BOSHLASH',
		done : 'Bajarildi!',
		oops : 'Xatolik yuz berdi',
		noNetwork : 'Internetga ulanib bo\'lmadi ',
	}
}