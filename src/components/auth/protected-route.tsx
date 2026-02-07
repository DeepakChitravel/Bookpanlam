"use client";
import { useAuth } from "@/contexts/AuthContext";
import Forbidden from "../utility/forbidden";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user } = useAuth();

  return user === undefined ? null : user ? children : <Forbidden />;
};

export default ProtectedRoute;
