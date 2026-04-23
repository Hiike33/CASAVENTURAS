import { test } from 'node:test'
import assert from 'node:assert/strict'
import { articles as articlesEn } from './articles.en.ts'
import { articles as articlesEs } from './articles.es.ts'
import { articles as articlesFr } from './articles.fr.ts'

// i18n parity: slug set must match across locales so hreflang alternates
// line up 1-to-1 on /guides/[slug]. A missing slug in ES/FR silently drops
// the alternate and hurts SEO.
test('articles.{en,es,fr}.ts share the same slug set and order', () => {
  const slugs = (arr: typeof articlesEn) => arr.map(a => a.slug)
  assert.deepEqual(slugs(articlesEs), slugs(articlesEn), 'ES slugs diverge from EN')
  assert.deepEqual(slugs(articlesFr), slugs(articlesEn), 'FR slugs diverge from EN')
})

// Titles must be translated (ES/FR must differ from EN). Catches a
// forgotten copy-paste.
test('articles titles are translated (ES and FR differ from EN)', () => {
  for (let i = 0; i < articlesEn.length; i++) {
    assert.notEqual(articlesEs[i].title, articlesEn[i].title, `${articlesEn[i].slug}: ES title still EN`)
    assert.notEqual(articlesFr[i].title, articlesEn[i].title, `${articlesEn[i].slug}: FR title still EN`)
  }
})

// Body block count must match — if EN has 10 blocks and FR has 8, a
// translation was dropped. Same count keeps structure parity.
test('articles have same body block count across locales', () => {
  for (let i = 0; i < articlesEn.length; i++) {
    assert.equal(
      articlesEs[i].body.length,
      articlesEn[i].body.length,
      `${articlesEn[i].slug}: ES body block count differs`,
    )
    assert.equal(
      articlesFr[i].body.length,
      articlesEn[i].body.length,
      `${articlesEn[i].slug}: FR body block count differs`,
    )
  }
})

// relatedTourSlug must be a valid tour slug or undefined. Catches typos.
test('articles relatedTourSlug is a known tour or undefined', () => {
  const validSlugs = new Set(['el-yunque', 'catamaran', 'salsa', undefined])
  for (const article of articlesEn) {
    assert.ok(
      validSlugs.has(article.relatedTourSlug),
      `${article.slug}: unknown relatedTourSlug "${article.relatedTourSlug}"`,
    )
  }
})

// metaDescription length enforced: 100-170 chars keeps Google from
// truncating the SERP snippet.
test('articles metaDescription is within SEO length bounds (100-170 chars)', () => {
  for (const arr of [articlesEn, articlesEs, articlesFr]) {
    for (const article of arr) {
      const len = article.metaDescription.length
      assert.ok(
        len >= 100 && len <= 170,
        `${article.slug}: metaDescription length ${len} out of [100,170]`,
      )
    }
  }
})
