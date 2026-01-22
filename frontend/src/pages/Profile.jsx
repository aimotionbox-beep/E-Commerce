import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const Profile = () => {
  const { backendUrl, token, navigate } = useContext(ShopContext);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          backendUrl + "/api/user/profile/get-profile",
        );

        if (res.data.success) {
          setEmail(res.data.user.email);
          setPhone(res.data.user.phone || "Not added");
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-gray-300">
      <h2 className="text-2xl font-semibold mb-6 text-center">My Profile</h2>

      <div className="mb-4">
        <p className="text-gray-600 text-sm">Email</p>
        <p className="font-medium">{email}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm">Phone Number</p>
        <p className="font-medium">{phone}</p>
      </div>

      <button
        onClick={() => navigate("/")}
        className="w-full bg-black text-white py-2 mt-4"
      >
        Go Home
      </button>
    </div>
  );
};

export default Profile;
