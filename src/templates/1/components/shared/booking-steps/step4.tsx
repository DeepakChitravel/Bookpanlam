import { RadioGroup } from "@/components/ui/radio-group";
import PaymentMethod from "../../cards/payment-method";
import { BookingStep4Props, manualPaymentMethod } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllManualPaymentMethods } from "@/lib/api/manual-payment-methods";
import Image from "next/image";
import { uploadsUrl } from "@/config";

const Step4 = ({
  cashInHand,
  razorpay,
  phonepe,
  payu,
  paymentMethod,
  setPaymentMethod,
}: BookingStep4Props) => {
  const { site } = useParams();
  const [manualPaymentMethods, setManualPaymentMethods] = useState<
    manualPaymentMethod[]
  >([]);

  useEffect(() => {
    async function fetchManualPaymentMethods() {
      try {
        const response = await getAllManualPaymentMethods(site as string);

        setManualPaymentMethods(response);
      } catch (error) {}
    }

    fetchManualPaymentMethods();
  }, [site]);

  return (
    <RadioGroup name="paymentMethod">
      {cashInHand && (
        <PaymentMethod
          {...{
            icon: "/static/cash.png",
            heading: "Cash In Hand",
            value: "Cash In Hand",
            color: "green",
          }}
          setPaymentMethod={setPaymentMethod}
        />
      )}

      {razorpay && (
        <PaymentMethod
          {...{
            icon: "/static/razorpay.png",
            heading: "Razorpay",
            value: "Razorpay",
            color: "blue",
          }}
          setPaymentMethod={setPaymentMethod}
        />
      )}

      {phonepe && (
        <PaymentMethod
          {...{
            icon: "/static/phonepe.png",
            heading: "Phonepe",
            value: "Phonepe",
            color: "indigo",
          }}
          setPaymentMethod={setPaymentMethod}
        />
      )}

      {payu && (
        <PaymentMethod
          {...{
            icon: "/static/payu.png",
            heading: "PayU",
            value: "PayU",
            color: "lime",
          }}
          setPaymentMethod={setPaymentMethod}
        />
      )}

      {manualPaymentMethods?.map((item, index) => {
        var color =
          index === 0
            ? "purple"
            : index === 1
            ? "blue"
            : index === 2
            ? "indigo"
            : index === 3
            ? "green"
            : "lime";

        const lines = item.instructions.trim().split("\n");

        return (
          <div key={index}>
            <PaymentMethod
              key={index}
              {...{
                icon: `/${item.icon}`,
                heading: item.name,
                value: item.name,
                color: color,
              }}
              setPaymentMethod={setPaymentMethod}
            />

            {paymentMethod === item.name && (
              <div className="bg-gray-50 p-5 rounded-md mt-2">
                <p className="font-medium leading-7">
                  {lines.map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>

                {item.image && (
                  <Image
                    src={uploadsUrl + "/" + item.image}
                    alt=""
                    width={300}
                    height={300}
                    className="w-auto max-h-[300px] mt-7"
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </RadioGroup>
  );
};

export default Step4;
