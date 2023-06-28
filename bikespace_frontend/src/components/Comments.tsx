import React from "react";

const Comments = (props: {comments: string, onCommentsChanged: (comments: string) => void}) => {
  const comments = props.comments
  const handleComments = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let commentText = e.currentTarget.value;
    props.onCommentsChanged(commentText);
  }
  return (
    <div id="comments">
      <h1>Comments</h1>
      <input type="text"
             onChange={handleComments}
             value={comments}></input>
    </div>
  )
}

export default Comments;