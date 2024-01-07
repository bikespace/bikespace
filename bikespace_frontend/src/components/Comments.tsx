import React from 'react';

const Comments = (props: {
  comments: string;
  onCommentsChanged: (comments: string) => void;
}) => {
  const comments = props.comments;
  const handleComments = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const commentText = e.currentTarget.value;
    props.onCommentsChanged(commentText);
  };
  return (
    <div id="submission-comments">
      <h1>Comments</h1>
      <h3>Any additional comments you want to add...</h3>
      <textarea
        onChange={handleComments}
        value={comments}
        rows={10}
        cols={33}
      ></textarea>
    </div>
  );
};

export default Comments;
