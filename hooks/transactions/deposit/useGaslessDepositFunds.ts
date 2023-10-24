import { OpenPeerEscrow } from 'abis';
import { Contract } from 'ethers';
import useBiconomy from 'hooks/useBiconomy';
import { useState } from 'react';
import { useAccount } from 'wagmi';

import { UseDepositFundsProps } from '../types';

interface Data {
	hash?: `0x${string}`;
}

const useGaslessDepositFunds = ({ contract, token, amount }: UseDepositFundsProps) => {
	const [data, updateData] = useState<Data>({});
	const [isSuccess, setIsSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { address } = useAccount();

	const { biconomy, gaslessEnabled } = useBiconomy({ contract });

	if (biconomy === undefined || gaslessEnabled === undefined) {
		return { isFetching: true, gaslessEnabled, isSuccess, isLoading, data };
	}

	if (biconomy === null || !gaslessEnabled) {
		return { isFetching: false, gaslessEnabled: false, isSuccess, isLoading, data };
	}

	const depositFunds = async () => {
		try {
			const provider = await biconomy.provider;
			const contractInstance = new Contract(contract, OpenPeerEscrow, biconomy.ethersProvider);
			const { data: transactionData } = await contractInstance.populateTransaction.deposit(token.address, amount);
			const txParams = {
				data: transactionData,
				to: contract,
				from: address,
				signatureType: 'EIP712_SIGN',
				gasLimit: 400000
			};
			// @ts-ignore
			await provider.send('eth_sendTransaction', [txParams]);
			setIsLoading(true);
			biconomy.on('txHashGenerated', (txData) => {
				setIsSuccess(false);
				updateData(txData);
			});
			biconomy.on('txMined', (minedData) => {
				setIsLoading(false);
				setIsSuccess(true);
				updateData(minedData);
			});

			biconomy.on('onError', (minedData) => {
				console.error('error', minedData);
				setIsLoading(false);
				setIsSuccess(false);
			});
		} catch (error) {
			console.error('error', error);
			setIsLoading(false);
			setIsSuccess(false);
		}
	};
	return { isFetching: false, gaslessEnabled: true, isLoading, isSuccess, data, depositFunds };
};

export default useGaslessDepositFunds;