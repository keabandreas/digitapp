# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Tailwind CSS CLI globally
RUN npm install -g tailwindcss

# Copy the rest of the application code
COPY . .

# Copy .env.local and load-env.js files
COPY .env.local .env.local
COPY load-env.js load-env.js

# Generate Prisma client
RUN npx prisma generate

# Build Tailwind CSS
RUN npx tailwindcss -i ./src/styles/globals.css -o ./src/styles/output.css

# Expose the ports the app and script server run on
EXPOSE 8080 5000

# Command to run the app in development mode and watch for Tailwind changes
CMD ["sh", "-c", "npx tailwindcss -i ./src/styles/globals.css -o ./src/styles/output.css --watch & npm run dev"]
