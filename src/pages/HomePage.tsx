import Catalog from '../components/Catalog'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import Header from '../components/Navbar'
import NewProducts from '../components/NewProducts'

function Home() {
	return (
		<div className='flex flex-col overflow-hidden '>
			<Header />
			<main className='LandingHero'>
				<Hero />
				<NewProducts />
				<Catalog />
			</main>
			<Footer />
		</div>
	)
}

export default Home
