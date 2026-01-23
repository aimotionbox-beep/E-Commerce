import React, { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

const Verify = () => {
  const { navigate, token, setCartItems } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const verifyPayment = async () => {
    try {
      if (!token) return;

      const response = await api.post("/api/order/verifyStripe", {
        success,
        orderId,
      });

      if (response.data.success) {
        setCartItems({});
        navigate("/orders");
      } else {
        navigate("/cart");
      }
    } catch (error) {
      console.log("verifyPayment error:", error);
      toast.error("Payment verification failed");
      navigate("/cart");
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [token]);

  return <div></div>;
};

export default Verify;
