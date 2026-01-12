import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useMediaQuery, useTheme, Drawer, Badge } from "@mui/material";
import { useSelector } from "react-redux";
// Icons check karein (Safe Icons)
import {
  ShoppingBasket,
  Menu,
  Home,
  AdminPanelSettingsOutlined,
  Explore,
  Close,
} from "@mui/icons-material";

const Navbar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));
  
  // Cart safety check
  const cart = useSelector((state) => state.cart) || [];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      scrolled ? "bg-gray-900 shadow-xl py-3" : "bg-gray-900 py-5"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        
        {/* Brand Logo */}
        <Link href="/">
          <a>
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-green-400 to-lime-300 bg-clip-text text-transparent cursor-pointer">
              Swirly
            </h1>
          </a>
        </Link>

        {/* Desktop Menu */}
        {!isMatch && (
          <div className="flex items-center space-x-8">
            <Link href="/"><a className="text-gray-300 hover:text-green-400 font-semibold transition">Home</a></Link>
            <Link href="/foods"><a className="text-gray-300 hover:text-green-400 font-semibold transition">Explore</a></Link>
          </div>
        )}

        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          <Link href="/cart">
            <a className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
              <Badge badgeContent={cart.length} color="success">
                <ShoppingBasket className="text-green-400" />
              </Badge>
            </a>
          </Link>

          {isMatch && (
            <button 
              onClick={() => setOpenDrawer(true)}
              className="p-2 text-green-400 bg-gray-800 rounded-lg"
            >
              <Menu />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{ sx: { width: "280px", bgcolor: "#111827", color: "white" } }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-10">
            <span className="text-xl font-bold">Menu</span>
            <Close className="text-green-500 cursor-pointer" onClick={() => setOpenDrawer(false)} />
          </div>
          <div className="flex flex-col space-y-6">
            <Link href="/"><a className="flex items-center space-x-4" onClick={() => setOpenDrawer(false)}><Home /> <span>Home</span></a></Link>
            <Link href="/foods"><a className="flex items-center space-x-4" onClick={() => setOpenDrawer(false)}><Explore /> <span>Explore</span></a></Link>
            <Link href="/admin/foods"><a className="flex items-center space-x-4" onClick={() => setOpenDrawer(false)}><AdminPanelSettingsOutlined /> <span>Dashboard</span></a></Link>
          </div>
        </div>
      </Drawer>
    </nav>
  );
};

export default Navbar;
