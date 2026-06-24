import React from "react";

export const Input = ({ label, name, type = "text", value, onChange, placeholder, required = false, ...props }) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="glass-input"
        {...props}
      />
    </div>
  );
};
