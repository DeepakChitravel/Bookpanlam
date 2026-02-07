"use client";
import useRazorpay from "react-razorpay";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { BreadcrumbLink } from "@/link";
import BookingHeader from "../components/shared/booking-header";
import BookingStepper from "../components/shared/booking-stepper";
import Step1 from "../components/shared/booking-steps/step1";
import { Button } from "../components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";
import Step2 from "../components/shared/booking-steps/step2";
import { AppointmentData, BookingPageProps, siteSettings } from "@/types";
import {
  calculateGST,
  formatDate,
  formatNumber,
  handleToast,
} from "@/lib/utils";
import getSymbolFromCurrency from "currency-symbol-map";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import Step3 from "../components/shared/booking-steps/step3";
import Step4 from "../components/shared/booking-steps/step4";
import { createAppointment } from "@/lib/api/appointments";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const Booking = ({ serviceData }: BookingPageProps) => {
  const {
    id,
    userId,
    slug,
    category,
    amount,
    previousAmount,
    gstPercentage,
    timeSlotInterval,
    intervalType,
  } = serviceData;

  const [Razorpay] = useRazorpay();

  const { user } = useAuth();
  const router = useRouter();

  const siteSettings: siteSettings | any =
    serviceData.user.siteSettings && serviceData.user.siteSettings[0];

  const gstAmount = calculateGST(
    parseInt(amount),
    gstPercentage,
    siteSettings?.gstType === "inclusive" ? true : false
  ).totalAmount;

  const [step, setStep] = useState(1);

  const [paymentMethod, setPaymentMethod] = useState("");

  // Date and time
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");

  // Input fields
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [remark, setRemark] = useState<string>("");
  const [charges, setCharges] = useState<number>(0);

  useEffect(() => {
    setName(user?.name as string);
    setPhone(user?.phone as string);
    setEmail(user?.email as string);
  }, [user]);

  useEffect(() => {
    setCharges(parseInt(selectedArea.split("|")[1]));
    setArea(selectedArea.split("|")[0]);
  }, [selectedArea]);

  const handleNext = () => {
    if (step === 1) {
      if (!date) return toast.error("Please select a date");
      if (!time) return toast.error("Please select a time");
    }

    if (step === 2) {
      if (!name) return toast.error("Please enter your name");
      if (!phone) return toast.error("Please enter your phone number");
      if (!isPossiblePhoneNumber(phone))
        return toast.error("Please enter a valid phone number");
      if (!area) return toast.error("Please select a area");
      if (!postalCode) return toast.error("Please enter your postal code");
      if (!address) return toast.error("Please enter your address");
    }

    if (step === 4) {
      if (!paymentMethod) return toast.error("Please choose a payment method");

      if (paymentMethod === "Razorpay") {
        handlePaymentWithRazorpay();
      } else if (paymentMethod === "Cash In Hand") {
        bookAppointment({
          paymentStatus: "Unpaid",
        });
      } else {
        bookAppointment({
          paymentStatus: "Unpaid",
        });
      }
    }

    setStep((current) => (current < 4 ? current + 1 : current));
  };

  const handlePrev = () => {
    setStep((current) => (current > 1 ? current - 1 : current));
  };

  const handlePaymentWithRazorpay = async () => {
    // const order = await createOrder(params); //  Create order on your backend

    const amount =
      parseInt(
        calculateGST(
          parseInt(serviceData.amount),
          serviceData.gstPercentage,
          siteSettings?.gstType
        ).totalAmount
      ) + charges;

    const options: any = {
      key: siteSettings?.razorpayKeyId, // Enter the Key ID generated from the Dashboard
      amount: amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: siteSettings?.currency,
      name: serviceData?.user.siteName,
      handler: function (response: any) {
        bookAppointment({
          paymentId: response.razorpay_payment_id,
          paymentStatus: "Paid",
        });
      },
      prefill: {
        name: name,
        email: email && email,
        contact: phone,
      },
      theme: {
        color: "#418ffb",
      },
    };

    const rzp1 = new Razorpay(options);

    rzp1.on("payment.failed", function (response: any) {
      alert(response.error.code);
      alert(response.error.description);
      alert(response.error.source);
      alert(response.error.step);
      alert(response.error.reason);
      alert(response.error.metadata.order_id);
      alert(response.error.metadata.payment_id);
    });

    rzp1.open();
  };

  const bookAppointment = async ({
    paymentId,
    paymentStatus,
  }: {
    paymentId?: string;
    paymentStatus: string;
  }) => {
    let obj: AppointmentData = {
      userId,
      serviceId: id,
      name,
      phone,
      email,
      date: date as Date,
      time,
      amount,
      charges: charges.toString(),
      gstNumber: siteSettings?.gstNumber,
      gstType: siteSettings?.gstType,
      gstPercentage: gstPercentage,
      paymentMethod,
      paymentId,
      area,
      postalCode,
      address,
      remark,
      status: "Booked",
      paymentStatus,
      gstAmount: formatNumber(
        parseInt(
          calculateGST(
            parseInt(serviceData.amount),
            serviceData.gstPercentage,
            siteSettings?.gstType
          ).gstAmount
        )
      ),
      totalAmount: (
        parseInt(
          calculateGST(
            parseInt(serviceData.amount),
            serviceData.gstPercentage,
            siteSettings?.gstType
          ).totalAmount
        ) + charges
      ).toString(),
    };
    if (user) obj.customerId = user.id;

    try {
      const result = await createAppointment(obj);

      handleToast(result);
      if (result.success) router.push("/");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${slug}`}>
                {serviceData.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Booking</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-10">
          <BookingHeader
            badge={category?.name}
            name={serviceData.name}
            amount={
              getSymbolFromCurrency(siteSettings?.currency as string) +
              formatNumber(
                siteSettings?.gstNumber ? parseInt(gstAmount) : parseInt(amount)
              )
            }
            previousAmount={
              previousAmount &&
              getSymbolFromCurrency(siteSettings?.currency as string) +
                formatNumber(parseInt(previousAmount))
            }
            taxType={siteSettings?.gstType}
          />
          <BookingStepper activeStep={step} />

          <div className="mt-10">
            {step === 1 ? (
              <Step1
                serviceId={id}
                siteSettings={siteSettings}
                timeSlotInterval={timeSlotInterval}
                intervalType={intervalType}
                date={{
                  value: date,
                  setValue: setDate,
                }}
                time={{
                  value: time,
                  setValue: setTime,
                }}
              />
            ) : step === 2 ? (
              <Step2
                name={{ value: name, setValue: setName }}
                phone={{ value: phone, setValue: setPhone }}
                email={{ value: email, setValue: setEmail }}
                selectedArea={{
                  value: selectedArea,
                  setValue: setSelectedArea,
                }}
                postalCode={{ value: postalCode, setValue: setPostalCode }}
                address={{ value: address, setValue: setAddress }}
                remark={{ value: remark, setValue: setRemark }}
              />
            ) : step === 3 ? (
              <Step3
                details={{
                  name,
                  mobileNumber: phone,
                  emailAddress: email,
                  area,
                  postalCode,
                  address,
                  remark,
                }}
                service={{
                  service: serviceData.name,
                  bookedDate: formatDate(date as Date),
                  bookedTime: time,
                  serviceAmount:
                    getSymbolFromCurrency(siteSettings?.currency) +
                    formatNumber(parseInt(serviceData.amount)),
                  gstAmount:
                    siteSettings?.gstType &&
                    serviceData.gstPercentage &&
                    getSymbolFromCurrency(siteSettings?.currency) +
                      formatNumber(
                        parseInt(
                          calculateGST(
                            parseInt(serviceData.amount),
                            serviceData.gstPercentage,
                            siteSettings?.gstType
                          ).gstAmount
                        )
                      ),
                  charges:
                    getSymbolFromCurrency(siteSettings?.currency) +
                    formatNumber(charges),
                  totalAmount:
                    getSymbolFromCurrency(siteSettings?.currency) +
                    formatNumber(
                      parseInt(
                        calculateGST(
                          parseInt(serviceData.amount),
                          serviceData.gstPercentage,
                          siteSettings?.gstType
                        ).totalAmount
                      ) + charges
                    ),
                }}
              />
            ) : (
              <Step4
                cashInHand={siteSettings?.cashInHand}
                razorpay={
                  siteSettings?.razorpayKeyId && {
                    keyId: siteSettings?.razorpayKeyId,
                  }
                }
                phonepe={
                  siteSettings?.phonepeSaltKey &&
                  siteSettings?.phonepeSaltIndex &&
                  siteSettings?.phonepeMerchantId && {
                    saltKey: siteSettings?.phonepeSaltKey,
                    saltIndex: siteSettings?.phonepeSaltIndex,
                    merchantId: siteSettings?.phonepeMerchantId,
                  }
                }
                payu={
                  siteSettings?.payuApiKey &&
                  siteSettings?.payuSalt && {
                    apiKey: siteSettings?.payuApiKey,
                    salt: siteSettings?.payuSalt,
                  }
                }
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
            )}
          </div>

          <div className="flex justify-between items-center mt-5">
            <Button
              size="lg"
              variant="outline"
              className="text-base rounded-full gap-1"
              onClick={handlePrev}
            >
              <MoveLeft /> Previous
            </Button>

            <Button
              size="lg"
              className="text-base rounded-full gap-1"
              onClick={handleNext}
            >
              Next <MoveRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
