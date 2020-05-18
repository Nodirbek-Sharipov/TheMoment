import React, {
	useState,
	useEffect,
	useContext,
	useCallback,
} from 'react'
import {
	View,
	Text,
	ActivityIndicator,
	StyleSheet,
	ScrollView,
	Alert,
	RefreshControl,
} from 'react-native'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import { TouchableOpacity, TextInput } from 'react-native-gesture-handler'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import DatePicker from 'react-native-date-picker'
import { NavigationActions } from 'react-navigation'
import Colors from '../constants/Colors'
import { MainContext } from '../contexts/MainContext'
import Avatar from '../components/Avatar'
import {
	writeBookmarks,
	readBookmarks,
} from '../helpers/db'
import DefaultSchedule from '../constants/DefaultSchedule'

const backAction = NavigationActions.back({
	key: null
})

const EditScheduleScreen = ({ navigation }) => {

	const context = useContext(MainContext)
	const { meeting } = navigation.state.params
	let {id, clientId, hostId, clientNotes, hostNotes, confirmed } = meeting


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
				'Done!',
				'',
				[{text: 'OK'}],
			)
			back()
		}).catch(err=>{
			setLoading(false)
			Alert.alert(
				'Oops, something went wrong',
				'Could not connect to internet ' + (__DEV__ ? err : ''),
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

							<Text style={styles.formLabelH1}>Choose a good time for you</Text>

							<DatePicker
								date={date}
								minimumDate={new Date()}
								minuteInterval={5}
								mode='datetime'
								locale='en_GB'
								onDateChange={setDate}
							/>

							<TextInput
								onChangeText={text => setNotes(text)}
								value={notes}
								style={styles.notesInput}
								placeholder='Additional notes'/>

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
									<Text style={styles.btnTxt}>Accept</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
		</View>
	)
}

EditScheduleScreen.navigationOptions = {
	title: 'Edit schedule'
};

export default EditScheduleScreen

const styles = StyleSheet.create({
	bg: {
		flex: 1,
		backgroundColor: '#fff',
		paddingRight: 20,
		paddingLeft: 20,
		paddingTop: 20,
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
		justifyContent: 'center',
		alignItems: 'center',
	},
	formScroller: {
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	formLabelH1: {
		fontSize: 20,
		marginBottom: 40,
		marginTop: 20,
		fontWeight: '300',
		color: Colors.profileSolid,
	},
	notesInput: {
		width: 250,
		borderRadius: 10,
		paddingBottom: 15,
		paddingTop: 15,
		paddingRight: 25,
		paddingLeft: 25,
		marginTop: 40,
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
