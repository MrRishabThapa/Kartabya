<div align="center">

# 🦊 Adaptiv

### ✨ Generative AI‑Powered Learning Platform

Transforming lessons into animated, personalized learning experiences.

<br/>

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)
![Framer Motion](https://img.shields.io/badge/Framer-Motion-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

</div>

---

## 🚀 What is Adaptiv?

Adaptiv is a next‑generation EdTech platform where:

> Lessons are **structured JSON scene graphs** — not video files.

AI generates semantic content.  
The browser renders it into animated experiences.

No MP4 files.  
No hardcoded styles.  
No static slides.

---

## 🎬 How It Works
AI → Video Schema (JSON)
→ Storage Layer
→ React Renderer
→ Animated Lesson

text


The renderer interprets scenes and animates them using Framer Motion.

---

## ✨ Core Features

| Feature | Description |
|----------|------------|
| 🎥 Scene-Based Learning | Lessons built from structured scenes |
| 🧠 AI-Generated Schema | Semantic JSON output |
| 🎯 Personalisation Engine | Per-profile placeholder injection |
| ⚡ Lightweight Architecture | No video hosting required |
| 🧩 Interactive Quiz System | Animated MCQs with scoring & confetti |
| 🎨 Design-System Controlled | Renderer owns presentation logic |

---

## 🧠 Interactive Quiz Module

Beautifully animated quiz experience with:

- ✅ Smooth transitions  
- ✅ Progress bar  
- ✅ Score tracking  
- ✅ Confetti celebration  
- ✅ Result summary screen  
- ✅ Restart functionality  

---

## 🏗 Architecture Overview

### 🎞 Scene
A temporal unit (~15 seconds)

Defines:
- Purpose
- Layout
- Narration
- Theme

### 🧱 Block
Renderable content unit inside a scene:

- Text  
- Code  
- Math  
- Diagram  
- Callout  
- Image  
- Placeholder  
- Quiz (planned)  

---

## 📂 Project Structure
frontend/
├── app/
├── components/
│ ├── onboarding-screens/
│ ├── quiz/
│ └── shared/
├── context/
├── data/
├── lib/
└── types/

text


Clean. Modular. Scalable.

---

## 🛠 Tech Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

**Rendering**
- KaTeX
- Shiki
- React Flow

**Storage**
- Backblaze B2

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/adaptiv-web-app.git
cd adaptiv-web-app/frontend
npm install
npm run dev
Open in browser:

text

http://localhost:3000
🔮 Roadmap
 Schema-driven quiz blocks
 Adaptive difficulty
 Fox animated tutor
 Scene streaming engine
 AI-generated assessments
```
