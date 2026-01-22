import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const savedCart = localStorage.getItem("guestCart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes (for non-logged-in users)
  useEffect(() => {
    if (!token && Object.keys(cartItems).length > 0) {
      localStorage.setItem("guestCart", JSON.stringify(cartItems));
    }
    
    // Clear guest cart when user logs in (to avoid conflicts with server cart)
    if (token) {
      localStorage.removeItem("guestCart");
    }
  }, [cartItems, token]);

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    // Save to localStorage for guests
    if (!token) {
      localStorage.setItem("guestCart", JSON.stringify(cartData));
    }

    // Save to server for logged-in users
    if (token) {
      try {
        await api.post("/api/cart/add", { itemId, size });
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.error("Error counting cart item:", error);
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    if (cartData[itemId] && cartData[itemId][size]) {
      cartData[itemId][size] = quantity;
    }

    setCartItems(cartData);

    // Save to localStorage for guests
    if (!token) {
      localStorage.setItem("guestCart", JSON.stringify(cartData));
    }

    if (token) {
      try {
        await api.post("/api/cart/update", { itemId, size, quantity });
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0 && itemInfo) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.error("Error calculating cart amount:", error);
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserCart = async () => {
    try {
      const response = await api.get("/api/cart/get");

      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load cart");
    }
  };

  // Merge guest cart with server cart when user logs in
  const mergeGuestCartWithServer = async () => {
    const guestCart = localStorage.getItem("guestCart");
    if (!guestCart) return;

    try {
      const guestCartData = JSON.parse(guestCart);
      
      // Send each item from guest cart to server
      for (const itemId in guestCartData) {
        for (const size in guestCartData[itemId]) {
          const quantity = guestCartData[itemId][size];
          if (quantity > 0) {
            try {
              await api.post("/api/cart/add", { 
                itemId, 
                size, 
                quantity 
              });
            } catch (error) {
              console.error("Error merging cart item:", error);
            }
          }
        }
      }
      
      // Clear guest cart after successful merge
      localStorage.removeItem("guestCart");
      // Refresh server cart
      await getUserCart();
      
      toast.success("Cart items merged successfully!");
      
    } catch (error) {
      console.error("Error merging carts:", error);
    }
  };

  // Handle user login
  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    
    // Merge guest cart if exists
    const guestCart = localStorage.getItem("guestCart");
    if (guestCart) {
      mergeGuestCartWithServer();
    } else {
      getUserCart(); // Just fetch server cart
    }
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    
    // Load guest cart if exists
    const guestCart = localStorage.getItem("guestCart");
    if (guestCart) {
      try {
        setCartItems(JSON.parse(guestCart));
      } catch (error) {
        console.error("Error loading guest cart on logout:", error);
      }
    } else {
      setCartItems({});
    }
    
    navigate("/");
    toast.success("Logged out successfully!");
  };

  // Clear cart (both local and server)
  const clearCart = async () => {
    setCartItems({});
    localStorage.removeItem("guestCart");
    
    if (token) {
      try {
        await api.delete("/api/cart/clear");
        toast.success("Cart cleared successfully!");
      } catch (error) {
        console.error("Error clearing server cart:", error);
        toast.error("Failed to clear cart");
      }
    } else {
      toast.success("Cart cleared successfully!");
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId, size) => {
    let cartData = structuredClone(cartItems);
    
    if (cartData[itemId] && cartData[itemId][size]) {
      delete cartData[itemId][size];
      
      // Remove the item object if it has no more sizes
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    }
    
    setCartItems(cartData);
    
    // Save to localStorage for guests
    if (!token) {
      if (Object.keys(cartData).length > 0) {
        localStorage.setItem("guestCart", JSON.stringify(cartData));
      } else {
        localStorage.removeItem("guestCart");
      }
    }
    
    // Remove from server for logged-in users
    if (token) {
      try {
        await api.post("/api/cart/remove", { itemId, size });
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  // Load token and cart on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const guestCart = localStorage.getItem("guestCart");

    if (savedToken) {
      setToken(savedToken);
      // Server cart will be fetched by the token useEffect below
    } else if (guestCart) {
      try {
        setCartItems(JSON.parse(guestCart));
      } catch (error) {
        console.error("Error parsing guest cart:", error);
      }
    }
  }, []); // Run once on mount

  // Refetch cart when token changes (for login/logout scenarios)
  useEffect(() => {
    if (token) {
      getUserCart();
    } else {
      // When logging out, try to load guest cart
      const guestCart = localStorage.getItem("guestCart");
      if (guestCart) {
        try {
          setCartItems(JSON.parse(guestCart));
        } catch (error) {
          console.error("Error parsing guest cart:", error);
        }
      } else {
        setCartItems({});
      }
    }
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    token,
    handleLogin,
    handleLogout,
    clearCart,
    removeFromCart,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;