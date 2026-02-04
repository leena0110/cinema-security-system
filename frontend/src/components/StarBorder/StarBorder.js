import './StarBorder.css';

const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = '#667eea',
  speed = '6s',
  thickness = 2,
  children,
  ...rest
}) => {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{
        '--star-color': color,
        '--star-speed': speed,
        ...rest.style
      }}
      {...rest}
    >
      <svg className="star-border-svg" xmlns="http://www.w3.org/2000/svg">
        <rect
          className="star-border-line star-border-line-1"
          rx="16"
          ry="16"
          style={{
            stroke: color,
            strokeWidth: thickness
          }}
        />
        <rect
          className="star-border-line star-border-line-2"
          rx="16"
          ry="16"
          style={{
            stroke: color,
            strokeWidth: thickness
          }}
        />
      </svg>
      <div className="inner-content">{children}</div>
    </Component>
  );
};

export default StarBorder;
