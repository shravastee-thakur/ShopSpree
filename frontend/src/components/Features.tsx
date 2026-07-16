import { Truck, ShieldCheck, Headset } from "lucide-react";
import { ReactElement } from "react";

interface FeatureItem {
  icon: ReactElement;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

const featuresData: FeatureItem[] = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Free Shipping",
    description: "On orders above Rs 500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Secure Payment",
    description: "100% secure transactions",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: <Headset className="h-6 w-6" />,
    title: "24/7 Support",
    description: "Always here to help",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
];

const Features = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`h-12 w-12 ${feature.bgColor} ${feature.iconColor} rounded-full flex items-center justify-center shrink-0`}
              >
                {feature.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
