const { Blog } = require('../_helper/db');
const { User } = require('../_helper/db');
const response = require("../_helper/response");

class BlogController {
    // Method to create a new blog
    static async createBlog(req, res) {
        try {
            const { title, description } = req.body;

            if (!title || !description) {
                return response(res, "Requested Data Missing", 400);
            }

            //createdBy from the authenticated user (from req.user)
            const createdBy = req.user.id;


            const user = await User.findById(createdBy);
            if (!user) {
                return response(res, "User not found", 404);
            }

            const blog = new Blog({
                title,
                description,
                createdBy,
            });

            const savedBlog = await blog.save();

            return response(res, "Blog created successfully!", 201, savedBlog);
        } catch (err) {
            return response(res, "Server Error", 500, { message: err.message });
        }
    }


    // Fetch blogs sorted by created_at in descending order (newest first)
    static async getBlogs(req, res) {
        try {
            const blogs = await Blog.find()
                .sort({ created_at: -1 }) // Sort blogs by createdAt (newest first)
                .populate('createdBy', 'name email avatar') // Populate user details for the blog
                .exec();

            if (!blogs || blogs.length === 0) {
                return response(res, "No blogs found", 404);
            }

            return response(res, "Blogs fetched successfully", 200, blogs);
        } catch (err) {
            return response(res, "Server Error", 500, { message: err.message });
        }
    }

    static async getMyBlogs(req, res) {
        try {
            const userId = req.user.id;
    
            const blogs = await Blog.find({ createdBy: userId })
                .sort({ created_at: -1 }) // Newest first
                .populate('createdBy', 'name email avatar') // Populate creator details
                .exec();
    
            if (!blogs || blogs.length === 0) {
                return response(res, "No blogs found for this user", 404);
            }
    
            return response(res, "User's blogs fetched successfully", 200, blogs);
        } catch (err) {
            return response(res, "Server Error", 500, { message: err.message });
        }
    }
    

    static async updateById(req, res) {
        try {
          const { blog_id, updatedData } = req.body;
          const userId = req.user.id;
      
          if (!blog_id || !updatedData) {
            return response(res, "Requested data missing", 400);
          }
      
          const blog = await Blog.findOne({ _id: blog_id, createdBy: userId });
      
          if (!blog) {
            return response(res, "Blog not found or unauthorized", 404);
          }
      
          // Update blog fields
          blog.title = updatedData.title || blog.title;
          blog.description = updatedData.description || blog.description;
      
          const updatedBlog = await blog.save();
      
          return response(res, "Blog updated successfully", 200, updatedBlog);
        } catch (err) {
          return response(res, "Server Error", 500, { message: err.message });
        }
      }
      



}

module.exports = BlogController;
