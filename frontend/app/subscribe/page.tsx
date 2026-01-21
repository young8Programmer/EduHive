'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Link from 'next/link'

export default function SubscribePage() {
  const router = useRouter()
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [method, setMethod] = useState<'click' | 'payme'>('click')
  const [loading, setLoading] = useState(false)

  const plans = {
    monthly: { price: 99000, name: 'Oylik obuna' },
    yearly: { price: 990000, name: 'Yillik obuna' },
  }

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await api.post('/payments/initiate', {
        plan,
        method,
      })
      // In production, redirect to payment gateway
      alert('To\'lov tizimiga yo\'naltirilmoqda...')
      // window.location.href = response.data.paymentUrl
    } catch (error: any) {
      alert(error.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Orqaga
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Obuna sotib olish
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className={`border-2 rounded-lg p-6 cursor-pointer ${
              plan === 'monthly'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200'
            }`}
            onClick={() => setPlan('monthly')}
          >
            <h3 className="text-xl font-bold mb-2">Oylik obuna</h3>
            <p className="text-3xl font-bold text-primary-600 mb-2">
              {plans.monthly.price.toLocaleString()} UZS
            </p>
            <p className="text-gray-600">Har oy</p>
          </div>

          <div
            className={`border-2 rounded-lg p-6 cursor-pointer ${
              plan === 'yearly'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200'
            }`}
            onClick={() => setPlan('yearly')}
          >
            <h3 className="text-xl font-bold mb-2">Yillik obuna</h3>
            <p className="text-3xl font-bold text-primary-600 mb-2">
              {plans.yearly.price.toLocaleString()} UZS
            </p>
            <p className="text-gray-600">Har yil (2 oy tekin)</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">To'lov usuli</h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="method"
                value="click"
                checked={method === 'click'}
                onChange={(e) => setMethod(e.target.value as 'click')}
                className="mr-2"
              />
              <span>Click</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="method"
                value="payme"
                checked={method === 'payme'}
                onChange={(e) => setMethod(e.target.value as 'payme')}
                className="mr-2"
              />
              <span>Payme</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-md font-semibold hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Kutilmoqda...' : 'Obuna sotib olish'}
        </button>
      </div>
    </div>
  )
}
