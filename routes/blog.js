const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const { verifyToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   - name: Blog
 *     description: Blog endpoints
 * /api/blogs:
 *   get:
 *     tags: [Blog]
 *     summary: Returns a list of blogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of blogs
 *       401:
 *         description: Unauthorized - authentication required
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/**
 * @swagger
 * /api/blogs:
 *   post:
 *     tags: [Blog]
 *     summary: Creates a new blog
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       401:
 *         description: Unauthorized - authentication required
 */
router.post("/", verifyToken, async (req, res) => {
  const { title, content, image } = req.body;

  const blog = new Blog({
    title,
    content,
    image,
  });

  try {
    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     tags: [Blog]
 *     summary: Returns a blog by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the blog to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A blog object
 *       401:
 *         description: Unauthorized - authentication required
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     tags: [Blog]
 *     summary: Updates a blog by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the blog to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedBlog)
      return res.status(404).json({ message: "Blog not found" });
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     tags: [Blog]
 *     summary: Deletes a blog by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the blog to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       401:
 *         description: Unauthorized - authentication required
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog)
      return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
