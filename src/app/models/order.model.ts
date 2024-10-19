export interface OrderDetail {
    id?: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    name?: string;
    image?: string;
  }