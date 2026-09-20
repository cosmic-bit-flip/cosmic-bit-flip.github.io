// Read scroll geometry once, before the page's scroll handlers write styles.
export const scrollPosition = {
  y: Math.max(window.scrollY, 0),
  height: window.innerHeight,
}

function update() {
  scrollPosition.y = Math.max(window.scrollY, 0)
}

window.addEventListener('scroll', update, { passive: true })
window.addEventListener('resize', () => {
  scrollPosition.height = window.innerHeight
  update()
}, { passive: true })
document.addEventListener('astro:page-load', update)
