import { useEffect, useState, useRef } from 'react';
import { ProductsType } from '../components/NewProducts';
import { Spin } from 'antd';
import noImage from "../assets/images/noImage.jpg";
import { LeftCircleOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PATH } from '../hook/usePath';
import { useLanguage } from '../Context/LanguageContext';
import '../styles/CategoryButton.css';

const BASE_URL = import.meta.env.VITE_API_REQUEST;

export interface CategoryType {
  id: number;
  name: string;
}

const AllProducts = () => {
  const navigate = useNavigate();
  const { translations, language } = useLanguage();

  const [isCategoryLoading, setIsCategoryLoading] = useState<boolean>(false);
  const [gender, setGender] = useState<string>("none");
  const [content, setContent] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectCategory, setSelectCategory] = useState<number>(0);

  const [allProducts, setAllProducts] = useState<ProductsType[]>([]);
  const [productCount, setProductCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Category fetch
  useEffect(() => {
    if (gender === "none") return;

    setContent(true);
    setIsCategoryLoading(true);

    const langParam = language === "uz" ? "" : `&lang=${language}`;

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/shop/categories/?gender=${gender}${langParam}`);
        if (!res.ok) throw new Error(`Kategoriya olishda xatolik: ${res.status}`);
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Category fetch error:", error);
      } finally {
        setIsCategoryLoading(false);
      }
    };
    fetchCategories();
  }, [gender, language]);

  const handleCategoryClick = (id: number) => {
    setSelectCategory(id);
    setAllProducts([]);
    setCurrentPage(1);
    setHasMore(true);
  };

  const handleProductClick = (product: ProductsType) => {
    localStorage.setItem("last_page", `${PATH.product}/${product.id}`);
    navigate(`${PATH.product}/${product.id}`);
  };

  // Products fetch with infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);

    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          page_size: String(pageSize),
          lang: language,
        });
        if (selectCategory !== 0) params.append("category_id", String(selectCategory));

        const res = await fetch(`${BASE_URL}/shop/products/?${params.toString()}`);
        if (!res.ok) throw new Error(`Xatolik: ${res.status}`);
        const data = await res.json();
        setAllProducts(prev => [...prev, ...(data.results || [])]);
        setProductCount(data.count || 0);

        if ((data.results?.length || 0) < pageSize) setHasMore(false);
      } catch (err) {
        console.error("Products fetch error:", err);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, selectCategory, language, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setCurrentPage(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loaderRef, hasMore, isLoading]);
if (isLoading){
      return <div className='w-full w-[700px] text-center my-20 py-5'><Spin size='large' className='scale-[2]'/></div>
}
  return (
    <>
 <h1
  className="
    relative text-center font-semibold 
    text-md sm:text-base md:text-lg lg:text-xl xl:text-2xl  /* kichikroq shriftlar */
    my-6 sm:m-8 lg:m-10       /* atrofga margin */
    px-4 py-2                /* ichki padding kichikroq */
    border-2 border-gray-300 rounded-lg
    bg-white/20 backdrop-blur-sm
    shadow-md
    whitespace-pre-line
  "
>
  {translations.allProducts.motiveSentence}
</h1>

 <div className='w-[1476px] max-w-full mx-auto lg:flex flex-col lg:flex-row items-start justify-between py-[50px] px-4'>
        
        {/* Sidebar */}
        <div className={`lg:w-[25%] lg:mr-10 caregoryList ${content ? "bg-white p-5" : ""} mb-10 lg:mb-0`}>
          <h2 className='mb-[42px] font-medium text-[28px] text-[#3E3E3E]'>{translations.allProducts.title}</h2>
          {!isCategoryLoading ? (
            <>
              {content ? (
                <div className='w-full rounded-[20px] border-[2px] border-gray-500 h-[70vh] lg:h-[100vh] p-[20px] overflow-y-auto'>
                  <div className='mb-[40px] flex items-center gap-5 ml-[10px]'>
                    <button onClick={() => setContent(false)}>
                      <LeftCircleOutlined className='scale-[2] cursor-pointer inline-block'/>
                    </button>
                    <p className='font-regular text-[22px]'>
                      {gender === "all" ? translations.allProducts.all 
                        : gender === "male" ? translations.allProducts.men 
                        : gender === "female" ? translations.allProducts.girl : null}
                    </p>
                  </div>

                  {Array.isArray(categories) && categories.length > 0 ? (
                    <ul className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4'>
                      {categories.map((item: CategoryType, index: number) => (
                        <li
                          key={`category-${item.id || index}`}
                          onClick={() => handleCategoryClick(item.id)}
                          className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center justify-between cursor-pointer toy-border transition-all duration-200
                            ${selectCategory === item.id ? "category-active" : ""}`}
                        >
                          <p className='font-regular text-[14px] sm:text-[16px] lg:text-[18px] text-[#3E3E3E] line-clamp-2'>
                            {index + 1}. {item.name}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Spin className='w-full mt-[200px] scale-[3] block mx-auto relative z-30' size='large'/>
                  )}
                </div>
              ) : (
                <div className='w-full flex flex-col space-y-5'>
                  {["all", "male", "female"].map(g => (
                    <button key={g} onClick={() => setGender(g)}
                      className={`w-full px-2 lg:px-[10px] py-3 lg:py-[15px] rounded-[10px] flex items-center justify-between cursor-pointer toy-border ${gender === g ? "category-active" : ""}`}>
                      <p className="font-medium">
                        {g === "all" ? translations.allProducts.all : g === "male" ? translations.allProducts.men : translations.allProducts.girl}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className='flex flex-col mx-auto text-center gap-[20px]'>
              <Spin className='scale-[2]' size='large'/>
              <p>{translations.allProducts.loading}</p>
            </div>
          )}
        </div>

        {/* Products */}
        <div className='w-full lg:w-[70%] productList'>
          <h2 className='inline-block mb-10 text-[20px] sm:text-[22px] md:text-[24px] lg:text-[28px] font-medium text-gray-800'>
            {productCount} {translations.allProducts.productsFound}
          </h2>

          <ul className='w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
            {allProducts.map((item: ProductsType) => (
              <li
                key={`product-${item.id}`}
                onClick={() => handleProductClick(item)}
                className='bg-white w-full hover:shadow-xl hover:shadow-blue-300 overflow-hidden cursor-pointer duration-300 rounded-[16px] sm:rounded-[20px] pb-[10px]'
              >
                <img
                  className='w-full h-[160px] sm:h-[200px] lg:h-[231px] object-contain'
                  src={item.images?.[0]?.image || noImage}
                  alt={item.name || "Product Image"}
                  width={194} height={231}
                />
                <div className='px-3 sm:px-[20px] lg:px-[30px] py-3 sm:py-[15px] lg:py-[28px]'>
                  <h3 className='font-medium text-[16px] sm:text-[20px] lg:text-[22px] mb-0 line-clamp-2'>
                    {item.name}
                  </h3>
                  {item.discount > 0 && (
                    <del className='font-regular text-[18px] text-[#73808E]'>
                      {new Intl.NumberFormat('uz-UZ').format(Number(item.price))}
                    </del>
                  )}
                  <p className='font-medium text-[14px] sm:text-[18px] lg:text-[20px] text-[#3E3E3E]'>
                    {new Intl.NumberFormat('uz-UZ').format(Number(item.discounted_price))}
                  </p>
                </div>
                <button className='product-card-button cursor-pointer w-[140px] sm:w-[160px] lg:w-[170px] my-2 py-[8px] sm:py-[12px] lg:py-[15px] block mx-auto rounded-[10px] sm:rounded-[12px] text-white font-medium text-[12px] sm:text-[15px] lg:text-[17px]'>
                  {translations.allProducts.buyNow} <ShoppingOutlined />
                </button>
              </li>
            ))}
          </ul>

        
          <div ref={loaderRef} className="h-[20px]"></div>
        </div>
      </div>

    </>
  );
};

export default AllProducts;
