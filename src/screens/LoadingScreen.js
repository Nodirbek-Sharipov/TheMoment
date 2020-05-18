import React from 'react'
import {
	StyleSheet,
	View,
	Text,
	ActivityIndicator,
} from 'react-native'
import Shimmer from 'react-native-shimmer'

import Colors from '../constants/Colors'
import EvilIcons from 'react-native-vector-icons/EvilIcons'

EvilIcons.loadFont()

const LoadingScreen = ()=>(
	<View style={styles.bg}>
		<View style={styles.innerView}>
			<Shimmer>
				<Text style={styles.headerText}>The Moment</Text>
			</Shimmer>
			<EvilIcons name='calendar' size={150} color={Colors.taskSolid}/>
			<ActivityIndicator size='large' color={'#000'} />
		</View>
	</View>
);

export default LoadingScreen;

const styles = StyleSheet.create({
	bg: {
		flex: 1,
		backgroundColor: "#fff",
	},
	innerView: {
		display: "flex",
		flex: 1,
		alignItems: 'center',
		justifyContent: 'space-around',
	},
	headerText: {
		fontSize: 30,
		color: '#999',
		fontWeight: '900',
	},
});