# TenchiOne Design System

## Brand Identity
- **Name**: TenchiOne
- **Tagline**: "Smart Commerce Operations Transformation & Technology"
- **Acronym**: SCOTT
- **Industry**: Enterprise S&OP, Supply Chain, Inventory Management

## Color Palette

### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Navy Dark | `#1a1a2e` | Primary background, headers |
| Tenchi Orange | `#e89a2d` | Accent, CTAs, highlights, logo |
| Deep Navy | `#0f172a` | Dark mode background |
| Pure White | `#ffffff` | Cards, text on dark |

### Semantic Colors
| State | Color | Tailwind |
|-------|-------|----------|
| Success/Good | `#22c55e` | `text-emerald-500` |
| Warning/Slow | `#f59e0b` | `text-amber-500` |
| Error/Bad | `#ef4444` | `text-rose-500` |
| Info | `#3b82f6` | `text-blue-500` |
| Purple | `#8b5cf6` | `text-violet-500` |
| Cyan | `#06b6d4` | `text-cyan-500` |

### Background Colors
| Usage | Light Mode | Dark Mode |
|-------|-----------|-----------|
| Page Background | `#f8fafc` | `#0f172a` |
| Card Background | `rgba(255,255,255,0.8)` | `rgba(30,41,59,0.8)` |
| Elevated Card | `#ffffff` | `#1e293b` |
| Hover State | `#f1f5f9` | `#334155` |

### Gradient Definitions
```css
/* Primary Gradient */
--gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);

/* Success Gradient */
--gradient-success: linear-gradient(135deg, #22c55e 0%, #10b981 100%);

/* Warning Gradient */
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);

/* Dark Gradient */
--gradient-dark: linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%);

/* Glass Effect */
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

## Typography

### Font Families
- **Primary**: Inter (Google Fonts) - weights: 400, 500, 600, 700
- **Monospace**: JetBrains Mono - for SKU codes, data display
- **Display**: Inter with tight letter-spacing for headings

### Type Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 2.5rem (40px) | 700 | 1.2 |
| H2 | 2rem (32px) | 700 | 1.25 |
| H3 | 1.5rem (24px) | 600 | 1.3 |
| H4 | 1.25rem (20px) | 600 | 1.4 |
| Body Large | 1.125rem (18px) | 400 | 1.6 |
| Body | 1rem (16px) | 400 | 1.5 |
| Body Small | 0.875rem (14px) | 400 | 1.5 |
| Caption | 0.75rem (12px) | 500 | 1.4 |
| Overline | 0.75rem (12px) | 600 | 1.4 |

## Spacing System

### Layout Spacing
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing, icon gaps |
| sm | 8px | Component internal spacing |
| md | 16px | Card padding, section gaps |
| lg | 24px | Page padding, grid gaps |
| xl | 32px | Large section spacing |
| 2xl | 48px | Major section breaks |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| sm | 6px | Small buttons, badges |
| md | 8px | Inputs, small cards |
| lg | 12px | Cards, modals |
| xl | 16px | Large cards, containers |
| 2xl | 24px | Feature cards, hero |
| full | 9999px | Pills, avatars |

## Component Styles

### Cards
```css
.card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

### Buttons
```css
.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.btn-secondary {
  background: white;
  color: #1a1a2e;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}
```

### Inputs
```css
.input {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

### Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background: #dcfce7;
  color: #166534;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-error {
  background: #fee2e2;
  color: #991b1b;
}
```

## Animation System

### Timing Functions
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Durations
- Micro: 100ms (button states, color changes)
- Fast: 200ms (hovers, small transitions)
- Normal: 300ms (entrances, modals)
- Slow: 500ms (page transitions, large movements)
- Chart: 1000ms (data visualizations)

### Animation Presets
```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Slide In Right */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Pulse Glow */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }
}

/* Shimmer (Loading) */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

## Layout Grid

### Dashboard Layout
- Max Width: 1600px
- Sidebar Width: 280px (collapsible to 80px)
- Header Height: 64px
- Content Padding: 24px
- Grid Gap: 24px

### Responsive Breakpoints
| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, stacked cards |
| Tablet | 640-1024px | 2 columns, condensed sidebar |
| Desktop | 1024-1440px | Full layout |
| Wide | > 1440px | Expanded grids, more content |

## Chart Styles

### Color Palette for Charts
```javascript
const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  purple: '#a855f7',
  pink: '#ec4899',
  orange: '#f97316',
  teal: '#14b8a6',
};
```

### Chart Gradients
```css
.chart-gradient-blue {
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 100%);
}

.chart-gradient-green {
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0) 100%);
}
```

## Icon System
- **Library**: Lucide React
- **Default Size**: 20px
- **Stroke Width**: 2
- **Sizes**: sm(16), md(20), lg(24), xl(32)

## Shadow System
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);
```

## Z-Index Scale
| Layer | Z-Index | Usage |
|-------|---------|-------|
| Background | 0 | Page background |
| Content | 10 | Main content |
| Cards | 20 | Floating cards |
| Sticky Header | 30 | Fixed header |
| Dropdowns | 40 | Select menus |
| Modals | 50 | Dialog overlays |
| Toast | 60 | Notifications |
| Tooltip | 70 | Hover tooltips |
| AI Assistant | 80 | Floating chat |
