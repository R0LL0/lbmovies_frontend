import React, { useState, useEffect } from "react";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../services/socialService";
import { getCurrentUser } from "../services/authService";
import "./Comments.css";

const Comments = ({ movieId, movieType }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
    loadUser();
  }, [movieId, movieType]);

  const loadUser = async () => {
    const { user } = await getCurrentUser();
    setUser(user);
  };

  const loadComments = async () => {
    setLoading(true);
    const { data, error } = await getComments(movieId, movieType);
    if (!error && data) {
      setComments(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { data, error } = await addComment(
      user.id,
      movieId,
      movieType,
      newComment.trim()
    );

    if (!error && data) {
      setComments([data, ...comments]);
      setNewComment("");
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;

    const { data, error } = await updateComment(
      commentId,
      user.id,
      editContent.trim()
    );

    if (!error && data) {
      setComments(comments.map((c) => (c.id === commentId ? data : c)));
      setEditingId(null);
      setEditContent("");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    const { error } = await deleteComment(commentId, user.id);

    if (!error) {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  };

  if (loading) {
    return <div className="comments-loading">Loading comments...</div>;
  }

  return (
    <div className="comments-section">
      <h3 className="comments-title">Comments ({comments.length})</h3>

      {user && (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="comment-input"
          />
          <button
            type="submit"
            className="comment-submit"
            disabled={!newComment.trim()}
          >
            Post Comment
          </button>
        </form>
      )}

      {!user && (
        <p className="comments-login-prompt">
          <a href="/login">Sign in</a> to leave a comment
        </p>
      )}

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <div className="comment-avatar">
                    {comment.profiles?.username?.charAt(0).toUpperCase() ||
                      comment.profiles?.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                  <div>
                    <strong>{comment.profiles?.username || "User"}</strong>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {user && user.id === comment.user_id && (
                  <div className="comment-actions">
                    {editingId === comment.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(comment.id)}
                          className="comment-action-btn save"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent("");
                          }}
                          className="comment-action-btn cancel"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(comment)}
                          className="comment-action-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="comment-action-btn delete"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {editingId === comment.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="comment-edit-input"
                  rows={3}
                />
              ) : (
                <p className="comment-content">{comment.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
