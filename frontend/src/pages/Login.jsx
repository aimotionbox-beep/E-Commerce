import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
   
  const { token, setToken, navigate, backendUrl } =
    useContext(ShopContext);

  const [currentState, setCurrentState] = useState("Login"); 
  // Login | Sign Up | Verify OTP

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");


  /* ================= SUBMIT HANDLER ================= */
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      /* -------- LOGIN -------- */
      if (currentState === "Login") {
        const res = await axios.post(
          backendUrl + "/api/user/login",
          { email, password }
        );

        if (res.data.success) {
          setToken(res.data.token);
          localStorage.setItem("token", res.data.token);
          toast.success("Login successful");
        } else {
          toast.error(res.data.message);
        }
      }

      /* -------- SIGNUP -------- */
      if (currentState === "Sign Up") {
        const res = await axios.post(
          backendUrl + "/api/user/signup",
          { name, email, password }
        );

        if (res.data.success) {
          toast.success("OTP sent to email");
          setCurrentState("Verify OTP");
        } else {
          toast.error(res.data.message);
        }
      }

      /* -------- VERIFY OTP -------- */
      if (currentState === "Verify OTP") {
        const res = await axios.post(
          backendUrl + "/api/user/verify-signup-otp",
          { email, otp }
        );

        if (res.data.success) {
          setToken(res.data.token);
          localStorage.setItem("token", res.data.token);
          toast.success("Account verified");
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
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {/* NAME */}
      {currentState === "Sign Up" && (
        <input
          type="text"
          placeholder="Name"
          className="w-full px-3 py-2 border border-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}

      {/* EMAIL */}
      {(currentState === "Login" || currentState === "Sign Up") && (
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border border-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      )}

      {/* PASSWORD */}
      {(currentState === "Login" || currentState === "Sign Up") && (
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border border-gray-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      )}

      {/* OTP */}
      {currentState === "Verify OTP" && (
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full px-3 py-2 border border-gray-800"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
      )}

      {/* SWITCH LINKS */}
      {currentState !== "Verify OTP" && (
        <div className="w-full flex justify-between text-sm mt-[-8px]">
          <p   onClick={() => navigate("/forgot-password")} className="cursor-pointer">Forgot your password?</p>
          {currentState === "Login" ? (
            <p
              onClick={() => setCurrentState("Sign Up")}
              className="cursor-pointer"
            >
              Create account
            </p>
          ) : (
            <p
              onClick={() => setCurrentState("Login")}
              className="cursor-pointer"
            >
              Login here
            </p>
          )}
        </div>
      )}

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login"
          ? "Sign In"
          : currentState === "Sign Up"
          ? "Sign Up"
          : "Verify OTP"}
      </button>
    </form>
  );
};

export default Login;
