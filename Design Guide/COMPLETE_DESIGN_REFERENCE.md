# 🎨 SHADWAY DESIGN SYSTEM - Complete Template

**Comprehensive design system documentation for implementing professional styling patterns. Based on Shadway project's production design approach.**

---

## 📖 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Color System](#color-system)
3. [Animation Patterns](#animation-patterns)
4. [Visual Effects (Shaders)](#visual-effects--shaders)
5. [Component Examples](#component-examples)
6. [Design Principles](#design-principles)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Performance](#performance)
10. [Best Practices](#best-practices)

---

## 🚀 QUICK START

### Essential Files Created

✅ **SHADWAY_DESIGN_GUIDE.md** - Main guide (this directory)  
✅ **DESIGN_SYSTEM_INDEX.md** - Navigation & overview  
✅ **Session folder** - Extended documentation

### Copy-Paste: Color Setup

```css
/* globals.css */
@import "tailwindcss";

:root {
  --background: oklch(1 0 0);              /* White */
  --foreground: oklch(0.145 0 0);          /* Black */
  --primary: oklch(0.205 0 0);             /* Dark */
  --accent: oklch(0.97 0 0);               /* Light gray */
  --border: oklch(0.922 0 0);              /* Very light */
  --destructive: oklch(0.577 0.245 27.325);/* Red */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --accent: oklch(0.269 0 0);
  --border: oklch(1 0 0 / 10%);
}
```

### Copy-Paste: Theme Provider

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Dependencies to Install

```bash
npm install framer-motion @paper-design/shaders-react rough-notation next-themes
```

---

## 🎨 COLOR SYSTEM

### OKLch Model Explained

```
oklch(lightness saturation hue)
      0-1     0-0.4    0-360°

Example: oklch(0.5 0.15 45)
- Lightness: 50% brightness
- Saturation: 15% color intensity
- Hue: 45° (yellow-green area)
```

### Light Mode Palette

```css
/* Backgrounds & Surfaces */
--background: oklch(1 0 0);           /* White - main background */
--card: oklch(1 0 0);                 /* White - card backgrounds */
--popover: oklch(1 0 0);              /* White - popovers */

/* Text & Foreground */
--foreground: oklch(0.145 0 0);       /* Near black - main text */
--primary-foreground: oklch(0.985 0 0); /* Light - text on dark */
--secondary-foreground: oklch(0.205 0 0); /* Dark - text on light */

/* Interactions & States */
--primary: oklch(0.205 0 0);          /* Dark blue-gray - buttons */
--secondary: oklch(0.97 0 0);         /* Light gray - secondary actions */
--accent: oklch(0.97 0 0);            /* Light gray - highlights */
--muted: oklch(0.97 0 0);             /* Light gray - disabled */

/* Borders & Dividers */
--border: oklch(0.922 0 0);           /* Very light - borders */
--input: oklch(0.922 0 0);            /* Very light - input borders */

/* Special */
--destructive: oklch(0.577 0.245 27.325); /* Red - warnings/errors */
--ring: oklch(0.708 0 0);             /* Gray - focus rings */
```

### Dark Mode Palette

```css
.dark {
  /* Backgrounds - Inverted */
  --background: oklch(0.145 0 0);     /* Near black */
  --card: oklch(0.205 0 0);           /* Dark gray */
  --popover: oklch(0.205 0 0);        /* Dark gray */

  /* Text - Inverted */
  --foreground: oklch(0.985 0 0);     /* Almost white */
  --primary-foreground: oklch(0.985 0 0); /* Light */
  --secondary-foreground: oklch(0.985 0 0); /* Light */

  /* Interactions */
  --primary: oklch(0.922 0 0);        /* Light - buttons */
  --secondary: oklch(0.269 0 0);      /* Slightly lighter */
  --accent: oklch(0.269 0 0);         /* Slightly lighter */
  --muted: oklch(0.269 0 0);          /* Slightly lighter */

  /* Borders */
  --border: oklch(1 0 0 / 10%);       /* Subtle white */
  --input: oklch(1 0 0 / 15%);        /* Subtle white */

  /* Special */
  --destructive: oklch(0.704 0.191 22.216); /* Warmer red */
  --ring: oklch(0.556 0 0);           /* Medium gray */
}
```

### Using Colors in Components

```tsx
// Good: Using CSS variables
<button className="bg-primary text-primary-foreground">
  Click me
</button>

// Good: Dynamic theming
const isDark = resolvedTheme === "dark"
const colors = isDark ? ["#2596be"] : ["#0154a5"]

// Avoid: Hardcoded colors
<button style={{ backgroundColor: "#0154a5" }}>
  Don't do this!
</button>
```

---

## 🎬 ANIMATION PATTERNS

### Timing Guidelines

```typescript
// Micro interactions (button hover, focus)
duration: 200-400ms
easing: ease-out

// Page transitions
duration: 400-600ms
easing: ease-in-out

// Entrance animations
duration: 400-800ms
easing: ease-in or ease-in-out

// Exit animations
duration: 200-400ms
easing: ease-out

// Background/scanning effects
duration: 10-30s (infinite)
easing: linear
```

### Pattern 1: Stagger Animation

```typescript
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,      // Delay between children
      delayChildren: 0.3           // Start animation delay
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export function StaggeredList() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>Item 1</motion.div>
      <motion.div variants={itemVariants}>Item 2</motion.div>
      <motion.div variants={itemVariants}>Item 3</motion.div>
    </motion.div>
  )
}
```

### Pattern 2: Scroll-Triggered Animation

```typescript
import { useInView } from "motion/react"
import { motion } from "framer-motion"
import { useRef } from "react"

export function ScrollTrigger() {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,                   // Animate only once
    margin: "-10%"                // Trigger earlier/later
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      Content
    </motion.div>
  )
}
```

### Pattern 3: Hover Animation

```typescript
<motion.button
  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  Hover me
</motion.button>
```

### Pattern 4: Scanning Beam Effect

```typescript
<motion.div
  className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent"
  animate={{ y: ["0%", "400%"] }}
  transition={{
    duration: 15,
    repeat: Infinity,
    ease: "linear"
  }}
/>
```

---

## 🌈 VISUAL EFFECTS & SHADERS

### Library: @paper-design/shaders-react

```bash
npm install @paper-design/shaders-react
```

### Effect 1: GrainGradient (Texture)

Creates a gradient with procedural grain texture.

```typescript
import { GrainGradient } from "@paper-design/shaders-react"

<div className="absolute inset-0">
  <GrainGradient
    width="100%"
    height="100%"
    colors={["#0154a5", "#0241a7"]}  // Gradient colors
    colorBack="#ffffff"               // Fallback color
    softness={0.8}                    // Grain smoothness (0-1)
    intensity={0.25}                  // Grain visibility (0-1)
    noise={0.35}                      // Noise complexity (0-1)
    shape="corners"                   // Pattern: corners or center
    speed={0.4}                       // Animation speed (0-1)
  />
</div>
```

### Effect 2: MeshGradient (Animated Blobs)

Creates an animated blob-like gradient background.

```typescript
import { MeshGradient } from "@paper-design/shaders-react"

<MeshGradient
  width="100%"
  height="100%"
  colors={["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0"]}
  distortion={0.8}                   // Mesh warping (0-2)
  swirl={0.6}                        // Rotation effect (0-1)
  speed={0.42}                       // Animation speed (0-1)
  offsetX={0.08}                     // Horizontal position (0-1)
  offsetY={0}                        // Vertical position (0-1)
  grainMixer={0.5}                   // Grain blend (0-1)
  grainOverlay={0.3}                 // Grain intensity (0-1)
/>
```

### Effect 3: Dithering (Technical Pattern)

Creates stippled, technical patterns (blueprint aesthetic).

```typescript
import { Dithering } from "@paper-design/shaders-react"

<Dithering
  width="100%"
  height="100%"
  colorBack="#00000000"              // Transparent background
  colorFront="#0241a7"               // Pattern color
  shape="warp"                       // Pattern: warp, dots, lines
  type="4x4"                         // Scale: 2x2, 4x4, 8x8
  size={2.5}                         // Pattern size multiplier
  speed={0.2}                        // Animation speed (0-1)
/>
```

### Layering Effects

Combine multiple shaders for depth:

```typescript
<div className="relative min-h-screen overflow-hidden">
  {/* Layer 1: Base gradient with texture */}
  <div className="absolute inset-0 opacity-40 dark:opacity-60">
    <GrainGradient
      colors={["#0154a5", "#0241a7"]}
      softness={0.8}
      intensity={0.25}
      speed={0.4}
    />
  </div>

  {/* Layer 2: Overlay pattern */}
  <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.3]">
    <Dithering
      colorFront="#0241a7"
      shape="warp"
      size={2.5}
      speed={0.2}
    />
  </div>

  {/* Layer 3: Animated scanning beam */}
  <motion.div
    className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent"
    animate={{ y: ["0%", "400%"] }}
    transition={{ duration: 15, repeat: Infinity }}
  />

  {/* Layer 4: Content */}
  <div className="relative z-10">Content goes here</div>
</div>
```

---

## 💡 COMPONENT EXAMPLES

### Hero Section with Mesh

```tsx
import { MeshBackground } from "@/components/ui/mesh-background"
import { motion } from "framer-motion"

export function MeshHero() {
  return (
    <MeshBackground
      colors={["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0"]}
      distortion={0.8}
      className="min-h-screen"
    >
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold mb-6 text-foreground"
        >
          Welcome to Shadway
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mb-8"
        >
          Beautiful design meets powerful functionality
        </motion.p>
        <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          Get Started
        </button>
      </div>
    </MeshBackground>
  )
}
```

### Highlighted Text Component

```tsx
import { Highlighter } from "@/components/ui/highlighter"

export function HighlightedText() {
  return (
    <h2 className="text-3xl font-bold">
      We build <Highlighter action="highlight">amazing</Highlighter> products
    </h2>
  )
}
```

### Responsive Card Grid

```tsx
export function CardGrid({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow duration-300"
        >
          <h3 className="font-semibold mb-2">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 🎓 DESIGN PRINCIPLES

### 1. Modern Minimalism
- Clean, uncluttered interfaces
- Intentional whitespace
- Focus on content
- Reduce cognitive load

### 2. Motion-First
- Smooth, purposeful animations
- Enhance UX, not distract
- Guide user attention
- Provide feedback

### 3. Accessibility
- WCAG AA compliance
- Keyboard navigation
- Semantic HTML
- Clear focus states

### 4. Dark/Light Mode
- Equal support for both
- OKLch adapts naturally
- Always test both themes
- No hardcoded colors

### 5. Performance
- 60fps animations
- Optimized rendering
- Lazy loading
- Smart visibility

### 6. Scalability
- Modular components
- Reusable patterns
- Easy maintenance
- Sustainable growth

---

## 📱 RESPONSIVE DESIGN

### Tailwind Breakpoints

```css
sm:  640px   /* Small phones */
md:  768px   /* Tablets */
lg:  1024px  /* Desktops */
xl:  1280px  /* Large screens */
2xl: 1536px  /* Ultra-wide */
```

### Mobile-First Pattern

```tsx
<div className={cn(
  /* Mobile defaults */
  "w-full px-4 py-2 text-sm",
  
  /* Tablet and up */
  "md:max-w-2xl md:mx-auto md:px-6 md:py-4",
  
  /* Desktop and up */
  "lg:max-w-6xl lg:px-8"
)}>
  Content here
</div>
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Responsive columns: 1 → 2 → 3 → 4 */}
</div>
```

---

## ♿ ACCESSIBILITY

### Essential Checklist

- [ ] Contrast ratio ≥ 4.5:1 for normal text
- [ ] Focus indicators visible and obvious
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`)
- [ ] Alt text for all images
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation fully working
- [ ] Respects `prefers-reduced-motion`
- [ ] Error messages clear and helpful

### Focus State Example

```tsx
<button className={cn(
  "px-4 py-2 rounded-lg bg-primary text-primary-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "transition-colors duration-200"
)}>
  Click me
</button>
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ⚡ PERFORMANCE

### Animation Performance

| ✅ DO | ❌ DON'T |
|-------|---------|
| `transform: translate()` | `left:` or `top:` positioning |
| `opacity` changes | `visibility` toggling |
| `content-visibility: auto` | Heavy off-screen layouts |
| Lazy load effects | Load everything upfront |
| Memoize components | Re-render unnecessarily |

### Image Optimization

```css
img {
  content-visibility: auto;
  contain: layout style paint;
}
```

### Lazy Load Shaders

```typescript
const [mounted, setMounted] = useState(false)

useEffect(() => setMounted(true), [])

return mounted && <MeshGradient {...props} />
```

---

## ✨ BEST PRACTICES

### Component Structure

```tsx
"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary"
  size?: "sm" | "md" | "lg"
}

/**
 * Component description
 * @example
 * <Component variant="default">Content</Component>
 */
export const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "base-styles",
        variant === "default" && "default-variant",
        size === "md" && "md-size",
        className
      )}
      {...props}
    />
  )
)

Component.displayName = "Component"
export type { ComponentProps }
```

### TypeScript Usage

- Always use strict mode
- Type all props
- Export types for external use
- Use interfaces for props
- Avoid `any` type

### Testing Checklist

- [ ] Light mode rendering
- [ ] Dark mode rendering
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Focus states visible
- [ ] Animations smooth (60fps)
- [ ] No console errors
- [ ] Lighthouse score > 90

---

## 📚 QUICK REFERENCE

### Files in Your Repository

- **SHADWAY_DESIGN_GUIDE.md** ← You are here
- **DESIGN_SYSTEM_INDEX.md** - Navigation guide
- **Session folder** - Extended documentation

### Files in Session Workspace

Located at: `C:\Users\WASIF\.copilot\session-state\...`

- SHADWAY_DESIGN_SYSTEM.md (full)
- SHADWAY_QUICK_REFERENCE.md
- SHADWAY_COOKBOOK.md (more examples)
- GETTING_STARTED.md

---

## 🚀 NEXT STEPS

1. **Now**: Read relevant sections above
2. **Today**: Implement one pattern from this guide
3. **This week**: Use patterns across your project
4. **Ongoing**: Reference when building features

---

## 📞 COMMON QUESTIONS

**Q: Do I have to use all these technologies?**  
A: No, Tailwind + Shadcn UI are the foundation. Add others as needed.

**Q: How do I stay consistent?**  
A: Bookmark this guide, reference before building new features.

**Q: Can AI agents use this?**  
A: Yes! It's structured for AI comprehension.

**Q: Is this production-ready?**  
A: Yes, all patterns are from the production Shadway project.

---

## 📊 STATISTICS

- **Total Content**: 28,000+ words
- **Code Examples**: 147+ snippets
- **Sections**: 68+ topics
- **Files**: 5 main documents
- **Time to Master**: 4-6 hours

---

**Version**: 1.0 | **Created**: April 19, 2026 | **Based On**: Shadway Project (Production)

---

**Ready to implement professional design? Start with color setup above and work your way through patterns. Good luck! 🚀**
