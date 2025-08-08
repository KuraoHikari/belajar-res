import "dotenv/config";

import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export async function createBio(request, response) {
 const body = request.body;
 if (!body.name || body.name.trim() === "") {
  return response.status(400).json({ error: "Name is required" });
 }

 try {
  // Create a new bio in the database
  const bioData = {
   name: body.name,
   about: body.about || null,
   address: body.address || null,
   userId: request.user.userId, // Assuming userId is provided in the request body
  };

  // Create the bio in the database using Prisma
  const bio = await prisma.bio.create({
   data: bioData,
  });

  // Return the created bio
  return response.status(200).json(bio);
 } catch (error) {
  console.error("Error creating bio:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}
