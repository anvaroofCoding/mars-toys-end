import { Route, Routes } from 'react-router-dom'
import { PATH } from '../hook/usePath'
import Home from '../pages/HomePage'
import AllProducts from '../pages/AllProductsPage'
import Basket from '../pages/BasketPage'
import Orders from '../pages/OrdersPage'
import SaleInfo from '../pages/SaleInfoPage'
import LoginPage from '../pages/LoginPage'
import OneProduct from '../pages/ProductDetailPage'

const ToysRoutes = () => {
  return (
    <Routes>
      <Route element={<Home />} path={PATH.home} />
      <Route element={<AllProducts />} path={PATH.allproducts} />
      <Route element={<Orders />} path={PATH.orders} />
      <Route element={<OneProduct />} path={`${PATH.product}/:id`} />
      <Route element={<Basket />} path={`${PATH.basket}`} />
      <Route element={<SaleInfo />} path={`${PATH.saleInfo}`} />
      <Route element={<LoginPage />} path={`${PATH.login}`} />
    </Routes>
  )
}

export default ToysRoutes
