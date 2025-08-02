// middlewares/validateFinance.js
const Joi = require("joi");

// Define Joi schemas
const transactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  date: Joi.date().required(),
  description: Joi.string().allow('', null),
  category: Joi.string().max(50).required()
});

const expenditureGoalSchema = Joi.object({
  monthly_goal: Joi.number().positive().required()
});

// Middleware for validating transaction body
function validateTransaction(req, res, next) {
  const { error } = transactionSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: "Transaction validation failed",
      details: error.details.map(d => d.message)
    });
  }
  next();
}

// Middleware for validating expenditure goal body
function validateExpenditureGoal(req, res, next) {
  const { error } = expenditureGoalSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: "Expenditure goal validation failed",
      details: error.details.map(d => d.message)
    });
  }
  next();
}

module.exports = {
  validateTransaction,
  validateExpenditureGoal
};
