"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserCoupons, validateCoupon, Coupon } from "@/lib/api/coupons";
import { Tag, Check, X, Percent, IndianRupee, Calendar, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface CouponSelectorProps {
    userId: number;
    totalAmount: number;
    onCouponApplied: (coupon: Coupon, discountAmount: number, totalAfterDiscount: number) => void;
    onCouponRemoved: () => void;
}

export default function CouponSelector({
    userId,
    totalAmount,
    onCouponApplied,
    onCouponRemoved
}: CouponSelectorProps) {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showCoupons, setShowCoupons] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [discountInfo, setDiscountInfo] = useState<{
        amount: number;
        totalAfterDiscount: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Wrap fetchUserCoupons in useCallback
    const fetchUserCoupons = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const response = await getUserCoupons(userId);
            if (response.success) {
                setCoupons(response.data || []);
                if (response.data.length === 0) {
                    setFetchError("No coupons available");
                }
            } else {
                setFetchError(response.message || "Failed to load coupons");
                setCoupons([]);
            }
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
            setFetchError("Failed to load coupons");
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Fetch user coupons on mount
    useEffect(() => {
        if (userId && userId > 0) {
            fetchUserCoupons();
        }
    }, [userId, fetchUserCoupons]);

    // Handle coupon selection from list
    const handleSelectCoupon = async (coupon: Coupon) => {
        setApplying(true);
        setError(null);

        try {
            const result = await validateCoupon(coupon.code, userId, totalAmount);

            if (result.success && result.discount) {
                setAppliedCoupon(result.data!);
                setDiscountInfo({
                    amount: result.discount.amount,
                    totalAfterDiscount: result.discount.total_after_discount
                });
                setCouponCode(coupon.code);
                onCouponApplied(result.data!, result.discount.amount, result.discount.total_after_discount);
                toast.success(`Coupon applied! You saved ₹${result.discount.amount}`);
                setShowCoupons(false);
            } else {
                setError(result.message || "Failed to apply coupon");
                toast.error(result.message || "Failed to apply coupon");
            }
        } catch (error: any) {
            setError(error.message || "Failed to apply coupon");
            toast.error(error.message || "Failed to apply coupon");
        } finally {
            setApplying(false);
        }
    };

    // Handle manual coupon code entry
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setError("Please enter a coupon code");
            return;
        }

        setApplying(true);
        setError(null);

        try {
            const result = await validateCoupon(couponCode.trim(), userId, totalAmount);

            if (result.success && result.discount) {
                setAppliedCoupon(result.data!);
                setDiscountInfo({
                    amount: result.discount.amount,
                    totalAfterDiscount: result.discount.total_after_discount
                });
                onCouponApplied(result.data!, result.discount.amount, result.discount.total_after_discount);
                toast.success(`Coupon applied! You saved ₹${result.discount.amount}`);
                setCouponCode("");
            } else {
                setError(result.message || "Invalid coupon code");
                toast.error(result.message || "Invalid coupon code");
            }
        } catch (error: any) {
            setError(error.message || "Failed to apply coupon");
            toast.error(error.message || "Failed to apply coupon");
        } finally {
            setApplying(false);
        }
    };

    // Remove applied coupon
    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscountInfo(null);
        setCouponCode("");
        setError(null);
        onCouponRemoved();
        toast.info("Coupon removed");
    };

    // Format discount text
    const formatDiscount = (coupon: Coupon) => {
        if (coupon.discount_type === 'percentage') {
            return `${coupon.discount}% OFF`;
        } else {
            return `₹${coupon.discount} OFF`;
        }
    };

    // Check if coupon is applicable (minimum amount) - FIXED: Added null check
    const isCouponApplicable = (coupon: Coupon) => {
        // If min_booking_amount is null or undefined, coupon is applicable
        if (coupon.min_booking_amount === null || coupon.min_booking_amount === undefined) {
            return true;
        }
        // Otherwise check if totalAmount meets the minimum
        return totalAmount >= coupon.min_booking_amount;
    };

    // Get minimum amount display - FIXED: Added null check
    const getMinAmountDisplay = (coupon: Coupon) => {
        if (coupon.min_booking_amount && coupon.min_booking_amount > 0) {
            return `Min. ₹${coupon.min_booking_amount}`;
        }
        return null;
    };

    // Calculate amount needed to apply coupon - FIXED: Added null check
    const getAmountNeeded = (coupon: Coupon) => {
        if (coupon.min_booking_amount && coupon.min_booking_amount > totalAmount) {
            return (coupon.min_booking_amount - totalAmount).toFixed(0);
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Coupons & Offers</h3>
                </div>

                {appliedCoupon ? (
                    <button
                        onClick={handleRemoveCoupon}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                        <X className="h-4 w-4" />
                        Remove
                    </button>
                ) : coupons.length > 0 && !fetchError ? (
                    <button
                        onClick={() => setShowCoupons(!showCoupons)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                        {showCoupons ? (
                            <>Hide coupons <ChevronUp className="h-4 w-4" /></>
                        ) : (
                            <>Show {coupons.length} coupons <ChevronDown className="h-4 w-4" /></>
                        )}
                    </button>
                ) : null}
            </div>

            {/* Applied Coupon Banner */}
            {appliedCoupon && discountInfo && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-green-800">
                                    Coupon Applied: <span className="font-bold">{appliedCoupon.code}</span>
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                    {appliedCoupon.discount_type === 'percentage'
                                        ? `${appliedCoupon.discount}% discount`
                                        : `₹${appliedCoupon.discount} discount`}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    You saved: ₹{discountInfo.amount}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">{appliedCoupon.name}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Coupon Input */}
            {!appliedCoupon && (
                <div className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            disabled={applying}
                        />
                        <button
                            onClick={handleApplyCoupon}
                            disabled={applying || !couponCode.trim()}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {applying ? "Applying..." : "Apply"}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </p>
                    )}
                </div>
            )}

            {/* Coupons List */}
            {!appliedCoupon && showCoupons && (
                <div className="mt-2 space-y-3 max-h-80 overflow-y-auto pr-1">
                    {loading ? (
                        <div className="text-center py-6">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Loading coupons...</p>
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No coupons available for you</p>
                            <p className="text-xs text-gray-400 mt-1">Check back later for offers</p>
                        </div>
                    ) : (
                        coupons.map((coupon) => {
                            const applicable = isCouponApplicable(coupon);
                            const minAmountDisplay = getMinAmountDisplay(coupon);
                            const amountNeeded = getAmountNeeded(coupon);

                            return (
                                <div
                                    key={coupon.id}
                                    className={`border rounded-lg p-4 transition-all ${applicable
                                            ? 'border-blue-200 hover:border-blue-400 hover:shadow-md cursor-pointer bg-white'
                                            : 'border-gray-200 bg-gray-50 opacity-60'
                                        }`}
                                    onClick={() => applicable && handleSelectCoupon(coupon)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded">
                                                    {formatDiscount(coupon)}
                                                </span>
                                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                                    {coupon.code}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-gray-900 text-sm">{coupon.name}</h4>
                                        </div>
                                        {applicable && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelectCoupon(coupon);
                                                }}
                                                className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors"
                                            >
                                                Apply
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-2">
                                        {minAmountDisplay && (
                                            <span className="flex items-center gap-1">
                                                <IndianRupee className="h-3 w-3" />
                                                {minAmountDisplay}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Valid till {coupon.formatted_end}
                                        </span>
                                        {coupon.usage_limit && coupon.usage_limit > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {coupon.usage_limit} uses left
                                            </span>
                                        )}
                                    </div>

                                    {!applicable && amountNeeded && (
                                        <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Add ₹{amountNeeded} more to apply
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Error message for fetch */}
            {fetchError && !loading && coupons.length === 0 && !appliedCoupon && (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-500">{fetchError}</p>
                </div>
            )}
        </div>
    );
}