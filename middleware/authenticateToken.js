import "dotenv/config";

import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export default async function authenticateTokenMiddleware(request, response, next) {
 const token = request.headers["token"];
 console.log("🚀 ~ authenticateTokenMiddleware ~ token:", token);

 if (!token || token.trim() === "") {
  return response.status(401).json({ error: "Token is required" });
 }

 try {
  const verifiedToken = jwt.verify(token, secret);
  console.log("ini token verifynya", verifiedToken);

  if (!verifiedToken || !verifiedToken.userId) {
   return response.status(403).json({ error: "Invalid token" });
  }

  // Attach the userId to the request object for further use
  request.user = {
   userId: verifiedToken.userId,
   email: verifiedToken.email,
  };

  next();
 } catch (error) {
  return response.status(403).json({ error: "Invalid token" });
 }
}
