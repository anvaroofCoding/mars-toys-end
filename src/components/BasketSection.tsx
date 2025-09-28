import { useNavigate } from 'react-router-dom'
import {  ProductsType } from '../components/NewProducts'
import { Button, Empty,  InputNumber } from 'antd'
import {  ShoppingOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { PATH } from '../hook/usePath'
import { useBasket } from '../Context/Context'
import noImage from "../assets/images/noImage.jpg"
import toast, { Toaster } from 'react-hot-toast'
import { useLanguage } from '../Context/LanguageContext'
import { useEffect } from 'react'
interface Order {
  id: number;
  items: ProductsType[];
  totalPrice: number;
  date: string;
}



const Basket = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate()
  const {  basketItems, removeFromBasket, updateQuantity, basketCount } = useBasket()
  

useEffect(() => {
    localStorage.removeItem("orders");
    }, []);


  function handleRemoveFromBasket(productId: number) {
    removeFromBasket(productId);
    toast.success(translations.basket.deleteButton);
  }

  function handleUpdateQuantity(productId: number, newQuantity: number) {
    updateQuantity(productId, newQuantity);
    toast.success(translations.basket.count);
  }

  function calculateTotal() {
    return basketItems.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseInt(item.price) : item.price;
      return total + (price * item.quantity);
    }, 0);
  }

  function handlePlaceOrder() {
    if (basketItems.length === 0 || basketItems.some(item => item.quantity <= 0)) {
      toast.error(translations.basket.noProductSelected);
      return;
    }
    const order: Order = {
      id: Date.now(),
      items: basketItems,
      totalPrice: calculateTotal(),
      date: new Date().toISOString()
    };
    const existingOrders = localStorage.getItem('orders');
    const orders = existingOrders ? JSON.parse(existingOrders) : [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    toast.success("Buyurtma muvaffaqiyatli qabul qilindi");
    localStorage.setItem("last_page", PATH.saleInfo);
    navigate(PATH.saleInfo);
  }



  return (
  <div className="min-h-screen bg-gray-50">
    <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-auto px-4 py-10 flex flex-col gap-6">
        <div className="flex justify-between flex-wrap gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg"
          >
            <ArrowLeftOutlined />
            {translations.basket.backtoButton}
          </button>
          <button
            onClick={() => (localStorage.setItem("last_page", PATH.allproducts), navigate(PATH.allproducts))}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-lg"
          >
            <ShoppingOutlined />
            {translations.basket.backtoSale}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center">
          {translations.basket.saleTitle}
        </h1>

        {basketCount > 0 ? (
          <div className="flex flex-col gap-4">
            {basketItems.map(item => (
              <div
                key={`basket-item-${item.id}`}
                className="flex flex-col lg:flex-row justify-between items-start bg-white shadow-lg rounded-lg p-4 gap-4"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={item.images?.[0]?.image || noImage}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-gray-700">
                      {new Intl.NumberFormat("uz-UZ").format(Number(item.price))}{" "}
                      {translations.basket.sum}
                    </p>
                    <p className="text-gray-500">
                      {translations.basket.count}: {item.quantity} {translations.order.count}
                    </p>
                    <p className="text-gray-500">
                      {translations.basket.color}: {item.color} 
                    </p>
                    <p className="text-gray-700 font-medium">
                      {translations.basket.total}:{" "}
                      <span className="text-pink-500">
                        {(typeof item.price === "string" ? parseInt(item.price) : item.price) *
                          item.quantity}{" "}
                        {translations.basket.sum}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center mt-2 lg:mt-0">
                  <InputNumber
                    min={1}
                    value={item.quantity}
                    onChange={value => handleUpdateQuantity(item.id, value || 1)}
                    className="w-20"
                  />
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFromBasket(item.id)}
                    className="!bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-none"
                  >
                    {translations.basket.deleteButton}
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex flex-col lg:flex-row justify-between items-center bg-white shadow-xl rounded-lg p-4 gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {translations.basket.total}:{" "}
                  <span className="text-pink-500">
                    {calculateTotal()} {translations.basket.sum}
                  </span>
                </h2>
                <p className="text-gray-500">
                  {translations.basket.total} {basketCount} {translations.basket.totalProduct}
                </p>
              </div>
              <Button
                type="primary"
                size="large"
                onClick={handlePlaceOrder}
                className="!bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 border-none"
              >
                {translations.basket.toOrder}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Empty
              description={translations.basket.noProductSelected}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    

  </div>
);

}

export default Basket