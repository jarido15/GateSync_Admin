import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { loginUser } from "./authService";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect if already logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const adminRef = doc(db, "admin", user.uid);
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
          navigate("/dashboard");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(data.email, data.password);
      if (response.success) {
        const user = response.user;

        // Check if user exists in the "admin" collection
        const adminRef = doc(db, "admin", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          navigate("/dashboard");
        } else {
          setError("Access Denied: You are not an admin.");
        }
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("email", { required: true })}
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded"
          />
          <input
            {...register("password", { required: true })}
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
