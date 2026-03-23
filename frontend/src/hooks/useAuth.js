import { useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  const saveLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  return { user, saveLogin };
}