import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

// Get complete user profile with statistics
const getUserProfileData = async (req, res) => {
    try {
        const { userId } = req.body;

        // Fetch user data without password
        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Fetch all orders for the user
        const orders = await orderModel.find({ userId }).sort({ date: -1 });

        // Calculate statistics
        const totalOrders = orders.length;
        
        // Get recent orders (last 3)
        const recentOrders = orders.slice(0, 3).map(order => ({
            id: order._id,
            date: new Date(order.date).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            status: order.status || 'Processing',
            amount: `₹${order.amount}`,
            items: order.items,
            address: order.address,
            paymentMethod: order.paymentMethod,
            payment: order.payment
        }));

        // Get default/first address from user's orders
        let defaultAddress = null;
        if (orders.length > 0 && orders[0].address) {
            const addr = orders[0].address;
            defaultAddress = {
                name: user.name,
                street: `${addr.street || ''}`,
                city: `${addr.city || ''}, ${addr.state || ''} - ${addr.zipcode || ''}`,
                phone: addr.phone || user.phone || ''
            };
        }

        // Count unique addresses
        const uniqueAddresses = new Set();
        orders.forEach(order => {
            if (order.address) {
                const addrKey = `${order.address.street}-${order.address.zipcode}`;
                uniqueAddresses.add(addrKey);
            }
        });

        // Calculate wishlist items (assuming cartData contains wishlist)
        const wishlistItems = user.cartData ? Object.keys(user.cartData).length : 0;

        // Profile data
        const profileData = {
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
                dateJoined: new Date(user.createdAt || user._id.getTimestamp()).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                })
            },
            statistics: {
                totalOrders: totalOrders,
                wishlistItems: wishlistItems,
                savedAddresses: uniqueAddresses.size,
                rewardPoints: totalOrders * 50 // Example: 50 points per order
            },
            recentOrders: recentOrders,
            defaultAddress: defaultAddress
        };

        res.json({ success: true, data: profileData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get user's basic profile info
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { userId, name, phone } = req.body;

        // Validate inputs
        if (!name || name.trim() === '') {
            return res.json({ success: false, message: "Name is required" });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { name, phone },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Profile updated successfully", user: updatedUser });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getUserProfile, getUserProfileData, updateUserProfile };