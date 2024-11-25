const BASE_URL = "http://localhost:3000";

export const login = async (username, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    return data.token; // Save this token securely (e.g., AsyncStorage or Secure Storage)
  } else {
    throw new Error("Login failed");
  }
};

export const fetchGroceryList = async (token) => {
  const response = await fetch(`${BASE_URL}/grocery-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.ok) {
    return await response.json(); // Return the grocery list
  } else {
    throw new Error("Failed to fetch grocery list");
  }
};
