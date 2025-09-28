import Footer from '../components/Footer'
import Header from '../components/Navbar'
import SaleInfo from '../components/SaleInfoSection'

function SaleInfoPage() {
  return (
    <div className='flex flex-col overflow-hidden '>
      <Header />
      <SaleInfo />
      <Footer />
    </div>
  )
}

export default SaleInfoPage
