import React, {
	useContext,
} from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
} from 'react-native'
import {
	isSmallDevice,
} from '../../constants/Layout'
import {
	MainContext,
} from '../../contexts/MainContext'

const AboutScreen = ({ navigation }) => {

	const { appLanguage } = useContext(MainContext)

	AboutScreen.navigationOptions = {
		title: lang[appLanguage].title
	};

	return (
		<View style={styles.bg}>
			<ScrollView>
				<Text style={styles.iam}>{ lang[appLanguage].whoAmI }</Text>
				<Text style={styles.iam2}>{ lang[appLanguage].iAm }</Text>

				<View style={styles.listItem}>
					<Text style={styles.txt}>{ lang[appLanguage].nameJob }</Text>
				</View>

				<View style={styles.listItem}>
					<Text style={styles.txt}>{ lang[appLanguage].study }</Text>
				</View>

				<View style={styles.listItem}>
					<Text style={styles.txt}>{ lang[appLanguage].secure }</Text>
				</View>

				<View style={styles.listItem}>
					<Text style={styles.txt}>{ lang[appLanguage].scalable }</Text>
				</View>

				<View style={styles.listItem}>
					<Text style={styles.txt}>{ lang[appLanguage].intuitive }</Text>
				</View>
			</ScrollView>
		</View>
	)
}

export default AboutScreen

const styles = StyleSheet.create({
	bg: {
		flex: 1,
		backgroundColor: 'rgb(242,242,247)',
	},
	iam: {
		color: '#999',
		fontSize: 40,
		fontWeight: '900',
		letterSpacing: 0.6,
		paddingTop: isSmallDevice ? 20 : 50,
		paddingBottom: 20,
		textAlign: 'center',
	},
	iam2: {
		fontSize: 40,
		fontWeight: '100',
		letterSpacing: 2,
		paddingBottom: isSmallDevice ? 20 : 50,
		textAlign: 'center',
	},
	listItem: {
		width: '100%',
		paddingLeft: 30,
		height: 60,
		justifyContent: 'flex-start',
		alignItems: 'center',
		flexDirection: 'row',

	},
	icon: {
		paddingRight: 30,
		fontSize: 18,
	},
	txt: {
		fontSize: 16,
		fontWeight: '200',
	},
})

const lang = {
	en: {
		title		: 'About us',
		whoAmI		: 'Who am I ?',
		iAm			: 'I am',
		nameJob 	: 'Nodirbek Sharipov, fullstack developer',
		study		: 'a WIUT student, class 2020 graduate',
		secure		: 'a developer with focus on secure,',
		scalable	: 'fast and scalable system architectures',
		intuitive	: 'and intuitive user experiences.',
	},
	ru: {
		title		: 'О нас',
		whoAmI		: 'Кто я ?',
		iAm			: 'Я',
		nameJob 	: 'Нодирбек Шарипов, фуллстак разработчик',
		study		: 'студент (МВУТ), выпускник 2020 года',
		secure		: 'разработчик с акцентом на безопасные,',
		scalable	: 'быстрые и масштабируемые системные архитектуры',
		intuitive	: 'и интуитивный пользовательский интерфейс.',
	},
	uz: {
		title		: 'Biz haqimizda',
		whoAmI		: 'Men kimman ?',
		iAm			: 'Men',
		nameJob 	: 'Nodirbek Sharipov, fullstack dasturchiman',
		study		: 'talabaman (WIUT), bitiruvchi - 2020',
		secure		: 'asosiy fokusim havfsiz, tezkor,',
		scalable	: 'keng masshtabli tizim arxitekturasi',
		intuitive	: 'va chiroyli dizaynlar',
	},
}