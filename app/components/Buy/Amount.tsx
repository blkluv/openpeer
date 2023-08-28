import { getAuthToken } from '@dynamic-labs/sdk-react-core';
import Flag from 'components/Flag/Flag';
import Input from 'components/Input/Input';
import { AccountInfo } from 'components/Listing';
import StepLayout from 'components/Listing/StepLayout';
import Token from 'components/Token/Token';
import { useConfirmationSignMessage, useFormErrors } from 'hooks';
import { countries } from 'models/countries';
import { Errors, Resolver } from 'models/errors';
import { List, User } from 'models/types';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import snakecaseKeys from 'snakecase-keys';
import { truncate } from 'utils';
import { useAccount } from 'wagmi';

import { BuyStepProps, UIOrder } from './Buy.types';

interface BuyAmountStepProps extends BuyStepProps {
	price: number | undefined;
}

const Prefix = ({ label, image }: { label: string; image: React.ReactNode }) => (
	<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
		<div className="flex flex-row">
			<span className="mr-2">{image}</span>
			<span className="text-gray-500">{label}</span>
		</div>
	</div>
);

const Amount = ({ order, updateOrder, price }: BuyAmountStepProps) => {
	const router = useRouter();
	const { fiatAmount: quickBuyFiat, tokenAmount: quickBuyToken } = router.query;
	const { list = {} as List, token_amount: orderTokenAmount, fiat_amount: orderFiatAmount } = order;
	const { address } = useAccount();
	const { fiat_currency: currency, token, type } = list;

	const [fiatAmount, setFiatAmount] = useState<number | undefined>(
		orderFiatAmount || quickBuyFiat ? Number(quickBuyFiat) : undefined
	);
	const [tokenAmount, setTokenAmount] = useState<number | undefined>(
		orderTokenAmount || quickBuyToken ? Number(quickBuyToken) : undefined
	);
	const [user, setUser] = useState<User | null>();

	const { errors, clearErrors, validate } = useFormErrors();

	const { signMessage } = useConfirmationSignMessage({
		onSuccess: async (data, variables) => {
			const result = await fetch('/api/orders/', {
				method: 'POST',
				body: JSON.stringify(
					snakecaseKeys(
						{
							order: {
								listId: order.list.id,
								fiatAmount,
								tokenAmount,
								price
							},
							data,
							address,
							message: variables.message
						},
						{ deep: true }
					)
				),
				headers: {
					Authorization: `Bearer ${getAuthToken()}`
				}
			});
			const { uuid } = await result.json();
			if (uuid) {
				router.push(`/orders/${uuid}`);
			}
		}
	});

	const resolver: Resolver = () => {
		const error: Errors = {};

		const { limit_min: limitMin, limit_max: limitMax, total_available_amount: totalAvailableAmount } = list;
		const max = Number(limitMax) || Number(totalAvailableAmount) * (price || 0);

		if (!fiatAmount) {
			error.fiatAmount = 'Should be bigger than 0';
		} else if (fiatAmount < (Number(limitMin) || 0)) {
			error.fiatAmount = `Should be more or equal ${limitMin}`;
		} else if (fiatAmount > max) {
			error.fiatAmount = `Should be less or equal ${max}`;
		}

		if (!tokenAmount) {
			error.tokenAmount = 'Should be bigger than 0';
		}

		return error;
	};

	const onProceed = () => {
		if (list && price) {
			if (!validate(resolver)) return;

			const newOrder: UIOrder = {
				...order,
				...{ fiat_amount: fiatAmount!, token_amount: tokenAmount!, price }
			};

			if (type === 'SellList') {
				updateOrder(newOrder);

				const message = JSON.stringify(
					snakecaseKeys(
						{
							listId: newOrder.list.id,
							fiatAmount: newOrder.fiat_amount,
							tokenAmount: newOrder.token_amount,
							price
						},
						{ deep: true }
					),
					undefined,
					4
				);
				signMessage({ message });
			} else {
				updateOrder({ ...newOrder, ...{ step: newOrder.step + 1 } });
			}
		}
	};

	function onChangeFiat(val: number | undefined) {
		clearErrors(['fiatAmount']);
		setFiatAmount(val);
		if (price && val) setTokenAmount(truncate(val / price, token.decimals));
	}

	function onChangeToken(val: number | undefined) {
		clearErrors(['tokenAmount']);

		setTokenAmount(val);
		if (price && val) setFiatAmount(val * price);
	}

	useEffect(() => {
		updateOrder({ ...order, ...{ fiatAmount, tokenAmount } });
	}, [tokenAmount, fiatAmount]);

	useEffect(() => {
		if (!address) return;

		fetch(`/api/users/${address}`, {
			headers: {
				Authorization: `Bearer ${getAuthToken()}`
			}
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.errors) {
					setUser(null);
				} else {
					setUser(data);
				}
			});
	}, [address]);

	const buyCrypto = list.type === 'BuyList';
	const buttonText = buyCrypto ? '' : 'Sign and Continue';

	if (!user?.email) {
		return <AccountInfo setUser={setUser} />;
	}

	return (
		<StepLayout onProceed={onProceed} buttonText={buttonText}>
			<div className="my-8">
				<Input
					label={buyCrypto ? "Amount you'll receive" : 'Amount to buy'}
					prefix={
						<Prefix
							label={currency!.symbol}
							image={<Flag name={countries[currency.country_code]} size={24} />}
						/>
					}
					id="amountBuy"
					value={fiatAmount}
					onChangeNumber={(f) => onChangeFiat(f)}
					type="decimal"
					error={errors.fiatAmount}
				/>
				<Input
					label={buyCrypto ? 'Amount to sell' : "Amount you'll receive"}
					prefix={<Prefix label={token!.name} image={<Token token={token} size={24} />} />}
					id="amountToReceive"
					value={tokenAmount}
					onChangeNumber={(t) => onChangeToken(t)}
					type="decimal"
					decimalScale={token.decimals}
					error={errors.tokenAmount}
				/>
			</div>
		</StepLayout>
	);
};

export default Amount;
