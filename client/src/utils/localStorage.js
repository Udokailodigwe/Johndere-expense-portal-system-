export const addUserToLocalStorage = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeUserFromLocalStorage = () => {
  localStorage.removeItem("user");
};

export const getUserFromLocalStorage = () => {
  return localStorage.getItem("user");
};

// SessionStorage utilities for temporary data during registration/activation
export const addUserToSessionStorage = (user) => {
  sessionStorage.setItem("tempUser", JSON.stringify(user));
};

export const removeUserFromSessionStorage = () => {
  sessionStorage.removeItem("tempUser");
};

export const getUserFromSessionStorage = () => {
  return sessionStorage.getItem("tempUser");
};
