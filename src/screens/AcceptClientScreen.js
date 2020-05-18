import React, {
	useState,
	useContext,
} from 'react'
import {
	View,
	Text,
	ActivityIndicator,
	StyleSheet,
	ScrollView,
	Alert,
} from 'react-native'
import firestore from '@react-native-firebase/firestore'
import { TouchableOpacity, TextInput } from 'react-native-gesture-handler'
import DatePicker from 'react-native-date-picker'
import { NavigationActions } from 'react-navigation'
import Colors from '../constants/Colors'
import { MainContext } from '../contexts/MainContext'


const backAction = NavigationActions.back({
	key: null
})

const AcceptClientScreen = ({ navigation }) => {

	const { appLanguage } 	= useContext(MainContext)
	const { meeting } 		= navigation.state.params
	let {id, clientId, hostId, clientNotes, hostNotes, confirmed } = meeting

	AcceptClientScreen.navigationOptions = {
		title: lang[appLanguage].title
	};

	const [date, setDate] 		= useState(meeting.date.toDate())
	const [notes, setNotes]		= useState('')
	const [loading, setLoading]	= useState(false)

	const back = ()=>{
		navigation.dispatch(backAction);
	}

	const accept = ()=>{
		setLoading(true)
		firestore()
		.doc('meetings/'+id)
		.set({
			date: date,
			hostNotes: notes.trim(),
			confirmed: true,
		}, { merge: true }).then(()=>{
			setLoading(false)
			Alert.alert(
				lang[appLanguage].done,
				'',
				[{text: 'OK'}],
			)
			back()
		}).catch(err=>{
			setLoading(false)
			Alert.alert(
				lang[appLanguage].oops,
				lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
				[{text: 'OK'}],
			)
		})
	}

	return (
		<View style={styles.bg}>
			<View style={{...styles.actionWrap, ...styles.bookForm}}>


				<View style={styles.formWrap}>
					<View style={styles.topForm}>
						<ScrollView contentContainerStyle={styles.formScroller}>

							<View style={styles.topView}>
								<Text style={styles.formLabelH1}>{ lang[appLanguage].goodTime }</Text>
							</View>

							<View style={styles.middleView}>
								<TextInput
									onChangeText={text => setNotes(text)}
									value={notes}
									style={styles.notesInput}
									placeholder={lang[appLanguage].notes}
								/>
							</View>

							<View style={styles.bottomView}>
								<DatePicker
									date={date}
									minimumDate={new Date()}
									minuteInterval={5}
									mode='datetime'
									locale='en_GB'
									onDateChange={setDate}
								/>
							</View>

						</ScrollView>
					</View>
					<View style={styles.yesNoWrap}>
						<View style={styles.btnCols}>
							<TouchableOpacity
								disabled={loading}
								onPress={accept}
								style={styles.submitBtn}
							>
								{loading ? (
									<ActivityIndicator size='small' color={Colors.profileSolid} />
								) : (
									<Text style={styles.btnTxt}>{ lang[appLanguage].accept }</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
		</View>
	)
}

export default AcceptClientScreen

const styles = StyleSheet.create({
	bg: {
		flex: 1,
		backgroundColor: '#fff',
	},
	btnTxt: {
		color: Colors.profileSolid,
	},
	formWrap: {
		flex: 1,
		width: '100%',
	},
	topForm: {
		flex: 1,
	},
	formScroller: {
		width: '100%',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	topView: {
		width: '100%',
		height: 60,
		alignItems: 'center',
		justifyContent: 'center'
	},
	formLabelH1: {
		fontSize: 20,
		fontWeight: '300',
		color: Colors.profileSolid,
	},
	middleView: {
		width: '100%',
		height: 70,
		paddingRight: 20,
		paddingLeft: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center'
	},
	notesInput: {
		flex: 1,
		borderRadius: 10,
		paddingBottom: 15,
		paddingTop: 15,
		paddingRight: 25,
		paddingLeft: 25,
		backgroundColor: '#fff',

		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	bottomView: {
		width: '100%',
		height: 200,
		alignItems: 'center',
		justifyContent: 'center',
	},


	yesNoWrap: {
		width: '100%',
		height: 80,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnCols: {
		flex: 1,
		paddingLeft: 10,
		paddingRight: 10,
	},
	cancelBtn: {
		width: '100%',
		height: 50,
		borderRadius: 10,
		alignItems: 'center',
		backgroundColor: '#fff',
		justifyContent: 'center',
	},
	submitBtn: {
		width: '100%',
		height: 50,
		borderRadius: 10,
		backgroundColor: Colors.profileOpaque,
		alignItems: 'center',
		justifyContent: 'center',
	},
	bookForm: {
		height: '100%',
	},
	actionWrap: {
		width: '100%',
		height: 80,
		justifyContent: 'center',
		paddingLeft: 20,
		paddingRight: 20,
	},
	btnOrder: {
		width: '100%',
		height: 50,
		borderRadius: 10,
		backgroundColor: Colors.profileOpaque,
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnLabel: {
		color: Colors.profileSolid,
	},
})

const lang = {
	en: {
		title: 'Accept request',
		goodTime: 'Choose a good time for you',
		accept: 'Accept',
		notes: 'Additional notes',

		done : 'Done!',
		oops : 'Oops, something went wrong',
		noNetwork : 'Could not connect to internet ',
	},
	ru: {
		title: 'Принять запрос',
		goodTime: 'Выберите хорошее время для вас',
		accept: 'Принимать',
		notes: 'Дополнительные заметки',

		done : 'Выполнено!',
		oops : 'Упс! Что-то пошло не так',
		noNetwork : 'Не удалось подключиться к интернету ',
	},
	uz: {
		title: 'So\'rovni qabul qilish',
		goodTime: 'Siz uchun yaxshi vaqtni tanlang',
		accept: 'Qabul qilish',
		notes: 'Qo\'shimcha eslatmalar',

		done : 'Bajarildi!',
		oops : 'Xatolik yuz berdi',
		noNetwork : 'Internetga ulanib bo\'lmadi ',
	}
}