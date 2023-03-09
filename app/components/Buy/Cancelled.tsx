import Button from 'components/Button/Button';
import StepLayout from 'components/Listing/StepLayout';
import HeaderH2 from 'components/SectionHeading/h2';
import { useRouter } from 'next/router';
import { smallWalletAddress } from 'utils';
import { useAccount } from 'wagmi';

import { XCircleIcon } from '@heroicons/react/24/outline';

import { BuyStepProps } from './Buy.types';

const Cancelled = ({ order }: BuyStepProps) => {
	const { list, token_amount: tokenAmount, buyer, fiat_amount: fiatAmount, cancelled_at: cancelledAt } = order;
	const { token, seller, fiat_currency: currency } = list!;
	const { address } = useAccount();
	const selling = seller.address === address;
	const router = useRouter();

	const tokenValue = `${tokenAmount} ${token.symbol}`;

	return (
		<StepLayout>
			<div className="my-8">
				<div className="mb-4">
					<span className="flex flex-row text-red-600 mb-2">
						<XCircleIcon className="w-8 mr-2" />
						<HeaderH2 title="Order Cancelled" />
					</span>
					<p className="text-base">
						{selling
							? `Your sale of ${tokenValue} to ${buyer?.name || buyer?.address} has been cancelled.`
							: `Your purchase of ${tokenValue} from ${
									seller?.name || smallWalletAddress(seller.address)
							  } has been cancelled.`}
					</p>
					<p className="text-base">Cancelled at: {new Date(cancelledAt).toLocaleString()}</p>
				</div>

				<div className="border-b border-gray-200 my-4"></div>

				<div className="flex flex-col flex-col-reverse md:flex-row items-center justify-between mt-8 md:mt-0">
					<span className="w-full">
						<Button title="Back to Listings" onClick={() => router.push('/')} />
					</span>
				</div>
			</div>
		</StepLayout>
	);
};

export default Cancelled;