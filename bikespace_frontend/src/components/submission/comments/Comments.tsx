import React from 'react';

import * as styles from './comments.module.scss';

export const Comments = (props: {
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
    <div className={styles.submissionComments}>
      <h1>Comments</h1>
      <h3>Any additional comments you want to add...</h3>
      <textarea
        onChange={handleComments}
        value={comments}
        rows={10}
        cols={33}
        data-umami-event="comments-text-box"
      />
    </div>
  );
};
