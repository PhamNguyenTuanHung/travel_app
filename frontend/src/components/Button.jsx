import React from "react";

export const Button = ({ children, type = "button", onClick, variant = "primary", disabled = false, ...props }) => {
  const className = `btn btn-${variant}`;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    />
  );
};
