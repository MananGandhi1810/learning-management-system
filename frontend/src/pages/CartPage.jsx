import AuthContext from "@/context/auth-provider";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { toast } = useToast();

    const loadCart = async () => {
        const cart = await axios
            .get(`${process.env.SERVER_URL}/cart`, {
                validateStatus: false,
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            })
            .then((res) => res.data);
        setCart(cart.data.cart);
    };

    const removeFromCart = async (id) => {
        await axios.delete(`${process.env.SERVER_URL}/cart/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
            validateStatus: false,
        });
        loadCart();
    };

    const checkout = async () => {
        if (cart.length === 0) return;

        setIsProcessing(true);
        try {
            // Initialize a bulk payment for all cart items
            const response = await axios.post(
                `${process.env.SERVER_URL}/payment/bulk/initiate`,
                { cartItems: cart.map((item) => item.id) },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    validateStatus: false,
                },
            );

            if (response.data.success) {
                // Navigate to payment page with the payment session
                navigate("/payment", {
                    state: {
                        paymentSession: response.data.data.paymentSession,
                    },
                });
            } else {
                toast({
                    title: "Checkout failed",
                    description:
                        response.data.message || "Failed to initiate payment",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Checkout failed",
                description: "There was an error processing your purchase",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => loadCart, []);

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Your Cart</h1>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between border rounded-md p-4 mb-3 hover:border-gray-300 hover:cursor-pointer"
                            >
                                <Link
                                    to={`/course/${item.slug}`}
                                    className="flex-1"
                                >
                                    <div className="flex flex-row gap-2">
                                        <img
                                            src={item.thumbnailPath}
                                            className="max-w-20 aspect-video w-min"
                                            alt=""
                                        />
                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                {item.title}
                                            </h2>
                                            <p className="text-gray-500">
                                                Price: ₹{item.price}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                                <div>
                                    <button
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() => {
                                            removeFromCart(item.id);
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className="border rounded-md p-4">
                            <h2 className="text-xl font-semibold mb-3">
                                Order Summary
                            </h2>
                            <p className="text-gray-500 mb-2">
                                Subtotal: ₹
                                {cart.reduce(
                                    (total, item) => total + item.price,
                                    0,
                                )}
                            </p>
                            <h3 className="text-lg font-semibold">
                                Total: ₹
                                {cart.reduce(
                                    (total, item) => total + item.price,
                                    0,
                                )}
                            </h3>
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full disabled:opacity-50"
                                onClick={checkout}
                                disabled={isProcessing || cart.length === 0}
                            >
                                {isProcessing ? "Processing..." : "Checkout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
