import { Truck, ShieldCheck, Headphones } from "lucide-react";
import type { ReactNode } from "react";

interface FeatureItem {
  icon: ReactNode;
  title: string;
  description: string;
  bgClass: string;
  iconClass: string;
}

const features: FeatureItem[] = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Free Shipping",
    description: "On orders above Rs 500",
    bgClass: "bg-blue-100",
    iconClass: "text-blue-600",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Secure Payment",
    description: "100% secure transactions",
    bgClass: "bg-green-100",
    iconClass: "text-green-600",
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: "24/7 Support",
    description: "Always here to help",
    bgClass: "bg-purple-100",
    iconClass: "text-purple-600",
  },
];

const Features = () => {
  return (
    <section className="py-12 bg-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`h-12 w-12 ${feature.bgClass} ${feature.iconClass} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                {feature.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
