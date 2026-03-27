/**
 * @file StarRating.jsx
 * @description Displays a star rating with review count.
 * @author Hossein
 */

import './StarRating.css';

/**
 * StarRating component.
 * @param {object} props
 * @param {number} props.rating - Average rating (0–5)
 * @param {number} props.reviewCount - Total number of reviews
 */
const StarRating = ({ rating = 0, reviewCount = 0 }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full';
    if (i < rating) return 'half';
    return 'empty';
  });

  return (
    <div className="star-rating" aria-label={`Rating: ${rating.toFixed(1)} out of 5`}>
      <span className="stars">
        {stars.map((type, i) => (
          <span key={i} className={`star star--${type}`}>
            {type === 'full' ? '★' : type === 'half' ? '⯨' : '☆'}
          </span>
        ))}
      </span>
      <span className="star-count">({reviewCount})</span>
    </div>
  );
};

export default StarRating;
