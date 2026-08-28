// import swaggerJSDoc from 'swagger-jsdoc';

// const options: swaggerJSDoc.Options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'PetPass SL API',
//       version: '1.0.0',
//       description:
//         'RESTful API specification for the PetPass SL platform, covering administrator authentication, veterinary clinic directories, pet service providers, category management, and location filtering.',
//     },
//     servers: [
//       {
//         url: 'http://localhost:3000',
//         description: 'Local Development Server',
//       },
//     ],
//     components: {
//       securitySchemes: {
//         BearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//           description: 'Enter your Bearer access token issued from /api/v1/auth/login',
//         },
//       },
//     },
//   },
//   // Automatically scan all route handlers and TypeScript files inside app/api
//   apis: ['./app/api/**/*.ts'],
// };

// export const getApiDocs = () => {
//   const spec = swaggerJSDoc(options);
//   return spec;
// };

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PetPass SL API',
      version: '1.0.0',
      description:
        'Official REST API documentation for the PetPass SL Platform. Includes administrative authentication, location hierarchies, and pet service categories.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Next.js Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Bearer access token issued from /api/v1/auth/login',
        },
      },
    },
  },
  apis: ['./app/api/**/*.ts'],
};

export const getApiDocs = () => {
  return swaggerJSDoc(swaggerOptions);
};