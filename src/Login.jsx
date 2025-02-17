import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = () => {
    setLoading(true);
    setError("");

    const email = "admin@gmail.com"; // Static email
    const password = "Admin123"; // Static password

    // Check if the credentials are correct
    if (email === "admin@gmail.com" && password === "Admin123") {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <button
          onClick={onSubmit}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
};

export default Login;

        
