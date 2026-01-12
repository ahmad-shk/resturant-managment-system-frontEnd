import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import axios from "axios";
import Loading from "../components/Loading";
import Router from "next/router";

const order = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    cart,
    user: { user },
  } = useSelector((state) => state);
  const foodName = cart.map((item) => item.name);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !address || foodName.length === 0) {
      enqueueSnackbar(
        foodName.length === 0 ? "Your cart is empty!" : "Please fill all the fields!", 
        {
          variant: "error",
          autoHideDuration: 2000,
        }
      );
      return;
    }

    enqueueSnackbar("Order placed! Redirecting...", {
      variant: "info",
      autoHideDuration: 2000,
    });

    Router.push("/thankyou");
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="max-w-6xl mx-auto min-h-[83vh] p-3">
            <div className="flex flex-col justify-center items-center p-3">
              <form
                className="flex flex-col items-center justify-center"
                onSubmit={handleSubmit}
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-3 border-2 border-green-400 mt-3 bg-transparent rounded-lg outline-none font-semibold placeholder:text-sm"
                  type="text"
                  placeholder="Your name"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 border-2 border-green-400 mt-3 bg-transparent rounded-lg outline-none font-semibold placeholder:text-sm"
                  type="text"
                  placeholder="Your email"
                />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="p-3 border-2 border-green-400 mt-3 bg-transparent rounded-lg outline-none font-semibold placeholder:text-sm w-full"
                  type="text"
                  placeholder="Your address"
                />
                <input
                  type="submit"
                  value={"Place order"}
                  className="bg-white text-green-500 font-bold p-3 outline-none rounded-lg w-full cursor-pointer mt-3 hover:bg-green-400 hover:text-white transition duration-300 ease-in"
                />
              </form>
              <p className="text-sm font-bold text-green-400 mt-3">
                * Only Cash on delivery is Available
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default order;
