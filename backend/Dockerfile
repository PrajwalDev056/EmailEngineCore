FROM node:18 AS build

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Disable strict-ssl
RUN npm config set strict-ssl false

RUN  npm cache clean --force

# Install app dependencies with the --legacy-peer-deps flag
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Ensure the dist folder exists and set permissions
RUN mkdir -p dist && chmod -R 755 dist

# Build the TypeScript code (assuming your build script creates the dist folder)
RUN npm run build

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Open port 3000 and 4040
EXPOSE 3000 4040

# Start the server
CMD ["npm", "run", "start"]