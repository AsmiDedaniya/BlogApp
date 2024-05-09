import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create a post'));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }
  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    //done by me
    // Update user document to include the new post
    console.log(req.user.id);
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { posts: savedPost._id } }, // Assuming 'posts' is the array field in your user schema to store post IDs
      { new: true }
    );
    //////////////////
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

///////////////////main//////////////////////////////

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 12;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    const userId = req.query.userId; // Get userId from query
    console.log(userId);
    let query = {}; // Initialize empty query object

    if (userId) {
      // If userId is provided, fetch posts only for that user
      query.userId = userId;
    }

    // Add other query parameters
    query = {
      ...query,
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    };

    const posts = await Post.find(query)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      ...query,
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};
////////////////////main//////////////////////

export const getuserposts = async (req, res, next) => {
  try {
    // console.log("hello user");
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 12;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    const userId = req.query.userId ; // Get userId from query or current user
    console.log(userId);

    let query = {}; // Initialize empty query object

    // Fetch posts only for the specified user
    query.userId = userId;
   // console.log(query.userId);

    // Add other query parameters
    query = {
      ...query,
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    };

    const posts = await Post.find(query)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);
    //console.log(totalPosts);

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    // Count posts created by the current user in the last month
    const lastMonthPosts = await Post.countDocuments({
      ...query,
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts:totalPosts,
      lastMonthPosts:lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};


// export const deletepost = async (req, res, next) => {
//   if (!req.user.isAdmin || req.user.id !== req.params.userId) {
//     return next(errorHandler(403, 'You are not allowed to delete this post'));
//   }
//   try {
//     await Post.findByIdAndDelete(req.params.postId);
//     res.status(200).json('The post has been deleted');
//   } catch (error) {
//     next(error);
//   }
// };
export const deletepost = async (req, res, next) => {
  try {
    // Check if the user is authorized to delete the post
    if (!req.user.isAdmin || req.user.id !== req.params.userId) {
      return next(errorHandler(403, 'You are not allowed to delete this post'));
    }
    
    // Delete the post
    await Post.findByIdAndDelete(req.params.postId);

    // Remove the post reference from the user schema
    await User.findByIdAndUpdate(
      req.params.userId, // Assuming req.params.userId contains the user's ID
      { $pull: { posts: req.params.postId } }, // Assuming 'posts' is the array field in your user schema to store post IDs
      { new: true }
    );

    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};


export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this post'));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};
