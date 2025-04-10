import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "@/context/auth-provider";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, CheckCircle2, Trash2 } from "lucide-react";

const PaymentPage = () => {
    const [paymentState, setPaymentState] = useState("form");
    const [paymentData, setPaymentData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState("card");
    const [cardNumber, setCardNumber] = useState("");
    const [cardholderName, setCardholderName] = useState("");
    const [expiryMonth, setExpiryMonth] = useState("01");
    const [expiryYear, setExpiryYear] = useState(
        new Date().getFullYear().toString(),
    );
    const [cvv, setCvv] = useState("");
    const [saveCard, setSaveCard] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const [savedCards, setSavedCards] = useState([]);
    const [selectedSavedCard, setSelectedSavedCard] = useState(null);
    const [useSavedCard, setUseSavedCard] = useState(false);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { toast } = useToast();
    const location = useLocation();

    useEffect(() => {
        if (user.isAuthenticated) {
            const saved = JSON.parse(
                localStorage.getItem(`payment_methods_${user.id}`) || "[]",
            );
            setSavedCards(saved);

            if (saved.length > 0) {
                setSelectedSavedCard(saved[0].id);
                setUseSavedCard(true);
            }
        }
    }, [user.id, user.isAuthenticated]);

    useEffect(() => {
        const { paymentSession } = location.state || {};

        if (!paymentSession) {
            toast({
                title: "Error",
                description: "No payment information found",
                variant: "destructive",
            });
            navigate("/cart");
            return;
        }

        setPaymentData(paymentSession);
    }, [location.state, navigate, toast]);

    const validateForm = () => {
        const errors = {};

        if (paymentMethod === "card" && !useSavedCard) {
            if (!cardNumber) {
                errors.cardNumber = "Card number is required";
            } else if (!/^\d{16}$/.test(cardNumber)) {
                errors.cardNumber = "Card number must be 16 digits";
            }

            if (!cardholderName) {
                errors.cardholderName = "Cardholder name is required";
            } else if (cardholderName.length < 2) {
                errors.cardholderName =
                    "Cardholder name must be at least 2 characters";
            }
        }

        if (!cvv) {
            errors.cvv = "CVV is required";
        } else if (!/^\d{3,4}$/.test(cvv)) {
            errors.cvv = "CVV must be 3-4 digits";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const generateCardId = () => {
        return (
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)
        );
    };

    const saveCardToLocalStorage = () => {
        if (saveCard && cardNumber && cardholderName) {
            const newCard = {
                id: generateCardId(),
                cardNumber: cardNumber,
                lastFourDigits: cardNumber.slice(-4),
                cardholderName: cardholderName,
                expiryMonth: expiryMonth,
                expiryYear: expiryYear,
                timestamp: new Date().toISOString(),
            };

            const updatedCards = [...savedCards, newCard];
            localStorage.setItem(
                `payment_methods_${user.id}`,
                JSON.stringify(updatedCards),
            );
            setSavedCards(updatedCards);

            toast({
                title: "Card saved",
                description:
                    "Your payment method has been saved for future use.",
            });
        }
    };

    const deleteSavedCard = (cardId) => {
        const updatedCards = savedCards.filter((card) => card.id !== cardId);
        localStorage.setItem(
            `payment_methods_${user.id}`,
            JSON.stringify(updatedCards),
        );
        setSavedCards(updatedCards);

        if (selectedSavedCard === cardId) {
            setSelectedSavedCard(
                updatedCards.length > 0 ? updatedCards[0].id : null,
            );
            setUseSavedCard(updatedCards.length > 0);
        }

        toast({
            title: "Card removed",
            description: "Your saved payment method has been deleted.",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!paymentData) {
            toast({
                title: "Error",
                description: "No payment information found",
                variant: "destructive",
            });
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);
        setPaymentState("processing");

        try {
            if (!useSavedCard && saveCard) {
                saveCardToLocalStorage();
            }

            await new Promise((resolve) => setTimeout(resolve, 2000));

            const endpoint = paymentData.courses
                ? `${process.env.SERVER_URL}/payment/bulk/complete`
                : `${process.env.SERVER_URL}/payment/complete`;

            const response = await axios.post(
                endpoint,
                {
                    transactionId: paymentData.id,
                    paymentMethod: paymentMethod,
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    validateStatus: false,
                },
            );

            if (response.data.success) {
                setPaymentState("success");
                toast({
                    title: "Payment successful",
                    description:
                        "Your course(s) have been added to your library",
                });
            } else {
                throw new Error(response.data.message || "Payment failed");
            }
        } catch (error) {
            setPaymentState("error");
            toast({
                title: "Payment failed",
                description:
                    error.message || "An error occurred during payment",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSavedCardSelect = (cardId) => {
        setSelectedSavedCard(cardId);
        setCvv("");
    };

    const formatCardNumber = (cardNumber) => {
        return `•••• •••• •••• ${cardNumber.slice(-4)}`;
    };

    if (!paymentData) {
        return <div className="container mx-auto py-10">Loading...</div>;
    }

    const isBulkPayment = Array.isArray(paymentData.courses);

    return (
        <div className="container mx-auto py-10">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate("/cart")}
                disabled={isProcessing || paymentState === "success"}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    {paymentState === "form" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                                <CardDescription>
                                    Complete your purchase securely
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {savedCards.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="useSavedCard"
                                                    checked={useSavedCard}
                                                    onCheckedChange={
                                                        setUseSavedCard
                                                    }
                                                />
                                                <Label htmlFor="useSavedCard">
                                                    Use a saved payment method
                                                </Label>
                                            </div>

                                            {useSavedCard && (
                                                <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                                                    <Label>Select a card</Label>
                                                    <RadioGroup
                                                        value={
                                                            selectedSavedCard
                                                        }
                                                        onValueChange={
                                                            handleSavedCardSelect
                                                        }
                                                        className="space-y-3"
                                                    >
                                                        {savedCards.map(
                                                            (card) => (
                                                                <div
                                                                    key={
                                                                        card.id
                                                                    }
                                                                    className="flex items-center justify-between border rounded-md p-3"
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        <RadioGroupItem
                                                                            value={
                                                                                card.id
                                                                            }
                                                                            id={`card-${card.id}`}
                                                                        />
                                                                        <Label
                                                                            htmlFor={`card-${card.id}`}
                                                                            className="cursor-pointer flex-1"
                                                                        >
                                                                            <div className="font-medium">
                                                                                {formatCardNumber(
                                                                                    card.cardNumber,
                                                                                )}
                                                                            </div>
                                                                            <div className="text-sm text-muted-foreground">
                                                                                {
                                                                                    card.cardholderName
                                                                                }{" "}
                                                                                •
                                                                                Expires{" "}
                                                                                {
                                                                                    card.expiryMonth
                                                                                }

                                                                                /
                                                                                {card.expiryYear.slice(
                                                                                    -2,
                                                                                )}
                                                                            </div>
                                                                        </Label>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            deleteSavedCard(
                                                                                card.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ),
                                                        )}
                                                    </RadioGroup>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="savedCardCvv">
                                                            CVV
                                                        </Label>
                                                        <Input
                                                            id="savedCardCvv"
                                                            placeholder="123"
                                                            value={cvv}
                                                            onChange={(e) =>
                                                                setCvv(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            maxLength={4}
                                                            type="password"
                                                        />
                                                        {formErrors.cvv && (
                                                            <p className="text-sm font-medium text-destructive">
                                                                {formErrors.cvv}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {(!useSavedCard ||
                                        savedCards.length === 0) && (
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <Label>Payment Method</Label>
                                                <RadioGroup
                                                    value={paymentMethod}
                                                    onValueChange={
                                                        setPaymentMethod
                                                    }
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <div className="flex items-center space-x-3 space-y-0">
                                                        <RadioGroupItem
                                                            value="card"
                                                            id="card"
                                                        />
                                                        <Label
                                                            htmlFor="card"
                                                            className="font-normal"
                                                        >
                                                            Credit/Debit Card
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-3 space-y-0">
                                                        <RadioGroupItem
                                                            value="upi"
                                                            id="upi"
                                                        />
                                                        <Label
                                                            htmlFor="upi"
                                                            className="font-normal"
                                                        >
                                                            UPI
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>

                                            {paymentMethod === "card" && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cardNumber">
                                                            Card Number
                                                        </Label>
                                                        <Input
                                                            id="cardNumber"
                                                            placeholder="1234 5678 9012 3456"
                                                            value={cardNumber}
                                                            onChange={(e) =>
                                                                setCardNumber(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            maxLength={16}
                                                        />
                                                        {formErrors.cardNumber && (
                                                            <p className="text-sm font-medium text-destructive">
                                                                {
                                                                    formErrors.cardNumber
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="cardholderName">
                                                            Cardholder Name
                                                        </Label>
                                                        <Input
                                                            id="cardholderName"
                                                            placeholder="John Doe"
                                                            value={
                                                                cardholderName
                                                            }
                                                            onChange={(e) =>
                                                                setCardholderName(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        {formErrors.cardholderName && (
                                                            <p className="text-sm font-medium text-destructive">
                                                                {
                                                                    formErrors.cardholderName
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="expiryMonth">
                                                                Expiry Month
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    expiryMonth
                                                                }
                                                                onValueChange={
                                                                    setExpiryMonth
                                                                }
                                                            >
                                                                <SelectTrigger id="expiryMonth">
                                                                    <SelectValue placeholder="Month" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Array.from(
                                                                        {
                                                                            length: 12,
                                                                        },
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) => {
                                                                            const month =
                                                                                i +
                                                                                1;
                                                                            const value =
                                                                                month
                                                                                    .toString()
                                                                                    .padStart(
                                                                                        2,
                                                                                        "0",
                                                                                    );
                                                                            return (
                                                                                <SelectItem
                                                                                    key={
                                                                                        value
                                                                                    }
                                                                                    value={
                                                                                        value
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        value
                                                                                    }
                                                                                </SelectItem>
                                                                            );
                                                                        },
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="expiryYear">
                                                                Expiry Year
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    expiryYear
                                                                }
                                                                onValueChange={
                                                                    setExpiryYear
                                                                }
                                                            >
                                                                <SelectTrigger id="expiryYear">
                                                                    <SelectValue placeholder="Year" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Array.from(
                                                                        {
                                                                            length: 10,
                                                                        },
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) => {
                                                                            const year =
                                                                                new Date().getFullYear() +
                                                                                i;
                                                                            return (
                                                                                <SelectItem
                                                                                    key={
                                                                                        year
                                                                                    }
                                                                                    value={year.toString()}
                                                                                >
                                                                                    {
                                                                                        year
                                                                                    }
                                                                                </SelectItem>
                                                                            );
                                                                        },
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="cvv">
                                                                CVV
                                                            </Label>
                                                            <Input
                                                                id="cvv"
                                                                placeholder="123"
                                                                value={cvv}
                                                                onChange={(e) =>
                                                                    setCvv(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                maxLength={4}
                                                                type="password"
                                                            />
                                                            {formErrors.cvv && (
                                                                <p className="text-sm font-medium text-destructive">
                                                                    {
                                                                        formErrors.cvv
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                                                        <Checkbox
                                                            id="saveCard"
                                                            checked={saveCard}
                                                            onCheckedChange={
                                                                setSaveCard
                                                            }
                                                        />
                                                        <div className="space-y-1 leading-none">
                                                            <Label htmlFor="saveCard">
                                                                Save card for
                                                                future
                                                            </Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Your payment
                                                                information will
                                                                be stored
                                                                securely
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {paymentMethod === "upi" && (
                                                <div className="text-center p-6">
                                                    <p className="text-sm text-muted-foreground mb-4">
                                                        For demo purposes, UPI
                                                        payments will be
                                                        auto-completed. In a
                                                        real application, this
                                                        would show a QR code or
                                                        UPI ID input.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isProcessing}
                                    >
                                        Pay ₹{paymentData.amount}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {paymentState === "processing" && (
                        <Card className="text-center p-10">
                            <CardHeader>
                                <CardTitle>Processing Payment</CardTitle>
                                <CardDescription>
                                    Please wait while we process your payment...
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                            </CardContent>
                            <CardFooter className="flex justify-center text-sm text-muted-foreground">
                                This usually takes just a few seconds
                            </CardFooter>
                        </Card>
                    )}

                    {paymentState === "success" && (
                        <Card className="text-center p-10">
                            <CardHeader>
                                <div className="flex justify-center">
                                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-2" />
                                </div>
                                <CardTitle>Payment Successful!</CardTitle>
                                <CardDescription>
                                    Thank you for your purchase. Your course
                                    {isBulkPayment ? "s" : ""}{" "}
                                    {isBulkPayment ? "have" : "has"} been added
                                    to your library.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-6">
                                <p>
                                    <strong>Transaction ID:</strong>{" "}
                                    {paymentData.id}
                                </p>
                                <p>
                                    <strong>Amount Paid:</strong> ₹
                                    {paymentData.amount}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-center gap-4">
                                <Button onClick={() => navigate("/my-courses")}>
                                    Go to My Courses
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/")}
                                >
                                    Continue Shopping
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {paymentState === "error" && (
                        <Card className="text-center p-10">
                            <CardHeader>
                                <CardTitle>Payment Failed</CardTitle>
                                <CardDescription>
                                    There was an issue processing your payment.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Please try again or use a different payment
                                    method.
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-center">
                                <Button
                                    onClick={() => setPaymentState("form")}
                                    className="mr-2"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/cart")}
                                >
                                    Back to Cart
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isBulkPayment ? (
                                <>
                                    <div className="space-y-3">
                                        {paymentData.courses.map((course) => (
                                            <div
                                                key={course.id}
                                                className="flex justify-between items-center"
                                            >
                                                <div className="text-sm">
                                                    {course.title}
                                                </div>
                                                <div>₹{course.price}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="flex justify-between font-medium">
                                        <div>Total</div>
                                        <div>₹{paymentData.amount}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <span className="font-medium">
                                            {paymentData.courseName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <div>Total</div>
                                        <div>₹{paymentData.amount}</div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 mx-auto">
                                <CreditCard className="h-4 w-4" />
                                <span>Secure payment by MockPay</span>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
