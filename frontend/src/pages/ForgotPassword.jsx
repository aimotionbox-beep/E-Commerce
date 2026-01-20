import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const ForgotPassword = () => {
  const { backendUrl, setToken, navigate, token } =
    useContext(ShopContext);

  const [step, setStep] = useState(1); // 1=email | 2=otp
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  /* ================= SUBMIT HANDLER ================= */
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      /* -------- SEND OTP -------- */
      if (step === 1) {
        const res = await axios.post(
          backendUrl + "/api/user/forgotPassword",
          { email }
        );

        if (res.data.success) {
          toast.success("OTP sent to your email");
          setStep(2);
        } else {
          toast.error(res.data.message);
        }
      }

      /* -------- VERIFY OTP -------- */
      if (step === 2) {
        const res = await axios.post(
          backendUrl + "/api/user/verifyForgotOTP",
          { email, otp }
        );

        if (res.data.success) {
          setToken(res.data.token);
          localStorage.setItem("token", res.data.token);
          toast.success("New password sent to email");
          navigate("/");
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  /* ================= REDIRECT ================= */
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <form
      onSubmit={submitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-20 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2">
        <p className="prata-regular text-3xl">
          {step === 1 ? "Forgot Password" : "Verify OTP"}
        </p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* EMAIL */}
      {step === 1 && (
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-3 py-2 border border-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      )}

      {/* OTP */}
      {step === 2 && (
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full px-3 py-2 border border-gray-800"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
      )}

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {step === 1 ? "Send OTP" : "Verify OTP"}
      </button>

      <p
        className="text-sm cursor-pointer mt-2"
        onClick={() => navigate("/login")}
      >
        Back to Login
      </p>
    </form>
  );
};

export default ForgotPassword;
