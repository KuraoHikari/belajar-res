import "dotenv/config";
import exp from "express";
import cors from "cors";

import jwt from "jsonwebtoken";
const server = exp();
const port = +process.env.PORT || 3000; // Default to 3000 if PORT is not set

const secret = process.env.JWT_SECRET;

import { PrismaClient } from "./generated/prisma/index.js";

import authRoutes from "./routes/auth.js";

import authenticateTokenMiddleware from "./middleware/authenticateToken.js";
import bioRoutes from "./routes/bio.js";

const prisma = new PrismaClient();

// Middleware to enable CORS
server.use(cors());

// Middleware to parse JSON bodies
server.use(exp.json());
server.use(exp.urlencoded({ extended: true }));

server.use("/auth", authRoutes);
server.use("/bio", bioRoutes);

// Route to create a new user
server.post("/users", createUser);
server.get("/users", authenticateTokenMiddleware, getUsers);
server.get("/users/:email", authenticateTokenMiddleware, getUserByEmail);
server.delete("/users/:email", deleteUser);
server.put("/users/:email", updateUser);

// getUserEmail function to handle fetching a user by email
async function getUserByEmail(request, response) {
 const email = request.params.email;
 if (!email || email.trim() === "") {
  return response.status(400).json({ error: "Email is required" });
 }

 try {
  const where = {
   email: email.trim(),
  };
  // Fetch the user by email from the database using Prisma
  const user = await prisma.user.findUnique({
   where: where,
   include: {
    bio: true, // Include bio related to the user
    posts: true, // Include posts related to the user
   },
  });
  return response.status(200).json(user);
 } catch (error) {
  console.error("Error creating user:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}

// getUsers function to handle fetching all users
async function getUsers(request, response) {
 try {
  console.log("🚀 ~ getUsers ~ request.user:", request.user);

  const users = await prisma.user.findMany({
   include: {
    bio: true,
    posts: true, // Include posts related to the user
   },
  });
  return response.status(200).json(users);
 } catch (error) {
  console.error("Error creating user:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}

// createUser function to handle user creation
async function createUser(request, response) {
 const body = request.body;

 //validate user input, for example, check if email is provided, email is not empty, etc.
 if (!body.email || body.email.trim() === "") {
  return response.status(400).json({ error: "Email is required" });
 }

 if (!body.name || body.name.trim() === "") {
  return response.status(400).json({ error: "Name cannot be empty" });
 }

 try {
  //create a new user in the database
  const userData = {
   email: body.email,
   name: body.name,
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

// deleteUser function to handle user deletion
async function deleteUser(request, response) {
 const email = request.params.email;
 if (!email || email.trim() === "") {
  return response.status(400).json({ error: "Email is required" });
 }
 try {
  const where = {
   email: email.trim(),
  };
  // Delete the user by email from the database using Prisma
  const user = await prisma.user.delete({
   where: where,
  });
  return response.status(200).json(user);
 } catch (error) {
  console.error("Error deleting user:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}

// updateUser function to handle user updates
async function updateUser(request, response) {
 const email = request.params.email;
 const body = request.body;

 if (!email || email.trim() === "") {
  return response.status(400).json({ error: "Email is required" });
 }

 if (!body.name || body.name.trim() === "") {
  return response.status(400).json({ error: "Name cannot be empty" });
 }

 try {
  const where = {
   email: email.trim(),
  };
  // Update the user by email in the database using Prisma
  const user = await prisma.user.update({
   where: where,
   data: {
    name: body.name,
   },
  });
  return response.status(200).json(user);
 } catch (error) {
  console.error("Error updating user:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}

server.post("/post", authenticateTokenMiddleware, createPost);
server.get("/post", getPosts);

async function createPost(request, response) {
 const body = request.body;
 if (!body.title || body.title.trim() === "") {
  return response.status(400).json({ error: "Title is required" });
 }

 try {
  // Create a new post in the database
  const postData = {
   title: body.title,
   userId: request.user.userId, // Assuming userId is provided in the request body
  };

  // Create the post in the database using Prisma
  const post = await prisma.post.create({
   data: postData,
  });

  // Return the created post
  return response.status(200).json(post);
 } catch (error) {
  console.error("Error creating post:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}

async function getPosts(request, response) {
 try {
  // Fetch all posts from the database using Prisma
  const posts = await prisma.post.findMany({
   include: {
    user: {
     select: {
      name: true,
     },
    },
    // include categories if the post has categories
    categories: true, // Corrected from categoryPosts: true
   },
  });
  return response.status(200).json(posts);
 } catch (error) {
  console.error("Error fetching posts:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}

server.post("/category", createCategory);

async function createCategory(request, response) {
 const body = request.body;
 if (!body.name || body.name.trim() === "") {
  return response.status(400).json({ error: "Name is required" });
 }

 try {
  // Create a new category in the database
  const categoryData = {
   name: body.name,
  };

  // Create the category in the database using Prisma
  const category = await prisma.category.create({
   data: categoryData,
  });

  // Return the created category
  return response.status(200).json(category);
 } catch (error) {
  console.error("Error creating category:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}

server.get("/category", getCategories);

async function getCategories(request, response) {
 try {
  // Fetch all categories from the database using Prisma
  const categories = await prisma.category.findMany({
   include: {
    categoryPosts: {
     include: {
      post: true, // Include posts related to the category
     },
    },
   },
  });
  return response.status(200).json(categories);
 } catch (error) {
  console.error("Error fetching categories:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}

server.post("/category-post", createCategoryPost);

async function createCategoryPost(request, response) {
 const body = request.body;
 if (!body.categoryId || !body.postId) {
  return response.status(400).json({ error: "Category ID and Post ID are required" });
 }

 try {
  // Create a new category-post relation in the database
  const categoryPostData = {
   categoryId: +body.categoryId,
   postId: +body.postId,
  };

  // Create the category-post relation in the database using Prisma
  const categoryPost = await prisma.categoryPost.create({
   data: categoryPostData,
  });

  // Return the created category-post relation
  return response.status(200).json(categoryPost);
 } catch (error) {
  console.error("Error creating category-post relation:", error);
  return response.status(500).json({ error: "Internal server error" });
 }
}

function startServer() {
 console.log("Server is running on port " + port);
}

server.listen(port, startServer);

export default server;
