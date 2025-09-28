'use client'
import {
	Home,
	Instagram,
	Mail,
	Menu,
	MessageCircle,
	Package,
	Phone,
	ShoppingBag,
	ShoppingCart,
	User,
	X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import SiteLogo from '../assets/images/SiteLogo.svg'
import { useBasket } from '../Context/Context'
import { useLanguage } from '../Context/LanguageContext'
import { PATH } from '../hook/usePath'
import LanguageSwitcher from './LanguageSwitcher'

const BASE_URL = import.meta.env.VITE_API_REQUEST

interface UserProfile {
	id: number
	username: string
	first_name: string
	last_name: string
	address: string
	phone_number: string
}

const Header = () => {
	const [mobileMenu, setMobileMenu] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)
	const { translations } = useLanguage()
	const { shopCount } = useBasket()
	const [userData, setUserData] = useState<UserProfile | null>(null)
	const menuRef = useRef<HTMLDivElement>(null)
	const token = localStorage.getItem('access_token')

	const fetchProfile = async () => {
		if (!token) return
		try {
			const res = await fetch(`${BASE_URL}/users/profile/`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			})
			if (!res.ok) throw new Error(`Xatolik: ${res.status}`)
			const data: UserProfile = await res.json()
			setUserData(data)
			localStorage.setItem('userData', JSON.stringify(data))
		} catch (error) {
			console.error('User fetch error:', error)
			setUserData(null)
			localStorage.removeItem('userData')
		}
	}

	useEffect(() => {
		fetchProfile()
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMobileMenu(false)
			}
		}

		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}

		document.addEventListener('mousedown', handleClickOutside)
		window.addEventListener('scroll', handleScroll)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			window.removeEventListener('scroll', handleScroll)
		}
	}, [token])

	// Desktop link target
	const desktopLink = token && userData ? PATH.orders : PATH.login
	const desktopText =
		token && userData ? userData.last_name : translations.header.login

	// Mobile link target
	const mobileLink = token && userData ? PATH.orders : PATH.login
	const mobileText =
		token && userData ? userData.last_name : translations.header.login

	return (
		<>
			<header
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					isScrolled
						? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm'
						: 'bg-white/95 backdrop-blur-sm'
				}`}
			>
				{/* Main navigation */}
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between h-16 lg:h-20'>
						{/* Logo */}
						<Link
							to='/'
							className='flex-shrink-0 transition-transform hover:scale-105'
						>
							<img
								src={SiteLogo || '/placeholder.svg'}
								alt='SiteLogo'
								className='w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16'
							/>
						</Link>

						{/* Desktop Navigation */}
						<nav className='hidden lg:flex items-center space-x-8 xl:space-x-12'>
							<NavLink
								className={({ isActive }) =>
									`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
										isActive
											? 'text-blue-600'
											: 'text-gray-700 hover:text-gray-900'
									}`
								}
								to={PATH.home}
							>
								{translations.header.home}
								<span className='absolute inset-x-0 -bottom-px h-px bg-blue-600 scale-x-0 transition-transform duration-200 group-hover:scale-x-100' />
							</NavLink>
							<NavLink
								className={({ isActive }) =>
									`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
										isActive
											? 'text-blue-600'
											: 'text-gray-700 hover:text-gray-900'
									}`
								}
								to={PATH.allproducts}
							>
								{translations.header.allProducts}
							</NavLink>
							<NavLink
								className={({ isActive }) =>
									`relative px-3 py-2 text-sm font-medium transition-all duration-200 ${
										isActive
											? 'text-blue-600'
											: 'text-gray-700 hover:text-gray-900'
									}`
								}
								to={PATH.orders}
							>
								{translations.header.orders}
							</NavLink>
						</nav>

						{/* Right side actions */}
						<div className='flex items-center gap-3 lg:gap-4'>
							{/* Desktop user account */}
							<Link
								to={desktopLink}
								className='hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200'
							>
								<User size={16} />
								<span>{desktopText}</span>
							</Link>

							{/* Shopping bag */}
							<Link
								to={PATH.basket}
								className='relative p-2 hover:bg-gray-50 rounded-lg transition-colors'
							>
								<ShoppingBag size={20} className='text-gray-700' />
								{shopCount > 0 && (
									<span className='absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium'>
										{shopCount > 99 ? '99+' : shopCount}
									</span>
								)}
							</Link>

							{/* Desktop language switcher */}
							<div className='hidden lg:block'>
								<LanguageSwitcher />
							</div>

							{/* Mobile menu button */}
							<button
								className='lg:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors'
								onClick={() => setMobileMenu(!mobileMenu)}
								aria-label='Toggle menu'
							>
								{mobileMenu ? (
									<X size={24} className='text-gray-700' />
								) : (
									<Menu size={24} className='text-gray-700' />
								)}
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Mobile menu overlay */}
			{mobileMenu && (
				<div className='fixed inset-0 z-40 lg:hidden'>
					<div
						className='fixed inset-0 bg-black/20 backdrop-blur-sm'
						onClick={() => setMobileMenu(false)}
					/>
					<div
						ref={menuRef}
						className='fixed top-16 right-4 left-4 bg-white rounded-2xl shadow-2xl border border-gray-200/50 max-w-sm mx-auto animate-in slide-in-from-top-2 duration-200'
					>
						<div className='p-6'>
							{/* Mobile navigation */}
							<nav className='space-y-1 mb-2'>
								<NavLink
									className={({ isActive }) =>
										`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
											isActive
												? 'bg-blue-50 text-blue-600'
												: 'text-gray-700 hover:bg-gray-50'
										}`
									}
									to={PATH.home}
									onClick={() => setMobileMenu(false)}
								>
									<Home size={20} />
									{translations.header.home}
								</NavLink>
								<NavLink
									className={({ isActive }) =>
										`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
											isActive
												? 'bg-blue-50 text-blue-600'
												: 'text-gray-700 hover:bg-gray-50'
										}`
									}
									to={PATH.allproducts}
									onClick={() => setMobileMenu(false)}
								>
									<Package size={20} />
									{translations.header.catalog}
								</NavLink>
								<NavLink
									className={({ isActive }) =>
										`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
											isActive
												? 'bg-blue-50 text-blue-600'
												: 'text-gray-700 hover:bg-gray-50'
										}`
									}
									to={PATH.orders}
									onClick={() => setMobileMenu(false)}
								>
									<ShoppingCart size={20} />
									{translations.header.myOrders}
								</NavLink>
							</nav>

							{/* Contact info */}
							<div className='space-y-3 mb-6 p-4 bg-gray-50 rounded-xl'>
								<h3 className='text-sm font-semibold text-gray-900 mb-2'>
									Contact Us
								</h3>
								<Link
									className='flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors'
									to='tel:+998939087085'
								>
									<Phone size={16} />
									<span className='text-sm'>+998 (93) 908-70-85</span>
								</Link>
								<Link
									className='flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors'
									to='mailto:marstoys@gmail.com'
								>
									<Mail size={16} />
									<span className='text-sm'>marstoys@gmail.com</span>
								</Link>
								<div className='flex items-center gap-4 pt-2'>
									<Link
										to='https://www.instagram.com/marstoys01/'
										className='text-gray-600 hover:text-pink-600 transition-colors'
									>
										<Instagram size={20} />
									</Link>
									<Link
										to='https://t.me/sardorigrushki'
										className='text-gray-600 hover:text-blue-500 transition-colors'
									>
										<MessageCircle size={20} />
									</Link>
								</div>
							</div>

							{/* User account and language */}
							<div className='space-y-3 pt-1 border-t border-gray-200'>
								<Link
									to={mobileLink}
									onClick={() => setMobileMenu(false)}
									className='flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors'
								>
									<User size={20} className='text-blue-600' />
									<span className='text-blue-600 font-medium'>
										{mobileText}
									</span>
								</Link>
								<div className='px-4'>
									<LanguageSwitcher />
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default Header
