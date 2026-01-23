import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {

    const { token, backendUrl, navigate } = useContext(ShopContext);

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        image: '',
        address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            zipcode: '',
            country: ''
        }
    });

    const [isEdit, setIsEdit] = useState(false);
    const [image, setImage] = useState(false);

    const loadUserProfile = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/profile', { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setUserData(prev => ({ 
                    ...prev, 
                    ...data.userData,
                    address: { ...prev.address, ...(data.userData.address || {}) } 
                }));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const updateUserProfileData = async () => {
        try {
            if (!userData.name || !userData.phone) {
                toast.error("Name and Phone are required");
                return;
            }

            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('phone', userData.phone);
            formData.append('address', JSON.stringify(userData.address));
            
            image && formData.append('image', image);

            const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { Authorization: `Bearer ${token}` } });

            if (data.success) {
                toast.success(data.message);
                await loadUserProfile();
                setIsEdit(false);
                setImage(false);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (!token) {
            navigate('/login')
        } else {
            loadUserProfile()
        }
    }, [token, navigate, backendUrl])

    return userData && (
        <div className='flex flex-col items-center w-full gap-8 text-zinc-900 pt-10 pb-20'>
            
            <div className='flex flex-col items-center gap-4 bg-white p-8 rounded-lg shadow-md w-full max-w-2xl border border-gray-100'>
                <h1 className='text-3xl font-semibold text-center mb-4'>My Profile</h1>
                
                {isEdit 
                ? <label htmlFor="image" className='relative cursor-pointer group'>
                    <img className='w-32 h-32 rounded-full object-cover opacity-80 group-hover:opacity-60 transition-opacity' src={image ? URL.createObjectURL(image) : userData.image ? userData.image : assets.profile_icon} alt="" />
                    <div className='absolute inset-0 flex items-center justify-center'>
                         <img className='w-10 h-10 bg-white/50 p-2 rounded-full' src={assets.upload_icon || assets.cross_icon} alt="Upload" /> 
                    </div>
                    <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="image" hidden />
                </label>
                : <img className='w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm' src={userData.image ? userData.image : assets.profile_icon} alt="" />
                }

                {isEdit 
                ? <input className='bg-gray-50 text-2xl font-medium text-center border-b-2 border-gray-300 focus:border-primary outline-none py-1 px-2 w-2/3' type="text" value={userData.name} onChange={e => setUserData(prev => ({...prev, name: e.target.value}))} />
                : <p className='font-medium text-2xl text-neutral-800'>{userData.name}</p>
                }

                <hr className='bg-zinc-200 h-[1px] w-full border-none my-2' />
                
                <div className='w-full grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 text-sm text-neutral-700'>
                    
                    {/* Contact Info */}
                    <div className='flex flex-col gap-1'>
                         <h3 className='text-lg font-medium text-gray-900 mb-2'>Contact Information</h3>
                    </div>
                     <div className='flex flex-col gap-4'>
                        <div className='grid grid-cols-[100px_1fr] items-center gap-2'>
                            <p className='font-medium text-gray-600'>Email:</p>
                            <p className='text-blue-500 truncate'>{userData.email}</p>
                        </div>
                        <div className='grid grid-cols-[100px_1fr] items-center gap-2'>
                            <p className='font-medium text-gray-600'>Phone:</p>
                            {isEdit 
                            ? <input className='bg-gray-50 border border-gray-300 rounded px-2 py-1 w-full max-w-xs focus:outline-none focus:border-primary' type="text" value={userData.phone} onChange={e => setUserData(prev => ({...prev, phone: e.target.value}))} />
                            : <p className='text-blue-400'>{userData.phone || "Not provided"}</p>
                            }
                        </div>
                     </div>

                    {/* Address Info */}
                    <div className='flex flex-col gap-1 md:mt-4'>
                         <h3 className='text-lg font-medium text-gray-900 mb-2'>Address</h3>
                    </div>
                    <div className='flex flex-col gap-2 md:mt-4'>
                         {isEdit
                        ? <div className='grid grid-cols-1 gap-3 w-full'>
                            <input className='bg-gray-50 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-primary' onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={userData.address.line1} type="text" placeholder='Address Line 1' />
                            <input className='bg-gray-50 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-primary' onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={userData.address.line2} type="text" placeholder='Address Line 2' />
                            <div className='grid grid-cols-2 gap-3'>
                                <input className='bg-gray-50 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-primary' onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))} value={userData.address.city} type="text" placeholder='City' />
                                <input className='bg-gray-50 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-primary' onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))} value={userData.address.state} type="text" placeholder='State' />
                            </div>
                            <div className='grid grid-cols-2 gap-3'>
                                <input className='bg-gray-50 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-primary' onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, zipcode: e.target.value } }))} value={userData.address.zipcode} type="text" placeholder='Zipcode' />
                                <input className='bg-gray-50 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:border-primary' onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, country: e.target.value } }))} value={userData.address.country} type="text" placeholder='Country' />
                            </div>
                        </div>
                        : <div className='text-gray-500 leading-relaxed'>
                            <p>{userData.address.line1 || "No address added"}</p>
                            {userData.address.line2 && <p>{userData.address.line2}</p>}
                            <p>
                                {userData.address.city && `${userData.address.city}, `}
                                {userData.address.state && `${userData.address.state}, `}
                                {userData.address.country && `${userData.address.country}`}
                                {userData.address.zipcode && ` - ${userData.address.zipcode}`}
                            </p>
                        </div>
                        }
                    </div>
                </div>
                
                <div className='mt-8 w-full flex justify-center'>
                    {isEdit
                    ? <button className='bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all font-medium min-w-[150px]' onClick={updateUserProfileData}>Save Information</button>
                    : <button className='border border-black px-8 py-3 rounded-full hover:bg-black hover:text-white transition-all font-medium min-w-[150px]' onClick={()=>setIsEdit(true)}>Edit Profile</button>
                    }
                </div>
            </div>
        </div>
    )
}

export default Profile
