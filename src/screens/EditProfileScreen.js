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
	TextInput,
	Alert,
} from 'react-native'
import firestore from '@react-native-firebase/firestore'
import { TouchableOpacity } from 'react-native-gesture-handler'
import {
	readProfile,
	writeProfile,
} from '../helpers/db'
import Colors from '../constants/Colors'
import {
	MainContext,
} from '../contexts/MainContext'

String.prototype.toKeys = function(){
	return this.split(' ').map(x => x.trim()).filter(x => x.length > 3)
}

const EditProfileScreen = ({ navigation }) => {

	const usersCollection = firestore().collection('users')

	const { appLanguage } = useContext(MainContext)

	EditProfileScreen.navigationOptions = {
		title: lang[appLanguage].title
	};

	const [user, setUser] = useState(null)

	const [loading, setLoading] = useState(false)

	useEffect(()=>{
		readProfile().then(prof=>{
			(!user && prof !== null) && setUser(prof)
		})
	})

	const SaveUser = ()=>{
		if(user.isHost){
			// validate barbershop name too > 3
			if(user.fullName.length > 3 && user.placeName.length > 3){
				// update
				setLoading(true)
				usersCollection.where('uid', '==', user.uid).get().then(res => {
					// can be undefined
					if(res && res._docs && res._docs[0] && res._docs[0]._data){
						const userId = res._docs[0].id
						firestore()
						.doc('users/'+userId)
						.set({
							fullName: user.fullName,
							placeName: user.placeName,
							keywords: [...user.fullName.toKeys(), ...user.placeName.toKeys()]
						}, { merge: true }).then(()=>{
							setLoading(false)
							writeProfile(user)
							Alert.alert(lang[appLanguage].done, '', [{text: 'OK'}])
						}).catch(err=>{
							setLoading(false)
							Alert.alert(
								lang[appLanguage].oops,
								lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
								[{text: 'OK'}],
							)
						})
					}else{
						// something is undefined
						setLoading(false)
						Alert.alert(
							lang[appLanguage].oops,
							lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
							[{text: 'OK'}],
						)
					}
				}).catch(err => {
					setLoading(false)
					Alert.alert(
						lang[appLanguage].oops,
						lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
						[{text: 'OK'}],
					)
				});
			}else{
				Alert.alert(
					lang[appLanguage].barberNameLess,
					'',
					[{text: 'Ok'}]
				)
			}
		}else{
			// validate user name > 3
			if(user.fullName.length <= 3){
				Alert.alert(
					lang[appLanguage].nameLess,
					'',
					[{text: 'Ok'}]
				)
			}else{
				setLoading(true)
				// update
				usersCollection.where('uid', '==', user.uid).get().then(res => {
					// can be undefined
					if(res && res._docs && res._docs[0] && res._docs[0]._data){
						const userId = res._docs[0].id
						firestore()
						.doc('users/'+userId)
						.set({
							fullName: user.fullName,
						}, { merge: true }).then(()=>{
							setLoading(false)
							writeProfile(user)
							Alert.alert(lang[appLanguage].done, '', [{text: 'OK'}])
						}).catch(err=>{
							setLoading(false)
							Alert.alert(
								lang[appLanguage].oops,
								lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
								[{text: 'OK'}],
							)
						})
					}else{
						// something is undefined
						setLoading(false)
						Alert.alert(
							lang[appLanguage].oops,
							lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
							[{text: 'OK'}],
						)
					}
				}).catch(err => {
					setLoading(false)
					Alert.alert(
						lang[appLanguage].oops,
						lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
						[{text: 'OK'}],
					)
				});
			}
		}
	}

	return (
		<View style={styles.bg}>
			<ScrollView
				contentContainerStyle={{flex: 1,}}
			>
				<View style={styles.formRow}>
					<Text style={styles.formLabel}>{ lang[appLanguage].fullName }</Text>
					<TextInput
						style={styles.formInput}
						editable={true}
						onChangeText={text => setUser(user=>({...user, fullName: text})) }
						value={(user && user.fullName) ? user.fullName : ''}/>
				</View>

				{(user && user.isHost) && (
					<View style={styles.formRow}>
						<Text style={styles.formLabel}>{ lang[appLanguage].placeName }</Text>
						<TextInput
							style={styles.formInput}
							editable={true}
							onChangeText={text => setUser(user=>({...user, placeName: text})) }
							value={(user && user.placeName) ? user.placeName : ''}/>
					</View>
				)}

			</ScrollView>
			<View style={styles.btnWrap}>
				<TouchableOpacity
					disabled={loading}
					style={styles.btnSave}
					onPress={SaveUser}
				>
					{loading ? (
						<ActivityIndicator size='small' color={Colors.profileSolid} />
					) : (
						<Text style={styles.btnTxt}>{ lang[appLanguage].save }</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default EditProfileScreen

const styles = StyleSheet.create({
	bg: {
		flex: 1,
	},
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
	formRow: {
		marginTop: 20,
		width: '100%',
		height: 100,
		flexDirection: 'column',
		paddingLeft: 40,
		paddingRight: 40,
	},
	formLabel: {
		fontSize: 16,
		fontWeight: '300',
		color: '#999',
		paddingTop: 10,
		paddingBottom: 10,
	},
	formInput: {
		fontSize: 16,
		backgroundColor: '#fff',
		// color: '#999',
		paddingTop: 15,
		paddingBottom: 15,
		paddingLeft: 30,
		paddingRight: 30,
		borderRadius: 10,

		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,

		marginBottom: 10,
	},
	btnWrap: {
		position: 'absolute',
		bottom: 0,
		backgroundColor: 'rgb(242,242,247)',
		width: '100%',
		height: 80,
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnSave: {
		alignItems: "center",
		justifyContent: "center",
		alignSelf: 'flex-end',
		flexDirection: 'row',
		borderRadius: 10,
		height: 50,
		width: 300,
		backgroundColor: Colors.profileOpaque,
	},
	btnTxt: {
		color: Colors.profileSolid,
	},
})

const lang = {
	en: {
		title			: 'Edit profile',
		fullName		: 'Full name',
		placeName		: 'Barbershop name',
		save			: 'Save',

		done 			: 'Done!',
		oops 			: 'Oops, something went wrong',
		noNetwork 		: 'Could not connect to internet ',
		barberNameLess 	: 'Full name and barbershop name should be more than 3 symbols',
		nameLess 		: 'Full Name should be more than 3 symbols',

	},
	ru: {
		title			: 'Редактировать профиль',
		fullName		: 'Полное имя',
		placeName		: 'Имя парикмахерской',
		save			: 'Сохранить',

		done 			: 'Выполнено!',
		oops 			: 'Упс! Что-то пошло не так',
		noNetwork 		: 'Не удалось подключиться к интернету ',
		barberNameLess 	: 'Полное имя и название парикмахерской должны быть более 3 символов',
		nameLess 		: 'Полное имя должно быть более 3 символов',
	},
	uz: {
		title			: 'Profilni tahrirlash',
		fullName		: 'To\'liq ism',
		placeName		: 'Sartaroshxonaning nomi',
		save			: 'Saqlash',

		done 			: 'Bajarildi!',
		oops 			: 'Xatolik yuz berdi',
		noNetwork 		: 'Internetga ulanib bo\'lmadi ',
		barberNameLess 	: 'To\'liq ism va sartaroshning nomi 3 belgidan ko\'p bo\'lishi kerak',
		nameLess 		: 'To\liq ism 3 belgidan ko\'p bo\'lishi kerak',
	}
}