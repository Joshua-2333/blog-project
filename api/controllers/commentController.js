// api/controllers/commentController.js
export const getComments = (req, res) => {
  res.json({ message: "Get all comments route not implemented yet" });
};

export const addComment = (req, res) => {
  res.json({ message: "Add comment route not implemented yet" });
};

export const deleteComment = (req, res) => {
  res.json({ message: `Delete comment ${req.params.id} route not implemented yet` });
};
