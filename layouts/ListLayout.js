import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { useState } from 'react'
import Pagination from '@/components/Pagination'
import formatDate from '@/lib/utils/formatDate'
import { useRouter } from 'next/router'

export default function ListLayout({ posts, title, initialDisplayPosts = [], pagination }) {
  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.summary + frontMatter.tags.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  const router = useRouter()
  console.log(router.pathname)

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="max-width pb-2 dark:divide-gray-700">
          <h1 className="text-sm leading-9 text-gray-900 dark:text-gray-100 sm:text-base sm:leading-10 md:text-lg md:leading-14">
            {title}
          </h1>
          {/* <div className="relative max-w-lg">
            <input
              aria-label="Search articles"
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder=""
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
            />
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div> */}
          <nav className="flex justify-center space-x-28 pt-4">
            <Link
              className="block h-8 border-gray-500 text-gray-300"
              href={`/blog`}
              style={router.pathname === '/blog' ? { borderBottom: '3px solid gray' } : undefined}
            >
              biogtabf
            </Link>
            <Link
              className="h-8 border-gray-500  text-gray-300"
              href={`/blog/qiita`}
              style={
                router.pathname.includes('/blog/qiita')
                  ? { borderBottom: '3px solid gray' }
                  : undefined
              }
            >
              qiita
            </Link>
            <Link
              className="h-8 border-gray-500  text-gray-300"
              href={`/blog/note`}
              style={
                router.pathname.includes('/blog/note')
                  ? { borderBottom: '3px solid gray' }
                  : undefined
              }
            >
              note
            </Link>
          </nav>
        </div>
        <div className="container p-12">
          <ul className="grid gap-9 md:grid-cols-2 md:gap-24 ">
            {!filteredBlogPosts.length && '投稿がまだありません。🎈'}
            {displayPosts.map((frontMatter) => {
              const { slug, date, title, summary, tags } = frontMatter
              return (
                <li
                  key={slug}
                  className="rounded-lg border-2 border-gray-200 border-opacity-60 px-3 py-4 dark:border-gray-700"
                >
                  <article className="block h-full flex-col overflow-hidden rounded-lg">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="font-sm text-base leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-3 xl:col-span-3">
                      <div>
                        <h3 className="text-2xl font-bold leading-8 tracking-tight">
                          <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                            {title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap">
                          {tags.map((tag) => (
                            <Tag key={tag} text={tag} />
                          ))}
                        </div>
                      </div>
                      <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                        {summary}
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          type={router.pathname}
        />
      )}
    </>
  )
}
