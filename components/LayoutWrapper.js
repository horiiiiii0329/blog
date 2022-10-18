import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import Logo2 from '@/data/logo2.svg'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

const LayoutWrapper = ({ children }) => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  useEffect(() => setTheme('dark'), [])

  return (
    <SectionContainer>
      <div className="flex h-screen flex-col justify-between">
        <header className="flex items-center justify-between py-10">
          <div className="flex items-center text-base leading-5">
            <Link href="/" aria-label={siteMetadata.headerTitle}>
              <div className="flex items-center justify-between">
                <div className="mr-3">
                  {theme === 'dark' || resolvedTheme === 'dark' ? <Logo2 /> : <Logo />}
                </div>
              </div>
            </Link>
            <div className="hidden sm:block">
              {headerNavLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="p-1 font-light text-gray-700 dark:text-gray-100 sm:p-4"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="mr-5 flex items-center text-base leading-5">
            <ThemeSwitch />
            <MobileNav />
          </div>
        </header>
        <main className="container mx-auto mb-auto px-2">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
