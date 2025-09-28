import Footer from '../components/Footer'
import Header from '../components/Navbar'
import Basket from '../components/BasketSection'

function BasketPage() {
  return (
    <div className='flex flex-col overflow-hidden '>
      <Header />
      <Basket />
      <Footer />
    </div>
  )
}

export default BasketPage
