import React, {
	useState,
	useContext,
} from 'react'
import {
	StyleSheet,
	View,
	Text,
	TouchableHighlight,
	ActivityIndicator,
	Alert,
} from 'react-native'
import {
	MainContext,
} from '../contexts/MainContext'
import Ionicons from 'react-native-vector-icons/Ionicons'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import {
	firebase
} from '@react-native-firebase/auth'

import Colors from '../constants/Colors'
import Notch from '../components/Notch'

Ionicons.loadFont()
EvilIcons.loadFont()

const LoginScreen = ({ navigation }) => {

	const { appLanguage } = useContext(MainContext)

	// local constants
	const CodeWaitTime = 60; // 60 seconds interval between each SMS to be sent
	// data state
	const [number, setNumber] 					= useState('') // 9 digit string
	const [code, setCode]						= useState('') // 6 digit string
	const [confirmResult, setConfirmResult] 	= useState(null)
	// UI states
	const [timeLeft, setTimeLeft] 				= useState(CodeWaitTime)
	const [editable, setEditable] 				= useState(true)  // true
	const [isCodeForm, setCodeForm] 			= useState(false); // false
	const [isHinted, setHinted] 				= useState(false); // false
	const [showResendBtn, setShowResendBtn] 	= useState(false); // false

	const numArr 	= [...number]
	const codeArr 	= [...code]

	const append = num => {
		if(isCodeForm){
			if(code.length < 6) setCode(code + String(num))
		}else{
			if(number.length < 9) setNumber(number + String(num))
		}
	}

	const backSpace = () => {
		if(isCodeForm){
			setCode(code.slice(0, -1))
		}else{
			setNumber(number.slice(0, -1))
		}
	}

	const submit = ()=>{
		if(isCodeForm){
			// log in with phone && code
			login()
		}else{
			// send code to phone number
			resendCode()
		}
	}

	const changeNumber = ()=>{
		ResetState();
	}

	const ResetState = ()=>{
		setNumber('')
		setCode('')
		setTimeLeft(CodeWaitTime)
		setEditable(true)
		setCodeForm(false)
		setHinted(false)
		setShowResendBtn(false)
	}

	const resendCode = ()=>{
		SendCode();

		setHinted(true)
		setTimeLeft(CodeWaitTime)
		setCodeForm(true)
		setShowResendBtn(false)
		let timer = setInterval(()=>{ setTimeLeft(t=>t - 1) }, 1000)
		setTimeout(()=>{
			clearInterval(timer)
			setShowResendBtn(true)
			setTimeLeft(CodeWaitTime)
		}, CodeWaitTime * 1000)
		setEditable(true)
	}

	const SendCode = ()=>{
		// get phone number && send the code
		const phoneNumber = '+998' + number
		setEditable(false);
		firebase.auth()
			.signInWithPhoneNumber(phoneNumber)
			.then(confirmResult =>{
				setConfirmResult(confirmResult)
				setEditable(true)
			})
			.catch(error => {
				setEditable(true)
				__DEV__ && console.log(error)
				Alert.alert(
					lang[appLanguage].oops,
					lang[appLanguage].errorSending + (__DEV__ ? error : ''),
					[{text: 'OK'}]
				)
			});
	}

	const login = ()=>{
		// firebase login with phone number
		if(confirmResult){
			setEditable(false)
			confirmResult.confirm(code)
				.then((user) => {
					// go to next page
					navigation.navigate('PostLoginScreen')
				})
				.catch(error => {
					if(error.code === 'auth/invalid-verification-code'){
						setEditable(true)
						setCode('')
						Alert.alert(
							lang[appLanguage].invalidCode,
							'',
							[{text: 'OK'}]
						)
					}else{
						__DEV__ && console.log(error)
						Alert.alert(
							lang[appLanguage].oops,
							lang[appLanguage].errorSending + (__DEV__ ? error : ''),
							[
								{text: 'OK'}]
						)
					}
				});
		}
	}

	return (
		<View style={styles.bg}>
			<Notch />
			<View style={styles.innerView}>
				<View style={styles.container}>

					<View style={styles.row}>

						<View style={{...styles.topRows33, flex: 0.25}}>
							<Text style={styles.headerText}>
								{isCodeForm ? '+998' + number + lang[appLanguage].smsCode : lang[appLanguage].yourNumber}
							</Text>
						</View>

						<View style={{...styles.topRows33, ...styles.topMidRow}}>
							{ isCodeForm ? (
								<View style={styles.codeTxtWrapper}>
									<Text style={styles.codeTxt}>{ codeArr[0] || '*' }</Text>
									<Text style={styles.codeTxt}>{ codeArr[1] || '*' }</Text>
									<Text style={styles.codeTxt}>{ codeArr[2] || '*' }</Text>
									<Text style={styles.codeTxt}>{ codeArr[3] || '*' }</Text>
									<Text style={styles.codeTxt}>{ codeArr[4] || '*' }</Text>
									<Text style={styles.codeTxt}>{ codeArr[5] || '*' }</Text>
								</View>
							) : (
								<>
									<View style={styles.countryCodeWrapper}>
										<Text style={styles.countryCode}>🇺🇿 +998</Text>
									</View>

									<View style={styles.phoneNumWrapper}>
										<Text style={styles.phoneNumberCell}>{numArr[0] || '_'}</Text>
										<Text style={styles.phoneNumberCell}>{numArr[1] || '_'}</Text>
										<Text style={styles.phoneNumberCell}></Text>
										<Text style={styles.phoneNumberCell}>{numArr[2] || '_'}</Text>
										<Text style={styles.phoneNumberCell}>{numArr[3] || '_'}</Text>
										<Text style={styles.phoneNumberCell}>{numArr[4] || '_'}</Text>
										<Text style={styles.phoneNumberCell}></Text>
										<Text style={styles.phoneNumberCell}>{numArr[5] || '_'}</Text>
										<Text style={styles.phoneNumberCell}>{numArr[6] || '_'}</Text>
										<Text style={styles.phoneNumberCell}>{numArr[7] || '_'}</Text>
										<Text style={styles.phoneNumberCell}>{numArr[8] || '_'}</Text>
									</View>
								</>
							) }

						</View>

						<View style={{...styles.topRows33, flex: 0.25, flexDirection: "column"}}>
							{ isHinted && (<>
								<View style={styles.rowBottomStack50}>
									<Text style={styles.txtGrayItalic}>{ showResendBtn ? lang[appLanguage].didntGetCode : lang[appLanguage].sendingCode + timeLeft }</Text>
								</View>
								<View style={styles.rowBottomStack50}>
									{ showResendBtn && (
										<>
											<TouchableHighlight onPress={ ()=> changeNumber() } activeOpacity={1} underlayColor={Colors.taskOpaque} style={styles.resendBtn}><Text style={{color: Colors.taskSolid}}>{ lang[appLanguage].changeNumber }</Text></TouchableHighlight>
											<TouchableHighlight onPress={ ()=> resendCode() } activeOpacity={1} underlayColor={Colors.taskOpaque} style={styles.resendBtn}><Text style={{color: Colors.taskSolid}}>{ lang[appLanguage].resendCode }</Text></TouchableHighlight>
										</>
									)}
								</View>
							</>) }

						</View>

					</View>

					<View style={styles.row}>
						<View style={styles.numRows}>
							<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ () => append(1) } style={styles.btnCell}><Text style={styles.btnTxt}>1</Text></TouchableHighlight>
							<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ () => append(2) } style={styles.btnCell}><Text style={styles.btnTxt}>2</Text></TouchableHighlight>
							<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ () => append(3) } style={styles.btnCell}><Text style={styles.btnTxt}>3</Text></TouchableHighlight>
						</View>
						<View style={styles.numRows}>
							<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ () => append(4) } style={styles.btnCell}><Text style={styles.btnTxt}>4</Text></TouchableHighlight>
							<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ () => append(5) } style={styles.btnCell}><Text style={styles.btnTxt}>5</Text></TouchableHighlight>
							<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ () => append(6) } style={styles.btnCell}><Text style={styles.btnTxt}>6</Text></TouchableHighlight>
						</View>
						<View style={styles.numRows}>
							<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ () => append(7) } style={styles.btnCell}><Text style={styles.btnTxt}>7</Text></TouchableHighlight>
							<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ () => append(8) } style={styles.btnCell}><Text style={styles.btnTxt}>8</Text></TouchableHighlight>
							<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ () => append(9) } style={styles.btnCell}><Text style={styles.btnTxt}>9</Text></TouchableHighlight>
						</View>
						<View style={styles.numRows}>
							{((!isCodeForm && number.length != 0) || (isCodeForm && code.length != 0)) ? (
								<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ ()=>backSpace() } style={styles.btnCell}>
									<Ionicons
										name='ios-arrow-round-back'
										size={35}
										color={Colors.profileSolid}
									/>
								</TouchableHighlight>
							) : (<View style={styles.btnCell}></View>)}
							<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ () => append(0) } style={styles.btnCell}><Text style={styles.btnTxt}>0</Text></TouchableHighlight>
							{((!isCodeForm && number.length == 9) || (isCodeForm && code.length == 6)) ? (
								<TouchableHighlight disabled={!editable} activeOpacity={1} underlayColor={Colors.profileOpaque} onPress={ ()=> submit() } style={styles.btnCell}>
									{editable ? (
										<Ionicons
											name='ios-checkmark'
											size={35}
											color={Colors.profileSolid} />
									) : (
										<ActivityIndicator
											size={35}
											color={Colors.profileSolid} />
									)}

								</TouchableHighlight>
							) : (<View style={styles.btnCell}></View>)}
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}

LoginScreen.navigationOptions = {
	headerShown: false,
};

export default LoginScreen

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
	container: {
		maxWidth: "90%",
		minWidth: "80%",
		height: "90%",
		display: "flex",
		flexDirection: "column",
	},
	row: {
		flex: 0.5,
		display: "flex",
		flexDirection: "column",
	},
	topRows33: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	headerText: {
		fontSize: 20,
		letterSpacing: 1.5,
		color: Colors.profileSolid,
		fontWeight: "600",
	},
	topMidRow: {
		flex: 0.5,
		display: "flex",
		flexDirection: "row",
	},
	countryCodeWrapper: {
		height: 60,
		flex: 0.3333,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	countryCode: {
		fontSize: 20,
	},
	phoneNumWrapper: {
		height: 60,
		flex: 0.6666,
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
	},
	phoneNumberCell: {
		flex: 1,
		textAlign: "center",
		fontSize: 20,
	},
	rowBottomStack50: {
		flex: 1,
		width: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "row",
	},
	numRows: {
		flex: 0.25,
		display: "flex",
		flexDirection: "row",
	},
	btnCell: {
		flex: 0.3333,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 10,
	},
	btnTxt: {
		fontSize: 20,
		color: Colors.profileSolid,
	},
	resendBtn: {
		flex: 0.5,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		height: "100%",
		borderRadius: 10,
	},
	txtGrayItalic:{
		color: "#999",
		fontStyle: "italic",
	},
	codeTxtWrapper: {
		width: "80%",
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	codeTxt: {
		textAlign: "center",
		fontSize: 20,
		flex: 1,
	},
});

const lang = {
	en: {
		smsCode			: ' - SMS Code:',
		yourNumber 		: 'Your mobile number:',
		didntGetCode	: 'Did not get the code?',
		sendingCode		: 'Sending the code... ',
		changeNumber	: 'Change number',
		resendCode		: 'Resend code',
		oops 			: 'Oops, something went wrong',
		errorSending	: 'Error sending the code',
		invalidCode		: 'Invalid code',
	},
	ru: {
		smsCode			: ' - Код СМС:',
		yourNumber 		: 'Номер телефона:',
		didntGetCode	: 'Не получил код?',
		sendingCode		: 'Отправка кода... ',
		changeNumber	: 'Изменить номер',
		resendCode		: 'Отправить еще раз',
		oops 			: 'Упс! Что-то пошло не так',
		errorSending	: 'Ошибка при отправке кода',
		invalidCode		: 'Неверный код',
	},
	uz: {
		smsCode			: ' - SMS Kod:',
		yourNumber 		: 'Telefon raqamingiz:',
		didntGetCode	: 'Kod bormadimi?',
		sendingCode		: 'Kod yuborilyapti... ',
		changeNumber	: 'Raqamni o\'gartirish',
		resendCode		: 'Qaytadan jo\'natish',
		oops 			: 'Xatolik yuz berdi',
		errorSending	: 'Kodni yuborishda xato',
		invalidCode		: 'Kod xato',
	}
}