# Book Store Frontend

React application for the Book Store project.

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Builds the app for production and copies `index.html` and `static` folder to the frontend root directory. This is required for nginx to serve the files from `/frontend`.

The build process:
1. Creates optimized production build in `build/` folder
2. Copies `index.html` to frontend root
3. Copies `static/` folder to frontend root

After building, nginx can serve the app from `/frontend/index.html`.

## Features

- Book listing with pagination
- Category filtering
- Search functionality
- User authentication (login/register/logout)
- Responsive design

