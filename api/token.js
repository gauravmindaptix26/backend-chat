import { serverlessTokenHandler } from "../tokenHandler.js";

export default function handler(req, res) {
  return serverlessTokenHandler(req, res);
}
