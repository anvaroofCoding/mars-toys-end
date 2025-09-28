import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
const BASE_URL = import.meta.env.VITE_API_REQUEST
import { CommentType, ProductsType } from '../components/NewProducts'
import { Button, Modal } from 'antd'
import { StarFilled, ShoppingOutlined, CommentOutlined ,LeftOutlined,RightOutlined} from '@ant-design/icons'
import { PATH } from '../hook/usePath'
import { useBasket } from '../Context/Context'
import toast, { Toaster } from 'react-hot-toast'
import { useLanguage } from '../Context/LanguageContext'
import { Rate } from 'antd'
import { useSwipeable } from "react-swipeable";

// comment uchun type
interface RatingCommentType {
  product_id?: number | string
  comment?: string
  rating?: number
}

// ranglar bo‘yicha rasmlarni guruhlash
function groupImagesByColor(images: { id: number; image: string; color: string }[]) {
  const map = new Map<string, { id: number; image: string; color: string }[]>()
  images.forEach((img) => {
    if (!map.has(img.color)) {
      map.set(img.color, [])
    }
    map.get(img.color)!.push(img)
  })
  return map
}

const ProductDetail = () => {
  const { id } = useParams()
  const { translations, language } = useLanguage()
  const [product, setProduct] = useState<ProductsType>()
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState<number>(1)
  const navigate = useNavigate()
  const { addToBasket } = useBasket()
  const [commentList, setCommentList] = useState<CommentType[] | undefined>(undefined)
  const [commentModal, setCommentModal] = useState<boolean>(false)
  const [like, setLike] = useState<number>(0)
  const token = localStorage.getItem('access_token')

  // comment fetch
  const fetchComments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/shop/product-comments/${id}/`)
      if (!res.ok) throw new Error(`Xatolik: ${res.status}`)
      const data: CommentType[] = await res.json()
      setCommentList(data)
    } catch (error) {
      console.error('Comments fetch error:', error)
    }
  }

  // product fetch
  const langParam = language === 'uz' ? '' : `&lang=${language}`
  const fetchProduct = async () => {
    try {
      const res = await fetch(`${BASE_URL}/shop/product-details/?product_id=${id}${langParam}`)
      if (!res.ok) throw new Error(`Xatolik: ${res.status}`)
      const data: ProductsType = await res.json()
      setProduct(data)

      // birinchi rangni avtomatik tanlash
      if (data.images && data.images.length > 0) {
        const grouped = groupImagesByColor(data.images)
        const firstColor = Array.from(grouped.keys())[0]
        setActiveColor(firstColor)
        setSelectedImageIndex(0)
      }
    } catch (error) {
      console.error('Product fetch error:', error)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchComments()
    fetchProduct()
  }, [id, language])

  // savatga qo‘shish
  function handleAddToBasket() {
    if (product && activeColor) {
      addToBasket(product, quantity, activeColor)
      toast.success(translations.basket.addToCart)
      localStorage.setItem('last_page', PATH.basket)
      navigate(PATH.basket)
    }
  }

  // comment submit
  async function handleCommentSubmitDesktop() {
    const commentInput = document.getElementById('commentFormDesktopInput') as HTMLInputElement
    const comment = commentInput?.value || ''

    const data: RatingCommentType = {
      product_id: id,
      comment,
      rating: like || 0,
    }
    if (!token) {
      navigate(PATH.login)
      toast.error('Iltimos, komment qoldirish uchun tizimga kiring!')
      return
    }
    try {
      const res = await fetch(`${BASE_URL}/shop/comment-create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)

      toast.success('Komment muvaffaqiyatli yuborildi!')
      fetchProduct()
      fetchComments()
      setCommentModal(false)
    } catch (error) {
      console.error('Comment submit error:', error)
      toast.error('Komment yuborishda xatolik!')
    }
  }

  
  const grouped = groupImagesByColor(product?.images || [])
  const activeImages = activeColor ? grouped.get(activeColor) || [] : []
   const swipeHandlers = useSwipeable({
  onSwipedLeft: () =>
    setSelectedImageIndex((prev) =>
      activeImages.length > 0 ? (prev + 1) % activeImages.length : prev
),
onSwipedRight: () =>
  setSelectedImageIndex((prev) =>
    activeImages.length > 0
? (prev - 1 + activeImages.length) % activeImages.length
: prev
),
trackMouse: true,
});

// --- Desktop buttons ---
const handleNext = () => {
  setSelectedImageIndex((prev) => (prev + 1) % activeImages.length);
};
const handlePrev = () => {
  setSelectedImageIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
};


  return (
  <div className="min-h-screen bg-gray-50">
    <Toaster position="top-center" reverseOrder={false} />

    
      <div className="container mx-auto px-4 py-10">
        {product && (
          <div className="flex flex-col lg:flex-row gap-10">
          {/* Product Images */}
              <div className="relative lg:w-2/3 ml-2 flex flex-col-reverse flex-col gap-6">
                {/* Thumbnails */}
                <ul className="flex lg:flex-row gap-4 overflow-x-auto lg:overflow-x-visible">
                {Array.from(grouped.entries()).map(([color, images]) => (
                  <li
                    key={color}
                    onClick={() => {
                      setActiveColor(color)
                      setSelectedImageIndex(0)
                    }}
                    className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      activeColor === color ? 'border-blue-500 scale-110' : 'border-gray-200'
                    }`}
                  >
                    <img src={images[0].image} alt={`${color}-thumb`} className="w-full h-full object-cover" />
                  </li>
                ))}
              </ul>
            {/* Rang matni */}
              <p className=" text-lg font-medium  mt-1">
                {translations.basket.selectedColor}: {activeColor}
              </p>

                {/* Main Images */}
                {/* Mobile/Tablet: 1 ta rasm */}
              {activeImages.length > 0 && (
                <div className="w-full   lg:hidden h-64 sm:h-80 rounded-2xl overflow-hidden border bg-white shadow-lg flex items-center justify-center " {...swipeHandlers}>
                  <img
                    src={activeImages[selectedImageIndex].image}
                    alt={`main-${selectedImageIndex}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

                {/* Desktop/LG: 2 ta rasm */}
                <div className="hidden lg:flex w-full lg:w-2/3 gap-4 h-[450px] rounded-2xl overflow-hidden border bg-white shadow-lg">
                    {activeImages.map((img, index) => (
                  <div key={img.id} className="w-1/2 h-full relative flex items-center justify-center">
                    <img src={img.image} alt={`${activeColor}-${index}`} className="w-full h-full object-contain" />
                  </div>
                ))}
                </div>
             <div className="hidden lg:flex absolute left-4 top-2/5 -translate-y-1/2">
  <Button
    onClick={handlePrev}
    icon={<LeftOutlined />}
    className="rounded-full shadow-lg"
  />
</div>

<div className="hidden lg:flex absolute right-4 top-2/5 -translate-y-1/2">
  <Button
    onClick={handleNext}
    icon={<RightOutlined />}
    className="rounded-full shadow-lg"
  />
</div>
              </div>

              <div className="lg:w-1/3 flex flex-col gap-4">
                
                {/* Product Info Card */}
                <div className="bg-white shadow-lg rounded-xl p-6 lg:p-10 flex flex-col gap-6 h-[450px]">
              <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800">{product.name}</h1>

              <div className="flex flex-col gap-2">
                <p className="text-gray-600">{translations.basket.company}</p>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-1">
                    <StarFilled className="text-yellow-400" />
                    <span>
                      {product.average_rating} {translations.basket.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingOutlined className="text-yellow-400" />
                    <span className="text-gray-600">
                      {product.sold_count} {translations.basket.timesSold}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {product.discount && (
                  <del className="text-gray-400 text-lg">
                    {new Intl.NumberFormat("uz-UZ").format(Number(product.price))}{" "}
                    {translations.basket.sum}
                  </del>
                )}
                <p className="text-2xl lg:text-3xl font-medium text-gray-800">
                  {new Intl.NumberFormat("uz-UZ").format(Number(product.discounted_price))}{" "}
                  {translations.basket.sum}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg overflow-hidden w-36">
                  <button
                    onClick={() => setQuantity(prev => Math.max(0, prev - 1))}
                    className="w-1/3 py-2 bg-pink-100 hover:bg-pink-200 transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e =>
                      setQuantity(Math.max(0, parseInt(e.target.value) || 1))
                    }
                    className="w-1/3 text-center border-x"
                  />
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-1/3 py-2 bg-pink-100 hover:bg-pink-200 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                className="w-full py-3 text-lg !bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 border-none"
                onClick={handleAddToBasket}
              >
                {translations.basket.addToCart}
              </Button>
              {/* Yangi bo'sh card */}
            </div>
            {/* Yangi bo'sh card */}
  <div className="bg-white shadow-lg rounded-xl p-6 lg:p-10 h-[100px] flex flex-col justify-center items-center mt-4">
   <p className="text-gray-800 text-lg font-medium text-center">
    {translations.basket.deliveryDays}
  </p>
  <p className="text-gray-500 text-sm text-center">
    {translations.basket.deliveryInfo}
  </p>
  </div>
  </div>
          </div>
    )}


        {/* Comments Section */}
        <div className="flex flex-col lg:flex-row gap-6 mt-10">
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-2">{translations.basket.commentTitle}</h2>
            <p className="text-gray-600">{product?.description}</p>
          </div>

          <div className="lg:w-1/3 bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4">
            {commentList && commentList.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold text-gray-800">{translations.basket.comment}</h2>
                <ul className="flex flex-col gap-4 max-h-80 overflow-y-auto">
                  {commentList.map((item: CommentType, index: number) => (
                    <li key={`comment-${index}`} className="border-b pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-800">{item.first_name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                       <ul className='flex items-center gap-1'>
                {[...Array(5)].map((_, i) => (
                  <li key={`star-${i}`} className="transition-transform hover:scale-110">
                    <StarFilled className={i < (item.rating || 0) ? '!text-yellow-400' : '!text-gray-300'} />
                  </li>
                ))}
              </ul>
                      </div>
                      <p className="text-gray-700 text-sm">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <h3 className="text-center text-gray-700 font-semibold">
                {translations.basket.commentNotFound}
              </h3>
            )}

            {token && (
              <Button
                onClick={() => setCommentModal(true)}
                type="primary"
                size="large"
                icon={<CommentOutlined />}
                className="mt-2 !bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 border-none"
              >
                {translations.basket.writeComment}
              </Button>
            )}
          </div>
        </div>
      </div>
    

    {/* Comment Modal */}
    <Modal open={commentModal} onCancel={() => setCommentModal(false)} footer={null}>
      <div id="commentFormDesktop">
        <h2 className="text-lg font-bold text-center text-gray-800 my-5">
          {translations.basket.commentModalTitle}
        </h2>

        <div className="flex justify-center my-4">
          <Rate value={like} onChange={value => setLike(value)} />
        </div>

        <input
          id="commentFormDesktopInput"
          type="text"
          name="comment"
          placeholder={translations.basket.commentModalInputPlaceholder}
          className="w-full border-2 border-gray-300 rounded-lg p-2 my-5"
        />

        <Button
          htmlType="button"
          className="w-full mt-5 !bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
          type="primary"
          size="large"
          onClick={() => handleCommentSubmitDesktop()}
        >
          {translations.basket.commentModalButton}
        </Button>
      </div>
    </Modal>
  </div>
);

}

export default ProductDetail;