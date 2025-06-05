export interface SyncOrdersResponse {
  imported: number;
}

export interface ExternalOrder {
  id: number;
  status: string;
  total_amount: string;
  bonus: number;
  bank_card: string | null;
  delivery_cost: number;
  paid_at: string | null;
  shipped_at: string | null;
  created_at: string;
  user: {
    id: number;
    city: string;
    full_name: string;
  };
  order_items: ExternalOrderItem[];
}

export interface ExternalOrderItem {
  quantity: number;
  price: string;
  name: string;
}
