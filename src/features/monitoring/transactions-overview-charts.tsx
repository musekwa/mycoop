import { useColorScheme } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Bar, useChartPressState, CartesianChart } from 'victory-native'
import { Circle, LinearGradient, vec, useFont, Text as SKText } from '@shopify/react-native-skia'
import { useDerivedValue, type SharedValue } from 'react-native-reanimated'
import { StockDetailsType } from '@/types'
import { match } from 'ts-pattern'

function Tooltip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
	const isDark = useColorScheme() === 'dark'
	return <Circle cx={x} cy={y} r={8} color={isDark ? 'white' : 'black'} />
}

export default function TransactionsOverViewCharts({ stockDetails }: { stockDetails: StockDetailsType }) {
	const [domainHeight, setDomainHeight] = useState(25000)
	const isDark = useColorScheme() === 'dark'
	
	// Transform stockDetails object into array of {label, value} objects
	const transformedData = Object.entries(stockDetails).map(([key, value]) =>{ 

		const transformedLabel = match(key)
			.with('bought', () => 'Com')
			.with('sold', () => 'Ven')
			.with('aggregated', () => 'Agr')
			.with('transferredIn', () => 'Rec')
			.with('transferredOut', () => 'Tra')
			.with('lost', () => 'Des')
			.with('exported', () => 'Exp')
			.with('processed', () => 'Pro')
			.otherwise(() => key)

		return {
			label: transformedLabel,
			value: value
		}
	})

	useEffect(() => {
		const maxValue = Math.max(...transformedData.map(item => item.value))
		setDomainHeight(maxValue)
	}, [transformedData])

	const { state, isActive } = useChartPressState({
		x: '',
		y: { value: 0 },
	})

	const font = useFont(
		// eslint-disable-next-line @typescript-eslint/no-require-imports -- react-native-skia fonts require require()
		require('../../../assets/fonts/Roboto-Regular.ttf'),
		7,
	)

	const value = useDerivedValue(()=>{
		return state.y.value.value.value + " kg"
	}, [state])

	const textYPosition = useDerivedValue(() => {
		return state.y.value.position.value - 15
	}, [state])

	const textXPosition = useDerivedValue(() => {
		if (!font){
			return 0
		}
		return state.x.position.value - font.measureText(value.value).width / 2
	}, [state, font])

	return (
		<CartesianChart
			domainPadding={{ left: 20, right: 20 }}
			data={transformedData}
			padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
			domain={{ y: [0, domainHeight], }}
			axisOptions={{
				tickCount: 10,
				labelColor: isDark ? 'white' : 'black',
				font: font,
				labelOffset: { x: 5, y: 5 },
				formatYLabel: (value) => `${Intl.NumberFormat('pt-BR').format(value)} kg`,
				formatXLabel: (value) => value ?? ''
			}}
			xKey="label"
			yKeys={['value']}
			chartPressState={state}
		>
			{({ points, chartBounds }) => (
				<>
					{points.value.map((point, index) => (
						<Bar
							key={index}
							barCount={points.value.length}
							points={[point]}
							chartBounds={chartBounds}
							animate={{ type: "timing", duration: 1000 }}
							roundedCorners={{
								topLeft: 5,
								topRight: 5,
							}}
							barWidth={20}
							innerPadding={0.5}
						>
							<LinearGradient start={vec(0, 0)} end={vec(0, 400)} colors={['#5E5757FF', '#008000']} />
						</Bar>
					))}
					{isActive && <Tooltip x={state.x.position} y={state.y.value.position}  />}
					{
						isActive ? <>
							<SKText 
								font={font}
								color={isDark ? 'white' : 'black'}
								x={textXPosition}
								y={textYPosition}
								text={value}
							/>
						</> : null
					}
				</>
			)}
		</CartesianChart>
	)
}
