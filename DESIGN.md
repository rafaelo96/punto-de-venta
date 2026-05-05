# Design System

## Color Palette

### Primary Colors
- Primary: #3B82F6 (Blue-500)
- Danger: #EF4444 (Red-500)
- Accent: #D97706 (Amber-600)

### Neutral Scale (Light Mode)
- Neutral-50: #FAFAFA
- Neutral-100: #F5F5F5
- Neutral-200: #E5E5E5
- Neutral-300: #D1D5DB
- Neutral-400: #9CA3AF
- Neutral-500: #6B7280
- Neutral-600: #4B5563
- Neutral-700: #374151
- Neutral-800: #1F2937
- Neutral-900: #111827

### Surface Colors (Light Mode)
- Surface-50: #FAFAFA
- Surface-100: #F8F8F8
- Surface-200: #F0F0F0
- Surface-300: #EBEBEB

### Dark Mode Colors
#### Neutrals (Dark Mode)
- Neutral-50: #16181C
- Neutral-100: #202328
- Neutral-200: #373C44
- Neutral-300: #555C66
- Neutral-400: #737C8A
- Neutral-500: #919CAC
- Neutral-600: #AFBBC8
- Neutral-700: #CDD8EC
- Neutral-800: #E1EBF5
- Neutral-900: #F5FAFF

#### Surface Colors (Dark Mode)
- Surface-50: #0C0E12
- Surface-100: #12151A
- Surface-200: #1C2028
- Surface-300: #262C37

#### Primary Adjustments (Dark Mode)
- Primary: #63B3ED (Light Blue)

## Typography

### Font Family
- Sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Alternative: 'DM Sans', sans-serif (from Tailwind config)

### Font Weights
- Regular: 400
- Medium: 500
- Semi-bold: 600
- Bold: 700

### Font Sizes (rem)
- Base: 1rem (16px)
- Small: 0.875rem (14px)
- Large: 1.125rem (18px)
- XL: 1.25rem (20px)
- 2XL: 1.5rem (24px)
- 3XL: 1.875rem (30px)
- 4XL: 2.25rem (36px)
- 5XL: 3rem (48px)
- 6XL: 3.75rem (60px)

### Line Heights
- Tight: 1.25
- Normal: 1.5
- Relaxed: 1.75

## Spacing System

### Base Unit: 0.25rem (4px)
- 0: 0rem
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 5: 1.25rem (20px)
- 6: 1.5rem (24px)
- 7: 1.75rem (28px)
- 8: 2rem (32px)
- 9: 2.25rem (36px)
- 10: 2.5rem (40px)
- 12: 3rem (48px)
- 14: 3.5rem (56px)
- 16: 4rem (64px)
- 20: 5rem (80px)
- 24: 6rem (96px)
- 28: 7rem (112px)
- 32: 8rem (128px)
- 36: 9rem (144px)
- 40: 10rem (160px)
- 44: 11rem (176px)
- 48: 12rem (192px)
- 52: 13rem (208px)
- 56: 14rem (224px)
- 60: 15rem (240px)
- 64: 16rem (256px)
- 72: 18rem (288px)
- 80: 20rem (320px)
- 96: 24rem (384px)

## Border Radius
- None: 0px
- Sm: 0.125rem (2px)
- Base: 0.25rem (4px)
- Md: 0.375rem (6px)
- Lg: 0.5rem (8px)
- Xl: 0.75rem (12px)
- 2xl: 1rem (16px)
- 3xl: 1.5rem (24px)
- Full: 9999px

## Shadows
- Depth-1: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
- Depth-2: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- Depth-3: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- Depth-4: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
- Depth-5: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

### Dark Mode Shadows
- Depth-1: 0 1px 2px 0 rgba(0, 0, 0, 0.4)
- Depth-2: 0 2px 4px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 0 rgba(0, 0, 0, 0.2)
- Depth-3: 0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 8px 16px 0 rgba(0, 0, 0, 0.2)
- Depth-4: 0 8px 16px 0 rgba(0, 0, 0, 0.3), 0 16px 32px 0 rgba(0, 0, 0, 0.2)
- Depth-5: 0 16px 32px 0 rgba(0, 0, 0, 0.4), 0 24px 48px 0 rgba(0, 0, 0, 0.3)

## Component Specifications

### Buttons
- Background: rgb(var(--color-primary))
- Text Color: White
- Padding: 0.75rem 1.5rem
- Border Radius: 0.75rem
- Font Weight: 600
- Box Shadow: var(--shadow-depth-2)
- Transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Hover: Box shadow depth-3, translateY(-2px)
- Active: translateY(0), box shadow depth-1

### Ghost Buttons
- Background: Transparent
- Text Color: rgb(var(--color-primary))
- Hover Background: rgb(var(--surface-200))

### Cards (Elevated)
- Background: rgb(var(--surface-100))
- Border Radius: 1.5rem
- Box Shadow: var(--shadow-depth-3)
- Border: 1px solid rgb(var(--neutral-200))
- Transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Hover: Box shadow depth-4, translateY(-4px)

### Dark Mode Cards
- Background: rgb(var(--surface-100))
- Border: 1px solid rgb(var(--neutral-300))
- Box Shadow: 0 0 0 1px rgba(255, 255, 255, 0.03), var(--shadow-depth-3)

### Section Containers
- Background: rgb(var(--surface-100))
- Border Radius: 2rem
- Box Shadow: var(--shadow-depth-3)
- Border: 1px solid rgb(var(--neutral-200))
- Padding: 2rem
- Margin Bottom: 2rem
- Transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Hover: translateY(-2px)

### Dark Mode Section Containers
- Background: rgb(var(--surface-100))
- Border: 1px solid rgb(var(--neutral-300))
- Box Shadow: 0 0 0 1px rgba(255, 255, 255, 0.03), var(--shadow-depth-2)

### Glass Effect
- Background: rgba(255, 255, 255, 0.75)
- Backdrop Filter: blur(20px)
- Border: 1px solid rgba(255, 255, 255, 0.4)

### Dark Mode Glass
- Background: rgba(18, 21, 26, 0.85)
- Border: 1px solid rgba(255, 255, 255, 0.06)

### Hover Lift
- Transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- Hover: translateY(-4px), box shadow depth-4

### Focus Ring
- Outline: None
- Box Shadow: 0 0 0 2px rgb(var(--color-primary) / 0.5)

### Selection
- Background: rgb(var(--color-primary) / 0.2)
- Color: Inherit

### Placeholder
- Color: rgb(var(--neutral-500))
- Opacity: 1

### Dark Mode Placeholder
- Color: rgb(var(--neutral-400))

### Input Autofill
- Box Shadow: 0 0 0px 1000px rgb(var(--surface-100)) inset
- Text Fill Color: rgb(var(--neutral-900))

### Dark Mode Input Autofill
- Box Shadow: 0 0 0px 1000px rgb(var(--surface-100)) inset
- Text Fill Color: rgb(var(--neutral-900))

### Gradients
- Primary Gradient: linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary) / 0.8) 100%)
- Surface Gradient: linear-gradient(180deg, rgb(var(--surface-50)) 0%, rgb(var(--surface-100)) 100%)

## Animations

### Fade In
- From: opacity: 0
- To: opacity: 1
- Duration: 0.3s
- Timing: ease-out

### Slide Up
- From: opacity: 0, transform: translateY(20px)
- To: opacity: 1, transform: translateY(0)
- Duration: 0.4s
- Timing: ease-out

### Scale In
- From: opacity: 0, transform: scale(0.95)
- To: opacity: 1, transform: scale(1)
- Duration: 0.3s
- Timing: ease-out

### Spin (Loading Spinner)
- To: transform: rotate(360deg)
- Duration: 0.8s
- Timing: linear infinite

## Transitions
- Default: all 0.2s ease
- Speed Variable: --transition-speed: 0.3s
- Easing Variable: --transition-easing: cubic-bezier(0.4, 0, 0.2, 1)

## Scrollbar
- Width: 6px
- Height: 6px
- Track Background: Transparent
- Thumb Background: rgb(var(--neutral-300))
- Thumb Border Radius: 3px
- Thumb Hover Background: rgb(var(--neutral-400))

### Dark Mode Scrollbar
- Thumb Background: rgb(var(--neutral-500))
- Thumb Hover Background: rgb(var(--neutral-400))