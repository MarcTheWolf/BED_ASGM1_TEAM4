

const Joi = require("joi");

const medicationSchema = Joi.object({
  account_id: Joi.number().integer().required().messages({
    "number.base": "Account ID must be a number",
    "number.integer": "Account ID must be an integer",
    "any.required": "Account ID is required",
  }),

  name: Joi.string().min(1).max(100).required().messages({
    "string.base": "Medication name must be a string",
    "string.empty": "Medication name cannot be empty",
    "string.min": "Medication name must be at least 1 character",
    "string.max": "Medication name cannot exceed 100 characters",
    "any.required": "Medication name is required",
  }),

  description: Joi.string().max(255).allow(null, "").messages({
    "string.base": "Description must be a string",
    "string.max": "Description cannot exceed 255 characters",
  }),

  dosage: Joi.string().min(1).max(50).required().messages({
    "string.base": "Dosage must be a string",
    "string.empty": "Dosage cannot be empty",
    "string.min": "Dosage must be at least 1 character",
    "string.max": "Dosage cannot exceed 50 characters",
    "any.required": "Dosage is required",
  }),

  time: Joi.alternatives().conditional('frequency', {
    is: 'D',
    then: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
      .required()
      .messages({
        "string.pattern.base": "Time must be in HH:mm format (e.g., 08:00)",
        "any.required": "Time is required for daily medications",
      }),
    otherwise: Joi.any().valid(null, '').strip() // strips time if not daily
  }),

  frequency: Joi.string().min(1).max(100).required().messages({
    "string.base": "Frequency must be a string",
    "string.empty": "Frequency cannot be empty",
    "string.min": "Frequency must be at least 1 character",
    "string.max": "Frequency cannot exceed 50 characters",
    "any.required": "Frequency is required",
  }),

  start_date: Joi.date().required().messages({
    "date.base": "Start date must be a valid date",
    "any.required": "Start date is required",
  }),
});

const medicalConditionSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "string.base": "Condition name must be a string",
    "string.empty": "Condition name cannot be empty",
    "string.min": "Condition name must be at least 1 character",
    "string.max": "Condition name cannot exceed 100 characters",
    "any.required": "Condition name is required",
  }),

  descr: Joi.string().max(255).allow(null, "").messages({
    "string.base": "Description must be a string",
    "string.max": "Description cannot exceed 255 characters",
  }),

  acc_id: Joi.number().integer().required().messages({
    "number.base": "Account ID must be a number",
    "number.integer": "Account ID must be an integer",
    "any.required": "Account ID is required",
  }),

  prescription_date: Joi.date().required().messages({
    "date.base": "Prescription date must be a valid date",
    "any.required": "Prescription date is required",
  }),

  // 🔽 Now optional
  updated_at: Joi.date().messages({
    "date.base": "Updated date must be a valid date",
  }),

  mod_id: Joi.number().integer().required().messages({
    "number.base": "Modifier ID must be a number",
    "number.integer": "Modifier ID must be an integer",
    "any.required": "Modifier ID is required",
  }),
});




function validateMedication(req, res, next) {
  const { error } = medicationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

function validateMedicalCondition(req, res, next) {
  const { error } = medicalConditionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}


module.exports = {
    validateMedication,
    validateMedicalCondition
};

