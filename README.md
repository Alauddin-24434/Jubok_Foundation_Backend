# Alhamdulillah Foundation - Backend API

NestJS-based REST API for the Alhamdulillah Foundation investment management platform.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 👥 **Role-Based Access Control** - 4 user roles (Super Admin, Admin, Moderator, User)
- 📝 **Project Management** - Full CRUD for investment projects
- 🤝 **Join Request System** - Users can request to join projects
- 💳 **Payment Integration** - SSLCommerz (Bangladesh payment gateway)
- 🎯 **Banner Management** - Featured project banners
- 📊 **MongoDB + Mongoose** - Robust data persistence
- ⚡ **Redis Ready** - Prepared for caching
- 🛡️ **Security** - Helmet, rate limiting, validation

## Tech Stack

- **Framework**: NestJS 10+
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **Security**: Helmet, Throttler
- **Payment**: SSLCommerz

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values
```

## Configuration

Edit `.env` file with your credentials:

- **MongoDB**: Update `MONGODB_URI`
- **JWT**: Change `JWT_SECRET` (use a strong secret in production)
- **Cloudinary**: Add your credentials for file uploads
- **SSLCommerz**: Add your payment gateway credentials

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects (public)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project (Admin+)
- `PATCH /api/projects/:id` - Update project (Admin+)
- `DELETE /api/projects/:id` - Delete project (Super Admin)

### Join Requests
- `POST /api/join-requests` - Send join request
- `GET /api/join-requests/my-requests` - User's requests
- `GET /api/join-requests/project/:projectId` - Project requests (Admin+)
- `PATCH /api/join-requests/:id/review` - Approve/Reject (Admin+)

### Payments
- `POST /api/payments/initiate` - Start payment
- `GET /api/payments/my-payments` - User's payment history
- `GET /api/payments/project/:projectId` - Project payments (Admin+)

### Banners
- `GET /api/banners` - Get active banners (public)
- `POST /api/banners` - Create banner (Admin+)
- `PATCH /api/banners/:id` - Update banner (Admin+)
- `DELETE /api/banners/:id` - Delete banner (Super Admin)

## User Roles & Permissions

### Super Admin
- Full system access
- Create/manage projects
- Manage banners
- View all payments

### Admin
- Manage assigned projects
- Add/remove members
- Review join requests
- View payments

### Moderator
- Approve/reject join requests
- View project info

### User
- View projects
- Send join requests
- Make payments

## Project Structure

```
src/
├── auth/              # Authentication module
├── project/           # Project management
├── join-request/      # Join request workflow
├── payment/           # Payment processing
├── banner/            # Banner management
├── user/              # User schemas
├── common/            # Shared guards, decorators
└── config/            # Configuration files
```

## Security Notes

⚠️ **Important for Production**:
1. Change `JWT_SECRET` to a strong random string
2. Update MongoDB connection with authentication
3. Configure proper CORS origins
4. Add rate limiting values based on your needs
5. Use environment-specific `.env` files
6. Enable MongoDB replica sets for transactions

## Payment Integration (Manual Bkash)

The platform supports a manual payment verification flow for membership activation:

1.  User sends money to the provided Bkash number.
2.  User submits their **Bkash Number** and **Transaction ID** via the dashboard.
3.  Admin reviews the request in the admin panel (`PATCH /api/payments/:id/approve`).
4.  Upon approval, the user's status is updated to `active`.

## Development

```bash
# Run tests
npm run test

# Format code
npm run format

# Lint
npm run lint
```

## License

MIT
