import Link from '@/components/Link'
import { useRouter } from 'next/router'

export default function Pagination({ totalPages, currentPage, type }) {
  const router = useRouter()
  let routerPathName = ''
  if (router.pathname.includes('qiita')) {
    routerPathName = 'qiita'
  }
  if (router.pathname.includes('note')) {
    routerPathName = 'note'
  }
  const path = type !== '/blog' ? routerPathName + '/' : ''
  const path1 = type !== '/blog' ? '/' + routerPathName : ''

  const prevPage = parseInt(currentPage) - 1 > 0
  const nextPage = parseInt(currentPage) + 1 <= parseInt(totalPages)

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button rel="previous" className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            前ページ
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/blog${path1}` : `/blog/${path}page/${currentPage - 1}`}
          >
            <button rel="previous">前ページ</button>
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button rel="next" className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/blog/${path}page/${currentPage + 1}`}>
            <button rel="next">次ページ</button>
          </Link>
        )}
      </nav>
    </div>
  )
}
