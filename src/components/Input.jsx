function Input({ type, placeholder, value, onChange }) {
    return (
      <input
        type={type}
        placeholder={placeholder}
        className="signup-input"
        value={value}
        onChange={onChange}
        required
      />
    );
  }
  
  export default Input;
  