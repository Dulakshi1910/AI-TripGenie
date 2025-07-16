export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Email is required";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Password is required";
  }
  
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }
  
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) {
    return "Username is required";
  }
  
  if (username.length < 3) {
    return "Username must be at least 3 characters long";
  }
  
  if (username.length > 30) {
    return "Username cannot exceed 30 characters";
  }
  
  // Check for valid characters (letters, numbers, underscores, hyphens)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return "Username can only contain letters, numbers, underscores, and hyphens";
  }
  
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  
  return null;
};

// Additional validation functions for enhanced security
export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) {
    return "Phone number is required";
  }
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    return "Phone number must be at least 10 digits";
  }
  
  if (cleanPhone.length > 15) {
    return "Phone number cannot exceed 15 digits";
  }
  
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) {
    return "Name is required";
  }
  
  if (name.length < 2) {
    return "Name must be at least 2 characters long";
  }
  
  if (name.length > 50) {
    return "Name cannot exceed 50 characters";
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  }
  
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) {
    return "URL is required";
  }
  
  try {
    new URL(url);
    return null;
  } catch {
    return "Please enter a valid URL";
  }
};

export const validateAge = (age: string): string | null => {
  if (!age) {
    return "Age is required";
  }
  
  const ageNum = parseInt(age);
  
  if (isNaN(ageNum)) {
    return "Age must be a valid number";
  }
  
  if (ageNum < 13) {
    return "You must be at least 13 years old";
  }
  
  if (ageNum > 120) {
    return "Please enter a valid age";
  }
  
  return null;
};
