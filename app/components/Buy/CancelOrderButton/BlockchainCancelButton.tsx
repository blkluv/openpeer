import { OpenPeerEscrow } from 'abis';
import { Button } from 'components';
import TransactionLink from 'components/TransactionLink';
import { BigNumber } from 'ethers';
import { useBlockchainCancel, useTransactionFeedback } from 'hooks';
import { Order } from 'models/types';
import { useAccount, useContractRead } from 'wagmi';

interface BlockchainCancelButtonParams {
	order: Order;
	outlined?: boolean;
	title?: string;
}

const BlockchainCancelButton = ({ order, outlined, title = 'Cancel Order' }: BlockchainCancelButtonParams) => {
	const {
		escrow,
		buyer,
		list: { seller }
	} = order;
	const { isConnected, address: connectedAddress } = useAccount();
	const isBuyer = buyer.address === connectedAddress;
	const isSeller = seller.address === connectedAddress;

	const { data: sellerCanCancelAfter }: { data: BigNumber | undefined } = useContractRead({
		address: escrow!.address,
		abi: OpenPeerEscrow,
		functionName: 'sellerCanCancelAfter'
	});

	const { isLoading, isSuccess, cancelOrder, data } = useBlockchainCancel({ contract: escrow!.address, isBuyer });

	useTransactionFeedback({
		hash: data?.hash,
		isSuccess,
		Link: <TransactionLink hash={data?.hash} />
	});

	if (sellerCanCancelAfter === undefined) {
		return <p>Loading...</p>;
	}

	const now = Date.now() / 1000;
	const sellerCanCancelAfterSeconds = parseInt(sellerCanCancelAfter.toString());
	const sellerCantCancel = isSeller && (sellerCanCancelAfterSeconds <= 1 || sellerCanCancelAfterSeconds > now);

	const onBlockchainCancel = () => {
		if (!isConnected || sellerCantCancel) return;

		cancelOrder?.();
	};

	return (
		<Button
			title={sellerCantCancel ? 'You cannot cancel' : isLoading ? 'Processing...' : isSuccess ? 'Done' : title}
			processing={isLoading}
			disabled={isSuccess || sellerCantCancel || sellerCantCancel}
			onClick={onBlockchainCancel}
			outlined={outlined}
		/>
	);
};

export default BlockchainCancelButton;