import Footer from '../components/Footer'
import Header from '../components/Navbar'
import Orders from '../components/OrdersSection'

function Home() {
  return (
    <div className='flex flex-col overflow-hidden '>
      <Header />
      <Orders />
      <Footer />
    </div>
  )
}

export default Home
