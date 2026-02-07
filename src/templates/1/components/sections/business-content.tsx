import { BusinessContentProps} from "@/types";
import HomepageBooking from "./homepage-booking";
import DepartmentBooking from "./department-booking";
import HotelBooking from "./hotel-booking";

export default function BusinessContent({ user, site }: BusinessContentProps) {

  if (!user) return null;

  const type = user.service_type_id;

  if (type === 1) {
    return <HomepageBooking userId={user.userId} site={site} />;
  }

  if (type === 3) {
    return <DepartmentBooking userId={user.userId} site={site} />;
  }

  if (type === 2) {
    return <HotelBooking userId={user.userId} site={site} />;
  }

  return null;
}
