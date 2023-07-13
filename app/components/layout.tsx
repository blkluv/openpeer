import type { AppProps } from 'next/app';

import 'react-toastify/dist/ReactToastify.css';

import { ConnectKitButton, useModal, useSIWE } from 'connectkit';
import Image from 'next/image';
import Link from 'next/link';
import OpenpeerAirdrop from 'public/airdrop/openpeerAirdrop.svg';
import logo from 'public/logo.svg';
import React, { Fragment, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useAccount } from 'wagmi';

import { Dialog, Menu, Transition } from '@headlessui/react';
import {
	ChartBarSquareIcon,
	PencilIcon,
	PlusCircleIcon,
	ShoppingBagIcon,
	XMarkIcon
} from '@heroicons/react/24/outline';
import { Manrope } from '@next/font/google';

import Button from './Button/Button';
import { CollapseButton } from './Navigation';
import Notifications from './Notifications/Notifications';

const manrope = Manrope({
	subsets: ['latin'],
	variable: '--font-manrope'
});

const AirdropIcon = () => (
	<Image
		src={OpenpeerAirdrop}
		alt="openpeer logo"
		className="text-gray-400 group-hover:text-gray-300 flex-shrink-0 h-6 w-6 mr-2"
	/>
);

const navigation = [
	{ name: 'Trade P2P', href: '/trade', icon: ChartBarSquareIcon },
	{ name: 'Post Ad', href: '/sell', icon: PlusCircleIcon },
	{ name: 'My Ads', href: '/ads', icon: PencilIcon },
	{ name: 'My Trades', href: '/orders', icon: ShoppingBagIcon },
	{ name: 'Airdrop', href: '/airdrop', icon: AirdropIcon }
];

const NavItems = ({ selected, onClick }: { selected: string | undefined; onClick?: () => void }) => (
	<div>
		{navigation.map((item) => (
			<Link
				key={item.name}
				href={item.href}
				className={`${
					selected === item.name ? 'bg-gray-700' : ''
				} text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-4 py-8 text-base font-medium`}
				onClick={onClick}
			>
				<item.icon
					className="text-gray-400 group-hover:text-gray-300 flex-shrink-0 h-6 w-6 mr-2"
					aria-hidden="true"
				/>
				{item.name}
			</Link>
		))}
	</div>
);

const Unauthenticated = () => {
	const { openSIWE } = useModal();
	return (
		<div className="flex h-screen">
			<div className="px-6 m-auto flex flex-col justify-items-center content-center text-center">
				<span className="mb-6 text-xl">You are not signed in to OpenPeer.</span>
				<span className="mb-6 text-gray-500 text-xl">Sign In With your wallet to continue.</span>
				<span className="mb-4 m-auto">
					<Button title="Sign in" onClick={() => openSIWE(true)} />
				</span>
			</div>
		</div>
	);
};

const Layout = ({ Component, pageProps }: AppProps) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { title } = pageProps;
	const { address, isConnected } = useAccount();
	const { data, isSignedIn } = useSIWE();
	console.log('session', data);
	const authenticated = isSignedIn && isConnected && data.address === address;

	return (
		<div className={`${manrope.variable} font-sans`}>
			<div>
				<Transition.Root show={sidebarOpen} as={Fragment}>
					<Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
						<Transition.Child
							as={Fragment}
							enter="transition-opacity ease-linear duration-300"
							enterFrom="opacity-0"
							enterTo="opacity-100"
							leave="transition-opacity ease-linear duration-300"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
						</Transition.Child>

						<div className="fixed inset-0 z-40 flex">
							<Transition.Child
								as={Fragment}
								enter="transition ease-in-out duration-300 transform"
								enterFrom="-translate-x-full"
								enterTo="translate-x-0"
								leave="transition ease-in-out duration-300 transform"
								leaveFrom="translate-x-0"
								leaveTo="-translate-x-full"
							>
								<Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-black pt-5 pb-4">
									<Transition.Child
										as={Fragment}
										enter="ease-in-out duration-300"
										enterFrom="opacity-0"
										enterTo="opacity-100"
										leave="ease-in-out duration-300"
										leaveFrom="opacity-100"
										leaveTo="opacity-0"
									>
										<div className="absolute top-0 right-0 -mr-12 pt-2">
											<button
												type="button"
												className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
												onClick={() => setSidebarOpen(false)}
											>
												<span className="sr-only">Close sidebar</span>
												<XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
											</button>
										</div>
									</Transition.Child>
									<div className="flex flex-shrink-0 items-center px-4">
										<Link href="/">
											<Image src={logo} alt="openpeer logo" className="w-40" />
										</Link>
									</div>
									<div className="mt-5 h-0 flex-1 overflow-y-auto">
										<nav className="space-y-1">
											<NavItems selected={title} onClick={() => setSidebarOpen(false)} />
										</nav>
									</div>
								</Dialog.Panel>
							</Transition.Child>
							<div className="w-14 flex-shrink-0" aria-hidden="true">
								{/* Dummy element to force sidebar to shrink to fit close icon */}
							</div>
						</div>
					</Dialog>
				</Transition.Root>

				{/* Static sidebar for desktop */}
				<div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
					{/* Sidebar component, swap this element with another sidebar if you like */}
					<div className="flex min-h-0 flex-1 flex-col bg-black">
						<div className="flex h-16 flex-shrink-0 items-center px-4">
							<Link href="/">
								<Image src={logo} alt="openpeer logo" className="w-48" />
							</Link>
						</div>
						<div className="flex flex-1 flex-col overflow-y-auto">
							<nav className="flex-1 space-y-1 py-4">
								<NavItems selected={title} onClick={() => setSidebarOpen(false)} />
							</nav>
						</div>
					</div>
				</div>
				<div className="flex flex-col lg:pl-64">
					<div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
						<CollapseButton open={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)} />
						<div className="w-full flex items-center justify-between px-4">
							<h3 className="text-xl font-bold sm:px-6 md:px-4">{title}</h3>
							<div className="ml-4 flex items-center md:ml-6">
								{/* Notifications */}
								<Notifications />

								{/* Profile dropdown */}
								<Menu as="div" className="relative">
									<div className="flex flex-row items-center">
										{!!address && (
											<Link
												className="pr-4 pl-2 text-gray-400 hover:text-gray-500 w-14"
												href={`/${address}`}
											>
												{/* <Avatar user={user} className="w-full" /> @TODO: Marcos */}
											</Link>
										)}
										<ConnectKitButton />
									</div>
								</Menu>
							</div>
						</div>
					</div>

					<main className="flex-1 min-h-screen">
						{authenticated ? <Component {...pageProps} /> : <Unauthenticated />}
					</main>
				</div>
			</div>
			<ToastContainer />
		</div>
	);
};

export default Layout;
