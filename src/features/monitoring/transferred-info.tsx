import React from 'react'
import { View } from 'react-native'
import { OrganizationTransferredTransactionItem } from '@/features/types'
import NoContentPlaceholder from '@/components/no-content-placeholder'
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated'
import TransactionCard from '@/features/monitoring/transaction-card'
import TransactionShimmer from '@/components/skeletons/transaction-shimmer'
import { getWarehouseTypeLabel } from '@/helpers/transaction-helpers'
import { getTransactedItemPortugueseName } from '@/helpers/trades'

interface OrganizationTransferredInfoProps {
	transactions: OrganizationTransferredTransactionItem[]
}

const TransactionItem = ({ transaction, index }: { transaction: OrganizationTransferredTransactionItem; index: number }) => {
	const warehouseType = getWarehouseTypeLabel(transaction.destination_org_organization_type)
	const description = transaction.destination_org_group_name

	if (!transaction.item) {
		return null
	}

	return (
		<TransactionCard
			index={index}
			itemType={transaction.item}
			quantity={transaction.quantity!}
			startDate={transaction.start_date!}
			endDate={transaction.end_date!}
			warehouseType={warehouseType}
			description={description}
			headerLabel={`Transferência de ${getTransactedItemPortugueseName(transaction.item!).toLowerCase()}`}
			locationLabel="Destino"
			statusBadge={{
				icon: 'time-outline',
				text: 'Aguardando confirmação',
				iconColor: '#DC2626',
				textClassName: 'text-red-600 dark:text-red-400',
				bgClassName: 'bg-red-50 dark:bg-red-900/20',
			}}
		/>
	)
}

export default function OrganizationTransferredInfo({ transactions }: OrganizationTransferredInfoProps) {
	// Show shimmer only when transactions is undefined (initial load)
	const isLoading = transactions === undefined
	const isEmpty = !isLoading && transactions.length === 0

	const data = isLoading ? Array(3).fill({}) : transactions

	if (isLoading) {
		return (
			<View>
				{Array(1)
					.fill({})
					.map((_, index) => (
						<TransactionShimmer key={index} />
					))}
			</View>
		)
	}

	if (isEmpty) {
		return <NoContentPlaceholder message="Não há transações aguardando confirmação no momento." />
	}

	return (
		<Animated.ScrollView
			contentContainerStyle={{ paddingBottom: 200, paddingTop: 4, paddingHorizontal: 4, flexGrow: 1 }}
			showsVerticalScrollIndicator={false}
		>
			{data.map((transaction, index) => (
				<Animated.View
					key={transaction.id}
					entering={FadeInDown.delay(index * 100).springify()}
					layout={LinearTransition.springify()}
				>
					<TransactionItem transaction={transaction} index={index} />
				</Animated.View>
			))}
		</Animated.ScrollView>
	)
}
