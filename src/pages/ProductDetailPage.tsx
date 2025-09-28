import Footer from '../components/Footer'
import Header from '../components/Navbar'
import Product from '../components/ProductDetailSection'

function ProductsPage() {
  return (
    <div className='flex flex-col overflow-hidden '>
      <Header />
      <Product />
      <Footer />
    </div>
  )
}

export default ProductsPage
