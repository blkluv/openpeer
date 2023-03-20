import { Button } from 'components';
import TransactionLink from 'components/TransactionLink';
import { BigNumber, constants } from 'ethers';
import { useTransactionFeedback } from 'hooks';
import { useApproval } from 'hooks/transactions';
import { Token } from 'models/types';
import { useEffect } from 'react';
import { erc20ABI, useAccount, useContractRead } from 'wagmi';

const ApproveTokenButton = ({
	token,
	spender,
	amount,
	onTokenApproved
}: {
	token: Token;
	spender: `0x${string}`;
	amount: BigNumber;
	onTokenApproved: () => void;
}) => {
	const { address, isConnected } = useAccount();
	const { isLoading, isSuccess, data, approve } = useApproval({
		token,
		spender,
		amount
	});

	useTransactionFeedback({ hash: data?.hash, isSuccess, Link: <TransactionLink hash={data?.hash} /> });

	const approveToken = async () => {
		if (!isConnected) return;

		approve?.();
	};

	const { data: allowance } = useContractRead({
		address: token.address,
		abi: erc20ABI,
		functionName: 'allowance',
		args: [address!, spender]
	});

	const approved = ((allowance as BigNumber) || constants.Zero).gte(amount);

	useEffect(() => {
		if (isSuccess || approved) onTokenApproved();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSuccess, approved]);

	return (
		<Button
			title={isLoading ? 'Processing...' : isSuccess ? 'Done' : `Approve ${token.symbol}`}
			onClick={approveToken}
			processing={isLoading}
			disabled={isSuccess}
		/>
	);
};

export default ApproveTokenButton;
