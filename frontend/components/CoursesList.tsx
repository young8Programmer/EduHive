'use client'

import { useQuery } from 'react-query'
import api from '@/lib/api'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string | null
  level: string
  price: number
  isPremium: boolean
  views: number
  enrollments: number
}

export function CoursesList() {
  const { data: courses, isLoading } = useQuery<Course[]>(
    'courses',
    async () => {
      const response = await api.get('/courses')
      return response.data
    }
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses?.map((course) => (
        <Link
          key={course.id}
          href={`/courses/${course.id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                {course.level}
              </span>
              {course.isPremium && (
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                  Premium
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {course.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-600">
                {course.price.toLocaleString()} UZS
              </span>
              <div className="text-sm text-gray-500">
                {course.enrollments} o'quvchi
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
