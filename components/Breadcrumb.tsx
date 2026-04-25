import { siteConfig } from '@/lib/tours'

type Crumb = { name: string; url: string }

function buildList(items: Crumb[]) {
  // @id is anchored to the terminal crumb's URL (the page hosting the
  // breadcrumb). Makes the node referenceable from other graphs and
  // gives Google a stable identifier across re-crawls.
  const last = items[items.length - 1]
  const lastUrl = last
    ? last.url.startsWith('http') ? last.url : `${siteConfig.url}${last.url}`
    : siteConfig.url
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${lastUrl}#breadcrumb`,
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
