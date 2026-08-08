# 🏙️ City Map Component

An interactive, pan-and-zoom city map that serves as the main navigation hub for the Computer Science course. Students explore a beautiful 2D city where each district represents a course unit. Built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, and `react-zoom-pan-pinch`.

---

## 📸 What It Looks Like

- **Desktop**: Interactive map with hover glow, click-to-zoom, and a floating info card on the right
- **Mobile**: Draggable/pinch-zoomable map with a bottom sheet info card
- **Initial view**: Auto-focused on Web Harbor (Web Technology II) as the starting district

---

## 🗂️ File Structure

```
components/city-map/
├── CityMap.tsx           # Main map component (pan/zoom logic, camera, controls)
├── DistrictOverlay.tsx   # SVG polygon per district (hover glow, click handler)
├── InfoCard.tsx          # Side panel / bottom sheet with district details
└── README.md             # You are here

data/
├── districts.ts          # District data (name, colors, coords, route)
└── districts-types.ts    # TypeScript types

hooks/
└── useProgress.ts        # localStorage-based progress tracking

public/assets/
├── city-map.svg          # Main isometric city illustration
└── city-background.png   # Landscape backdrop (currently unused, ready to enable)
```

---

## 🏗️ Architecture Overview

The map is built in **layered stacks** for clean separation of concerns:

```
┌─────────────────────────────────────────┐
│ Layer 4: UI (Header, zoom buttons, card)│  ← Fixed, doesn't pan/zoom
├─────────────────────────────────────────┤
│ Layer 3: District labels (pills)        │  ← Inside map, pans/zooms with it
├─────────────────────────────────────────┤
│ Layer 2: Polygon overlay (click zones)  │  ← Inside map, invisible hitboxes
├─────────────────────────────────────────┤
│ Layer 1: City SVG (the artwork)         │  ← Inside map, visual only
├─────────────────────────────────────────┤
│ Layer 0: Background gradient            │  ← Fills viewport
└─────────────────────────────────────────┘
```

**Key insight:** The city SVG, polygons, and labels all live inside the **same container** (`mapInnerRef`). They scale, pan, and zoom **together as one unit**. This is why polygon alignment stays perfect no matter what the user does.

---

## 🎯 Core Concepts

### 1. Pan & Zoom (`react-zoom-pan-pinch`)

We use [`react-zoom-pan-pinch`](https://github.com/prc5/react-zoom-pan-pinch) to handle all interaction:
- **Mouse drag** → pan
- **Scroll wheel** → zoom
- **Pinch (touch)** → zoom
- **Double-click** → reset

The map container is intentionally **larger than the viewport** (e.g., `160vmin` on desktop, `220vw` on mobile). This forces users to pan around to explore, creating a "city discovery" feeling.

### 2. Districts as Data

Every district is a plain object in `data/districts.ts`:

```typescript
{
  id: 'web-technology',
  name: 'Web Harbor',
  courseTitle: 'Web Technology II',
  description: 'Set sail through HTML, CSS, JavaScript, PHP...',
  color: '#F5A623',              // Used for glow, icons, progress bar
  glowColor: 'rgba(...)',        // Softer version for shadows
  polygonPoints: '43,12 68,12 68,35 43,33',  // Click zone (percentage coords)
  centerCoords: { x: 55, y: 22 },            // Camera target
  totalLessons: 12,
  route: '/learn/computer-science/web-technology',
  Icon: Ship,                     // lucide-react icon component
}
```

### 3. Percentage-Based Coordinates

Both `polygonPoints` and `centerCoords` use **percentages (0-100)** relative to the map SVG's `viewBox="0 0 100 100"`. This means:
- ✅ Coords work at any screen size
- ✅ Polygons stay aligned when map is resized
- ✅ No pixel calculations needed

### 4. Camera Focus Math

When a district is clicked, we programmatically pan the map so that district appears at a specific viewport position:

```typescript
// District's pixel position within the map
const districtX = (district.centerCoords.x / 100) * mapWidth;
const districtY = (district.centerCoords.y / 100) * mapHeight;

// Where we want it to appear on screen
const targetVX = viewportW * 0.20;  // 20% from left (leaves room for info card)
const targetVY = viewportH * 0.50;  // vertical center

// Translation needed
const newX = targetVX - districtX * FOCUS_ZOOM;
const newY = targetVY - districtY * FOCUS_ZOOM;

transformRef.current.setTransform(newX, newY, FOCUS_ZOOM, 600, 'easeOut');
```

---

## 🎛️ Tuning Knobs (Top of `CityMap.tsx`)

All the "magic numbers" that control the feel:

```typescript
const FOCUS_ZOOM = 1.8;   // Zoom level when a district is clicked
const MIN_ZOOM = 0.9;     // Furthest zoom-out allowed
const MAX_ZOOM = 4;       // Closest zoom-in allowed
```

### Inside `focusDistrict()`:

```typescript
const targetVX = isMobile ? viewportW * 0.5 : viewportW * 0.20;
const targetVY = isMobile ? viewportH * 0.32 : viewportH * 0.5;
```

| Variable | Effect | Try if... |
|---|---|---|
| `FOCUS_ZOOM` | How close the camera gets | Too tight? Lower to `1.5`. Too far? Raise to `2.2` |
| `targetVX` (desktop) | Horizontal landing position | Card covers district? Lower to `0.15`. Too far left? Raise to `0.25` |
| `targetVY` (mobile) | Vertical landing position | Bottom sheet covers district? Lower to `0.28` |

### Map container size (in JSX):

```tsx
className="relative
           w-[220vw] h-[220vw]           /* Mobile: big draggable canvas */
           md:w-[160vmin] md:h-[160vmin] /* Tablet+ */
           lg:w-[150vmin] lg:h-[150vmin]
           xl:w-[140vmin] xl:h-[140vmin]"
```

Change these to make the whole map bigger/smaller. Polygons scale automatically.

---

## 🖼️ Adding or Editing Districts

### To modify an existing district:
1. Open `data/districts.ts`
2. Find the district by `id`
3. Update fields as needed
4. Save — hot reload picks it up

### To add a new district:
1. Add a new object to the `DISTRICTS` array in `data/districts.ts`
2. Fill in all required fields (see interface in `data/districts-types.ts`)
3. Choose a lucide-react icon and import it at the top of the file
4. Test hover, click, camera focus, and info card display

### Getting polygon coordinates:

**Fast method (recommended):**
1. Temporarily enable debug outlines in `DistrictOverlay.tsx`:
   ```tsx
   <polygon
     points={district.polygonPoints}
     fill={district.color}
     fillOpacity="0.35"
     stroke={district.color}
     strokeWidth="0.3"
   />
   ```
2. Reload the page
3. See colored overlays on each district — nudge coord values until they cover the correct areas
4. **Remove the debug polygon** when done

**Manual method:**
- Open the city SVG in an editor (Figma, Inkscape)
- Identify the district's corners as % of the total map (e.g., top-left corner is at 43% width, 12% height)
- Format as `"x1,y1 x2,y2 x3,y3 x4,y4"` — clockwise from top-left

### Getting center coordinates:
- Just eyeball the visual center of the district in percentages
- Or use `(polygonMinX + polygonMaxX) / 2, (polygonMinY + polygonMaxY) / 2`

---

## 💳 Info Card Behavior

### Desktop (`≥ 768px`)
- Slides in from the **right** as a floating panel
- Semi-transparent white with rounded corners
- Fixed at vertical center
- Close via X button

### Mobile (`< 768px`)
- Slides up from the **bottom** as a bottom sheet
- Rounded top corners only
- Dark backdrop appears behind it (dims map, tap to close)
- Drag handle at top — swipe down to close
- Scrollable if content exceeds screen height

Both modes render **the exact same content**, styled responsively via Tailwind breakpoints.

### Card content includes:
- Colored icon badge (district's `Icon` in its `color`)
- District name + course title
- Description
- Stats: total lessons, completed count
- Progress bar (reads from `useProgress` hook)
- Explore button (`DuolingoButton` — navigates to `district.route`)

---

## 🎨 Design System Notes

- **Typography**: `slate-800` for headings, `slate-500` for body text
- **Card**: Pure white `bg-white`, `border-slate-200`, subtle shadow
- **Buttons**: Uses `DuolingoButton` from `components/shared/Button.tsx` — always warm orange primary
- **District colors**: Each district has a unique brand color used in 3 places max — icon, glow, progress bar
- **Icons**: All from `lucide-react` (no emojis for consistency)

---

## 🔧 Common Issues & Fixes

### "Polygons don't align with districts"
- **Cause 1**: Someone added a `transform: scale(...)` on the city SVG only — this scales the artwork without scaling polygons. **Fix**: Remove the transform.
- **Cause 2**: Polygon coords are outdated. **Fix**: Enable debug outlines and recalibrate (see above).

### "Info card covers the selected district"
- Adjust `targetVX` in `focusDistrict` — lower value pushes district further left, giving card more space
- Or reduce `FOCUS_ZOOM` — smaller district = fits better in available space

### "Map jumps to wrong location on click"
- Check that `centerCoords` in `districts.ts` matches where that district actually is in the artwork
- Turn on debug mode with a red circle at `centerCoords` to visualize

### "TypeScript errors on `transformRef.current.state`"
- The `react-zoom-pan-pinch` API path is `transformRef.current.state.scale` — not `.instance.transformState`

### "Turbopack warning about webpack config"
- The SVGR loader is configured for Turbopack in `next.config.ts` under the `turbopack.rules` key — not in `webpack()`

### "Map is too small / too big on my screen"
- Adjust the responsive width classes on the `mapInnerRef` div
- Use `vmin` for square-friendly sizing (adapts to smaller viewport dimension)
- Use `vw` for mobile if you want the map to always overflow horizontally

---

## 📊 Data Flow

```
User clicks district polygon
        ↓
DistrictOverlay onClick(id)
        ↓
CityMap.focusDistrict(id)
        ↓
setSelectedId(id)  ─────────┐
        ↓                   ↓
Camera pans/zooms       InfoCard receives district prop
        ↓                   ↓
Framer animation        Slides in from right (or up on mobile)
                            ↓
                        User clicks "Explore"
                            ↓
                        Router pushes to district.route
```

---

## 🧪 Testing Checklist

Before merging changes to this component, verify:

**Desktop:**
- [ ] Hover over each district → only that district glows
- [ ] Click a district → smooth zoom, info card appears on right
- [ ] Clicking district doesn't get covered by info card
- [ ] Close (X) or click outside → zoom resets
- [ ] Zoom in/out buttons work
- [ ] Reset button returns to initial Web Harbor view
- [ ] Mouse wheel zoom works
- [ ] Drag pan works smoothly

**Mobile:**
- [ ] Map is draggable with finger
- [ ] Pinch-to-zoom works (test on real device)
- [ ] Tapping a district zooms in + bottom sheet appears
- [ ] Bottom sheet is dismissible via swipe down, X, or backdrop tap
- [ ] District labels are readable

**Edge cases:**
- [ ] Refresh page → no hydration errors in console
- [ ] Rapid clicking between districts → animations don't break
- [ ] Very slow network → skeleton/loading state present (TODO)
- [ ] Progress persists after page reload (localStorage)

---

## 🚀 Future Enhancements (Backlog)

Nice-to-haves that aren't in Phase 1:

- [ ] **Sound effects** — soft hover, click, unlock sounds
- [ ] **Cinematic intro** — camera flies from overview → Web Harbor on load
- [ ] **Mini-map** in corner showing viewport position
- [ ] **Background blur** when info card is open (depth-of-field effect)
- [ ] **Onboarding hint** — "Drag to explore" tooltip on first visit
- [ ] **Haptic feedback** on mobile district tap (`navigator.vibrate`)
- [ ] **Loading skeleton** while SVG loads
- [ ] **Analytics** — track which districts get clicked most

---

## 🔗 Dependencies

| Package | Purpose |
|---|---|
| `next` (v15+) | React framework, image optimization, routing |
| `framer-motion` | Info card slide animations, polygon glow effects |
| `react-zoom-pan-pinch` | Pan/zoom map interactions |
| `lucide-react` | All icons (district icons, close, book, trophy, etc.) |
| `@svgr/webpack` | Import SVG as React component |
| `tailwindcss` | All styling |

---

## 👥 Ownership

**Original author**: Rishab Thapa
**Last updated**: [2026 july 04]


For questions or design decisions, ping the frontend team lead. For content changes (district descriptions, lesson counts), edit `data/districts.ts` directly — no code changes needed.

---

## 📝 License

Internal use only — Adaptiv Education Platform.
