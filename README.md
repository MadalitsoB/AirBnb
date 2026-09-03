# Airbnb Clone

A React, Express, and MongoDB Airbnb clone with guest reservations and host/admin listing management.

## Project Structure

- `Frontend/` React and Vite client
- `Backend/` Express API, controllers, models, routes, and authentication middleware

## Requirements

- Node.js 18 or newer
- MongoDB database
- A strong JWT secret

## Local Setup

1. Install dependencies:

   ```powershell
   npm install
   Push-Location Backend; npm install; Pop-Location
   Push-Location Frontend; npm install; Pop-Location
   ```

2. Create `Backend/.env`:

   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
   JWT_SECRET=<long-random-secret>
   JWT_EXPIRE=7d
   PORT=5000
   OPENAI_API_KEY=<optional>
   ```

3. Seed sample accommodations if required:

   ```powershell
   Push-Location Backend; npm run seed; Pop-Location
   ```

4. Start the API:

   ```powershell
   Push-Location Backend; npm run dev; Pop-Location
   ```

5. Start the frontend in a second terminal:

   ```powershell
   Push-Location Frontend; npm run dev; Pop-Location
   ```

The frontend uses `http://localhost:5000/api` by default. Set `VITE_API_URL` in `Frontend/.env` when the API is deployed elsewhere.

## API Endpoints

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <jwt>`.

### Users

- `POST /users/register` creates a guest or host account.
- `POST /users/login` authenticates a user and returns a JWT.
- `GET /users/me` returns the authenticated user.

### Accommodations

- `GET /accommodations` lists properties; optional query: `?location=Cape%20Town`.
- `GET /accommodations/:id` returns one property.
- `POST /accommodations` creates a listing for an authenticated host/admin.
- `PUT /accommodations/:id` updates an owned listing or any listing as admin.
- `DELETE /accommodations/:id` deletes an owned listing or any listing as admin.

### Reservations

- `POST /reservations` creates a reservation. The API calculates the price from the listing.
- `GET /reservations/user` lists the authenticated guest's reservations.
- `GET /reservations/host` lists reservations for the authenticated host's listings.
- `GET /reservations/:id` returns a reservation for its guest, host, or an admin.
- `PATCH /reservations/:id/status` approves, declines, or completes a host reservation.
- `DELETE /reservations/:id` cancels a reservation for its guest, host, or an admin.

## Validation and Security

- Passwords are hashed with bcrypt before storage.
- JWTs require `JWT_SECRET`; there is no fallback production secret.
- Listing numeric fields, guest capacity, dates, IDs, and reservation status are validated.
- Reservation totals are calculated server-side from trusted accommodation data.
- Ownership checks protect listings and reservations.

## Checks

Run the backend authentication tests:

```powershell
Push-Location Backend; npm test; Pop-Location
```

Run frontend lint and build checks:

```powershell
Push-Location Frontend; npm run lint; npm run build; Pop-Location
```

## Deployment

Deploy the backend and frontend as separate services. Configure `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, and `PORT` as backend environment variables. Configure `VITE_API_URL` at frontend build time with the deployed API URL. Do not commit `.env` files or secrets. Use HTTPS in production and restrict CORS to the deployed frontend origin instead of allowing every origin.
