import React, {
	useContext,
} from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Linking,
} from 'react-native'
import {
	MainContext,
} from '../../contexts/MainContext'
import Entypo from 'react-native-vector-icons/Entypo'
import Feather from 'react-native-vector-icons/Feather'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import {
	TouchableOpacity
} from 'react-native-gesture-handler'

Entypo.loadFont()
Feather.loadFont()
Ionicons.loadFont()
MaterialCommunityIcons.loadFont()
AntDesign.loadFont()

const ContactScreen = ({ navigation }) => {

	const { appLanguage } = useContext(MainContext)

	ContactScreen.navigationOptions = {
		title: lang[appLanguage].title
	};

	const email = async ()=>{
		await Linking.openURL('mailto:mail@nodir.dev');
	}

	const web = async ()=>{
		await Linking.openURL('https://nodir.dev');
	}

	const tg = async ()=>{
		await Linking.openURL('https://t.me/wiuterian_n');
	}

	const github = async ()=>{
		await Linking.openURL('https://github.com/Nodirbek-Sharipov')
	}



	return (
		<View style={styles.bg}>
			<ScrollView>
				<Text style={styles.iam}>{ lang[appLanguage].anyQuestions }</Text>
				<Text style={styles.iam2}>{ lang[appLanguage].donotHesitate }</Text>

				<TouchableOpacity onPress={email}>
					<View style={styles.listItem}>
						<Feather style={styles.icon} name='mail' />
						<Text style={styles.txt}>mail@nodir.dev</Text>
					</View>
				</TouchableOpacity>


				<TouchableOpacity onPress={web}>
					<View style={styles.listItem}>
						<Ionicons style={styles.icon} name='ios-globe' />
						<Text style={styles.txt}>www.nodir.dev</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity onPress={tg}>
					<View style={styles.listItem}>
						<MaterialCommunityIcons style={styles.icon} name='telegram' />
						<Text style={styles.txt}>@wiuterian_n</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity onPress={github}>
					<View style={styles.listItem}>
						<AntDesign style={styles.icon} name='github' />
						<Text style={styles.txt}>Nodirbek-Sharipov</Text>
					</View>
				</TouchableOpacity>


			</ScrollView>
		</View>
	)
}

export default ContactScreen

const styles = StyleSheet.create({
	bg: {
		flex: 1,
		backgroundColor: 'rgb(242,242,247)',
	},
	iam: {
		color: '#999',
		fontSize: 40,
		fontWeight: '900',
		letterSpacing: 0.3,
		paddingTop: 50,
		paddingBottom: 20,
		textAlign: 'center',
	},
	iam2: {
		fontSize: 40,
		fontWeight: '100',
		letterSpacing: 2,
		paddingBottom: 50,
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
		fontSize: 20,
	},
	txt: {
		fontSize: 16,
		fontWeight: '300',
	},
})

const lang = {
	en: {
		title			: 'Contact us',
		anyQuestions	: 'Any questions?',
		donotHesitate	: 'Do not hesitate',
	},
	ru: {
		title			: 'Связаться с нами',
		anyQuestions	: 'Есть вопросы?',
		donotHesitate	: 'Не стесняйтесь',
	},
	uz: {
		title			: 'Biz bilan bog\'lanish',
		anyQuestions	: 'Savollar bormi?',
		donotHesitate	: 'tortinmang',
	}
}