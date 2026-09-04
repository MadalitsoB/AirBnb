# AirBnb Clone

An accommodation marketplace inspired by Airbnb and focused on stays in South Africa. Guests can discover properties, view listing details, create accounts, make reservations, and track their bookings. Hosts have a separate workspace where they can publish and manage listings and respond to reservation requests.

This project was built as a full-stack application using React, Express, MongoDB, and JWT authentication.

## What The App Entails

The application connects two types of users:

- **Guests** search for accommodation, inspect property information, and make reservations.
- **Hosts** add properties to the marketplace, update their listing information, remove listings, and manage guest reservations.
- **Administrators** use the same protected API capabilities as hosts, with permission to manage all listings and reservations.

The interface presents destinations such as Cape Town, Durban, Knysna, Stellenbosch, Johannesburg, and other South African locations. Property information includes the title, location, accommodation type, nightly price, bedrooms, bathrooms, guest capacity, amenities, images, rating, and reviews.

## What The App Should Do

The intended user experience is:

1. A visitor opens the home page and explores recommended destinations.
2. The visitor searches or filters available accommodation by location.
3. The visitor opens a listing to see its full details and reservation form.
4. A guest creates an account or logs in before making a reservation.
5. The guest selects dates and the number of guests, then submits a booking request.
6. The host views the request in the host dashboard and approves, declines, or completes it.
7. The guest can return to the reservations page to view or cancel their bookings.

The application should also provide a reliable separation between public pages and protected user actions, keep reservation totals consistent, and prevent users from changing resources they do not own.

## What The App Currently Does

### Guest features

- Displays a home page with destination discovery sections.
- Lists available accommodations and supports location filtering.
- Displays detailed accommodation pages with images, amenities, pricing, and host information.
- Supports guest and host registration.
- Supports login and JWT-based sessions.
- Allows authenticated guests to create reservations.
- Calculates reservation totals on the server using trusted listing data.
- Shows a guest's reservations and allows permitted reservations to be cancelled.

### Host and administrator features

- Provides a protected host dashboard.
- Shows dashboard, listing, listing creation, and reservation sections.
- Allows hosts to create listings with property details, pricing, fees, amenities, and images.
- Allows hosts to edit or delete listings they own.
- Allows hosts to approve, decline, or complete reservation requests for their listings.
- Gives administrators broader listing and reservation management permissions.

### Backend features

- Express REST API under the `/api` prefix.
- MongoDB persistence through Mongoose models.
- Password hashing with `bcryptjs`.
- JWT authentication and role-based authorization.
- Validation for IDs, dates, numeric listing values, guest limits, and reservation statuses.
- Optional OpenAI chat endpoint at `POST /api/chat` when an API key is configured.
- Seed script for adding sample accommodation data.

## Technology Stack

| Layer                | Technology                   |
| -------------------- | ---------------------------- |
| Frontend             | React 19, React Router, Vite |
| Backend              | Node.js, Express             |
| Database             | MongoDB with Mongoose        |
| Authentication       | JSON Web Tokens and bcryptjs |
| Testing              | Node.js built-in test runner |
| Optional integration | OpenAI API                   |

## Project Structure

```text
Frontend/
  src/
    components/       Shared navigation, cards, and route protection
    pages/            Home, listings, authentication, host, and reservation views
    services/         Frontend API client
Backend/
  config/             Database connection
  controllers/        Request and business logic
  middleware/         Authentication and authorization
  models/             User, accommodation, and reservation schemas
  routes/             REST API route definitions
  test/               Backend authentication tests
  server.js           Express application and startup
  seed.js             Sample data loader
```

## Requirements

- Node.js 18 or newer
- A running MongoDB database, either local or MongoDB Atlas
- A strong JWT secret
- An OpenAI API key only if the chat endpoint is required

## Installation And Setup

Install dependencies from the project root and each application folder:

```powershell
npm install
Push-Location Backend; npm install; Pop-Location
Push-Location Frontend; npm install; Pop-Location
```

Create `Backend/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>
JWT_EXPIRE=7d
PORT=5000
OPENAI_API_KEY=<optional>
```

If the MongoDB password contains special characters, URL-encode those characters in the connection string. When using MongoDB Atlas, add the development machine's IP address to the Atlas network access list and confirm that the database user has the required permissions.

To use a different backend URL, create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Seed sample listings when needed:

```powershell
Push-Location Backend; npm run seed; Pop-Location
```

Start the backend:

```powershell
Push-Location Backend; npm run dev; Pop-Location
```

Start the frontend in a second terminal:

```powershell
Push-Location Frontend; npm run dev; Pop-Location
```

The Vite development server will display the local frontend URL, normally `http://localhost:5173`. The API normally runs at `http://localhost:5000`.

## API Overview

All API paths are prefixed with `/api`. Protected endpoints require an `Authorization: Bearer <jwt>` header.

### Users

- `POST /users/register` creates a guest or host account.
- `POST /users/login` authenticates a user and returns a JWT.
- `GET /users/me` returns the authenticated user.

### Accommodations

- `GET /accommodations` lists properties. Optional example: `?location=Cape%20Town`.
- `GET /accommodations/:id` returns one property.
- `POST /accommodations` creates a host listing.
- `PUT /accommodations/:id` updates an owned listing or an administrator-managed listing.
- `DELETE /accommodations/:id` deletes an owned listing or an administrator-managed listing.

### Reservations

- `POST /reservations` creates a reservation.
- `GET /reservations/user` lists the authenticated guest's reservations.
- `GET /reservations/host` lists reservations for the authenticated host's listings.
- `GET /reservations/:id` returns an authorized reservation.
- `PATCH /reservations/:id/status` changes a reservation to approved, declined, or completed.
- `DELETE /reservations/:id` cancels an authorized reservation.

## Challenges Faced And How They Were Addressed

### 1. MongoDB connection and application startup

The application depends on MongoDB for users, listings, and reservations. A missing or invalid connection string originally creates a confusing startup failure if it is not surfaced clearly. The database connector now explicitly checks for `MONGO_URI`, uses Mongoose connection settings, and reports a `MongoDB connection failed` error. The server only starts listening after the database connection succeeds, preventing an API from appearing healthy while persistence is unavailable.

When troubleshooting MongoDB, the main checks are:

- Confirm `Backend/.env` exists and is loaded from the backend process.
- Confirm the variable is named exactly `MONGO_URI`.
- Check the MongoDB username, password, cluster, and database name.
- URL-encode special characters in credentials.
- For Atlas, check IP allow-list and database-user permissions.
- Confirm the local MongoDB service is running when using a local URI.

### 2. Keeping frontend and backend communication reliable

The frontend and backend run on different development ports. The shared `apiFetch` helper centralizes the API base URL, adds JSON headers, attaches the JWT from local storage, and converts network failures into a useful message. `VITE_API_URL` allows the frontend to use the deployed API instead of assuming localhost.

### 3. Authentication and role-based access

The application has public pages as well as guest-only and host-only workflows. This required both frontend route protection and backend authorization. Passwords are hashed before storage, JWTs require a configured `JWT_SECRET`, and ownership checks prevent hosts from modifying another host's listings or reservations.

### 4. Reservation pricing and validation

Reservation data comes from a client form, so it cannot be trusted for pricing or permissions. The backend validates dates, guest limits, IDs, and reservation status, then calculates the total from the accommodation stored in MongoDB. This avoids clients changing the price sent to the server.

### 5. Listing images and form data

The host dashboard accepts image files and converts them to data URLs in the browser. Listing forms also convert comma-separated or line-separated amenities and image values into arrays before sending them to the API. Numeric values are validated before submission so invalid pricing, capacity, or fee values do not reach the backend.

### 6. Handling optional AI functionality

The OpenAI integration is optional and must not prevent the core marketplace from being understood or configured. The `/api/chat` endpoint checks for a message and returns a clear error when the API key is missing. The main application still requires MongoDB because users, listings, and reservations are persistent features.

## Security Notes

- Never commit `.env` files, JWT secrets, database credentials, or API keys.
- Use HTTPS and restrict CORS to the deployed frontend origin in production.
- Use a long, random value for `JWT_SECRET`.
- Keep all reservation calculations and ownership decisions on the backend.
- Review uploaded image size and storage strategy before production use; browser data URLs are suitable for this project stage but are not an ideal long-term media solution.

## Testing And Quality Checks

Run backend authentication tests:

```powershell
Push-Location Backend; npm test; Pop-Location
```

Run frontend linting and build checks:

```powershell
Push-Location Frontend; npm run lint; Pop-Location
```

```powershell
Push-Location Frontend; npm run build; Pop-Location
```

The current automated tests focus on JWT middleware behavior, including missing tokens, invalid tokens, valid claims, missing secrets, and tokens signed with the wrong secret. Additional integration tests would be valuable for MongoDB operations, registrations, listing ownership, and reservation flows.

## Current Limitations And Future Improvements

- Add a production image-upload service instead of storing browser data URLs.
- Add availability checks to prevent overlapping reservations.
- Add payment processing and reservation confirmation emails.
- Add reviews and ratings backed by the database rather than display data.
- Add stronger request validation and rate limiting around authentication and chat.
- Replace permissive development CORS configuration with a deployed frontend allow-list.
- Add end-to-end tests for the most important guest and host workflows.

## Deployment

Deploy the backend and frontend as separate services. Configure `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, and `PORT` in the backend environment. Set `VITE_API_URL` at frontend build time to the deployed API URL. Use HTTPS, restrict CORS, and keep all secrets outside the repository.
