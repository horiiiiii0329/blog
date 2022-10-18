import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import { PageSEO } from '@/components/SEO'

export default function AuthorLayout({ children, frontMatter }) {
  const { name, avatar, occupation, company, email, twitter, linkedin, github } = frontMatter

  return (
    <>
      <PageSEO title={`Profile - ${name}`} description={`Profile - ${name}`} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-1 pt-6 pb-2 md:space-y-5">
          <h1 className="text-sm leading-9 text-gray-900 dark:text-gray-100 sm:text-base sm:leading-10 md:text-lg md:leading-14">
            プロフィール
          </h1>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:space-y-0">
          <div className="flex flex-col items-center justify-between pt-8 text-center">
            <Image
              src={avatar}
              alt="avatar"
              width="70px"
              height="70px"
              className="h-24 w-24 rounded-full"
            />
            <h3 className="leading-2 pt-4 pb-2 tracking-tight">{name}</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">{occupation}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{company}</div>
            <div className="flex space-x-3 pt-6">
              <SocialIcon kind="mail" href={`mailto:${email}`} />
              <SocialIcon kind="github" href={github} />
              <SocialIcon kind="linkedin" href={linkedin} />
            </div>
          </div>
          <div className="prose max-w-none pt-8 pb-8  dark:prose-dark xl:col-span-2">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
