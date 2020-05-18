import AsyncStorage from '@react-native-community/async-storage'
import { en } from '../constants/LangEnums'

const PROFILE = 'profile'
const BOOKMARKS = 'bookmarks'
const LANG = 'language'
const GPS_SETTING = 'gps_setting'
const FEED = 'feed'
const MEETINGS = 'meetings'

export const wipeAll = ()=>{
	AsyncStorage.removeItem(PROFILE)
	AsyncStorage.removeItem(BOOKMARKS)
	AsyncStorage.removeItem(LANG)
	AsyncStorage.removeItem(GPS_SETTING)
	AsyncStorage.removeItem(FEED)
	AsyncStorage.removeItem(MEETINGS)
}

export const readProfile = async ()=>{
	const p = await AsyncStorage.getItem(PROFILE)
	return p ? JSON.parse(p) : null
}

export const writeProfile = (obj)=>{
	AsyncStorage.setItem(PROFILE, JSON.stringify(obj))
}


export const readBookmarks = async () => {
	const b = await AsyncStorage.getItem(BOOKMARKS)
	return b ? JSON.parse(b) : null
}
export const writeBookmarks = (obj)=>{
	AsyncStorage.setItem(BOOKMARKS, JSON.stringify(obj))
}

export const readLang = async ()=>{
	const b = await AsyncStorage.getItem(LANG)
	return b ? b : en
}

export const writeLang = (lang)=>{
	AsyncStorage.setItem(LANG, lang)
}

export const readGpsSetting = async ()=>{
	const b = await AsyncStorage.getItem(GPS_SETTING)
	return b ? JSON.parse(b) : null
}

export const writeGpsSetting = (gps)=>{
	AsyncStorage.setItem(GPS_SETTING, String(gps))
}

export const readFeed = async ()=>{
	const b = await AsyncStorage.getItem(FEED)
	return b ? JSON.parse(b) : null
}

export const writeFeed = (obj)=>{
	AsyncStorage.setItem(FEED, JSON.stringify(obj))
}

export const readMeetings = async ()=>{
	const b = await AsyncStorage.getItem(MEETINGS)
	return b ? JSON.parse(b) : null
}

export const writeMeetings = (obj)=>{
	AsyncStorage.setItem(MEETINGS, JSON.stringify(obj))
}

const db = ()=>({
	wipeAll,
	readProfile,
	writeProfile,
	readBookmarks,
	writeBookmarks,
	readLang,
	writeLang,
	readGpsSetting,
	writeGpsSetting,
	readFeed,
	writeFeed,
	readMeetings,
	writeMeetings,
})

export default db