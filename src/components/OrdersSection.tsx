import { useEffect, useState } from 'react'
import { Spin } from 'antd'
const BASE_URL = import.meta.env.VITE_API_REQUEST
import { useLanguage } from '../Context/LanguageContext'
import { useNavigate } from 'react-router-dom';
import { PATH } from '../hook/usePath'

interface OrderItemType {
  item_id: number
  product_id: number
  product_name: string
  price: number
  quantity: number
  image?: string[]
  color: string
}

interface LastOrderType {
  order_id: number
  status: string
  payment_method: string
  is_paid: boolean
  items: OrderItemType[]
}

const Orders = () => {
  const token = localStorage.getItem('access_token')
  const [isActive, setIsActive] = useState(false)
  const [isloading, setIsLoading] = useState(false)
  const [orders, setOrders] = useState<LastOrderType[]>([])
  const { translations, language } = useLanguage()
  const navigate = useNavigate();

  // Status mapping
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Kutilmoqda', color: '#52EA17' },
    delivering: { label: 'Yetkazilmoqda', color: '#FFC107' },
    delivered: { label: 'Yetkazib berildi', color: '#1E40AF' },
    cancelled: { label: 'Bekor qilindi', color: '#EF4444' }
  }

  useEffect(() => {
    if (!token) return
    setIsLoading(true)
    const langQuery = language === 'uz' ? '' : `?lang=${language}`

    fetch(`${BASE_URL}/shop/order-history/${langQuery}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return await res.json()
      })
      .then((data: LastOrderType[]) => {
        setOrders(data)
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }, [token, language])

  const filteredOrders = isActive
    ? orders.filter((o) => o.status === 'pending')
    : orders
  if (isloading){
    return (
      <div className='w-[700px] h-[40vh] mx-auto my-20 relative lg:block'>
        <div className='absolute right-[50%] top-[20%]'>
          <Spin size='large' className='scale-[2]' />
        </div>
      </div>
    )
  }
  return (
    <div>
       
        <div className='max-w-[1000px] mx-auto lg:block'>
          <div className='mt-[40px] flex items-center gap-[30px] px-2'>
            <button
              onClick={() => setIsActive(false)}
              className={`w-[220px] py-[8px] font-regular text-[22px] rounded-[20px] ${
                isActive ? 'bg-[#EEEEEE] text-[#3E3E3E]' : 'bg-black text-white'
              }`}
            >
              {translations.order.allOrder}
            </button>
            <button
              onClick={() => setIsActive(true)}
              className={`w-[140px] py-[8px] font-regular text-[22px] rounded-[20px] ${
                isActive ? 'bg-black text-white' : 'bg-[#EEEEEE] text-[#3E3E3E]'
              }`}
            >
              {translations.order.active}
            </button>
          </div>

          {filteredOrders.length === 0 ? null : (
            <ul className='w-full mt-[15px] flex flex-col gap-[30px] px-2'>
              {filteredOrders.map((order) => {
                const totalPrice = order.items.reduce(
                  (acc, item) => acc + item.price * item.quantity,
                  0
                )

                const statusInfo = statusMap[order.status] || { label: order.status, color: '#3E3E3E' }

                return (
                  <li
                    key={order.order_id}
                    className='w-full border-[1px] border-[#D9D9D9] rounded-[18px]'
                  >
                    <div className='w-full border-b-[1px] border-[#D9D9D9] py-[10px] flex flex-col px-[15px]'>
                      <div className='flex items-center gap-[10px]'>
                        <span className='font-regular text-[18px] text-[#3E3E3E]'>
                          {translations.order.status}:
                        </span>
                        <strong
                          className='font-medium text-[18px]'
                          style={{ color: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </strong>
                      </div>
                      <div className='flex items-center gap-[10px] mt-1'>
                        <span className='font-regular text-[18px] text-[#3E3E3E]'>
                          {translations.saleInfo.paymentMethod}:
                        </span>
                        <strong className='font-medium text-[18px] text-gray-700'>
                          {order.payment_method}
                        </strong>
                      </div>
                      <div className='flex items-center gap-[10px] mt-1'>
                        <span className='font-regular text-[18px] text-[#3E3E3E]'>
                          {translations.order.totalPrice}:
                        </span>
                        <strong className='font-medium text-[18px] text-gray-700'>
                          {totalPrice} {translations.basket.sum}
                        </strong>
                      </div>
                    </div>

                    {order.items.length > 0 && (
                      <ul className='flex flex-col gap-[20px] p-4'>
                        {order.items.map((item) => (
                          <li
                            key={item.item_id}
                            className='w-full flex items-center gap-4 border-[1px] p-3 rounded-lg cursor-pointer hover:shadow-lg'
                             onClick={() => navigate(`${PATH.product}/${item.product_id}`)}
                          >
                            {item.image?.[0] && (
                              <img
                                src={item.image[0]}
                                alt={item.product_name}
                                className='w-[120px] h-[90px] object-cover rounded-lg'
                              />
                            )}
                            <div className='flex flex-col gap-1'>
                              <p className='text-gray-700 font-medium'>{item.product_name}</p>
                              <p className='text-gray-700'>
                                {translations.order.price}: {item.price}
                              </p>
                              <p className='text-gray-700'>
                                {translations.order.quantity}: {item.quantity}{' '}
                                {translations.order.count}
                              </p>
                              <p className='text-gray-700'>
                                {translations.basket.color}: {item.color}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      
    </div>
  )
}

export default Orders
