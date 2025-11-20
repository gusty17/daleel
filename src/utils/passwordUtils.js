export const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return '';
    if (pwd.length < 8) return 'Weak';
  
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
  
    let strength = 0;
    if (hasNumber || hasSymbol) strength++;
    if (hasUpper && hasLower) strength++;
    if (pwd.length >= 12) strength++;
  
    if (strength <= 1) return 'Weak';
    if (strength === 2) return 'Medium';
    return 'Strong';
  };
  
  export const hasMinLength = (pwd) => pwd.length >= 8;
  
  export const hasNumberOrSymbol = (pwd) =>
    /\d/.test(pwd) || /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
  
  export const passwordsMatch = (pwd, confirmPwd) =>
    pwd && confirmPwd && pwd === confirmPwd;
  