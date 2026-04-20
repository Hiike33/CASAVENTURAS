import { siteConfig } from '@/lib/tours'

type Crumb = { name: string; url: string }

function buildList(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url.startsWith('http') ? c.url : `${siteConfig.url}${c.url}`,
    })),
  }
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  const json = JSON.stringify(buildList(items)).replace(/</g, '\\u003c')
  const props = { type: 'application/ld+json' as const, dangerouslySetInnerHTML: { __html: json } }
  return <script {...props} />
}
