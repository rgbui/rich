const requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60)
    }
  )
})()

const easeInOutQuad = function (t, b, c, d) {
  t /= d / 2
  if (t < 1) {
    return (c / 2) * t * t + b
  }
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

const animatedScrollTo = function (element, to, duration = 1000, callback?) {
  if (!element) {
    return
  }
  element.classList.add('willChange-scroll')
  duration = Math.min(Number(duration), 3000)
  const start = element.scrollTop
  const change = to - start
  const animationStart = +Number(new Date())
  let animating = true
  const animateScroll = function () {
    if (!animating || !element) {
      if (element) {
        element.classList.remove('willChange-scroll')
      }
      if (callback) {
        return callback()
      }
      return
    }
    requestAnimFrame(animateScroll)
    const now = +Number(new Date())
    const val = Math.floor(easeInOutQuad(now - animationStart, start, change, duration))
    element.scrollTop = val
    if (now > animationStart + duration) {
      element.scrollTop = to
      animating = false
    }
  }
  requestAnimFrame(animateScroll)
}

export default animatedScrollTo
