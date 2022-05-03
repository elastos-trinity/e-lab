import { Response } from "express";
import logger from "../logger";
import { DataOrError, ErrorType } from "../model/dataorerror";

const errorTypeToHttpStatus = (dataOrError: DataOrError<unknown>) => {
  switch (dataOrError.errorType) {
    case ErrorType.STATE_ERROR: return 400;
    case ErrorType.FORBIDDEN_ACCESS: return 401;
    case ErrorType.INVALID_PARAMETER: return 403;
    case ErrorType.SERVER_ERROR: return 500;
    default: return 500;
  }
}

export const apiError = (res: Response, dataOrError: DataOrError<unknown>) => {
  let status = errorTypeToHttpStatus(dataOrError);

  logger.error("API error:", status, dataOrError.error);

  res.status(status).send(dataOrError.error);
}