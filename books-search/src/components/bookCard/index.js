import React from 'react';
import PropTypes from 'prop-types';
import './main.scss';

const MAX_LENGTH_DESCRIPTION = 200;
const MAX_LENGTH_TITLE = 100;

/**
 * BookCard renders book card
 * @param {Object} props props received
 * @returns {Node} 
 */
const BookCard = (props) => {
  const { title, summary, author, highlightId, id } = props;
  return (
    <div className={`book-card-wrapper ${highlightId && highlightId === id ? 'highlight' : ''}`}>
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

BookCard.propTypes = {
  title: PropTypes.string,
  summary: PropTypes.string,
  author: PropTypes.string,
  highlightId: PropTypes.number,
  id: PropTypes.number,
};

export default BookCard;
