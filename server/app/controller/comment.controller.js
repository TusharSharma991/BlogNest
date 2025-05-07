const { Blog, User, Comment } = require('../_helper/db');

const response = require("../_helper/response");

class BlogController {
    // Method to create a new blog
    static async create(req, res) {
        try {
            const { content, blog, parentComment } = req.body;

            if (!content || !blog) {
                return response(res, "Requested Data Missing", 400);
            }

            const user = req.user.id;

            const userData = await User.findById(user);
            if (!userData) {
                return response(res, "User not found", 404);
            }

            const commentData = {
                content,
                blog,
                user,
            };

            // Attaching parent comment if present
            if (parentComment) {
                commentData.parentComment = parentComment;
            }

            const comment = new Comment(commentData);
            const savedComment = await comment.save();

            return response(res, "Comment Saved successfully!", 201, savedComment);
        } catch (err) {
            return response(res, "Server Error", 500, { message: err.message });
        }
    }

    static async getCommentsByBlogId(req, res) {
        try {
            const blogId = req.params.id;
    
            if (!blogId) {
                return response(res, "Requested Data Missing", 400);
            }
    
            const comments = await Comment.find({ blog: blogId })
                .sort({ created_at: 1 })  // Optional: oldest to newest
                .populate('user', 'name email avatar');
    
            if (!comments || comments.length === 0) {
                return response(res, "No comments found for this blog", 404);
            }
    
            // Step 1: Create a map of all comments by ID
            const commentMap = {};
            comments.forEach(comment => {
                const plainComment = comment.toObject();
                plainComment.replies = [];
                commentMap[plainComment._id] = plainComment;
            });
    
            // Step 2: Recursively nest replies
            const nestComments = () => {
                const nestedComments = [];
    
                Object.values(commentMap).forEach(comment => {
                    if (comment.parentComment) {
                        const parent = commentMap[comment.parentComment];
                        if (parent) {
                            parent.replies.push(comment);
                        }
                    } else {
                        nestedComments.push(comment); // root comments
                    }
                });
    
                return nestedComments;
            };
    
            const nestedCommentTree = nestComments();
    
            return response(res, "Comments fetched successfully", 200, nestedCommentTree);
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
