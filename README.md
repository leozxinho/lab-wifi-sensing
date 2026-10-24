# Wi-Fi Sensing Dashboard

Experimental front-end that visualizes **Wi-Fi sensing** data in real time: presence detection, movement and vital signs estimated from changes in the Wi-Fi signal, shown in a 3D scene.

> Experimental project. This repository contains the dashboard; the sensing backend runs separately.

## Features

- **3D scene** (React Three Fiber): Wi-Fi sphere, particle field, grid floor and figures for detected people.
- **Panels:** presence, movement map, vital signs (e.g. heart rate), Wi-Fi signal strength (RSSI) and history chart.
- **Live data:** WebSocket stream plus periodic HTTP requests to the backend API.

## Stack

- Next.js 15, React 19 and TypeScript
- Three.js with `@react-three/fiber` and `@react-three/drei`
- Tailwind CSS

## Running locally

Requires Node.js (version in `.nvmrc`).

```bash
npm install
NEXT_PUBLIC_API_URL=<backend-url> npm run dev
```

`NEXT_PUBLIC_API_URL` points to the sensing backend.

## Structure

```
app/
  components/   3D scene and dashboard panels
  hooks/        useWifiData (WebSocket + HTTP)
  page.tsx
```

## Author

Developed by [Leonardo de Oliveira](https://github.com/leozxinho).
