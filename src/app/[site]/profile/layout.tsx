import ProtectedRoute from "@/components/auth/protected-route";
import Sidebar from "@/templates/1/components/shared/profile/sidebar";

interface Props {
  children: React.ReactNode;
}

const ProfileLayout = ({ children }: Props) => {
  return (
    <ProtectedRoute>
      <div className="container">
        <div className="flex gap-5 flex-col lg:flex-row">
          <div className="lg:w-[270px]">
            <Sidebar />
          </div>

          <div className="lg:w-[calc(100%_-_270px)]">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfileLayout;
