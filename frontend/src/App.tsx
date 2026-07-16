import Features from "./components/Features";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Trending from "./components/Trending";

const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <Trending />
    </div>
  );
};

export default App;
