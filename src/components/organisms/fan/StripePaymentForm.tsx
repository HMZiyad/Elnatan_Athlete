"use client";

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiCall } from '@/utils/api';
import { Loader2 } from 'lucide-react';

interface StripePaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    // 1. Tokenize the card on the frontend with Stripe
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message || "An error occurred with Stripe.");
      setProcessing(false);
      return;
    }

    // 2. Send the token to our backend to attach to the customer
    try {
      await apiCall('/users/me/payment-methods', {
        method: 'POST',
        body: JSON.stringify({ stripe_payment_method_id: paymentMethod.id })
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save payment method on server.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 mt-4 relative">
      <h3 className="text-white font-bold mb-4 flex items-center justify-between">
        Add Credit or Debit Card
        <button 
          type="button" 
          onClick={onCancel}
          className="text-white/40 hover:text-white text-xs font-normal"
        >
          Cancel
        </button>
      </h3>
      
      <div className="bg-[#121212] p-4 rounded-xl border border-white/5 mb-6">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#fff',
                '::placeholder': {
                  color: '#666',
                },
                iconColor: '#fff',
              },
              invalid: {
                color: '#ef4444',
                iconColor: '#ef4444',
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-4">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {processing && <Loader2 size={16} className="animate-spin" />}
        Save Payment Method
      </button>
    </form>
  );
};
