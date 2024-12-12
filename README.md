# Email Engine Core

## Overview

Email Engine Core is a service for synchronizing emails and handling notifications. It uses various technologies including Node.js, TypeScript, Docker, Azure, and Ngrok.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Docker Commands](#docker-commands)
- [Azure Account Setup](#azure-account-setup)
- [Ngrok Account Setup](#ngrok-account-setup)
- [Swagger Documentation](#swagger-documentation)

## Getting Started

To get started with the Email Engine Core, follow these steps:

1. Clone the repository:

   ```sh
   git clone https://github.com/your-repo/email-engine-core.git
   cd email-engine-core
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Build the project:

   ```sh
   npm run build
   ```

4. Start the project:
   ```sh
   npm start
   ```

## Docker Commands

To manage the project using Docker, use the following commands:

- Build Docker images:

  ```sh
  npm run docker:build
  ```

- Start Docker containers:

  ```sh
  npm run docker:up
  ```

- Stop Docker containers:

  ```sh
  npm run docker:down
  ```

- Prune Docker system:

  ```sh
  npm run docker:prune
  ```

- Reset Docker environment:
  ```sh
  npm run docker:reset
  ```

## Azure Account Setup

To create an Azure account and generate keys, follow these steps:

1. Go to the [Azure Portal](https://portal.azure.com/).
2. Click on "Create a resource" and select "Azure Active Directory".
3. Follow the prompts to create a new directory.
4. Once the directory is created, go to "App registrations" and click "New registration".
5. Enter a name for your application and click "Register".
6. After registration, go to "Certificates & secrets" and click "New client secret".
7. Copy the generated client secret and store it securely.
8. Go to "API permissions" and click "Add a permission".
9. Select "Microsoft Graph" and add the required permissions.
10. Grant admin consent for the permissions.

## Ngrok Account Setup

To create an Ngrok account and get a token, follow these steps:

1. Go to the [Ngrok website](https://ngrok.com/).
2. Sign up for a new account or log in if you already have one.
3. Once logged in, go to the "Auth" section in the dashboard.
4. Copy the authentication token provided.
5. Add the token to your `.env` file:
   ```env
   NGROK_AUTHTOKEN=your-ngrok-auth-token
   ```

## Swagger Documentation

Swagger provides interactive API documentation that allows you to explore and test the endpoints of the Email Engine Core service.

### Accessing Swagger Documentation

To access the Swagger documentation for the APIs, follow these steps:

1. Ensure that the Email Engine Core service is running.
2. Open your web browser and navigate to the following URL:

   [Swagger Documentation](http://localhost:3000/api-docs)

### Using Swagger

Once you have accessed the Swagger documentation, you can:

- View detailed information about each API endpoint, including request parameters and response formats.
- Test API endpoints directly from the browser by providing the necessary parameters and executing the requests.
- Explore the available API operations and understand how to interact with the Email Engine Core service programmatically.

Swagger makes it easy to understand and work with the APIs, providing a user-friendly interface for developers.

## Learn More

For more information, refer to the following resources:

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Azure documentation](https://docs.microsoft.com/en-us/azure/)
- [Ngrok documentation](https://ngrok.com/docs)
