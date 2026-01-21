'use client'

import { useQuery } from 'react-query'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import Link from 'next/link'

export default function CoursePage() {
  const params = useParams()
  const courseId = params.id as string
  const token = Cookies.get('token')

  const { data: course, isLoading } = useQuery(
    ['course', courseId],
    async () => {
      const response = await api.get(`/courses/${courseId}`)
      return response.data
    }
  )

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Yuklanmoqda...</div>
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Kurs topilmadi</div>
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
            {token && (
              <Link
                href="/dashboard"
                className="flex items-center text-gray-700 hover:text-primary-600"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded">
                {course.level}
              </span>
              {course.isPremium && (
                <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded">
                  Premium
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{course.description}</p>
            <div className="flex items-center space-x-6 text-gray-500">
              <span>{course.views} ko'rish</span>
              <span>{course.enrollments} o'quvchi</span>
              <span className="text-2xl font-bold text-primary-600">
                {course.price.toLocaleString()} UZS
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Darslar</h2>
          {course.lessons && course.lessons.length > 0 ? (
            <div className="space-y-4">
              {course.lessons.map((lesson: any, index: number) => (
                <div
                  key={lesson.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500 font-semibold">{index + 1}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="text-sm text-gray-600">{lesson.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {lesson.isPremium && (
                        <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          Premium
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{lesson.duration} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Darslar hali qo'shilmagan</p>
          )}
        </div>
      </main>
    </div>
  )
}
