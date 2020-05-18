import React, {
	useState,
	useEffect,
	useContext,
} from 'react'
import {
	StyleSheet,
	Text,
	Animated,
} from 'react-native'
import {
	isSmallDevice,
} from '../constants/Layout'
import Events from '../assets/events'
import Schedule from '../assets/schedule'
import Tasks from '../assets/tasks'
import {
	MainContext,
} from '../contexts/MainContext'

const fadeDuration = 500
const animationDelay = 500

const w = isSmallDevice ? '80%' : '80%'
const h = isSmallDevice ? '60%' : '60%'

export const Slide1 = () => {

	const { appLanguage } = useContext(MainContext)

	const [fadeAnim] = useState(new Animated.Value(0)) // Initial value for opacity: 0

	useEffect(() => {
		setTimeout(()=>{
			Animated.timing(
				fadeAnim,
				{
					toValue: 1,
					duration: fadeDuration,
					useNativeDriver: true,
				}
				).start();
		}, animationDelay)
	}, [])

	return (
		<Animated.View style={{...styles.card, opacity: fadeAnim}}>
			<Schedule width={w} height={h} />
			<Text style={styles.bottomText}>{ lang[appLanguage].allAboutTime }</Text>
		</Animated.View>
	)
}

export const Slide2 = ()=>{

	const { appLanguage } = useContext(MainContext)

	const [fadeAnim] = useState(new Animated.Value(0)) // Initial value for opacity: 0

	useEffect(() => {
		setTimeout(()=>{
			Animated.timing(
				fadeAnim,
				{
					toValue: 1,
					duration: fadeDuration,
					useNativeDriver: true,
				}
				).start();
		}, animationDelay)
	}, [])

	return (
		<Animated.View style={{...styles.card, opacity: fadeAnim}}>
			<Events width={w} height={h} />
			<Text style={styles.bottomText}>{ lang[appLanguage].manageReservations }</Text>
		</Animated.View>
	)
}

export const Slide3 = ()=>{

	const { appLanguage } = useContext(MainContext)

	const [fadeAnim] = useState(new Animated.Value(0)) // Initial value for opacity: 0

	useEffect(() => {
		setTimeout(()=>{
			Animated.timing(
				fadeAnim,
				{
					toValue: 1,
					duration: fadeDuration,
					useNativeDriver: true,
				}
				).start();
		}, animationDelay)
	}, [])

	return (
		<Animated.View style={{...styles.card, opacity: fadeAnim}}>
			<Tasks width={w} height={h} />
			<Text style={styles.bottomText}>{ lang[appLanguage].manageYourTime }</Text>
		</Animated.View>
	)
}

const WelcomeSlides = [<Slide1 key={1} />, <Slide2 key={2} />, <Slide3 key={3}/>]

export default WelcomeSlides;

const styles = StyleSheet.create({
	card: {
		flex: 1,
		maxWidth: '100%',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		height: isSmallDevice ? 250 : 400,
		opacity: 0,
	},
	bottomText: {
		position: 'absolute',
		bottom:0,
		fontSize: 18,
		fontWeight: '400',
		letterSpacing: 1.5,
	},
})

const lang = {
	en: {
		allAboutTime 		: 'Is is all about time',
		manageReservations 	: 'Manage Reservations',
		manageYourTime 		: 'Manage your time',

	},
	ru: {
		allAboutTime 		: 'Это все о времени',
		manageReservations 	: 'Управление бронированием',
		manageYourTime 		: 'Управляйте своим временем',
	},
	uz: {
		allAboutTime 		: 'Hammasi vaqt haqida',
		manageReservations 	: 'Bronlashni boshqaring',
		manageYourTime 		: 'Vaqtingizni boshqaring',
	}
}