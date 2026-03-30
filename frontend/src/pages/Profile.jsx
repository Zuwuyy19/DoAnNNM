import { useEffect, useState } from "react";
import { getProfile } from "../services/authService";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getProfile()
      .then((res) => setUser(res.data))
      .catch(() => alert("Chưa đăng nhập"));
  }, []);

  return (
    <div>
      <h2>Profile</h2>
      {user && <p>{user.email}</p>}
    </div>
  );
};

export default Profile;