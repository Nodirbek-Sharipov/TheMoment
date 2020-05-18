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
} from 'react-native'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import {
	TouchableOpacity,
	TextInput,
} from 'react-native-gesture-handler'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import DatePicker from 'react-native-date-picker'
import Colors from '../constants/Colors'
import {
	MainContext,
} from '../contexts/MainContext'
import Avatar from '../components/Avatar'
import {
	writeBookmarks,
	readBookmarks,
} from '../helpers/db'
import {
	isSmallDevice,
} from '../constants/Layout'

Array.prototype.checkBookmark = function(hostId){
	return (this.filter(bm => bm._data.hostId === hostId).length > 0)
}

const any = (bool1, bool2)=>{
	if(bool1){
		return true
	}
	if(bool2){
		return true
	}
	return false
}

const dayIndex = new Date().getDay()

const ShowHostScreen = ({ navigation }) => {

	const { appLanguage } 						= useContext(MainContext)

	ShowHostScreen.navigationOptions = {
		title: lang[appLanguage].title
	};

	const { host } 								= navigation.state.params

	const bookmarksCollection 					= firestore().collection('bookmarks')
	const usersCollection 						= firestore().collection('users')
	const meetingsCollection 					= firestore().collection('meetings')

	const [loginUser, setLoginUser] 			= useState(null)
	const [loading, setLoading] 				= useState(false)
	const [bookmarked, setBookmarked] 			= useState(null)
	const [bookmarks, setBookmarks] 			= useState(null)
	const [loadingBookmark, setLoadingBookmard] = useState(true)
	const [active, setActive] 					= useState(1)
	const [bookForm, setBookform]				= useState(false)
	const [date, setDate] 						= useState(new Date())
	const [notes, setNotes]						= useState('')
	const [loadingForm, setLoadingForm]			= useState(false)

	const [renders, setRenders] 				= useState(0)

	useEffect(()=>{
		let isMounted = true

		setRenders(renders => renders + 1)

		const subscriber = auth().onAuthStateChanged(usr =>{
			if(!loginUser && isMounted) setLoginUser(usr)
		});

		if(bookmarks && bookmarked === null){
			const addedBm = bookmarks.checkBookmark(host.uid)
			if(addedBm){
				isMounted && setBookmarked(true)
				isMounted && setLoadingBookmard(false)
			}else{
				isMounted && setBookmarked(false)
				isMounted && setLoadingBookmard(false)
			}
		}

		const INIT = async ()=>{
			if(renders === 1 && bookmarks === null){
				const bk = await readBookmarks()
				if(bk && isMounted){
					setBookmarks(bk)
				}
			}
			if(renders > 1 && bookmarks === null){
				bookmarksCollection.where('clientId', '==', loginUser.uid).get().then(res => {
					// can be undefined
					if(isMounted){
						setBookmarks(res.docs)
						writeBookmarks(res.docs)
						__DEV__ && console.log(res.docs)
					}
				}).catch(err => {
					Alert.alert(
						lang[appLanguage].oops,
						lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
						[{text: 'OK'}],
					)
				});
			}
		}
		INIT()

		return ()=>{
			isMounted = false
			subscriber()
		}
	}, [loginUser, loading, bookmarked, bookmarks, active, loadingBookmark, bookForm, date, notes, loadingForm])

	const onRefresh = useCallback(() => {
		setLoading(true)

		const INIT = async ()=>{

			setLoading(false)
		}
		INIT()


	}, [loading])



	const reWriteBookmarks = (hostId)=>{
		const newBookmarks = bookmarks.filter(bm => bm.hostId !== hostId)
		setBookmarks(newBookmarks)
		writeBookmarks(newBookmarks)
	}

	const appendBookmarks = (obj)=>{
		const newBookmarks = [...bookmarks, obj]
		setBookmarks(newBookmarks)
		writeBookmarks(newBookmarks)
	}


	const ToggleBookmark = async ()=>{
		// save current bookmark state
		const bmd = bookmarked === true ? true : false; // state copy, wont change when state changes
		// set bookmarked to null to show loading
		setTimeout(() => {
			setBookmarked(null)
			setLoadingBookmard(true)
		});
		// send bookmark request

		if(bmd === true){
			// =================================delete bm=================================
			bookmarksCollection.where('hostId', '==', host.uid).where('clientId', '==', loginUser.uid).get().then(res=>{
				if(res && res.docs && res.docs[0] && res.docs[0].data()){
					const bm_id = res.docs[0].id

					bookmarksCollection.doc(bm_id).delete().then(() => {
						// bm deleted
						setTimeout(() => {
							setBookmarked(false)
							setLoadingBookmard(false)
						});

						reWriteBookmarks(host.uid)
					}).catch(err => {
						// cant delete
						setTimeout(() => {
							setBookmarked(true)
							setLoadingBookmard(false)
						});

						Alert.alert(
							lang[appLanguage].oops,
							lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
							[{text: 'OK'}],
						)
					})

				}else{
					// error
					setTimeout(() => {
						setBookmarked(true)
						setLoadingBookmard(false)
					});

					Alert.alert(
						lang[appLanguage].oops,
						lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
						[{text: 'OK'}],
					)
				}
			}).catch(err=>{
				// cant delete
				setTimeout(() => {
					setBookmarked(true)
					setLoadingBookmard(false)
				});

				Alert.alert(
					lang[appLanguage].oops,
					lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
					[{text: 'OK'}],
				)
			})
		}else{

			// =================================create bm=================================
			bookmarksCollection.where('hostId', '==', host.uid).where('clientId', '==', loginUser.uid).get().then(res=>{
				// check if bookmark is not added already
				if(res.docs.length === 0){
					// bookmark does not exist
					bookmarksCollection.add({
						clientId: loginUser.uid,
						hostId: host.uid,
					}).then((x)=>{
						// added!
						setTimeout(() => {
							setBookmarked(true)
							setLoadingBookmard(false)
						});

						appendBookmarks({
							id: x.id,
							_data: {
								clientId: loginUser.uid,
								hostId: host.uid,
							}
						})
						// -----------------
					}).catch(err=>{
						setTimeout(() => {
							setBookmarked(false)
							setLoadingBookmard(false)
						});

						Alert.alert(
							lang[appLanguage].oops,
							lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
							[{text: 'OK'}],
						)
					})
				}else{
					// bookmark was already added
					setTimeout(() => {
						setBookmarked(true)
						setLoadingBookmard(false)
					});
				}
			}).catch(err=>{
				setTimeout(() => {
					setBookmarked(false)
					setLoadingBookmard(false)
				});

				Alert.alert(
					lang[appLanguage].oops,
					lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
					[{text: 'OK'}],
				)
			})
		}
	}

	const sendRequest = ()=>{
		// meetings
		setLoadingForm(true)
		meetingsCollection.add({
			clientId 	: loginUser.uid,
			hostId		: host.uid,
			clientNotes	: notes.trim(),
			hostNotes	: '',
			date		: date,
			confirmed	: false,
		}).then(()=>{
			// done
			setLoadingForm(false)
			setDate(new Date())
			setNotes('')
			setBookform(false)
			setLoadingForm(false)
			Alert.alert(
				lang[appLanguage].done,
				'',
				[{text: 'Ok'}]
			)
		}).catch(err => {
			// error
			setLoadingForm(false)
			Alert.alert(
				lang[appLanguage].oops,
				lang[appLanguage].noNetwork + (__DEV__ ? err : ''),
				[{text: 'OK'}],
			)
		})
	}


	return (
		<View style={styles.bg}>
			<ScrollView contentContainerStyle={styles.scroller}>
				<View style={styles.infoWrap}>
					<View style={styles.avatarWrap}>
						<Avatar source={false} radius={10}  />
					</View>
					<View style={styles.bodyWrap}>
						<Text style={styles.placeName}>{ host.placeName }</Text>
						<View style={styles.nameSaveWrap}>
							<Text style={styles.fullName}>{ host.fullName }</Text>
						</View>
					</View>
				</View>

				{(host && host.schedule) && (
				<>
					<View style={styles.mbSectionWrap}>
						<View style={styles.bmTitleWrap}>
							<Text style={styles.scheduleLabel}>{ lang[appLanguage].schedule }</Text>
						</View>
						<View style={styles.bmBtnWrap}>
							<TouchableOpacity
								disabled={any((bookmarked === null), loadingBookmark)}
								onPress={ToggleBookmark}
								style={styles.actionBtn}
							>
								{any((bookmarked === null), loadingBookmark) ? (
									<ActivityIndicator size='small' color={Colors.profileSolid} />
								) : (bookmarked === true) ? (
									<FontAwesome
										name='bookmark'
										size={20}
										style={styles.icon}
									/>
								) : (bookmarked === false) && (
									<FontAwesome
										name='bookmark-o'
										size={20}
										style={styles.icon}
									/>
								)}
							</TouchableOpacity>
						</View>


					</View>

					<View style={(dayIndex===1) ? {...styles.workDays, ...styles.bgShade, ...styles.activeDay} : {...styles.workDays, ...styles.bgShade}}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].monday }</Text>
						<Text>{host.schedule.monday.start}-{host.schedule.monday.pause}</Text>
						<Text>{host.schedule.monday.resume}-{host.schedule.monday.finish}</Text>
					</View>

					<View style={(dayIndex===2) ? {...styles.workDays, ...styles.activeDay} : styles.workDays}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].tuesday }</Text>
						<Text>{host.schedule.tuesday.start}-{host.schedule.tuesday.pause}</Text>
						<Text>{host.schedule.tuesday.resume}-{host.schedule.tuesday.finish}</Text>
					</View>

					<View style={(dayIndex===3) ? {...styles.workDays, ...styles.bgShade, ...styles.activeDay} : {...styles.workDays, ...styles.bgShade}}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].wednesday }</Text>
						<Text>{host.schedule.wednesday.start}-{host.schedule.wednesday.pause}</Text>
						<Text>{host.schedule.wednesday.resume}-{host.schedule.wednesday.finish}</Text>
					</View>

					<View style={(dayIndex===4) ? {...styles.workDays, ...styles.activeDay} : styles.workDays}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].thursday }</Text>
						<Text>{host.schedule.thursday.start}-{host.schedule.thursday.pause}</Text>
						<Text>{host.schedule.thursday.resume}-{host.schedule.thursday.finish}</Text>
					</View>

					<View style={(dayIndex===5) ? {...styles.workDays, ...styles.bgShade, ...styles.activeDay} : {...styles.workDays, ...styles.bgShade}}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].friday }</Text>
						<Text>{host.schedule.friday.start}-{host.schedule.friday.pause}</Text>
						<Text>{host.schedule.friday.resume}-{host.schedule.friday.finish}</Text>
					</View>

					<View style={(dayIndex===6) ? {...styles.workDays, ...styles.activeDay} : styles.workDays}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].saturday }</Text>
						<Text>{host.schedule.saturday.start}-{host.schedule.saturday.pause}</Text>
						<Text>{host.schedule.saturday.resume}-{host.schedule.saturday.finish}</Text>
					</View>

					<View style={(dayIndex===0) ? {...styles.workDays, ...styles.bgShade, ...styles.activeDay} : {...styles.workDays, ...styles.bgShade}}>
						<Text style={styles.dayTitle}>{ lang[appLanguage].sunday }</Text>
						<Text>{host.schedule.sunday.start}-{host.schedule.sunday.pause}</Text>
						<Text>{host.schedule.sunday.resume}-{host.schedule.sunday.finish}</Text>
					</View>
				</>
				)}

			</ScrollView>
			<View style={bookForm ? {...styles.actionWrap, ...styles.bookForm} : styles.actionWrap}>

				{bookForm ? (
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
									disabled={loadingForm}
									onPress={()=>setBookform(false)}
									style={styles.cancelBtn}>
									<Text style={styles.btnTxt}>{ lang[appLanguage].cancel }</Text>
								</TouchableOpacity>
							</View>
							<View style={styles.btnCols}>
								<TouchableOpacity
									disabled={loadingForm}
									onPress={sendRequest}
									style={styles.submitBtn}
								>
									{loadingForm ? (
										<ActivityIndicator size='small' color={Colors.profileSolid} />
									) : (
										<Text style={styles.btnTxt}>{ lang[appLanguage].request }</Text>
									)}
								</TouchableOpacity>
							</View>
						</View>
					</View>
				) : (
					<TouchableOpacity
						onPress={()=>setBookform(true)}
						style={styles.btnOrder}>
						<Text style={styles.btnLabel}>{ lang[appLanguage].reserve }</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	)
}

export default ShowHostScreen

const styles = StyleSheet.create({
	bg: {
		flex: 1,
		backgroundColor: '#fff',
	},
	scroller: {
		paddingRight: isSmallDevice ? 10 : 20,
		paddingLeft: isSmallDevice ? 10 : 20,
		paddingTop: isSmallDevice ? 10 : 20,
	},
	infoWrap: {
		height: 100,
		width: '100%',
		flexDirection: 'row',
	},
	avatarWrap: {
		height: 100,
		width: 100,
		justifyContent: 'center',
		alignItems: 'center',
	},
	bodyWrap: {
		flex: 1,
		height: 100,
		alignItems: 'center',
		justifyContent: 'center',
	},
	placeName: {
		color: Colors.profileSolid,
		width: '100%',
		paddingTop: 5,
		paddingBottom: 5,
		paddingLeft: 10,
		paddingRight: 10,
		// marginBottom: 10,
		fontSize: 18,
		fontWeight: '400',

	},
	nameSaveWrap: {
		width: '100%',
		height: 40,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	fullName: {
		color: '#000',
		paddingLeft: 10,
		paddingRight: 10,
		fontSize: 16,
		fontWeight: '300'
	},
	actionBtn: {
		backgroundColor: Colors.profileOpaque,
		borderRadius: 10,
		height: 40,
		paddingRight: 12,
		paddingLeft: 12,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	icon: {
		paddingTop: 2,
		color: Colors.profileSolid
	},
	btnTxt: {
		color: Colors.profileSolid,
	},
	mbSectionWrap: {
		flexDirection: 'row',
	},
	bmTitleWrap: {
		flex: 1,
	},
	bmBtnWrap: {
		width: 50,
	},
	scheduleLabel: {
		width: '100%',
		paddingTop: 10,
		paddingBottom: 15,
		paddingLeft: 10,
	},
	workDays: {
		height: 40,
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	dayTitle: {
		width: 50,
	},
	bgShade: {
		backgroundColor: '#eee',
	},
	activeDay: {
		borderWidth: 1,
		borderColor: Colors.profileSolid,
		backgroundColor: Colors.profileOpaque,
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
		justifyContent: 'center',
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
		height: isSmallDevice ? 60 : 80,
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
		height: isSmallDevice ? 40 : 50,
		borderRadius: 10,
		alignItems: 'center',
		backgroundColor: '#fff',
		justifyContent: 'center',
	},
	submitBtn: {
		width: '100%',
		height: isSmallDevice ? 40 : 50,
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
		height: isSmallDevice ? 60 : 80,
		justifyContent: 'center',
		paddingLeft: 20,
		paddingRight: 20,
	},
	btnOrder: {
		width: '100%',
		height: isSmallDevice ? 40 : 50,
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
		title		: 'Details',
		schedule	: 'Schedule',
		goodTime	: 'Choose a good time for you',
		notes		: 'Additional notes',
		cancel		: 'Cancel',
		request		: 'Request',
		reserve		: 'Make a reservation',
		monday 		: 'Mon',
		tuesday 	: 'Tue',
		wednesday 	: 'Wed',
		thursday	: 'Thu',
		friday 		: 'Fri',
		saturday 	: 'Sat',
		sunday 		: 'Sun',
		done 		: 'Done!',
		oops 		: 'Oops, something went wrong',
		noNetwork 	: 'Could not connect to internet ',
	},
	ru: {
		title		: 'Подробности',
		schedule	: 'График',
		goodTime	: 'Выберите хорошее время для вас',
		notes		: 'Дополнительные примечания',
		cancel		: 'Отмена',
		request		: 'Запрос',
		reserve		: 'Зарезервировать',
		monday 		: 'Пн',
		tuesday 	: 'Вт',
		wednesday 	: 'Ср',
		thursday	: 'Чт',
		friday 		: 'Пт',
		saturday 	: 'Сб',
		sunday 		: 'Вк',
		done 		: 'Выполнено!',
		oops 		: 'Упс! Что-то пошло не так',
		noNetwork 	: 'Не удалось подключиться к интернету ',
	},
	uz: {
		title		: 'Tafsilotlar',
		schedule	: 'Jadval',
		goodTime	: 'Siz uchun yaxshi vaqtni tanlang',
		notes		: 'Qo\'shimcha eslatmalar',
		cancel		: 'Bekor qilish',
		request		: 'So\'rov yuborish',
		reserve		: 'Band qilish',
		monday 		: 'Du',
		tuesday 	: 'Se',
		wednesday 	: 'Ch',
		thursday	: 'Pa',
		friday 		: 'Ju',
		saturday 	: 'Sh',
		sunday 		: 'Ya',
		done 		: 'Bajarildi!',
		oops 		: 'Xatolik yuz berdi',
		noNetwork 	: 'Internetga ulanib bo\'lmadi ',
	}
}