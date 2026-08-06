import { supabase } from './supabaseClient';
import type { BankUser, BankInvoice } from './supabaseClient';

export async function findUserByPassport(passportCode: string): Promise<BankUser | null> {
  const cleanCode = passportCode.trim();
  try {
    const { data, error } = await supabase
      .from('bank_users')
      .select('*')
      .eq('passport_code', cleanCode)
      .maybeSingle();

    if (error) {
      console.error("Error finding user by passport:", error.message);
      return null;
    }
    return data as BankUser | null;
  } catch (err) {
    console.error("Supabase request failed:", err);
    return null;
  }
}

export async function createInvoice(
  senderPassport: string,
  receiverPassport: string,
  amount: number,
  description: string = "Оплата заказа на Пром Ирновии"
): Promise<BankInvoice | null> {
  const id = crypto.randomUUID();
  const invoiceData = {
    id,
    sender_passport: senderPassport.trim(),
    receiver_passport: receiverPassport.trim(),
    amount,
    description,
    status: 'pending' as const,
    is_forced: false
  };

  try {
    const { data, error } = await supabase
      .from('bank_invoices')
      .insert([invoiceData])
      .select();

    if (error) {
      console.error("Error creating bank invoice:", error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data[0] as BankInvoice;
    }
    return null;
  } catch (err) {
    console.error("Invoice creation failed:", err);
    return null;
  }
}

export function startPollingInvoice(
  invoiceId: string,
  onStatusChange: (status: 'pending' | 'paid' | 'cancelled') => void,
  intervalMs: number = 3000
): () => void {
  let isStopped = false;
  let timerId: any = null;

  async function poll() {
    if (isStopped) return;

    try {
      const { data, error } = await supabase
        .from('bank_invoices')
        .select('status')
        .eq('id', invoiceId)
        .maybeSingle();

      if (error) {
        console.warn("Polling error:", error.message);
      } else if (data) {
        onStatusChange(data.status);
        if (data.status === 'paid' || data.status === 'cancelled') {
          return; // Stop polling if final state reached
        }
      }
    } catch (err) {
      console.warn("Exception during invoice poll:", err);
    }

    // Schedule next run
    if (!isStopped) {
      timerId = setTimeout(poll, intervalMs);
    }
  }

  // Initial poll
  poll();

  // Return a cleanup function to stop polling
  return () => {
    isStopped = true;
    if (timerId) {
      clearTimeout(timerId);
    }
  };
}
