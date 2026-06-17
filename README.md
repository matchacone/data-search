Update logs:

5/13/2026
- Project Initialization
    - initialized Next.js project
    - initialized Django project
    - services folder

5/28/2026
- Scrapy Initialized (Crawler)

5/29/2026
- Landing page static design

6/17/2026
- Frontend redesign (glassmorphic minimalism)
    - full dark-mode design system with OKLCH color tokens
    - Sora + Inter typography via next/font
    - interactive dot grid with cyan mouse-spotlight effect
    - Logo component (SVG magnifying glass with cyan data-wave)
    - glassmorphic pill SearchBar with lucide-react icons
    - DatasetCard component (matches DatasetEngineItem schema)
        - color-coded file format badges (CSV, JSON, PDF, XLSX, XML, API)
        - tag pills, description clamp, download + explore CTA
    - SPA search flow: hero → compact header + results grid
    - shimmer skeleton loading state
    - format filter chips (All / CSV / JSON / PDF / API / XLSX)
    - mock dataset data (6 datasets from NASA, Census, WHO, World Bank, FDA, NOAA)
    - installed lucide-react for icons

WIP:
- Crawler
- Django API + search pipeline