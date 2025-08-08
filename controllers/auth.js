import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const saltRounds = +process.env.SALT_ROUND;
const secret = process.env.JWT_SECRET;

export async function login(request, response) {
 const body = request.body;

 //validate user input, for example, check if email is provided, email is not empty, etc.
 if (!body.email || body.email.trim() === "") {
  return response.status(400).json({ error: "Email is required" });
 }

 if (!body.password || body.password.trim() === "") {
  return response.status(400).json({ error: "Password is required" });
 }

 //check password length
 if (body.password.length < 6) {
  return response.status(400).json({ error: "Password must be at least 6 characters long" });
 }

 try {
  const where = {
   email: body.email.trim(),
  };
  // Fetch the user by email from the database using Prisma
  const user = await prisma.user.findUnique({
   where: where,
  });

  if (!user) {
   return response.status(404).json({ error: "User not found" });
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = bcrypt.compareSync(body.password, user.password);

  if (!isPasswordValid) {
   return response.status(401).json({ error: "Invalid password" });
  }

  // Generate a JWT token
  const token = jwt.sign(
   {
    userId: user.id,
    email: user.email,
   },
   secret
  );

  return response.status(200).json(token);
 } catch (error) {
  console.error("Error creating user:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}

export async function register(request, response) {
 const body = request.body;

 //validate user input, for example, check if email is provided, email is not empty, etc.
 if (!body.email || body.email.trim() === "") {
  return response.status(400).json({ error: "Email is required" });
 }

 if (!body.password || body.password.trim() === "") {
  return response.status(400).json({ error: "Password is required" });
 }

 //check password length
 if (body.password.length < 6) {
  return response.status(400).json({ error: "Password must be at least 6 characters long" });
 }

 try {
  const hash = bcrypt.hashSync(body.password, saltRounds);

  //create a new user in the database
  const userData = {
   email: body.email,
   password: hash,
  };

  // Create the user in the database using Prisma
  const user = await prisma.user.create({
   data: userData,
  });

  // Return the created user
  return response.status(200).json(user);
 } catch (error) {
  console.error("Error creating user:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}
