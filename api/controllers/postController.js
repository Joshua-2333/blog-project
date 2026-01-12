// api/controllers/postController.js
export const getPosts = (req, res) => {
  res.json({ message: "Get all posts route not implemented yet" });
};

export const getPostById = (req, res) => {
  res.json({ message: `Get post ${req.params.id} route not implemented yet` });
};

export const createPost = (req, res) => {
  res.json({ message: "Create post route not implemented yet" });
};

export const updatePost = (req, res) => {
  res.json({ message: `Update post ${req.params.id} route not implemented yet` });
};

export const deletePost = (req, res) => {
  res.json({ message: `Delete post ${req.params.id} route not implemented yet` });
};
