import { NextPage } from "next";
import "next-auth";
import type { AppProps } from "next/app";

export interface AppPropsWithLayout extends AppProps {
  Component: NextPage & {
    hideHeader?: boolean;
  };
}
declare module "next-auth" {
  interface User {
    status: number;
    message: string;
    data: {
      id: string;
      email: string;
      phone_number: string;
      role: number;
      token: string;
    };
  }
  interface Session {
    user: User;
    accessToken: string;
  }
}

export interface IUser {
  id?: string;
  _id?: string;
  username?: string;
  name?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  device_token?: string;
  avatar?: string;
  location?: string;
  password?: string;
  role?: "жолооч" | "оператор" | "админ" | "супер админ" | "нярав";
  level?: 4 | 3 | 2 | 1 | 0;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
  logout_at?: Date;
  isActive: boolean;
  isOperator: boolean;
}
export interface IProduct {
  id?: string;
  _id?: string;
  code: String;
  name?: string;
  tailbar?: string;
  image?: string;
  price?: number;
  delivery_price?: number;
  total_price?: number;
  balance?: number;
  isActive?: boolean;
  category?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IDeliveryZone {
  id?: string;
  _id?: string;
  user: IUser;
  zone?: string;
  duureg?: string;
  car_number?: string;
  car_mark?: string;
  car_desc?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IOrlogo {
  id?: string;
  _id?: string;
  jolooch: IUser;
  jolooch_username: string;
  note: string;
  mungu?: number;
  tushaasan_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface ICustomer {
  id?: string;
  _id?: string;
  phone: string;
  address?: string;
  duureg?: string;
  created_at?: Date;
  updated_at?: Date;
}
export interface IInvoice {
  id?: string;
  _id?: string;
  invoice_number: string;
  owner: IUser;
  owner_name?: string;
  type?: string;
  invoice_products?: IInvoiceProducts[];
  invoice_product?: [
    {
      product: IProduct;
      product_code: string;
      product_name: string;
      price: number;
      sale_price: number;
      too: number;
    }
  ];
  total_price?: number;
  too?: number;
  from_user?: IUser;
  from_username?: string;
  to_user?: IUser;
  to_username?: string;
  customer?: ICustomer;
  customer_phone?: string;
  customer_name?: string;
  isPaid?: string;
  payment_date?: Date;
  isCompleted?: boolean;

  created_at?: Date;
  updated_at?: Date;
}
export interface IInvoiceProducts {
  id?: string;
  _id?: string;
  invoice_number: string;
  owner: IUser;
  type?: string;
  product?: IProduct;
  product_code?: string;
  product_name?: string;
  price: number;
  sale_price: number;
  too: number;
  isDeleted?: Date;
  created_at?: Date;
  updated_at?: Date;
}
export interface IUserBalances {
  id?: string;
  _id?: string;

  owner: IUser;
  username?: string;

  product?: IProduct;
  product_code?: string;
  product_name?: string;

  orlogodson?: number; // Тухайн хэрэглэгч дээр нэмсэн
  zarlagadsan?: number; // Тухайн хэрэглэгчээс гаргаж хассан бараанууд
  hurgegdsen?: number; // Борлуулж хүргэсэн барааны тоо
  uldsen: number; // orlogodson - zarlagadsan - hurgegdsen

  created_at?: Date;
  updated_at?: Date;
}

export interface IOrder {
  id?: string;
  _id?: string;
  order_number: string;
  owner: IUser;
  owner_name?: string;
  type?: string;
  order_products?: IOrderProducts[];
  order_product?: IOrderProducts[];
  total_price?: number;
  total_sale_price?: number;
  delivery_total_price?: number;
  too?: number;

  from_user?: IUser;
  from_username?: string;

  jolooch: IUser;
  deliveryzone: IDeliveryZone;
  jolooch_username: string;

  customer?: ICustomer;
  customer_phone: string;
  duureg?: string;
  address?: string;
  nemelt?: string;

  zone?: string;
  huleejawahudur?: Date;
  huleejawahtsag?: string;

  status?: string;

  invoice_number?: string;
  isPaid?: boolean;
  payment_date?: Date;
  payment_type?: String;

  isCompleted?: boolean;
  isToolson?: boolean;
  completedDate?: Date;
  from_date?: Date;
  completeTailbar?: string;

  created_at?: Date;
  updated_at?: Date;
  list_rank?: number;
}

export interface IOrderProducts {
  id?: string;
  _id?: string;
  order_number: string;
  customer: ICustomer;
  product?: IProduct;
  product_code?: string;
  jolooch_username?: string;
  jolooch?: IUser;
  product_name?: string;
  delivery_price?: number;
  sale_price?: number;
  too?: number;
  isDeleted?: Date;
  created_at?: Date;
  updated_at?: Date;
}
