import { useEffect, useRef, useState } from "react"

export default function LazySection({
  children,
  minHeight = "240px",
  onVisible,
}) {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current

    if (!node || isVisible) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)

          if (typeof onVisible === "function") {
            onVisible()
          }

          observer.disconnect()
        }
      },
      {
        rootMargin: "300px",
        threshold: 0.01,
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [isVisible, onVisible])

  return (
    <div ref={sectionRef} style={{ minHeight }}>
      {isVisible ? children : null}
    </div>
  )
}