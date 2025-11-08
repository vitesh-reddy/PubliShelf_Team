//client/src/pages/buyer/checkout/Checkout.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { placeOrder, getBuyerAddresses, addBuyerAddress, updateBuyerAddress, deleteBuyerAddress } from "../../../services/buyer.services.js";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../../../store/hooks';
import { clearCart } from "../../../store/slices/cartSlice.js";
import { useDispatch } from "react-redux";

const Checkout = () => {
    const { items: cartItems } = useCart();
    const [selectedPayment, setSelectedPayment] = useState("cod");
    const [showCardForm, setShowCardForm] = useState(false);
    const [showUpiForm, setShowUpiForm] = useState(false);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [showEditAddressForm, setShowEditAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchAddresses = async () => {
            setLoadingAddresses(true);
            try {
                const res = await getBuyerAddresses();
                if (res.success) {
                    setAddresses(res.addresses);
                    if (res.addresses && res.addresses.length > 0)
                        setSelectedAddress(res.addresses[0]._id);
                }
            } catch (err) {}
            setLoadingAddresses(false);
        };
        fetchAddresses();
    }, []);
    const [savedCards, setSavedCards] = useState([]);
    const [savedUpiIds, setSavedUpiIds] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [newAddress, setNewAddress] = useState({ fullName: "", phoneNumber: "", address: "", city: "", state: "", postalCode: "" });
    const [cardDetails, setCardDetails] = useState({ cardNumber: "", expiryDate: "", cvv: "" });
    const [upiDetails, setUpiDetails] = useState({ upiId: "" });
    const [formErrors, setFormErrors] = useState({});
    const [cardErrors, setCardErrors] = useState({});
    const [upiErrors, setUpiErrors] = useState({});
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const navigate = useNavigate();

    const orderSummary = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.book?.price || 0) * item.quantity, 0);
        const shipping = subtotal > 35 ? 0 : 100;
        const tax = subtotal * 0.02;
        const total = subtotal + shipping + tax;
        return { subtotal, shipping, tax, total };
    }, [cartItems]);

    const validateAddress = () => {
        const errors = {};
        if (newAddress.fullName.trim().length < 3) errors.fullName = "Name must be at least 3 characters";
        if (!/^\+?[0-9]{10}$/.test(newAddress.phoneNumber)) errors.phoneNumber = "Phone number must be exactly 10 digits";
        if (newAddress.address.trim().length < 10) errors.address = "Address must be at least 10 characters";
        if (!/^[a-zA-Z\s]+$/.test(newAddress.city)) errors.city = "City must contain only letters and spaces";
        if (!/^[a-zA-Z\s]+$/.test(newAddress.state)) errors.state = "State must contain only letters and spaces";
        if (!/^[0-9]{6}$/.test(newAddress.postalCode)) errors.postalCode = "Postal code must be exactly 6 digits";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateCard = () => {
        const errors = {};
        if (!/^[0-9]{16}$/.test(cardDetails.cardNumber)) errors.cardNumber = "Card number must be exactly 16 digits";
        if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardDetails.expiryDate)) errors.expiryDate = "Expiry date must be in MM/YY format";
        if (!/^[0-9]{3}$/.test(cardDetails.cvv)) errors.cvv = "CVV must be exactly 3 digits";
        setCardErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateUpi = () => {
        const errors = {};
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiDetails.upiId)) errors.upiId = "Please enter a valid UPI ID (username@provider)";
        setUpiErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const addNewAddress = async (e) => {
        e.preventDefault();
        if (validateAddress()) {
            setIsSavingAddress(true);
            try {
                const payload = {
                    name: newAddress.fullName,
                    address: `${newAddress.address}, ${newAddress.city}, ${newAddress.state}, ${newAddress.postalCode}`,
                    phone: newAddress.phoneNumber
                };
                const res = await addBuyerAddress(payload);
                if (res.success) {
                    setAddresses([...addresses, res.address]);
                    setSelectedAddress(res.address._id);
                    setShowNewAddressForm(false);
                    setNewAddress({ fullName: "", phoneNumber: "", address: "", city: "", state: "", postalCode: "" });
                    setFormErrors({});
                }
            } catch (err) {}
            setIsSavingAddress(false);
        }
    };

    // Open edit address form
    const openEditAddressForm = (addr) => {
        const addressParts = addr.address.split(', ');
        const postalCode = addressParts.pop() || '';
        const state = addressParts.pop() || '';
        const city = addressParts.pop() || '';
        const addressLine = addressParts.join(', ') || '';
        
        setNewAddress({
            fullName: addr.name,
            phoneNumber: addr.phone,
            address: addressLine,
            city: city,
            state: state,
            postalCode: postalCode
        });
        setEditingAddressId(addr._id);
        setShowEditAddressForm(true);
        setShowNewAddressForm(false);
    };

    // Save edited address
    const saveEditedAddress = async (e) => {
        e.preventDefault();
        if (validateAddress()) {
            setIsSavingAddress(true);
            try {
                const payload = {
                    name: newAddress.fullName,
                    address: `${newAddress.address}, ${newAddress.city}, ${newAddress.state}, ${newAddress.postalCode}`,
                    phone: newAddress.phoneNumber
                };
                const res = await updateBuyerAddress(editingAddressId, payload);
                if (res.success) {
                    setAddresses(addresses.map(a => a._id === editingAddressId ? res.address : a));
                    setShowEditAddressForm(false);
                    setEditingAddressId(null);
                    setNewAddress({ fullName: "", phoneNumber: "", address: "", city: "", state: "", postalCode: "" });
                    setFormErrors({});
                }
            } catch (err) {}
            setIsSavingAddress(false);
        }
    };

    // Open delete confirmation dialog
    const openDeleteDialog = (_id) => {
        setAddressToDelete(_id);
        setShowDeleteDialog(true);
    };

    // Confirm delete address
    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;
        try {
            const res = await deleteBuyerAddress(addressToDelete);
            if (res.success) {
                setAddresses(addresses.filter(a => a._id !== addressToDelete));
                if (selectedAddress === addressToDelete && addresses.length > 1) {
                    setSelectedAddress(addresses[0]._id);
                }
            }
        } catch (err) {}
        setShowDeleteDialog(false);
        setAddressToDelete(null);
    };

    const handleSaveCard = (e) => {
        e.preventDefault();
        if (validateCard()) {
            const newCard = {
                id: `card${savedCards.length + 1}`,
                number: cardDetails.cardNumber,
                expiry: cardDetails.expiryDate
            };
            setSavedCards([newCard, ...savedCards]);
            setCardDetails({ cardNumber: "", expiryDate: "", cvv: "" });
            setCardErrors({});
            setShowCardForm(false);
            setSelectedPayment(newCard.id);
        }
    };

    const handleSaveUpi = (e) => {
        e.preventDefault();
        if (validateUpi()) {
            const newUpi = {
                id: `upi${savedUpiIds.length + 1}`,
                upiId: upiDetails.upiId
            };
            setSavedUpiIds([newUpi, ...savedUpiIds]);
            setUpiDetails({ upiId: "" });
            setUpiErrors({});
            setShowUpiForm(false);
            setSelectedPayment(newUpi.id);
        }
    };

    const togglePaymentForm = (type) => {
        if (type === "card") {
            setSelectedPayment("creditCard");
            setShowCardForm(!showCardForm);
            setShowUpiForm(false);
            if (showCardForm) {
                setCardDetails({ cardNumber: "", expiryDate: "", cvv: "" });
                setCardErrors({});
            }
        } else if (type === "upi") {
            setSelectedPayment("upi");
            setShowUpiForm(!showUpiForm);
            setShowCardForm(false);
            if (showUpiForm) {
                setUpiDetails({ upiId: "" });
                setUpiErrors({});
            }
        } else {
            setSelectedPayment("cod");
            setShowCardForm(false);
            setShowUpiForm(false);
        }
    };

    const handlePlaceOrder = async () => {        
        if (!selectedPayment) {
            toast.warning("Please select a payment method before placing your order.");
            return;
        }
        if (!selectedAddress) {
            toast.warning("Please select a shipping address before placing your order.");
            return;
        }
        if (orderSummary.subtotal <= 0) {
            toast.warning("Your cart is empty. Please add items before placing an order.");
            return;
        }
        // Map UI payment selection to backend enums
        let paymentMethod = "COD";
        if (selectedPayment === "cod") paymentMethod = "COD";
        else if (selectedPayment === "creditCard" || selectedPayment.startsWith("card")) paymentMethod = "CARD";
        else if (selectedPayment === "upi" || selectedPayment.startsWith("upi")) paymentMethod = "UPI";
        setPlacingOrder(true);
        try {
            const response = await placeOrder({ addressId: selectedAddress, paymentMethod });
            if (response.success) {
                toast.success("Order placed successfully!");
                dispatch(clearCart());
                navigate("/buyer/cart");
            } else {
                toast.error(response.message || "Failed to place order");
                // If cart items were removed (e.g., deleted books), sync with backend
                if (response.message?.includes("not available") || response.message?.includes("Cart is empty")) {
                    dispatch(clearCart());
                    navigate("/buyer/cart");
                }
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.message || "Error placing order";
            toast.error(errorMessage);
            // If error indicates cart sync issue, redirect to cart to refresh
            if (errorMessage.includes("not available") || errorMessage.includes("Cart is empty") || errorMessage.includes("Insufficient stock")) {
                dispatch(clearCart());
                navigate("/buyer/cart");
            }
        }
        setPlacingOrder(false);
    };
    if (loadingAddresses) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const inputStyle = "w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white transition-all duration-300 ease-in-out focus:border-purple-600 focus:outline-none focus:ring-3 focus:ring-purple-600/10";
    const errorInputStyle = "border-red-500";

    // Show message if cart is empty
    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col min-h-screen checkout-page">
                <Navbar />
                <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#f3e8ff] to-white pt-20">
                    <div className="text-center">
                        <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-4">Add items to your cart to proceed with checkout</p>
                        <button 
                            onClick={() => navigate("/buyer/dashboard")} 
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen checkout-page">
            <Navbar />

            <div className="bg-gradient-to-b from-[#f3e8ff] to-white pt-20">
                <div className="max-w-[800px] mx-auto p-5 md:p-5">
                    <h1 className="text-3xl font-bold text-gray-800 mb-5">Checkout</h1>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow-md p-5 mb-5 animate-fade-in md:p-5">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Address</h2>
                        <div className="flex flex-col gap-2.5" id="savedAddresses">
                            {addresses.map((addr) => (
                                <div key={addr._id} className={`flex items-center gap-2.5 p-2.5 border rounded-lg cursor-pointer transition-all duration-200 ${selectedAddress === addr._id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}> 
                                    <input
                                        type="radio"
                                        name="address"
                                        id={`address${addr._id}`}
                                        checked={selectedAddress === addr._id}
                                        onChange={() => setSelectedAddress(addr._id)}
                                        className="ml-2 mr-2.5 accent-purple-600 cursor-pointer"
                                    />
                                    <label htmlFor={`address${addr._id}`} className="w-full cursor-pointer">
                                        <strong className="text-gray-800">{addr.name}</strong><br />
                                        <span className="text-gray-600">{addr.address}</span><br />
                                        <span className="text-gray-600">Phone: {addr.phone}</span>
                                    </label>
                                    <div className="gap-1 ml-2">
                                        <button title="Edit" className="text-purple-600 hover:text-purple-800 px-2 py-1 rounded transition" onClick={() => openEditAddressForm(addr)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button title="Delete" className="text-red-500 hover:text-red-600 px-2 py-1 rounded transition" onClick={() => openDeleteDialog(addr._id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button className="p-2.5 bg-gray-100 border border-dashed border-gray-200 rounded-lg text-center cursor-pointer text-purple-600 font-medium hover:bg-gray-200 mt-2" onClick={() => setShowNewAddressForm(!showNewAddressForm)}>
                                + Add New Address
                            </button>
                        </div>

                        {showNewAddressForm && (
                            <div className="mt-5 bg-white rounded-lg shadow-md p-5 animate-[slideIn_0.5s_ease-out]" id="newAddressForm">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Address</h3>
                                <form id="addressForm" onSubmit={addNewAddress}>
                                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input type="text" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className={`${inputStyle} ${formErrors.fullName ? errorInputStyle : ''}`} required minLength="3" />
                                            <div className={`text-red-500 text-xs mt-1 ${formErrors.fullName ? 'block' : 'hidden'}`}>{formErrors.fullName}</div>
                                        </div>
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <input type="tel" value={newAddress.phoneNumber} onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })} className={`${inputStyle} ${formErrors.phoneNumber ? errorInputStyle : ''}`} required />
                                            <div className={`text-red-500 text-xs mt-1 ${formErrors.phoneNumber ? 'block' : 'hidden'}`}>{formErrors.phoneNumber}</div>
                                        </div>
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <textarea rows="3" value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} className={`${inputStyle} ${formErrors.address ? errorInputStyle : ''}`} required />
                                        <div className={`text-red-500 text-xs mt-1 ${formErrors.address ? 'block' : 'hidden'}`}>{formErrors.address}</div>
                                    </div>
                                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className={`${inputStyle} ${formErrors.city ? errorInputStyle : ''}`} required />
                                            <div className={`text-red-500 text-xs mt-1 ${formErrors.city ? 'block' : 'hidden'}`}>{formErrors.city}</div>
                                        </div>
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                            <input type="text" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className={`${inputStyle} ${formErrors.state ? errorInputStyle : ''}`} required />
                                            <div className={`text-red-500 text-xs mt-1 ${formErrors.state ? 'block' : 'hidden'}`}>{formErrors.state}</div>
                                        </div>
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                                            <input type="text" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} className={`${inputStyle} ${formErrors.postalCode ? errorInputStyle : ''}`} required />
                                            <div className={`text-red-500 text-xs mt-1 ${formErrors.postalCode ? 'block' : 'hidden'}`}>{formErrors.postalCode}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2.5 mt-4">
                                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg" onClick={() => setShowNewAddressForm(false)}>Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-purple-400" disabled={isSavingAddress}>{isSavingAddress ? "Saving..." : "Save Address"}</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {showEditAddressForm && (
                            <div className="mt-5 bg-white rounded-lg shadow-md p-5 animate-[slideIn_0.5s_ease-out]" id="editAddressForm">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Address</h3>
                                <form id="editAddressFormElement" onSubmit={saveEditedAddress}>
                                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input type="text" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className={`${inputStyle} ${formErrors.fullName ? errorInputStyle : ''}`} required minLength="3" />
                                            <div className={`text-red-500 text-xs mt-1 ${formErrors.fullName ? 'block' : 'hidden'}`}>{formErrors.fullName}</div>
                                        </div>
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <input type="tel" value={newAddress.phoneNumber} onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })} className={`${inputStyle} ${formErrors.phoneNumber ? errorInputStyle : ''}`} required />
                                            <div className={`text-red-500 text-xs mt-1 ${formErrors.phoneNumber ? 'block' : 'hidden'}`}>{formErrors.phoneNumber}</div>
                                        </div>
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <textarea rows="3" value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} className={`${inputStyle} ${formErrors.address ? errorInputStyle : ''}`} required />
                                        <div className={`text-red-500 text-xs mt-1 ${formErrors.address ? 'block' : 'hidden'}`}>{formErrors.address}</div>
                                    </div>
                                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className={`${inputStyle} ${formErrors.city ? errorInputStyle : ''}`} required />
                                            <div className={`text-red-500 text-xs mt-1 ${formErrors.city ? 'block' : 'hidden'}`}>{formErrors.city}</div>
                                        </div>
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                            <input type="text" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className={`${inputStyle} ${formErrors.state ? errorInputStyle : ''}`} required />
                                            <div className={`text-red-500 text-xs mt-1 ${formErrors.state ? 'block' : 'hidden'}`}>{formErrors.state}</div>
                                        </div>
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                                            <input type="text" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} className={`${inputStyle} ${formErrors.postalCode ? errorInputStyle : ''}`} required />
                                            <div className={`text-red-500 text-xs mt-1 ${formErrors.postalCode ? 'block' : 'hidden'}`}>{formErrors.postalCode}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2.5 mt-4">
                                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg" onClick={() => {
                                            setShowEditAddressForm(false);
                                            setEditingAddressId(null);
                                            setNewAddress({ fullName: "", phoneNumber: "", address: "", city: "", state: "", postalCode: "" });
                                            setFormErrors({});
                                        }}>Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-purple-400" disabled={isSavingAddress}>{isSavingAddress ? "Updating..." : "Update Address"}</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow-md p-5 mb-5 animate-fade-in-delay md:p-5">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Method</h2>
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2.5 p-2.5 border border-gray-200 rounded-lg cursor-pointer" onClick={() => togglePaymentForm("card")}>
                                <div className="flex items-center gap-2">
                                    <img src="https://logos-world.net/wp-content/uploads/2004/09/Visa-Logo-2014.png" alt="Visa" className="h-5" />
                                    <img src="https://logos-world.net/wp-content/uploads/2020/09/Mastercard-Logo.png" alt="MasterCard" className="h-5" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/RuPay-Logo.svg/2560px-RuPay-Logo.svg.png" alt="Rupay" className="h-5" />
                                    Credit/Debit Card
                                </div>
                            </div>
                            {showCardForm && (
                                <div className="mt-5 bg-white rounded-lg shadow-md p-5 animate-[slideIn_0.5s_ease-out]">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Enter Card Details</h3>
                                    <form onSubmit={handleSaveCard}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                                            <input type="text" value={cardDetails.cardNumber} onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })} className={`${inputStyle} ${cardErrors.cardNumber ? errorInputStyle : ''}`} required />
                                            <div className={`text-red-500 text-xs mt-1 ${cardErrors.cardNumber ? 'block' : 'hidden'}`}>{cardErrors.cardNumber}</div>
                                        </div>
                                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
                                                <input type="text" placeholder="MM/YY" value={cardDetails.expiryDate} onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })} className={`${inputStyle} ${cardErrors.expiryDate ? errorInputStyle : ''}`} required />
                                                <div className={`text-red-500 text-xs mt-1 ${cardErrors.expiryDate ? 'block' : 'hidden'}`}>{cardErrors.expiryDate}</div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                                                <input type="text" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} className={`${inputStyle} ${cardErrors.cvv ? errorInputStyle : ''}`} required />
                                                <div className={`text-red-500 text-xs mt-1 ${cardErrors.cvv ? 'block' : 'hidden'}`}>{cardErrors.cvv}</div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button type="submit" className="w-full p-3 bg-purple-600 text-white rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:bg-purple-700 hover:-translate-y-0.5">Save Card</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            {savedCards.map((card) => (
                                <div key={card.id} className="flex items-center gap-2.5 p-2.5 border border-gray-200 rounded-lg cursor-pointer bg-gray-50" onClick={() => setSelectedPayment(card.id)}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        id={card.id}
                                        checked={selectedPayment === card.id}
                                        onChange={() => setSelectedPayment(card.id)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={card.id} className="w-full cursor-pointer">
                                        <span className="font-semibold text-gray-800">
                                            Card ending in {card.number.slice(-4)}
                                        </span>
                                        <br />
                                        <span className="text-gray-500 text-sm">Expires: {card.expiry}</span>
                                    </label>
                                </div>
                            ))}                            
                            <div className="flex items-center gap-2.5 p-2.5 border border-gray-200 rounded-lg cursor-pointer" onClick={() => togglePaymentForm('upi')}>
                                <input type="radio" name="payment" id="upi" checked={selectedPayment === 'upi'} onChange={() => {}} className="hidden" />
                                <label htmlFor="upi" className="flex items-center gap-2 cursor-pointer">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-5" />
                                    UPI
                                </label>
                            </div>
                            {showUpiForm && (
                                <div className="mt-5 bg-white rounded-lg shadow-md p-5 animate-[slideIn_0.5s_ease-out]">
                                     <h3 className="text-xl font-bold text-gray-800 mb-4">Enter UPI ID</h3>
                                     <form onSubmit={handleSaveUpi}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                                            <input type="text" value={upiDetails.upiId} onChange={e => setUpiDetails({...upiDetails, upiId: e.target.value})} className={`${inputStyle} ${upiErrors.upiId ? errorInputStyle : ''}`} required />
                                            <div className={`text-red-500 text-xs mt-1 ${upiErrors.upiId ? 'block' : 'hidden'}`}>{upiErrors.upiId}</div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button type="submit" className="w-full p-3 bg-purple-600 text-white rounded-lg text-base font-medium transition-all duration-300 ease-in-out hover:bg-purple-700 hover:-translate-y-0.5">Save UPI</button>
                                        </div>
                                     </form>
                                </div>
                            )}
                             {savedUpiIds.map((upi) => (
                                <div key={upi.id} className="flex items-center gap-2.5 p-2.5 border border-gray-200 rounded-lg cursor-pointer bg-gray-50" onClick={() => setSelectedPayment(upi.id)}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        id={upi.id}
                                        checked={selectedPayment === upi.id}
                                        onChange={() => setSelectedPayment(upi.id)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={upi.id} className="w-full cursor-pointer">
                                        <span className="font-semibold text-gray-800">
                                            UPI ID: {upi.upiId}
                                        </span>
                                    </label>
                                </div>
                            ))}                            

                            <div className="flex items-center gap-2.5 p-2.5 border border-gray-200 rounded-lg cursor-pointer" onClick={() => togglePaymentForm('cod')}>
                                <input type="radio" name="payment" id="cod" checked={selectedPayment === 'cod'} onChange={() => {}} />
                                <label htmlFor="cod" className="flex items-center gap-2 cursor-pointer">
                                    <i className="fas fa-money-bill-wave"></i>
                                    Cash on Delivery
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow-md p-5 animate-fade-in-delay-2 md:p-5">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-3 text-sm text-gray-700">
                            <span>Subtotal</span>
                            <span>₹{orderSummary.subtotal}</span>
                        </div>
                        <div className="flex justify-between mb-3 text-sm text-gray-700">
                            <span>Shipping</span>
                            <span>₹{orderSummary.shipping}</span>
                        </div>
                        <div className="flex justify-between mb-3 text-sm text-gray-700">
                            <span>Tax</span>
                            <span>₹{orderSummary.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base text-gray-800 mb-3">
                            <span>Total</span>
                            <span>₹{orderSummary.total.toFixed(2)}</span>
                        </div>
                        <button disabled={placingOrder} onClick={handlePlaceOrder} className="w-full p-3 bg-purple-600 disabled:bg-purple-400 disabled:cursor-not-allowed text-white border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-300 ease-in-out hover:bg-purple-700 hover:-translate-y-0.5">
                            {placingOrder ? "Placing" : "Place"}  Your Order
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-5 w-full max-w-sm transform transition-all duration-200">
                        <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
                        <p className="text-gray-600 text-sm mt-2">
                            Are you sure you want to delete this address? This action cannot be undone.
                        </p>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowDeleteDialog(false);
                                    setAddressToDelete(null);
                                }}
                                className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteAddress}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Checkout;
