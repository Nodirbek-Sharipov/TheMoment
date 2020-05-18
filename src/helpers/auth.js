import AsyncStorage from '@react-native-community/async-storage'
import { firebase } from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import { Alert } from 'react-native'
import { wipeAll } from './db'

const usersCollection = firestore().collection('users')

export const USER_KEY = "UID"

export const SetUid = (key) => AsyncStorage.setItem(USER_KEY, key)

export const RemoveUid = () => AsyncStorage.removeItem(USER_KEY)


export const SignedInCheck = () => {
  return new Promise((resolve, reject) => {
	if (firebase.auth().currentUser) {
		resolve(true)
	} else {
		resolve(false)
	}
  });
};

export const NewUserCheck = () => {
	return new Promise((resolve, reject) => {
		AsyncStorage.getItem(USER_KEY).then(res => {
			if (!res) {
				// get uid from auth
				if(firebase.auth().currentUser){
					// logged in
					const uid = firebase.auth().currentUser.uid
					// check for user on firestore users collection
					usersCollection.where('uid', '==', uid).get().then(res => {
						// can be undefined
						if(res && res._docs && res._docs[0] && res._docs[0]._data && res._docs[0]._data.uid){
							SetUid(res._docs[0]._data.uid)
							return resolve(false) // existing user
						}else{
							return resolve(true)
						}
					}).catch(err => {
						Alert.alert(
							'Oops, something went wrong!',
							'Could not connect to the internet',
							[
								{text: 'Retry', onPress: ()=>{ NewUserCheck() }}
							],
							{ cancelable: false }
						)
					});
				}else{
					return resolve(true)
				}
			} else {
				return resolve(false)
			}
		}).catch(err => reject(err))
	});
}


export const logOut = ()=>{
	firebase.auth().signOut().then(()=>{
		RemoveUid()
		wipeAll()
	}).catch(()=>{
		Alert.alert(
			'Oops, something went wrong!',
			'Could not sign out',
			[
				{text: 'Ok', onPress: ()=>{}},
				{text: 'Retry', onPress: ()=>{ logOut() }}
			],
			{ cancelable: true }
		)
	}); // .currentUser.logOut()
}