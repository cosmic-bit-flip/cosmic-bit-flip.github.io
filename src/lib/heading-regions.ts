export interface HeadingRegion {
  id: string
  start: number
  headingEnd: number
  end: number
}

export function measureHeadingRegions(headings: HTMLElement[]): HeadingRegion[] {
  const scroll = window.scrollY
  const bottom = document.documentElement.scrollHeight
  const positions = headings.map((heading) => {
    const rect = heading.getBoundingClientRect()
    return { id: heading.id, start: rect.top + scroll, headingEnd: rect.bottom + scroll }
  })
  return positions.map((heading, index) => ({
    ...heading,
    end: positions[index + 1]?.start ?? bottom,
  }))
}

export function visibleHeadingIds(regions: HeadingRegion[], top: number, bottom: number): string[] {
  const visible = new Set<string>()
  for (const region of regions) {
    if (region.start <= bottom && region.headingEnd >= top) visible.add(region.id)
  }
  for (const region of regions) {
    if (region.start <= bottom && region.end >= top && region.end > region.headingEnd) {
      visible.add(region.id)
    }
  }
  return [...visible]
}
