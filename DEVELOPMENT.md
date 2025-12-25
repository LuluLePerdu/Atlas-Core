# Atlas Core Development Notes

## Current Status

✅ **Completed:**
- Backend API structure with all routes
- Database schema and migrations
- Frontend structure with React + Zustand
- Authentication flow (JWT)
- Core services (grocery generator, workout planner, etc.)
- Basic UI components
- Docker configuration

🚧 **In Progress / TODO:**
- Full calendar integration with FullCalendar
- Workout builder UI
- Recipe form with ingredient management
- Drag-and-drop for calendar blocks
- Template application UI
- Autopilot service integration

## Key Architecture Decisions

### Backend

**Database:** PostgreSQL with Knex.js
- Chose PostgreSQL for robust relational data with JSONB support
- Knex.js for migrations and query building (lighter than full ORM)
- UUID primary keys for better distributed systems support

**Authentication:** JWT with refresh tokens
- Access tokens expire in 1 hour
- Refresh tokens stored client-side, expire in 7 days
- Token refresh handled automatically in API interceptor

**Service Layer:** Separated business logic from routes
- `groceryGenerator.js` - Aggregates ingredients, handles units
- `workoutService.js` - Workout scheduling logic
- `recipeService.js` - Meal prep time calculations
- `autopilotService.js` - Pattern recognition for suggestions
- `calendarService.js` - Conflict detection, time slot suggestions

### Frontend

**State Management:** Zustand
- Simpler than Redux, less boilerplate
- Separate stores for auth, calendar, workouts, meals, grocery
- API calls handled in store actions

**Styling:** Tailwind CSS + Custom CSS
- Greek mythology theme (olympus colors)
- Custom utility classes for consistent styling
- Font: Cinzel for display, Inter for body

**Routing:** React Router v6
- Protected routes with authentication check
- Redirect logic based on auth state

## Database Design Notes

### Calendar Blocks
- Support for recurring events via `recurrence_pattern` JSONB
- Linked to workouts and recipes via foreign keys
- Color coding for visual organization

### Recipes & Ingredients
- Ingredients stored as JSONB array for flexibility
- Supports fraction quantities (1/2, 1 1/2, etc.)
- Categories for grocery list grouping

### Workouts
- Exercises stored as JSONB for flexible structure
- Support for sets, reps, weight, rest time
- Program types: PPL, Upper/Lower, Full Body, Bro Split

## API Response Patterns

**Success:**
```json
{
  "id": "uuid",
  "field": "value",
  ...
}
```

**Error:**
```json
{
  "error": "Error message",
  "details": []  // Optional validation details
}
```

## Frontend Component Structure

```
components/
├── auth/           # Login, Register
├── calendar/       # CalendarView, CalendarBlock, QuickAddModal
├── workouts/       # WorkoutLibrary, WorkoutBuilder, WorkoutLogger
├── meals/          # RecipeLibrary, RecipeForm, MealPlanner
├── grocery/        # GroceryList with category grouping
├── templates/      # TemplateList, TemplateManager
└── shared/         # Navbar, Sidebar, Loading, etc.
```

## Core Feature Interconnections

1. **Meal → Grocery:**
   - User selects recipes for week
   - `POST /api/meal-plans` saves selections
   - `POST /api/grocery/generate` aggregates ingredients
   - Returns categorized list with quantities

2. **Workout → Calendar:**
   - User creates workout template
   - Schedules workout on specific day/time
   - `POST /api/calendar/block` with `linked_workout_id`
   - Calendar displays workout block

3. **Template → Week:**
   - User saves current week as template
   - `POST /api/templates` captures all blocks
   - Later applies template to new week
   - `POST /api/templates/:id/apply` creates new blocks

## Security Considerations

- Passwords hashed with bcrypt (10 rounds)
- JWT secrets must be changed in production
- CORS restricted to frontend origin
- Rate limiting on auth endpoints (5 requests/15min)
- SQL injection prevented via parameterized queries
- XSS prevented via React's built-in escaping

## Performance Optimizations

- Database indexes on frequently queried fields
- Connection pooling for PostgreSQL
- Compression middleware for API responses
- Frontend code splitting (to be implemented)
- Lazy loading for routes (to be implemented)

## Testing Strategy

**Backend:**
- Unit tests for services (grocery generation, time calculations)
- Integration tests for API endpoints
- Database rollback between tests

**Frontend:**
- Component tests with React Testing Library
- E2E tests with Playwright (future)

## Load Balancing & Scaling

### Nginx Load Balancer

The project includes an Nginx reverse proxy that:
- **Load balances** multiple backend instances (least connections algorithm)
- **Rate limits** API endpoints (10 req/s) and auth endpoints (5 req/min)
- **Caches** static assets with appropriate headers
- **Compresses** responses with gzip
- **Adds security headers** (X-Frame-Options, CSP, etc.)
- **Health checks** backend availability

### Scaling Backend

```bash
# Scale to 3 backend instances
docker-compose up -d --scale backend=3

# Scale to 5 instances
docker-compose up -d --scale backend=5
```

Nginx automatically distributes traffic across all instances using least connections algorithm.

### Architecture with Load Balancer

```
Internet
    ↓
[Nginx Load Balancer :80]
    ↓
    ├─→ [Backend Instance 1]
    ├─→ [Backend Instance 2]  ← Load balanced
    └─→ [Backend Instance 3]
         ↓
    [PostgreSQL]
```

### Monitoring

Check Nginx status:
```bash
curl http://localhost/nginx-status
```

View Nginx logs:
```bash
docker-compose logs -f nginx
```

## Deployment Checklist

- [ ] Change JWT secrets (use `node scripts/generate-env.js`)
- [ ] Set strong database password
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL (add certificates to `nginx/ssl/`)
- [ ] Nginx load balancer configured ✅
- [ ] Configure environment variables
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Rate limiting configured (Nginx) ✅
- [ ] Optimize Docker images (multi-stage builds)
- [ ] Scale backend instances based on load
- [ ] Set up health checks and auto-restart

## Known Issues / TODOs

1. **Grocery List:**
   - Need price estimation API integration
   - Unit conversion not fully implemented (e.g., cups to grams)

2. **Autopilot:**
   - Pattern recognition needs more sophisticated algorithm
   - Should consider workout recovery time

3. **Calendar:**
   - No drag-and-drop yet (need to implement)
   - Recurring events not fully tested

4. **Frontend:**
   - Need error boundaries
   - Loading states need improvement
   - Mobile responsiveness needs work

## Environment Variables Reference

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Access token secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `JWT_EXPIRES_IN` - Access token expiration
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration
- `NODE_ENV` - development/production
- `PORT` - Server port (default 5000)
- `CORS_ORIGIN` - Allowed frontend origin

**Frontend:**
- `VITE_API_URL` - Backend API URL

## Useful Commands

```bash
# Database
psql atlas_core -U atlas_user  # Connect to database
npm run migrate                 # Run migrations
npm run migrate:rollback        # Rollback last migration
npm run seed                    # Seed sample data

# Development
npm run dev                     # Start dev server
docker-compose logs -f backend  # View backend logs
docker-compose logs -f frontend # View frontend logs

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## Future Enhancements

- **Social Features:** Share templates, follow other users
- **Integrations:** MyFitnessPal, Strava, Google Calendar
- **Mobile App:** React Native version
- **AI Enhancements:** Better autopilot with ML
- **Analytics:** Progress tracking, habit formation
- **Marketplace:** Public recipe and workout library
