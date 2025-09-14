import { useState } from "react";
import { motion } from "motion/react";
function Navigation() {
  return (
    <ul className="nav-ul">
      <li className="nav-li">
        <a className="nav-link font-semibold text-lg tracking-wide transition-all duration-300 hover:text-aqua hover:scale-105" href="#home">
          Home
        </a>
      </li>
      <li className="nav-li">
        <a className="nav-link font-semibold text-lg tracking-wide transition-all duration-300 hover:text-mint hover:scale-105" href="#about">
          About
        </a>
      </li>
      <li className="nav-li">
        <a className="nav-link font-semibold text-lg tracking-wide transition-all duration-300 hover:text-royal hover:scale-105" href="https://drive.google.com/file/d/11tgQS3R8CbXYitQFwPmjIUXJYzwgqYFU/view?usp=drive_link">
          Resume
        </a>
      </li>
      <li className="nav-li">
        <a className="nav-link font-semibold text-lg tracking-wide transition-all duration-300 hover:text-fuchsia hover:scale-105" href="#contact">
          Contact
        </a>
      </li>
    </ul>
  );
}
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed inset-x-0 z-20 w-full backdrop-blur-lg bg-primary/40">
      <div className="mx-auto c-space max-w-7xl">
        <div className="flex items-center justify-between py-2 sm:py-0">
          <a
            href="/"
            className="text-2xl font-extrabold transition-all duration-300 text-transparent bg-clip-text bg-gradient-to-r from-aqua via-mint to-royal hover:from-royal hover:via-fuchsia hover:to-aqua hover:scale-105 tracking-wide"
          >
             Yaten Arora 
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex cursor-pointer text-neutral-400 hover:text-aqua focus:outline-none sm:hidden transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-aqua/10"
          >
            <img
              src={isOpen ? "assets/close.svg" : "assets/menu.svg"}
              className="w-6 h-6 transition-transform duration-300"
              alt="toggle"
            />
          </button>
          <nav className="hidden sm:flex">
            <Navigation />
          </nav>
        </div>
      </div>
      {isOpen && (
        <motion.div
          className="block overflow-hidden text-center sm:hidden"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ maxHeight: "100vh" }}
          transition={{ duration: 1 }}
        >
          <nav className="pb-5">
            <Navigation />
          </nav>
        </motion.div>
      )}
    </div>
  );
};

export default Navbar;
