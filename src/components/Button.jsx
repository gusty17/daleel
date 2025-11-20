function Button({ children, onClick, type = "button", className = "btn" }) {
    return (
      <button className={className} type={type} onClick={onClick}>
        {children}
      </button>
    );
  }
  
  export default Button;
  