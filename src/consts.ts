import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'cosmic bit flip',
  description:
    'Cosmic Bit Flip is a U.S. high-school & undergraduate CTF and problem-solving community.',
  href: 'https://cosmicbitflip.org',
  author: 'jktrn',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/members',
    label: 'members',
  },
  {
    href: 'mailto:cosmic.bit.flips@proton.me',
    label: 'contact',
  },
  // {
  //   href: '/about',
  //   label: 'about',
  // },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://ctftime.org/team/372043',
    label: 'CTFtime',
  },
  {
    href: 'https://x.com/cbf_ctf',
    label: 'Twitter',
  },
  {
    href: 'https://github.com/cosmic-bit-flip/',
    label: 'GitHub',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
  CTFtime: '/static/ctftime-favicon.png',
  Discord: 'discord'
}
