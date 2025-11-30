# 🦎 Design Chameleon

AI-powered design system extractor. Upload any UI screenshot, website design, or moodboard and get a complete design system with colors, typography, and styles — ready as CSS, Tailwind, or shadcn/ui code.

![Design Chameleon](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## ✨ Features

- **🖼️ Drag & Drop Upload** — Support for PNG, JPG, WebP up to 10MB
- **🤖 AI Analysis** — Claude Vision API extracts design tokens
- **🎨 Complete Color Palette** — Primary, secondary, accent, semantic colors & gradients
- **📝 Typography** — Font families, sizes, weights, line heights
- **🎯 Styles** — Border radius, shadows, spacing scale
- **👁️ Live Preview** — See your design system in Dashboard, Landing & Cards views
- **📋 Code Export** — Copy-ready CSS variables, Tailwind config, or shadcn/ui theme

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/design-chameleon.git
cd design-chameleon
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📸 How It Works

1. **Upload** — Drag & drop or click to upload a UI reference image
2. **Analyze** — Claude Vision API examines the image and extracts design tokens
3. **Explore** — Browse extracted colors, typography, and styles
4. **Preview** — See your design system applied to real UI components
5. **Export** — Copy the code in your preferred format

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Next.js 15 |
| Styling | Tailwind CSS 4.0 |
| Language | TypeScript 5 |
| AI/ML | Claude Vision API (claude-sonnet-4-20250514) |
| Animation | Framer Motion |
| Icons | Lucide React |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── analyze/      # Claude Vision API integration
│   ├── globals.css       # Global styles & CSS variables
│   ├── layout.tsx        # Root layout with fonts
│   └── page.tsx          # Main application page
├── components/
│   ├── UploadZone.tsx    # Drag & drop image upload
│   ├── ColorPalette.tsx  # Color swatches display
│   ├── TypographyDisplay.tsx
│   ├── StylesDisplay.tsx
│   ├── InteractivePreview.tsx  # Live preview modes
│   ├── CodeOutput.tsx    # Code generation & export
│   └── ResultsTabs.tsx   # Tabbed results interface
├── lib/
│   ├── utils.ts          # Utility functions
│   └── demo-design-system.ts
└── types/
    └── design-system.ts  # TypeScript interfaces
```

## 🎨 Output Formats

### CSS Variables
```css
:root {
  --color-primary: #6366f1;
  --color-secondary: #a855f7;
  --font-heading: 'Inter', system-ui;
  --radius-md: 0.5rem;
  /* ... */
}
```

### Tailwind Config
```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#a855f7",
      },
    },
  },
};
```

### shadcn/ui Theme
```css
:root {
  --primary: 239 84% 67%;
  --secondary: 270 91% 65%;
  /* HSL format */
}
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |

## 📈 Roadmap

- [x] MVP: Image upload & analysis
- [x] CSS, Tailwind, shadcn/ui export
- [x] Interactive preview modes
- [ ] URL analysis (screenshot websites)
- [ ] Figma export integration
- [ ] Analysis history
- [ ] Batch processing
- [ ] API access

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with 💜 by the Design Chameleon Team
