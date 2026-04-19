# 📖 Shadway Design System Documentation

**Complete design system and styling guide based on Shadway's modern approach.**

This document explains how Shadway handles design, including design patterns, tools, and best practices. Use this as a template reference for your other projects.

---

## 🎯 Quick Navigation

- **Want quick answers?** → See "QUICK REFERENCE" section below
- **Need code examples?** → See "COOKBOOK" section
- **Learning the system?** → Read full sections
- **AI agent setup?** → Focus on "Quick Reference" first

---

## ⚡ QUICK REFERENCE

### Color System (OKLch)

```css
/* Light Mode */
:root {
  --background: oklch(1 0 0);              /* White */
  --foreground: oklch(0.145 0 0);          /* Black */
  --primary: oklch(0.205 0 0);             /* Dark blue-gray */
  --accent: oklch(0.97 0 0);               /* Light gray */
  --border: oklch(0.922 0 0);              /* Very light border */
  --destructive: oklch(0.577 0.245 27.325);/* Red */
}

/* Dark Mode */
.dark {
  --background: oklch(0.145 0 0);          /* Black */
  --foreground: oklch(0.985 0 0);          /* White */
  --primary: oklch(0.922 0 0);             /* Light */
  --accent: oklch(0.269 0 0);              /* Slightly lighter dark */
  --border: oklch(1 0 0 / 10%);            /* Subtle white border */
}
```

### Animation Patterns

```typescript
// Stagger animation
const staggerHeading = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};

// Scroll trigger
const isInView = useInView(ref, { once: true, margin: "-10%" })

// Scanning beam
<motion.div animate={{ y: ["0%", "400%"] }} transition={{ duration: 15, repeat: Infinity }} />
```

### Shader Components

```typescript
// Import
import { GrainGradient, MeshGradient, Dithering } from "@paper-design/shaders-react"

// Grain texture
<GrainGradient width="100%" height="100%" colors={["#0154a5"]} softness={0.8} />

// Mesh blobs
<MeshGradient colors={["#72b9bb", "#b5d9d9"]} distortion={0.8} speed={0.42} />

// Dithering pattern
<Dithering colorFront="#0241a7" shape="warp" type="4x4" size={2.5} />
```

---

## 📚 COOKBOOK - Ready-to-Use Examples

### Hero Section (Mesh Gradient)

```tsx
import { MeshBackground } from "@/components/ui/mesh-background"

export function MeshHero() {
  return (
    <MeshBackground colors={["#72b9bb", "#b5d9d9", "#ffd1bd"]} distortion={0.8}>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-6xl font-bold mb-6">Welcome</h1>
        <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg">
          Get Started
        </button>
      </div>
    </MeshBackground>
  )
}
```

### Card with Highlighting

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Highlighter } from "@/components/ui/highlighter"

export function HighlightedCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Highlighter action="highlight" color="rgba(79, 139, 255, 0.32)" isView={true}>
            Featured
          </Highlighter>
        </CardTitle>
      </CardHeader>
      <CardContent>Description here</CardContent>
    </Card>
  )
}
```

### Button Variants

```tsx
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        outline: "border border-border bg-background hover:bg-muted",
        ghost: "bg-transparent hover:bg-muted",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
)
```

### Staggered List Animation

```tsx
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export function AnimatedList({ items }: { items: string[] }) {
  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="visible">
      {items.map((item, i) => (
        <motion.li key={i} variants={itemVariants} className="p-4 rounded-lg bg-muted">
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

### Scroll-Triggered Animation

```tsx
import { useInView } from "motion/react"
import { motion } from "framer-motion"
import { useRef } from "react"

export function ScrollAnimation({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.div>
  )
}
```

### Form with Validation

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name too short"),
})

type FormData = z.infer<typeof schema>

export function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(console.log)} className="space-y-4">
      <input {...register("name")} placeholder="Name" className="w-full p-2 border rounded" />
      {errors.name && <p className="text-destructive">{errors.name.message}</p>}
      <input {...register("email")} type="email" placeholder="Email" className="w-full p-2 border rounded" />
      {errors.email && <p className="text-destructive">{errors.email.message}</p>}
      <button type="submit" className="w-full bg-primary text-primary-foreground p-2 rounded">Submit</button>
    </form>
  )
}
```

### Two-Column Responsive Layout

```tsx
export function TwoColumn() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-4">Left Column</h2>
        <p className="text-muted-foreground">Content here</p>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-full aspect-square bg-muted rounded-lg" />
      </div>
    </div>
  )
}
```

### Card Grid

```tsx
export function CardGrid({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <div key={i} className="p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow">
          <h3 className="font-semibold mb-2">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 🎨 Design Principles

### 1. Modern Minimalism
- Clean, uncluttered interfaces
- Intentional whitespace
- Focus on content
- Reduce cognitive load

### 2. Motion-First
- Smooth, purposeful animations (400-800ms for page transitions, 200-400ms for micro-interactions)
- Entrance: ease-in or ease-in-out
- Exit: ease-out
- Enhance UX, don't distract

### 3. Accessibility
- WCAG AA compliant (contrast ratio ≥ 4.5:1)
- Keyboard navigation fully supported
- Semantic HTML
- ARIA labels where needed
- Respect `prefers-reduced-motion`

### 4. Dark/Light Mode
- Both themes equally supported
- OKLch colors adapt naturally
- Always test in both modes
- No hardcoded colors

### 5. Scalability
- Modular components
- Reusable patterns
- Easy to maintain
- Grow without breaking

### 6. Performance
- 60fps animations
- Optimized bundle
- Content visibility: auto
- Smart rendering

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| Next.js | Framework | 15+ |
| React | UI Library | 19+ |
| TypeScript | Type Safety | 5+ |
| Tailwind CSS | Styling | 4+ |
| Shadcn UI | Components | Latest |
| Framer Motion | Animations | 12.23+ |
| @paper-design/shaders | Visual Effects | 0.0.61 |
| rough-notation | Highlights | 0.5.1 |
| next-themes | Dark Mode | 0.4.6 |

---

## 📱 Responsive Design

### Tailwind Breakpoints

```css
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Mobile-First Pattern

```tsx
<div className={cn(
  "w-full p-4",                    /* Mobile: full width */
  "md:max-w-2xl md:mx-auto md:p-6" /* Tablet+: constrained */
)}>
  {/* Content */}
</div>
```

---

## ✨ Key Features

### Paper Design Shaders

1. **GrainGradient** - Adds texture to backgrounds
2. **MeshGradient** - Animated blob-like gradients
3. **Dithering** - Technical stippled patterns
4. **StaticRadialGradient** - Static radial effects
5. **GodRays** - Volumetric light beams

### Rough Notation Annotations

- `highlight` - Colored background
- `underline` - Underneath
- `box` - Border
- `circle` - Circular border
- `strike-through` - Line through
- `crossed-off` - X pattern
- `bracket` - Bracket marks

### OKLch Color Model

```
oklch(lightness saturation hue)
     0-1      0-0.4      0-360°
```

Perceptually uniform - colors feel consistent when adjusted.

---

## 🎯 Implementation Checklist

### Phase 1: Foundation (30 min)
- [ ] Install dependencies
- [ ] Configure OKLch colors
- [ ] Setup theme provider
- [ ] Create base components

### Phase 2: Styling (1-2 hours)
- [ ] Color system (light + dark)
- [ ] Typography scale
- [ ] Base component styles
- [ ] Tailwind utilities

### Phase 3: Animation (1-2 hours)
- [ ] Framer Motion setup
- [ ] Animation variants
- [ ] Scroll triggers
- [ ] Micro-interactions

### Phase 4: Effects (1 hour)
- [ ] Shader components
- [ ] Gradient backgrounds
- [ ] Effect layering
- [ ] Visual polish

### Phase 5: Enhancement (2-4 hours)
- [ ] Highlighter component
- [ ] Interactive elements
- [ ] Complex layouts
- [ ] Advanced patterns

### Phase 6: Quality (1-2 hours)
- [ ] Responsive testing
- [ ] Accessibility audit
- [ ] Performance check
- [ ] Browser testing

---

## ⚡ Performance Tips

| ✅ DO | ❌ DON'T |
|-------|---------|
| Use `transform` for animations | Animate `left`, `top` properties |
| Use `opacity` changes | Use `visibility` toggling |
| `content-visibility: auto` | Heavy layouts off-screen |
| Lazy load shaders | Load all effects |
| Use `will-change` sparingly | Over-use `will-change` |

---

## ♿ Accessibility Essentials

- [ ] Contrast ratio ≥ 4.5:1 (normal text)
- [ ] Focus indicators visible and obvious
- [ ] Semantic HTML (`<button>`, not `<div>`)
- [ ] Alt text for all images
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation fully supported
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Error messages are clear

---

## 🎓 Component Template

```tsx
"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary"
  size?: "sm" | "md" | "lg"
}

/**
 * [ComponentName] - Description
 * @example
 * <Component variant="default" size="md">Content</Component>
 */
export const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "base-classes",
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

---

## 📚 Document Structure

**Based on:** Shadway Project (Production)  
**Version:** 1.0  
**Last Updated:** April 19, 2026

See related sections:
- Full Design System → See `02_DESIGN_SYSTEM.md` in `/DESIGN_SYSTEM` folder
- More Examples → See `03_COOKBOOK.md` in `/DESIGN_SYSTEM` folder
- Session Workspace → `C:\Users\WASIF\.copilot\session-state\...`

