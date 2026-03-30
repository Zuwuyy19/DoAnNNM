import { logout } from "../services/authService";

const Navbar = () => {
  return (
    <nav>
      <button
        onClick={() => {
          logout();
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;