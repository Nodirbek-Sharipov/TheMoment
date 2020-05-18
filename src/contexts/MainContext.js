import React, {
	createContext,
	Component,
} from 'react';
import {
	readLang,
	writeLang,
} from '../helpers/db';
import {
	en,
} from '../constants/LangEnums';

export const MainContext = createContext();

class MainContextProvider extends Component {
	state = {
		isLoggedIn: false,
		isNewUser: true,
		appLanguage: en,
	};

	componentDidMount(){
		readLang().then(lang=>{
			if(lang){
				this.setState(state => ({...state, appLanguage: lang}))
			}else{
				this.setState(state => ({...state, appLanguage: en}))
				writeLang(en)
			}
		})
	}

	toggleLogin = ()=> this.setState({...this.state, isLoggedIn: !this.state.isLoggedIn})
	toggleNewUser = ()=> this.setState({...this.state, isNewUser: !this.state.isNewUser})
	setAppLanguage = (langCode)=> this.setState({...this.state, appLanguage: langCode})

	render() {
		const setState = s => this.set_state(s)

		return (
			<MainContext.Provider value={{
						...this.state,

						toggleLogin: this.toggleLogin,
						toggleNewUser: this.toggleNewUser,
						setAppLanguage: this.setAppLanguage,
					}}>
				{this.props.children}
			</MainContext.Provider>
		);
	}
}

export default MainContextProvider;
