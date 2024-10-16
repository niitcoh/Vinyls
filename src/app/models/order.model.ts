export interface Order {
    id?: number;               // `id` opcional, autogenerado por la base de datos
    userId: number;            // Relación con el ID del usuario que hizo la compra
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Canceled'; // Estado de la orden
    createdAt?: string;        // Fecha de creación de la orden (opcional)
    updatedAt?: string;        // Fecha de actualización de la orden (opcional)
    totalAmount: number;       // Cantidad total de la orden
    paymentMethod?: string;    // Método de pago opcional
  }
  