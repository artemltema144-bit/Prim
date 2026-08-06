import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znpjyycuxazgnievbwrv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucGp5eWN1eGF6Z25pZXZid3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NjMyOTksImV4cCI6MjEwMTQzOTI5OX0.U9NGIYtXKqbpI66wO5mjIESjsWCwXmjbeJa6_TApVIs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BankUser {
  id: string;
  passport_code: string;
  first_name: string;
  last_name: string;
  discord_tag?: string;
  password_hash?: string;
  is_employer?: boolean;
  employer_company_name?: string | null;
  is_employer_approved?: boolean;
  created_at?: string;
}

export interface BankInvoice {
  id: string;
  sender_passport: string;
  receiver_passport: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'cancelled';
  is_forced: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  seller_passport: string;
  created_at: string;
}
