import { useState } from "react";
import type { SyntheticEvent } from "react";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/axiosinstance";
import { useAuthStore } from "../store/authStore";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const { setIsVerified, setUserInfo, email, setAccessToken, setRole } =
    useAuthStore();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const res = await api.post("api/v1/users/verify", { email, otp });
      console.log(res);

      if (res.data.success) {
        toast.success(res.data.message, {
          style: { borderRadius: "10px", background: "#F0E76F", color: "#333" },
        });
        setAccessToken(res.data.accessToken);
        setIsVerified(res.data.data.user.isVerified);
        setRole(res.data.data.user.role);
        setUserInfo(res.data.data.user);
        navigate("/");
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
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FA812F]/10 text-[#FA812F] mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
            Verify your email
          </h1>
          <p className="text-gray-500 text-sm">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="------"
              className="w-full px-4 py-4 text-center text-3xl font-mono font-bold tracking-[0.5em] text-gray-900 bg-white border border-gray-300 rounded-xl placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 bg-[#FA812F] hover:bg-[#e06a1a] text-white shadow-lg shadow-[#FA812F]/20 focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:ring-offset-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify Account</span>
                <ShieldCheck className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
