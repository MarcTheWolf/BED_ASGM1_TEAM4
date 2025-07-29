const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");

const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();

const server = http.createServer(app); // create HTTP server manually
const io = socketIo(server); // attach socket.io to the server


const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const notificationEngine = require("./Services/notificationEngine.js");

const accountController = require("./Controllers/accountController.js");
const medicalInformationController = require("./Controllers/medicalInformationController.js");
const eventController = require("./Controllers/eventController.js");
const financeController = require("./Controllers/financeController.js");
const taskController = require("./Controllers/taskController.js");
const notificationsController = require("./Controllers/notificationsController.js");


const authorization = require("./Middlewares/authorization.js");

const {
  validateMedication,
  validateMedicalCondition,
} = require("./Middlewares/medicalInformationValidation.js"); // import Book Validation Middleware


////////////////////////////////////////////////////
/////////////API Endpoints//////////////////////////
////////////////////////////////////////////////////

//Account Profile Endpoints (By XinHui)
app.post("/authenticateUser", accountController.authenticateAccount);
app.get("/getAccountById", authorization.verifyJWT, accountController.getAccountById);
app.post("/createAccount", accountController.createAccount);
app.post("/initializeAccountDetails/:id", accountController.initializeAccountDetails);
app.get("/getPhoneByAccountID", authorization.verifyJWT, accountController.getPhoneByAccountID);
app.put("/updateProfile", authorization.verifyJWT, accountController.updateProfile);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Medical Information & Medication Endpoints (By Marcus)

app.get("/getMedicationByAccountID", authorization.verifyJWT, medicalInformationController.getMedicationByAccountID);
app.get("/getMedicationByID/:id", authorization.verifyJWT, medicalInformationController.getMedicationByID);
app.get("/getMedicalConditionByID/:id", authorization.verifyJWT, medicalInformationController.getMedicalConditionByID);
app.get("/getWeeklyTiming/:med_id", authorization.verifyJWT, medicalInformationController.getWeeklyTiming);
app.get("/getMedicalConditionByAccountID", authorization.verifyJWT, medicalInformationController.getMedicalConditionByAccountID);
app.get("/getMedicationAssociatedWithMedicalCondition/:id", authorization.verifyJWT, medicalInformationController.getMedicationAssociatedWithMedicalCondition);

app.post("/createMedication", authorization.verifyJWT, validateMedication, medicalInformationController.createMedication);
app.post("/createMedicalCondition", authorization.verifyJWT, validateMedicalCondition, medicalInformationController.createMedicalCondition);
app.post("/associateMedicationWithMedicalCondition", authorization.verifyJWT, medicalInformationController.associateMedicationWithMedicalCondition);
app.post("/saveWeeklyTiming", authorization.verifyJWT, medicalInformationController.saveWeeklyTiming);

app.put("/updateMedication/:id", authorization.verifyJWT, medicalInformationController.updateMedication);
app.put("/updateMedicalCondition/:id", authorization.verifyJWT, medicalInformationController.updateMedicalCondition);

app.delete("/deleteMedication/:id", authorization.verifyJWT, medicalInformationController.deleteMedication);
app.delete("/deleteMedicalCondition/:id", authorization.verifyJWT, medicalInformationController.deleteMedicalCondition);
app.delete("/deleteMedicationConditionAssociation", authorization.verifyJWT, medicalInformationController.deleteMedicationConditionAssociation);


//Medical Information Autocomplete, Use of external API from backend (By Marcus)
app.get("/autocompleteMedication/:query", medicalInformationController.autocompleteMedication);
app.get("/autocompleteMedicalCondition/:query", medicalInformationController.autocompleteMedicalCondition);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Events Endpoints (By Ansleigh)
app.get("/getEventRegisteredByID", authorization.verifyJWT, eventController.getEventRegisteredByID);
app.get("/getEventDetailsByID/:id", authorization.verifyJWT, eventController.getEventDetailsByID);
app.get("/getAllEvents", eventController.getAllEvents);
app.post("/registerEvent/:event_id", authorization.verifyJWT, eventController.registerEvent);
app.delete("/unregisterEvent/:event_id", authorization.verifyJWT, eventController.unregisterEvent);


app.post("/createEvent", authorization.verifyJWT, eventController.createEvent);
app.put("/updateEvent/:event_id", authorization.verifyJWT, eventController.updateEvent);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Finance Endpoints (By Belle)

app.get("/getExpenditureGoalByID", authorization.verifyJWT, financeController.getExpenditureGoalByID);
app.get("/getTotalExpenditureByID", authorization.verifyJWT, financeController.getTotalExpenditureByID);
app.get("/getMonthlyExpenditureByID", authorization.verifyJWT, financeController.getMonthlyExpenditureByID);
app.get("/getAllTransactionsByID/", authorization.verifyJWT, financeController.getAllTransactionsByID);
app.get("/getTransactionByID/:id", authorization.verifyJWT, financeController.getTransactionByID);

app.post("/addTransactionToAccount", authorization.verifyJWT, financeController.addTransactionToAccount);
app.post("/addExpenditureGoal", authorization.verifyJWT, financeController.updateExpenditureGoal);

app.put("/updateTransaction/:id", authorization.verifyJWT, financeController.updateTransaction);
app.delete("/deleteTransaction/:id", authorization.verifyJWT, financeController.deleteTransaction);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Displaying data as graphs/charts, use of external API from backend (By Belle) ////////////////////////////////////////////////////////////////
app.get("/getExpenditureByMonthBarChart/:id", authorization.verifyJWT, financeController.getExpenditureByMonthBarChart);
app.get("/getBudgetExpenditureDoughnutChart/:month", authorization.verifyJWT, financeController.getBudgetExpenditureDoughnutChart);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Notification Feature API Endpoints (By Belle)
app.get("/getAllNotifications", authorization.verifyJWT, notificationsController.getAllNotifications);
app.get("/getUnnotified", authorization.verifyJWT, notificationsController.getUnnotified);


app.delete("/markNotificationAsNotified/:noti_id", authorization.verifyJWT, notificationsController.markNotificationAsNotified);
//app.delete("/deleteNotification/:id", authorization.verifyJWT, notificationsController.deleteNotification);
//app.delete("/clearNotifications", authorization.verifyJWT, notificationsController.clearNotifications);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.post("/postImage", authorization.verifyJWT); //WIP





// Task management API endpoints (By Yuxuan)
app.get("/tasks", taskController.getTasks);
app.post("/tasks", taskController.addTask);
app.delete("/tasks/:task_id",  taskController.deleteTask);

////////////////////////////////////////////////////
///////////////WebSocket API////////////////////
////////////////////////////////////////////////////
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


////////////////////////////////////////////////////
/////////////Create Express app////////////////
////////////////////////////////////////////////////

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API documentation: http://localhost:${port}/api-docs`);
  console.log(`Index page: http://localhost:${port}/login.html`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});


app.use(express.static(path.join(__dirname, "Public")));


////////////////////////////////////////////////////
/////////////Swagger Documentation////////////////
////////////////////////////////////////////////////

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json"); // Import generated spec

// Serve the Swagger UI at a specific route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


/////////////Exports Websocket io for controller use /////////////////////////////
module.exports.io = io; // Export it