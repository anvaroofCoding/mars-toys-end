import { FormEvent, useEffect, useState } from 'react'
import { Image, Spin } from 'antd'
import noImage from "../assets/images/noImage.jpg"
import { ProductsType } from '../components/NewProducts'
const BASE_URL = import.meta.env.VITE_API_REQUEST
import { useLanguage } from '../Context/LanguageContext'
import InputMask from "react-input-mask";
import toast from 'react-hot-toast'
interface OrderItem {
  id: number;
  items: (ProductsType & { quantity: number,color: string })[];
  totalPrice: number;
  date: string;
}

interface SimpleOrderItem {
  product_id: number;
  quantity: number;
  color: string;
}

export interface LastOrderType {
  id?: string,
  is_paid?: boolean,
  status?: string,
  payment_method: string,
  product_items: SimpleOrderItem[]
}

const SaleInfo = () => {
  const access_token = localStorage.getItem("access_token");
  const { translations } = useLanguage();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isloading, setIsLoading] = useState<boolean>(false)

  // ✅ To‘lov turini saqlash
  const [paymentMethod, setPaymentMethod] = useState<"karta" | "naxt">("karta");

  const submitOrder = async (orderData: LastOrderType, accessToken: string) => {
    try {
      setIsLoading(true);

      const res = await fetch(`${BASE_URL}/shop/order-product/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // ✅ Agar karta bo‘lsa to‘lov sahifasiga yo‘naltiramiz
      if (orderData.payment_method === "karta") {
        window.location.replace(data.payment_link);
      } else {
        toast("Buyurtma muvaffaqiyatli qabul qilindi (naxt to‘lov).");
        window.location.href = "/";
      }

      // 🧹 LocalStorage tozalash
      localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("phone");
        localStorage.removeItem("address");
      localStorage.removeItem("basket");
      localStorage.removeItem("orders");
    } catch (error) {
      console.error("Order error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mahsulotlar localStoragedan olish
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      setOrders(parsedOrders);
      const total = parsedOrders.reduce((sum: number, order: OrderItem) => {
        return sum + order.totalPrice;
      }, 0);
      setTotalPrice(total);
    }
  }, []);

  // ✅ Userni update qilish funksiyasi
const updateUser = async (accessToken: string) => {
  try {
    const body = {
      first_name: localStorage.getItem("firstName"),
      last_name: localStorage.getItem("lastName"),
      phone: localStorage.getItem("phone"),
      address: localStorage.getItem("address"),
    };

    const res = await fetch(`${BASE_URL}/users/update/`, {
      method: "PUT", // yoki PUT agar serverda shunday bo‘lsa
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`User update error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Update user error:", error);
  }
};


  function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
    localStorage.setItem('firstName', firstName);
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
    localStorage.setItem('lastName', lastName);
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const address = (form.elements.namedItem('address') as HTMLInputElement).value;
    localStorage.setItem('address', address);
    const formattedPhone = phone.replace(/\D/g, ''); // Faqat raqamlarni olish
    localStorage.setItem('phone', formattedPhone);

    const simpleItems: SimpleOrderItem[] = orders.flatMap(order =>
      order.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        color: item.color,
      }))
    );

    const LastData: LastOrderType = {
      payment_method: paymentMethod, 
      product_items: simpleItems
    }

    if (access_token) {
  
  updateUser(access_token).then(() => {
    
    submitOrder(LastData, access_token);
  });
} else {
  window.location.href = '/login';
}

  }
if (isloading) {
  
    <div className="max-w-[1476px] w-full h-[40vh] mx-auto relative">
      <div className="absolute right-[50%] top-[20%]">
        <Spin size="large" className="scale-[5]" />
      </div>
    </div>
}
  return (
    <div>
  
    <div className="max-w-[1476px] w-full mx-auto py-6 sm:py-8 px-3 sm:px-4 relative">
      <div className="flex flex-col lg:flex-row gap-6 relative">
        {/* Form va productlar */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <form id="profileForm" onSubmit={handleProfileSubmit}>
              {/* Ism Familiya */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="space-y-2 flex-1">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    <p>{translations.saleInfo.formName}</p>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Ismingizni kiriting..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    <p>{translations.saleInfo.formSurname}</p>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Familiyangizni kiriting..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Telefon */}
              <div className="space-y-2 mb-6">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  <p>{translations.saleInfo.phoneNumber}</p>
                </label>
                <InputMask
                  mask="+998 (99) 999-99-99"
                  maskChar={null}
                  id="phone"
                  name="phone"
                  alwaysShowMask={true}
                  placeholder="+998 (__) ___-__-__"
                  beforeMaskedStateChange={(newState: any) => {
                    let { value } = newState;
                    if (!value.startsWith("+998")) {
                      value = "+998";
                    }
                    return { ...newState, value };
                  }}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 mb-6">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  <p>{translations.saleInfo.address}</p>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Shahar, ko'cha, uy..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* To‘lov turi */}
              <div className="w-full sm:w-[400px] space-y-2 mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  {translations.saleInfo.paymentMethod}
                </label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {/* Karta */}
                  <div
                    onClick={() => setPaymentMethod("karta")}
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all 
                      ${
                        paymentMethod === "karta"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.25 8.25h19.5M2.25 12h19.5m-16.5 3.75h4.5"
                      />
                    </svg>
                    <span className="font-medium">Karta</span>
                    {paymentMethod === "karta" && (
                      <span className="text-xs text-blue-600">Tanlandi</span>
                    )}
                  </div>

                  {/* Naxt */}
                  <div
                    onClick={() => setPaymentMethod("naxt")}
                    className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all 
                      ${
                        paymentMethod === "naxt"
                          ? "border-blue-600 bg-blue-50 shadow-md"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.5 0-2.75 1.25-2.75 2.75S10.5 13.5 12 13.5 14.75 12.25 14.75 10.75 13.5 8 12 8zM3 6h18M3 18h18"
                      />
                    </svg>
                    <span className="font-medium">Naxt</span>
                    {paymentMethod === "naxt" && (
                      <span className="text-xs text-blue-600">Tanlandi</span>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Mahsulotlar */}
          {orders.length > 0 &&
            orders[orders.length - 1].items?.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:space-x-4 space-y-3 sm:space-y-0">
                  <div className="flex-shrink-0 w-24 h-24 relative mx-auto sm:mx-0">
                    <Image
                      src={item.images?.[0]?.image || noImage}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-md font-medium text-gray-700">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {translations.saleInfo.productCount}: {item.quantity}{" "}
                      {translations.saleInfo.count}
                    </p>
                    <p className="text-sm text-gray-500">
                      {translations.basket.color}: {item.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {item.price} {translations.saleInfo.money}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3 ">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {translations.saleInfo.ordery}
              </h2>
            </div>
              <p className="mx-4 mt-4 space-y-4 text-gray-700 line-height-6 font-semibold whitespace-pre-line text-base sm:text-lg">
  {translations.saleInfo.subtitle}
</p>

            <div className="p-4">
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span>{translations.saleInfo.total}</span>
                    <span>
                      {totalPrice} {translations.saleInfo.money}
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  form="profileForm"
                  className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {translations.saleInfo.payment}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

</div>
  )
}

export default SaleInfo
