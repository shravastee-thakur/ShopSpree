import { useState } from "react";
import type { SyntheticEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import api from "../utils/axiosinstance";

const Login = () => {
  const navigate = useNavigate();
  const { setUserEmail } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, SetPassword] = useState("");

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post(`/api/v1/users/initiate-login`, {
        email,
        password,
      });
      console.log(res);

      if (res.data.success) {
        toast.success(res.data.message, {
          style: { borderRadius: "10px", background: "#F0E76F", color: "#333" },
        });

        setUserEmail(email);
        navigate("/verify-otp");
      }
    } catch (err: any) {
      let message = "Something went wrong. Please try again.";
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message, {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
      console.log(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-[#FA812F] p-6 text-white">
            <h2 className="text-2xl font-bold text-center tracking-tight">
              Welcome Back
            </h2>
            <p className="text-center text-orange-100 mt-1 text-sm">
              Login to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent transition"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Password
                </label>
                <Link
                  to="/reset-password"
                  className="text-xs text-gray-500 hover:text-[#FA812F] transition font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => SetPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FA812F] hover:bg-[#e06a1a] disabled:bg-orange-300 text-white font-bold py-2.5 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-gray-600 text-sm">
                Do not have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#FA812F] hover:underline font-semibold"
                >
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
