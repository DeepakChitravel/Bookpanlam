"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

interface NotificationModalProps {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  details?: string[];
  onClose: () => void;
  autoClose?: number; // Auto close after milliseconds
}

const NotificationModal = ({
  isOpen,
  type,
  title,
  message,
  details = [],
  onClose,
  autoClose = 10000, // 15 seconds default
}: NotificationModalProps) => {
  useEffect(() => {
    if (isOpen && autoClose > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle className="h-10 w-10 text-green-600" />,
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-300",
      textColor: "text-green-900",
      buttonColor: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
    },
    error: {
      icon: <XCircle className="h-10 w-10 text-red-600" />,
      bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
      borderColor: "border-red-300",
      textColor: "text-red-900",
      buttonColor: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
    },
    warning: {
      icon: <AlertCircle className="h-10 w-10 text-amber-600" />,
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      borderColor: "border-amber-300",
      textColor: "text-amber-900",
      buttonColor: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
    },
    info: {
      icon: <Info className="h-10 w-10 text-blue-600" />,
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-300",
      textColor: "text-blue-900",
      buttonColor: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
    },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-50">
      {/* Semi-transparent backdrop */}
      <div 
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Centered modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className={`relative w-full max-w-lg rounded-3xl border-2 ${config.borderColor} ${config.bgColor} p-8 shadow-2xl`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full p-2 hover:bg-white/80 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="flex flex-col items-center">
            {/* Large icon */}
            <div className="mb-6 rounded-full bg-white p-4 shadow-lg">
              {config.icon}
            </div>

            {/* Title */}
            <h2 className={`text-3xl font-bold ${config.textColor} mb-4 text-center`}>
              {title}
            </h2>

            {/* Message */}
            <p className="text-gray-800 mb-6 text-lg text-center leading-relaxed">
              {message}
            </p>

            {/* Details in a card */}
            {details.length > 0 && (
              <div className="w-full mb-8">
                <div className="bg-white/90 rounded-2xl p-6 shadow-inner">
                  <div className="space-y-3">
                    {details.map((detail, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`w-3 h-3 rounded-full ${config.textColor.replace('text-', 'bg-')} mr-3 mt-1.5 flex-shrink-0`}></div>
                        <p className="text-gray-700">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action button */}
            <button
              onClick={onClose}
              className={`w-full py-4 px-8 text-white font-bold text-lg rounded-2xl ${config.buttonColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0`}
            >
              {type === "success" ? "Continue" : 
               type === "info" ? "Got It" : 
               type === "warning" ? "I Understand" : 
               "Try Again"}
            </button>

            {/* Simple note about auto-close */}
            {autoClose > 0 && (
              <p className="text-sm text-gray-500 mt-6">
                This message will close automatically in {autoClose/1000} seconds
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;