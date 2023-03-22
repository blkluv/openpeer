import Button from 'components/Button/Button';
import StepLayout from 'components/Listing/StepLayout';
import HeaderH2 from 'components/SectionHeading/h2';
import Image from 'next/image';
import { useAccount } from 'wagmi';

import { ClockIcon } from '@heroicons/react/24/outline';

import { BuyStepProps } from './Buy.types';
import CancelOrderButton from './CancelOrderButton/CancelOrderButton';
import ClipboardText from './ClipboardText';
import EscrowButton from './EscrowButton';
import MarkAsPaidButton from './MarkAsPaidButton';
import FeeDisplay from './Payment/FeeDisplay';
import PreShowDetails from './PreShowDetails';
import ReleaseFundsButton from './ReleaseFundsButton';

const Payment = ({ order }: BuyStepProps) => {
	const { list, fiat_amount: fiatAmount, token_amount: tokenAmount, price, uuid, buyer, escrow, id, status } = order;
	const { token, fiat_currency: currency, payment_method: paymentMethod } = list!;
	const { bank, values = {} } = paymentMethod;
	const { address } = useAccount();
	const seller = list?.seller.address === address;

	return (
		<StepLayout>
			<div className="my-8">
				{status === 'created' && (
					<div>
						<span className="flex flex-row mb-2 text-yellow-600">
							<ClockIcon className="w-8 mr-2" />
							<HeaderH2 title="Awaiting Merchant Deposit" />
						</span>
						<p className="text-base">
							{seller
								? 'Please deposit funds to escrow in order to confirm and complete this transaction.'
								: 'Kindly wait for the merchant to accept the order and escrow their funds. Payments details will become visible as soon as merchant escrow the funds. '}
						</p>
					</div>
				)}
				{status === 'escrowed' && (
					<div>
						<span className={`flex flex-row mb-2 ${!!seller && 'text-yellow-600'}`}>
							<HeaderH2 title={seller ? 'Awaiting Buyer Payment' : 'Pay Merchant'} />
						</span>
						<p className="text-base">
							{seller
								? 'Kindly wait for the buyer to pay. If the buyer already paid you can release the funds. Be careful.'
								: 'Proceed to your bank app or payment platform and send the required amount to the bank account details below.'}
						</p>
					</div>
				)}
				<div className="flex flex-row justify-around bg-gray-100 rounded-lg p-6 my-4">
					<div className="flex flex-col">
						<span className="text-sm">Amount to pay</span>
						<span className="text-lg font-medium">
							{seller
								? `${Number(tokenAmount)?.toFixed(2)} ${token.symbol}`
								: `${currency.symbol} ${Number(fiatAmount).toFixed(2)}`}
						</span>
					</div>
					{seller && <FeeDisplay escrow={escrow?.address} token={token} tokenAmount={tokenAmount} />}
					<div className="flex flex-col">
						<span className="text-sm">Price</span>
						<span className="text-lg font-medium">
							{currency.symbol} {Number(price).toFixed(2)}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm">Amount to receive</span>
						<span className="text-lg font-medium">
							{seller
								? `${currency.symbol} ${Number(fiatAmount).toFixed(2)}`
								: `${Number(tokenAmount)?.toFixed(2)} ${token.symbol}`}
						</span>
					</div>
				</div>
				{status === 'escrowed' && (
					<div className="w-full bg-white rounded-lg border border-color-gray-100 p-6">
						<div className="flex flex-row justify-between mb-4">
							<span className="text-neutral-500">Payment Method</span>
							<span className="flex flex-row justify-between">
								<Image
									src={bank.icon}
									alt={bank.name}
									className="h-6 w-6 flex-shrink-0 rounded-full mr-1"
									width={24}
									height={24}
								/>
								<ClipboardText itemValue={bank.name} />
							</span>
						</div>

						{Object.keys(values || {}).map((key) => {
							const {
								bank: { account_info_schema: schema }
							} = paymentMethod;
							const field = schema.find(({ id }) => id === key);
							const value = (values || {})[key];
							if (!value) return <></>;

							return (
								<div className="flex flex-row justify-between mb-4" key={key}>
									<span className="text-neutral-500">{field?.label}</span>
									<ClipboardText itemValue={value} />
								</div>
							);
						})}
						<div className="flex flex-row justify-between">
							<span className="text-neutral-500">Reference No.</span>
							<span className="flex flex-row justify-between">
								<ClipboardText itemValue={String(Number(id) * 10000)} />
							</span>
						</div>
						<div className="border-b-2 border-dashed border-color-gray-400 mb-4 hidden"></div>
						<div className="flex flex-row justify-between hidden">
							<span className="text-neutral-500">Payment will expire in </span>
							<span className="flex flex-row justify-between">
								<span className="text-cyan-600">15m:20secs</span>
							</span>
						</div>
					</div>
				)}

				<PreShowDetails />

				<div className="flex flex-col flex-col-reverse md:flex-row items-center justify-between mt-8 md:mt-0">
					<span className="w-full md:w-1/2 md:pr-8">
						<CancelOrderButton order={order} />
					</span>
					{status === 'created' && seller && (
						<EscrowButton
							buyer={buyer!.address}
							token={token}
							tokenAmount={tokenAmount || 0}
							uuid={uuid!}
						/>
					)}
					{status === 'escrowed' &&
						!!escrow &&
						(seller ? (
							<ReleaseFundsButton escrow={escrow.address} dispute={false} />
						) : (
							<MarkAsPaidButton escrowAddress={escrow.address} />
						))}
				</div>
			</div>
		</StepLayout>
	);
};

export default Payment;
