const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json"; // Output file for the spec
const routes = ["./app.js"]; // Path to your API route files

const doc = {
  info: {
    title: "SeniorSync API",
    description: "API documentation for SeniorSync \n Developed by: \n Marcus Ong, Belle Chong, Ansleigh Ong, Han XinHui and Huang YuXuan",
  },
  host: "localhost:3000", // Replace with your actual host if needed
};

swaggerAutogen(outputFile, routes, doc);