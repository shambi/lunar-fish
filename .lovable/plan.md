
# The Lunar Fisherman Dashboard

## Overview
A premium, mobile-first fishing dashboard with a dark atmospheric theme (deep blues/teals) that dynamically calculates moon phases and fishing forecasts.

## Features

### 1. Header
- App name "The Lunar Fisherman" with a subtle moon icon
- Today's date displayed dynamically
- Location placeholder text

### 2. Moon Phase Display (Hero Section)
- Large, glowing moon phase icon in the center using CSS/emoji rendering
- Moon phase name (e.g., "Waxing Gibbous") calculated from current date
- Illumination percentage
- Subtle glow/pulse animation around the moon

### 3. Fishing Forecast
- 1-5 star rating based on moon phase (Full/New Moon = 5 stars, Quarter = 2-3 stars)
- Brief text explanation of why the rating is what it is
- Visual star display with glow effects

### 4. Weather Widget (Placeholder)
- Card showing placeholder weather data (temperature, wind, conditions)
- Clean icon-based layout

### 5. Top Baits for Today
- List of 4-5 recommended baits based on moon phase category
- Each bait shown as a styled card/chip with an icon

## Design
- Dark background with deep navy/teal gradients
- Glassmorphism cards with subtle borders
- Glowing accents in teal/cyan
- Smooth animations
- Fully mobile-responsive, optimized for phone-first viewing

## Technical
- Pure JS moon phase calculation using synodic month algorithm (no API needed)
- All data derived from `new Date()` at render time
- Single page, no backend required
