// frontend/web-app/src/components/common/RatingStars.jsx
import React from 'react';
import { FaStar } from 'react-icons/fa';

const RatingStars = ({ rating, setRating, readOnly = false }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && setRating(star)}
          className={`text-2xl ${
            readOnly ? 'cursor-default' : 'cursor-pointer'
          } focus:outline-none ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          <FaStar />
        </button>
      ))}
      
      {!readOnly && (
        <span className="ml-2 text-sm text-gray-600">
          {rating} star{rating !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
