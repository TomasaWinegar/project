import { ParsedUrlQueryInput } from "querystring";

export const AUTH_ERROR_CODES = {
  ALREADY_EXISTS: "An unexpected error occurred, please try again.",
  EXPIRED: "This verification code has expired, please try again.",
  INCORRECT: "This login code has expired, please try again.",
  LOGIN_CODE_NOT_FOUND: "An unexpected error occurred, please try again.",
  MAX_ATTEMPTS:
    "You have exceeded the maximum number of attempts for this login code, please try again.",
  NOT_FOUND: "An unexpected error occurred, please try again.",
} as const;

type ParsedAuthQuery = {
  verificationId: string;
  verificationCode: string;
};

export const isParsedAuthQuery = (
  query: ParsedUrlQueryInput
): query is ParsedAuthQuery =>
  typeof query.verificationId === "string" &&
  typeof query.verificationCode === "string";
