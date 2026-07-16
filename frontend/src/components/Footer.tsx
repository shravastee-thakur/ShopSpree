import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "Let Us Help You",
    links: [
      { label: "Your Account", href: "/account" },
      { label: "Returns Centre", href: "/returns" },
      { label: "Product Safety Alerts", href: "/safety" },
      { label: "Purchase Protection", href: "/protection" },
    ],
  },
  {
    title: "Get to Know Us",
    links: [
      { label: "About ShopSpree", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press Releases", href: "/press" },
    ],
  },
];

const socialLinks = [
  {
    icon: <Facebook className="h-5 w-5" />,
    to: "https://facebook.com",
    label: "Facebook",
  },
  {
    icon: <Twitter className="h-5 w-5" />,
    to: "https://twitter.com",
    label: "Twitter",
  },
  {
    icon: <Instagram className="h-5 w-5" />,
    to: "https://instagram.com",
    label: "Instagram",
  },
  {
    icon: <Youtube className="h-5 w-5" />,
    to: "https://youtube.com",
    label: "YouTube",
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link
              to="/"
              className="text-3xl font-bold tracking-tight hover:text-gray-300 transition-colors"
            >
              ShopSpree
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Your one-stop destination for quality products at unbeatable
              prices.
            </p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  to={social.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe for exclusive deals and updates
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center"
              >
                <Mail className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ShopSpree. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/privacy"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
