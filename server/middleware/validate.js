import { validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorList = errors.array();
      return res.status(400).json({
        success: false,
        error: errorList[0].msg,
        errors: errorList
      });
    }

    next();
  };
};

export default validate;
