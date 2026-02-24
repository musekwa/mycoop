import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import Spinner from '@/components/loaders/spinner'
import { useActionStore } from '@/store/actions/actions'
import { ResourceName } from '@/types'

export default function CustomRedirectScreen() {
	const { getCurrentResource } = useActionStore()
	const currentResourceId = getCurrentResource().id
	const currentResourceName = getCurrentResource().name
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		setTimeout(() => {
			setIsLoading(false)
		}, 1000)
	}, [currentResourceId, currentResourceName, isLoading])

	if (isLoading) {
		return <Spinner />
	}

	if (currentResourceName === ResourceName.GROUP) {
		return <Redirect href={'/(profiles)/group'} />
	}

	if (currentResourceName === ResourceName.FARMER) {
		return <Redirect href={'/(profiles)/farmer/dashboard'} />
	}


	return <Redirect href={'/(tabs)/actors'} />
}
