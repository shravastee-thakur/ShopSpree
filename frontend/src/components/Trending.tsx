const TrendingProducts = [
  {
    id: "1",
    title: "HP 13th Gen Core i5-1334U",
    price: 52490,
    image: "./Laptop.avif",
    category: "Electronics",
    brand: "HP",
  },
  {
    id: "2",
    title: "Samsung Galaxy A55 5G",
    price: 29999,
    image: "./Mobile.avif",
    category: "Electronics",
    brand: "Samsung",
  },
  {
    id: "3",
    title: "Noise Pulse Hyper Smart Watch",
    price: 1599,
    image: "./SmartWatch.avif",
    category: "Electronics",
    brand: "Noise",
  },
  {
    id: "4",
    title: "Panasonic 20L Microwave Oven",
    price: 6440,
    image: "./Microwave.avif",
    category: "Kitchen",
    brand: "Panasonic",
  },
  {
    id: "5",
    title: "LG-32 inches LED TV",
    price: 13489,
    image: "./TV.avif",
    category: "Electronics",
    brand: "LG",
  },
];

const Trending: React.FC = () => {
  return (
    <div className="pt-4 pb-8 px-4 bg-gray-200">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
          Trending Products
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          {/* Product Section */}
          <div className="flex-1">
            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {TrendingProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-40 flex items-center justify-center bg-gray-50 p-4">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">
                      {product.title}
                    </h3>
                    <p className="text-[#FA812F] font-bold">
                      ₹{product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
