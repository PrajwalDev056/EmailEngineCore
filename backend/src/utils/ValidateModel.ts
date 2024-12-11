import { validate } from 'class-validator';
import { ValidationError } from './ErrorHandler';

/**
 * Utility function to validate a model using class-validator
 * @param model - The model to validate
 * @throws ValidationError if validation fails
 */
export const validateModel = async (model: object): Promise<void> => {
  const validationErrors = await validate(model);
  if (validationErrors.length > 0) {
    const errorMessages = validationErrors
      .map((error) => Object.values(error.constraints || {}))
      .join(', ');
    throw new ValidationError(`Validation failed: ${errorMessages}`);
  }
};
