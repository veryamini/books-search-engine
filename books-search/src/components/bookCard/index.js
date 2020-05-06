import React from 'react';
import './main.scss';

const MAX_LENGTH_DESCRIPTION = 200;
const MAX_LENGTH_TITLE = 100;

const BookCard = (props) => {
  const { title, summary, author } = props;
  return (
    <div className="book-card-wrapper">
      <div className="title-name">
        {title.length > MAX_LENGTH_TITLE
          ? `${title.substr(0, MAX_LENGTH_TITLE)} ...`
          : title}
      </div>
      <div className="description">
        {summary.length > MAX_LENGTH_DESCRIPTION
          ? `${summary.substr(0, MAX_LENGTH_DESCRIPTION)} ...`
          : summary}
      </div>
      <div className="author">{author}</div>
    </div>
  );
};

export default BookCard;
