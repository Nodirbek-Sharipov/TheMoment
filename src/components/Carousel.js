import React, {
	useState,

} from 'react'
import {
	View,
	ScrollView,
	Text,
	StyleSheet,
} from 'react-native'

export const Slide = ({ title }) => {
	return (
		<View style={styles.slide}>
			<Text style={{...styles.slideText}}>{title}</Text>
		</View>
	)
}

export const Stat = ({ label, value }) => {
	return (
		<View style={styles.stat}>
			<Text style={{...styles.statText}}>{value}</Text>
			<View style={styles.statHold}>
				<Text style={{...styles.statLabel}}>{label}</Text>
			</View>
		</View>
	)
}

const Carousel = ({ items, style, itemsPerInterval  = 1, isFlat = false}) => {

	const [interval, setIntervalSingle]	= useState(1);
	const [intervals, setIntervals]		= useState(1);
	const [width, setWidth]				= useState(0);

	const init = (width) => {
		// initialise width
		setWidth(width);
		// initialise total intervals
		const totalItems = items.length;
		setIntervals(Math.ceil(totalItems / itemsPerInterval));
	}

	const getInterval = (offset) => {
		for (let i = 1; i <= intervals; i++) {
			if (offset < (width / intervals) * i) {
				return i;
			}
			if (i == intervals) {
				return i;
			}
		}
	}

	let bullets = [];
	for (let i = 1; i <= intervals; i++) {
		bullets.push(<Text key={i} style={{...styles.bullet, opacity: interval === i ? 0.5 : 0.1}}>&bull;</Text>);
	}

	return (
		<View style={isFlat ? styles.container : styles.container3D}>
			<ScrollView
				horizontal={true}
				contentContainerStyle={{ ...styles.scrollView, width: `${100 * intervals}%` }}
				showsHorizontalScrollIndicator={false}
				onContentSizeChange={(w, h) => init(w)}
				onScroll={data => {
					setWidth(data.nativeEvent.contentSize.width)
					setIntervalSingle(getInterval(data.nativeEvent.contentOffset.x))
				}}
				scrollEventThrottle={200}
				pagingEnabled
				decelerationRate="fast"
			>
				{items.map((item, index) => {
					switch (style) {
						case 'stats':
							return (
								<Stat
									key={index}
									label={item.label}
									value={item.value}
								/>
							)
						case 'card':
							return item
						default:
							return (
								<Slide
									key={index}
									title={item.title}
								/>
							)
					}
				})}
			</ScrollView>
			<View style={styles.bullets}>
				{bullets}
			</View>
		</View>
	)
}

export default Carousel

export const styles = StyleSheet.create({
	statsHead: {
		paddingTop: 10,
		paddingHorizontal: 12,
	},
	container: {
		width: '100%',
		borderRadius: 8,
		marginTop: 10,
	},
	container3D: {
		width: '100%',
		borderRadius: 8,
		marginTop: 10,

		backgroundColor: '#fbfbfb',
		borderColor: '#ebebeb',
		borderWidth: 1,
		shadowColor: '#fcfcfc',
		shadowOpacity: 1,
		shadowOffset: {
			width: 0,
			height: 5
		},
	},
	scrollView: {
		display: 'flex',
		flexDirection: 'row',
		overflow: 'hidden',
	},
	bullets: {
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'row',
		paddingHorizontal: 10,
		paddingTop: 5,
	},
	bullet: {
	 	paddingHorizontal: 5,
		fontSize: 30,
	},
	slide: {
		paddingHorizontal: 20,
		paddingBottom: 10,
		paddingTop: 30,
		flexBasis: '100%',
		flex: 1,
		maxWidth: '100%',
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
		height: 200,
	},
	slideText: {
		width: '100%',
		textAlign: 'left',
		fontSize: 20,
	},
	stat: {
		paddingHorizontal: 20,
		paddingBottom: 10,
		paddingTop: 30,
		flexBasis: '33%',
		flex: 1,
		maxWidth: '33%',
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
	},
	statText: {
		width: '100%',
		textAlign: 'left',
		fontSize: 20,
	},
	statHold: {
		width: '100%',
		marginBottom: 8,
	},
	statLabel: {
		width: '100%',
		textAlign: 'left',
		fontSize: 11,
		fontWeight: '600',
		paddingTop: 5,
	},
})