import { useState } from "react";
import { Search, Menu, X, ShoppingCart } from "lucide-react";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { useAuthStore } from "../store/authStore";

const Navbar = () => {
  //   const { userId, accessToken, isVerified, name, role, logout } =
  //     useAuthStore();
  //   const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  //   const handleSearch = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     if (!searchQuery.trim()) return;
  //     navigate(`/search?q=${searchQuery}`);
  //     setSearchQuery("");
  //   };

  //   const handleLogout = async () => {
  //     try {
  //       const res = await axios.post(
  //         "http://localhost:3000/api/v1/user/logout",
  //         { userId },
  //         {
  //           headers: { Authorization: `Bearer ${accessToken}` },
  //           withCredentials: true,
  //         },
  //       );

  //       if (res.data.success) {
  //         toast.success(res.data.message || "Logged out successfully");
  //         logout();
  //         navigate("/login");
  //       }
  //     } catch (error) {
  //       toast.error("Logout failed. Please try again.");
  //     }
  //   };

  return (
    <nav className="bg-[#1A1A1D] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <p className="text-2xl font-bold tracking-tight">ShopSpree</p>

          {/* Desktop Search */}
          <form
            // onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-full text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <p
              //   to="/products"
              className="hover:text-yellow-200 transition font-medium"
            >
              Products
            </p>
            <p
              //   to="/about"
              className="hover:text-yellow-200 transition font-medium"
            >
              About
            </p>

            {/* {isVerified ? (
              <>
                {role === "admin" && (
                  <Link
                    to="/admin-dashboard"
                    className="hover:text-yellow-200 transition font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="hover:text-yellow-200 transition font-medium"
                >
                  {name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-yellow-200 transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="hover:text-yellow-200 transition font-medium"
              >
                Login
              </Link>
            )} */}

            <p
              //   to="/cart"
              className="relative hover:text-yellow-200 transition"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                3
              </span>
            </p>
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="flex items-center space-x-4 md:hidden">
            <p
              //   to="/cart"
              className="relative hover:text-yellow-200 transition"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                3
              </span>
            </p>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-[#e07225] transition focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#FA812F] border-t border-[#e07225]">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <form className="pb-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded-full text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* {isVerified ? (
              <div className="space-y-2 border-t border-[#e07225] pt-3">
                <p className="text-yellow-200 font-medium">Welcome, {name}</p>
                <Link
                  to="/profile"
                  className="block hover:text-yellow-200 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                {role === "admin" && (
                  <Link
                    to="/admin-dashboard"
                    className="block hover:text-yellow-200 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left hover:text-yellow-200 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="block hover:text-yellow-200 transition"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )} */}

            <p
              //   to="/products"
              className="block hover:text-yellow-200 transition"
              onClick={() => setIsOpen(false)}
            >
              Products
            </p>
            <p
              //   to="/about"
              className="block hover:text-yellow-200 transition"
              onClick={() => setIsOpen(false)}
            >
              About
            </p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
