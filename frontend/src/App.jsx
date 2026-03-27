import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CourseList from "./pages/course/CourseList";
import CourseDetail from "./pages/course/CourseDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;