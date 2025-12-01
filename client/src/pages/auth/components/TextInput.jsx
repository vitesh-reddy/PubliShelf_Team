import React from 'react';

// Generic text input with optional leading icon.
// Props:
// - label
// - name
// - type (default text)
// - placeholder
// - iconClass (font-awesome icon)
// - register: RHF register fn
// - rules: validation rules object
// - error: field error object
// - onBlurTrigger: optional function to trigger validation
export const TextInput = ({ label, name, type = 'text', placeholder, iconClass, register, rules, error, onBlurTrigger }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700" htmlFor={name}>{label}</label>}
      <div className="mt-1 relative">
        {iconClass && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`${iconClass} text-gray-400`}></i>
          </div>
        )}
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          className={`appearance-none block w-full ${iconClass ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500`}
          {...register(name, rules)}
          onBlur={() => onBlurTrigger && onBlurTrigger(name)}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};

export default TextInput;
