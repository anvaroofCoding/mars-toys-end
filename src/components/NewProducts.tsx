import { Button } from 'antd'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingCart, Tag } from 'lucide-react'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import noImage from '../assets/images/noImage.jpg'
import { useLanguage } from '../Context/LanguageContext'
import { PATH } from '../hook/usePath'

export interface ProductsType {
	id: number
	name: string
	price: string
	discounted_price: string
	quantity: number
	discount: number
	category: string
	average_rating: number
	images: ImagesType[]
	sold_count: number
	description: string
}
export interface ImagesType {
	id: number
	image: string
	color: string
}

export interface CommentType {
	id: number
	first_name: string
	text: string
	created_at: string
	rating: number
}

const NewProducts = () => {
	const BASE_URL = import.meta.env.VITE_API_REQUEST
	const navigate = useNavigate()
	const { translations } = useLanguage()
	const { language } = useLanguage()
	const [products, setProducts] = React.useState<ProductsType[]>([])

	useEffect(() => {
		const fetchNewProducts = async () => {
			try {
				const langParam = language === 'uz' ? '' : `?lang=${language}`
				const res = await fetch(`${BASE_URL}/shop/new-products/${langParam}`)
				if (!res.ok) throw new Error(`Xatolik: ${res.status}`)
				const data: ProductsType[] = await res.json()
				setProducts(data)
			} catch (err) {
				console.error('New products fetch error:', err)
				setProducts([])
			}
		}
		fetchNewProducts()
	}, [language])

	const handleProductClick = (item: ProductsType) => {
		navigate(`${PATH.product}/${item.id}`)
	}

	if (!products || products.length === 0) return null

	return (
		<div className='max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-[#fdfdfd] via-[#f8f9fb] to-[#f1f3f6]'>
			<motion.h2
				initial={{ opacity: 0, y: -20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
				className='text-center font-semibold tracking-tight text-3xl sm:text-4xl lg:text-[42px] mb-5 sm:mb-12 text-gray-900'
			>
				{translations.newProducts.title}
			</motion.h2>

			<ul className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6'>
				{products.map(item => (
					<motion.li
						key={item.id}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						whileHover={{ scale: 1.03, y: -4 }}
						transition={{ duration: 0.3 }}
						viewport={{ once: true }}
						onClick={() => handleProductClick(item)}
						className='bg-white border border-gray-100 shadow-sm hover:shadow-lg cursor-pointer rounded-2xl overflow-hidden flex flex-col duration-300'
					>
						<img
							className='w-full h-[180px] sm:h-[210px] lg:h-[240px] object-cover'
							src={item.images?.[0]?.image || noImage}
							alt={item.name || 'Product Image'}
						/>
						<div className='px-4 sm:px-6 py-4 sm:py-5 flex-1 flex flex-col justify-between'>
							<div>
								{/* Kategoriya */}
								{item.category && (
									<p className='flex items-center gap-1 text-xs sm:text-sm text-gray-500 mb-1'>
										<Tag className='w-4 h-4' /> {item.category}
									</p>
								)}

								<h3 className='font-medium text-[16px] sm:text-[19px] lg:text-[21px] mb-1 line-clamp-2 text-gray-900'>
									{item.name}
								</h3>

								<div className='flex items-center gap-2 flex-wrap'>
									<p className='font-semibold text-base sm:text-lg lg:text-[20px] text-gray-800'>
										{new Intl.NumberFormat('uz-UZ').format(
											Number(item.discounted_price)
										)}
										&nbsp;so‘m
									</p>
									{item.discount > 0 && (
										<del className='text-gray-400 text-sm sm:text-base'>
											{new Intl.NumberFormat('uz-UZ').format(
												Number(item.price)
											)}
										</del>
									)}
								</div>
							</div>

							<Button className='mt-4 w-full py-2 sm:py-3 lg:py-[15px] rounded-xl text-white font-medium text-sm sm:text-[15px] lg:text-[17px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-colors flex items-center justify-center gap-2'>
								{translations.newProducts.buyText}{' '}
								<ShoppingCart className='w-5 h-5' />
							</Button>
						</div>
					</motion.li>
				))}
			</ul>

			<div className='flex justify-center mt-10'>
				<Button
					onClick={() => navigate(PATH.allproducts)}
					className='w-[180px] sm:w-[200px] rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center gap-2'
					size='large'
				>
					{translations.newProducts.allProductsButtonTxt}{' '}
					<ArrowRight className='w-5 h-5' />
				</Button>
			</div>
		</div>
	)
}

export default NewProducts
