"use server";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { cookies } from "next/headers";

dotenv.config();
const secret: string = process.env.JWT!;

const generateAuthToken = function (_id: string, agentEndpoint: string) {
  const token = jwt.sign({ _id, agentEndpoint }, secret, { expiresIn: "24h" });
  return token;
};

const verifyAuthToken = function (token: string): JwtPayload|null {
  if (token) {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log(decoded);
    return decoded;
  }
  return null
};

const getCookie = async() => {
  try {
    const cookieValue = cookies().get("auth")?.value;

    if (cookieValue) {
      return cookieValue;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error retrieving cookie:", error);
    return false;
  }
};

const deleteCookie = () => {
  try {
    cookies().delete("auth");
    console.log("cookie removed");
  } catch (error) {
    console.log("cookie removal failed");
  }
};

export { generateAuthToken, verifyAuthToken, getCookie, deleteCookie };
