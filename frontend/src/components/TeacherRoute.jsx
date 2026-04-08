import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../services/authService";

const TeacherRoute = ({ children }) => {
  const token = getToken();
  const user = getUser();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!user || !["instructor", "admin"].includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default TeacherRoute;

