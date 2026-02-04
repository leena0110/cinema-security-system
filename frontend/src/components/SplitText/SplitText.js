import { useMemo } from 'react';

import "./SplitText.css";

const SplitText = ({
  text,
  className = '',
  delay = 40,
  splitType = 'chars',
  textAlign = 'center',
  tag = 'p',
}) => {
  // Split text into elements with staggered animation delays
  const splitContent = useMemo(() => {
    if (!text) return null;

    if (splitType.includes('chars')) {
      return text.split('').map((char, index) => (
        <span
          key={index}
          className="split-char"
          style={{ animationDelay: `${index * delay}ms` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    } else if (splitType.includes('words')) {
      return text.split(' ').map((word, index, array) => (
        <span
          key={index}
          className="split-word"
          style={{ animationDelay: `${index * delay}ms` }}
        >
          {word}
          {index < array.length - 1 ? '\u00A0' : ''}
        </span>
      ));
    }
    
    return text;
  }, [text, splitType, delay]);

  const Tag = tag || 'p';

  return (
    <Tag 
      className={`split-parent ${className}`}
      style={{ textAlign, display: 'block' }}
    >
      {splitContent}
    </Tag>
  );
};

export default SplitText;
