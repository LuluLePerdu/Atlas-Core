# Atlas Core - Integrated Weekly Life Planner

A comprehensive weekly planning application that seamlessly integrates workout scheduling, meal preparation, grocery management, and time blocking into a unified system.

## 🎯 Core Philosophy

**Everything is interconnected.** When you plan a meal, your grocery list updates automatically. When you schedule a workout, it appears in your calendar. When you modify your week, the entire system adapts intelligently.

## 🏛️ Features

- **Unified Calendar:** All activities (workouts, meals, work) in one drag-and-drop interface
- **Smart Grocery Lists:** Auto-generated from meal plans, categorized by store section
- **Workout Planning:** Library of exercises, custom workouts, progression tracking
- **Meal Prep Optimizer:** Groups recipes, estimates time, suggests prep order
- **Templates:** Save and reuse weekly schedules
- **Autopilot Mode:** AI-suggested weeks based on historical patterns
- **Real-time Sync:** All modules update automatically when one changes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Using Docker (Recommended)

1. Generate environment file with secure secrets:
```bash
node scripts/generate-env.js
```

2. Update `.env` with your database password and review settings

3. Start all services:
```bash
docker-compose up -d
```

4. Run migrations:
```bash
docker-compose exec backend npm run migrate
```

3. Seed sample data (optional):
```bash
docker-compose exec backend npm run seed
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Demo credentials: `demo@atlascore.com` / `password123`

### Manual Setup

See [SETUP.md](SETUP.md) for detailed manual installation instructions.

## 📁 Project Structure

```
atlas-core/
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration files
│   ├── migrations/       # Database migrations
│   └── seeds/            # Sample data
├── frontend/             # React SPA
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # Zustand state stores
│   │   └── services/     # API client
│   └── public/
└── docker-compose.yml    # Docker orchestration
```

## 🛠️ Technology Stack

### Backend
- Node.js + Express.js
- PostgreSQL with Knex.js
- JWT authentication
- bcrypt for password hashing

### Frontend
- React 18 with Zustand
- Tailwind CSS
- React Router
- Axios & date-fns

### Infrastructure
- Nginx (Load Balancer & Reverse Proxy)
- Docker & Docker Compose
- Horizontal scaling support

## 🎨 Design Theme

Greek mythology-inspired aesthetic:
- **Colors:** Deep navy, Gold, Marble
- **Typography:** Cinzel (display), Inter (body)
- **Visual Style:** Classical, elegant, powerful

## 📈 Development Roadmap

### Phase 1: MVP ✅
- Authentication system
- Basic calendar operations
- Recipe library
- Meal planning
- Grocery list generation

### Phase 2: Enhanced Features (Current)
- Complete workout module
- Workout logging
- Autopilot suggestions
- Smart scheduling

### Phase 3: Polish & Release
- UI theme refinement
- Responsive design
- Performance optimization
- Production deployment

## 📝 Documentation

- [SETUP.md](SETUP.md) - Setup instructions
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development notes

## 📄 License

MIT

---

**Built with ⚡ by a developer who believes everything should be interconnected.**
