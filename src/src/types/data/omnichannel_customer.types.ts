import { User } from "./user.types";

export interface OmnichannelCustomer {
  id: number;
  name: string;
  phone: string;
  status: string;
  customer_service_id?: number;
  customer_service?: User;
  created_at?: string;
  updated_at?: string;
}
