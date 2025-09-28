interface Path {
    home: string;
    allproducts: string;
    basket: string;
    orders: string;
    saleInfo:string;
    login:string;
    product:string;
}

export const PATH: Path = {
    home: "/",
    allproducts: "/allproducts",
    basket: "/basket",
    product:"/product-details",
    orders: "/orders",
    saleInfo: "/sale-info",
    login: "/login"
};
