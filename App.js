import React, {
	useContext,
	useState,
	useEffect,
} from 'react'
import { StatusBar } from 'react-native'
import { MainContext } from './src/contexts/MainContext'
import { getRootNavigator } from './src/navigation/RootNavigator'
import {
	SignedInCheck,
	RemoveUid,
	NewUserCheck,
} from './src/helpers/auth'
import {
	readLang,
	writeLang,
} from './src/helpers/db'
import { en } from './src/constants/LangEnums'
import LoadingScreen from './src/screens/LoadingScreen'

import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';

// const isHermes = () => global.HermesInternal !== null

const App = () => {

	// state and setState is main application state EVERYWHERE in code
	const {
		isLoggedIn, toggleLogin,
		isNewUser, toggleNewUser,
		appLanguage, setAppLanguage,
	} = useContext(MainContext)

	const [loaded, setLoaded] 	= useState(false)
	const [renders, setRenders] = useState(0)

	useEffect(()=>{

		setRenders(renders => renders + 1)

		let isMounted = true

		const INIT = async ()=>{
			const signed 	= await SignedInCheck()
			const isnew		= await NewUserCheck()
			const langCode 	= await readLang()

			if(renders === 1){ // if initial launch

				if(!signed || (signed && isnew)) RemoveUid() // clear USER_KEY from local db
				// here we gotta update MainContext to logged in
				if(isLoggedIn !== signed) toggleLogin()
				if(isNewUser !== isnew) toggleNewUser()

				if(appLanguage === null) {
					if(langCode){
						setAppLanguage(langCode)
					}else{
						setAppLanguage(en)
						writeLang(en)
					}
				}
			}

			//isMounted && setState({...state, isLoggedIn: signed, isNewUser: isnew })
			// show loading screen for extra 1 seconds,
			// so that we will have something to optimize in the later releases
			if(appLanguage){
				setTimeout(()=>{
					setLoaded(true)
				}, 1000) // 1000 - 1s
			}
		}
		INIT()

		return ()=>{
			isMounted = false
		}
	}, [isLoggedIn, isNewUser, appLanguage, loaded])

	// const { isLoggedIn, isNewUser } = state

	const RootNavigator = getRootNavigator(isLoggedIn, isNewUser)

	return (!loaded) ? (<LoadingScreen />) : (
		<>
			<StatusBar barStyle="dark-content" />
			<RootNavigator loggedIn={isLoggedIn} isNew={isNewUser}/>
		</>
	);
}

export default App;
