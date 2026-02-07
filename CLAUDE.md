# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **      IBREES-LIL-HUZAIFA** - a serverless e-commerce webstore deployed on Vercel with a **guest checkout-only** model (no customer registration required). The project uses vanilla JavaScript frontend with Vercel serverless functions for the backend API.

## Development Commands

```bash
# Start local development server
npm run dev

# Build (no build step required)
npm run build

# Start production server (Vercel deployment)
npm start
```

**Development Workflow**: Uses Vercel CLI for local development and deployment. No additional build tools or bundlers required.

## Code Architecture

### Two Implementation Patterns

This codebase contains **two parallel implementations**:

1. **Simple API Pattern** (`/api/` directory)
   - Direct Vercel serverless functions with in-memory data storage
   - Ready for immediate deployment
   - Used in production currently

2. **MVC Pattern** (`/src/` directory)
   - Full MVC structure with models, controllers, middleware
   - MongoDB schemas prepared but not actively used
   - More scalable architecture for future database integration

### Key Directories

- `/api/` - Vercel serverless API endpoints
  - `/api/auth/` - Authentication endpoints (login/register)
  - `/api/admin/` - Admin management endpoints
  - `/api/products.js` - Product catalog API
  - `/api/orders.js` - Order creation and management
  - `/api/orders/track.js` - Order tracking with tokens

- `/public/` - Frontend pages (alternative location)
- `/admin/` - Admin dashboard pages
- `/js/` - Frontend JavaScript utilities
  - `main.js` - Core functionality, cart management, product display
  - `checkout.js` - Multi-step checkout flow

- `/src/` - MVC implementation (future architecture)
  - `/src/models/` - Mongoose schemas
  - `/src/controllers/` - Business logic controllers
  - `/src/middleware/` - Authentication and validation middleware

### Core Features & Flow

**Guest Checkout Process**:
1. Product browsing → Cart management (LocalStorage)
2. Multi-step checkout: Shipping → Payment → Review
3. Order creation with unique tracking token
4. Order tracking via `/track-order.html?order={id}&token={token}`

**Admin System**:
- Single admin constraint (security feature)
- JWT-based authentication
- Product and order management
- Dashboard with statistics

### Technology Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework)
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Currently in-memory (MongoDB schemas prepared for future use)
- **Deployment**: Vercel platform
- **Authentication**: JWT tokens for admin, session-based for guest checkout

### Data Storage

**Current (In-Memory)**:
- Products: Hardcoded in API files
- Orders: Stored in memory during session
- Users: Single admin user in memory

**Future (MongoDB)**:
- Fully defined schemas in `/src/models/schema.js`
- Ready for database integration when needed
- Supports users, products, orders, reviews, categories, wishlists

### Security & Validation

- Strict input validation across all APIs
- CORS properly configured
- Single admin user constraint
- Guest checkout eliminates user registration security risks
- JWT-based admin authentication

### Testing Approach

**Current State**: Manual testing approach (no automated test suite)
**Recommended Testing**:

1. **API Endpoint Testing**:
   - Test `/api/products.js` - GET requests with category filters
   - Test `/api/orders.js` - POST order creation with validation
   - Test `/api/auth/login.js` - Admin authentication flow
   - Test `/api/orders/track.js` - Order tracking with tokens

2. **Frontend Flow Testing**:
   - Cart functionality (add/remove/update)
   - Multi-step checkout process
   - Form validation (shipping, payment)
   - LocalStorage persistence

3. **Integration Testing**:
   - End-to-end guest checkout flow
   - Order tracking system
   - Admin dashboard access

### Key Files to Understand

- `api/products.js` - Product catalog API with CORS setup
- `api/orders.js` - Order creation with validation and tracking tokens
- `api/auth/login.js` - Admin authentication with single admin constraint
- `js/main.js` - Frontend core functionality and cart management
- `js/checkout.js` - Multi-step checkout flow implementation
- `src/models/schema.js` - Complete MongoDB schemas for future database integration

### Environment Variables

When setting up for production, ensure these are configured:
- `JWT_SECRET` - For admin authentication
- `JWT_EXPIRES_IN` - Token expiration (default: 30 days)
- Database connection string for MongoDB integration

### Deployment

- Uses Vercel serverless functions
- No build step required
- Automatic deployments from git
- CORS configured for frontend-backend communication

### Common Development Tasks

**Adding New Products**:
- Update products array in `api/products.js` (current approach)
- Or use admin dashboard when database is integrated

**Testing Order Flow**:
1. Add items to cart on homepage
2. Navigate to checkout
3. Fill shipping form
4. Select shipping method
5. Choose payment method
6. Review and place order
7. Test tracking with order ID from confirmation

**Testing Admin**:
- Login at `/admin/login.html` with credentials:
  - Email: `huzaifamadani95@gmail.com`
  - Password: `636363`
- Access dashboard at `/admin/dashboard.html`

### Notes for Future Development

- The `/src/` directory provides a complete MVC structure ready for database integration
- MongoDB schemas are fully defined but not currently used
- Consider migrating from in-memory storage to MongoDB for production
- Add comprehensive test suite using Jest or similar framework
- Implement proper error handling and logging