import Footer from '../components/Footer'
import Header from '../components/Navbar'
import AllProducts from '../components/AllProductsSection'

function ProductsPage() {
  return (
    <div className='flex flex-col overflow-hidden '>
      <Header />
      <AllProducts />
      <Footer />
    </div>
  )
}

export default ProductsPage
