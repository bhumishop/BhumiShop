import { describe, it, expect } from 'vitest'
import {
  getCategoryKey,
  interleaveByCategory,
  pickMixedProducts,
  isCategoryFiltered,
  orderProducts
} from '../../src/utils/productMix'

const make = (id, category) => ({ id, category, name: `P${id}` })

describe('productMix', () => {
  it('groups case-insensitively and handles missing category', () => {
    expect(getCategoryKey(make(1, 'Camiseta'))).toBe('camiseta')
    expect(getCategoryKey(make(2, '  LIVRO '))).toBe('livro')
    expect(getCategoryKey(make(3, ''))).toBe('__none__')
    expect(getCategoryKey(make(4, null))).toBe('__none__')
  })

  it('interleaves t-shirts + books instead of clustering', () => {
    const products = [
      make(1, 'camiseta'),
      make(2, 'camiseta'),
      make(3, 'camiseta'),
      make(4, 'livro'),
      make(5, 'livro'),
      make(6, 'caneca')
    ]
    const mixed = interleaveByCategory(products)
    expect(mixed.map(p => p.id)).toEqual([1, 4, 6, 2, 5, 3])
    // first window of 4 already contains all 3 categories
    expect(new Set(mixed.slice(0, 4).map(p => p.category)).size).toBe(3)
  })

  it('preserves within-category order', () => {
    const products = [make(9, 'b'), make(7, 'b'), make(1, 'a'), make(2, 'a')]
    expect(interleaveByCategory(products).map(p => p.id)).toEqual([9, 1, 7, 2])
  })

  it('returns a copy and handles single-category input', () => {
    const products = [make(1, 'x'), make(2, 'x')]
    const out = interleaveByCategory(products)
    expect(out.map(p => p.id)).toEqual([1, 2])
    expect(out).not.toBe(products)
    expect(interleaveByCategory([])).toEqual([])
  })

  it('pickMixedProducts slices the interleaved list', () => {
    const products = [make(1, 'a'), make(2, 'a'), make(3, 'b'), make(4, 'b')]
    expect(pickMixedProducts(products, 2).map(p => p.id)).toEqual([1, 3])
    expect(pickMixedProducts(products, 99)).toHaveLength(4)
    expect(pickMixedProducts([], 5)).toEqual([])
  })

  it('detects category filtering', () => {
    expect(isCategoryFiltered('')).toBe(false)
    expect(isCategoryFiltered('todos')).toBe(false)
    expect(isCategoryFiltered('camisetas')).toBe(true)
  })
})

describe('orderProducts (full products page)', () => {
  const p = (id, category, price, name) => ({ id, category, price, name })

  // Simulates a bulk import: the three newest rows (highest ids) are all
  // t-shirts, so a plain "newest" sort would show a t-shirt-only page 1.
  const catalog = [
    p(1, 'livro', 40, 'Livro A'),
    p(2, 'livro', 50, 'Livro B'),
    p(3, 'caneca', 30, 'Caneca C'),
    p(10, 'camiseta', 90, 'Camiseta X'),
    p(11, 'camiseta', 80, 'Camiseta Y'),
    p(12, 'camiseta', 70, 'Camiseta Z')
  ]

  it('newest + "All" mixes every category round-robin', () => {
    const out = orderProducts(catalog, 'newest', '')
    expect(out.map(x => x.id)).toEqual([12, 3, 2, 11, 1, 10])
    // the first window already contains all three categories
    expect(new Set(out.slice(0, 3).map(x => x.category)).size).toBe(3)
    // newest-first inside each category
    expect(out.filter(x => x.category === 'camiseta').map(x => x.id)).toEqual([12, 11, 10])
  })

  it('newest + "todos" behaves like "All"', () => {
    expect(orderProducts(catalog, 'newest', 'todos').map(x => x.id))
      .toEqual(orderProducts(catalog, 'newest', '').map(x => x.id))
  })

  it('newest + a selected category keeps a pure order (no mixing)', () => {
    // Any active category disables interleaving: rows stay strictly
    // newest-first (the view normally passes an already filtered catalog).
    expect(orderProducts(catalog, 'newest', 'camiseta').map(x => x.id)).toEqual([12, 11, 10, 3, 2, 1])
    const tshirts = catalog.filter(x => x.category === 'camiseta')
    expect(orderProducts(tshirts, 'newest', 'camiseta').map(x => x.id)).toEqual([12, 11, 10])
  })

  it('explicit price/name sorts are never interleaved', () => {
    expect(orderProducts(catalog, 'price-asc', '').map(x => x.price)).toEqual([30, 40, 50, 70, 80, 90])
    expect(orderProducts(catalog, 'price-desc', '').map(x => x.price)).toEqual([90, 80, 70, 50, 40, 30])
    expect(orderProducts(catalog, 'name-asc', '').map(x => x.name))
      .toEqual(['Camiseta X', 'Camiseta Y', 'Camiseta Z', 'Caneca C', 'Livro A', 'Livro B'])
  })

  it('returns a new array and tolerates bad input', () => {
    const out = orderProducts(catalog, 'newest', '')
    expect(out).not.toBe(catalog)
    expect(catalog.map(x => x.id)).toEqual([1, 2, 3, 10, 11, 12]) // input untouched
    expect(orderProducts(null)).toEqual([])
  })
})
