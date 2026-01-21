'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'react-query'
import api from '@/lib/api'
import { authService } from '@/lib/auth'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  const { data: subscription } = useQuery(
    'subscription',
    async () => {
      const response = await api.get('/subscriptions/check-access')
      return response.data
    },
    { retry: false }
  )

  const { data: payments } = useQuery('payments', async () => {
    const response = await api.get('/payments/my')
    return response.data
  })

  useEffect(() => {
    authService.getCurrentUser().then(setUser)
  }, [])

  if (!user) {
    return <div>Yuklanmoqda...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                EduHive
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user.firstName} {user.lastName}
              </span>
              <button
                onClick={authService.logout}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Shaxsiy kabinet
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Obuna holati</h2>
            {subscription ? (
              <div className="text-green-600 font-semibold">
                ✅ Faol obuna mavjud
              </div>
            ) : (
              <div>
                <div className="text-red-600 font-semibold mb-4">
                  ❌ Faol obuna yo'q
                </div>
                <Link
                  href="/subscribe"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Obuna sotib olish
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">To'lovlar</h2>
            {payments && payments.length > 0 ? (
              <div className="space-y-2">
                {payments.slice(0, 3).map((payment: any) => (
                  <div key={payment.id} className="flex justify-between">
                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                    <span className="font-semibold">
                      {payment.amount.toLocaleString()} UZS
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">To'lovlar mavjud emas</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Kurslar</h2>
          <Link
            href="/courses"
            className="text-primary-600 hover:text-primary-700"
          >
            Barcha kurslarni ko'rish →
          </Link>
        </div>
      </main>
    </div>
  )
}
