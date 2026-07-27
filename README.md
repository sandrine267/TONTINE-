# Tontine Savings and Loan Management

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the backend and frontend together:
   ```bash
   npm run dev
   ```

3. Open the app in a browser on this PC:
   ```text
   http://localhost:5173/
   ```

4. Open the app from another device on the same network using your PC IP:
   ```text
   http://<PC-IP>:5173/
   ```

## Tunnel access (public URL)

If you need access from outside the Wi-Fi, use `localtunnel`:

1. Start the app locally:
   ```bash
   npm run dev
   ```

2. Open a second terminal and expose the frontend:
   ```bash
   npm run tunnel-client
   ```

3. Open a third terminal and expose the backend:
   ```bash
   npm run tunnel-api
   ```

4. Use the public frontend URL shown by the tunnel command.

5. If the app needs the backend URL externally, set `VITE_API_URL` to the API tunnel URL.

## Environment variable

The app supports a custom backend URL with:

```env
VITE_API_URL=http://your-api-tunnel-url
```

If `VITE_API_URL` is not set, the app uses the current browser hostname with port `4000` during development and `/api` in production.

## Deploying to Render

1. Push this repo to GitHub.
2. Create a new web service on Render.
3. Use the repository and choose `Node` as the environment.
4. Render will use `render.yaml` to build and start the app.
5. Set environment variables:
   - `SESSION_SECRET` = a strong secret string
   - `PORT` = `10000` (or leave default)
   - `CORS_ORIGIN` = `https://<your-render-service>.onrender.com`
   - `VITE_API_URL` = leave blank if frontend and backend are served from the same app
6. After deploy, open the rendered URL and sign in with the demo PINs.

If you host the backend separately, set `VITE_API_URL` to the backend URL and configure `CORS_ORIGIN` to allow the frontend origin.

## Demo credentials

- Member PIN: `1234`
- Admin PIN: `9999`

## Notes

- The app stores demo groups and receipts in browser local storage.
- The frontend uses `window.location.hostname` if no `VITE_API_URL` is configured.
- Use the tunnel only when your phone or other device cannot connect on the same network.
