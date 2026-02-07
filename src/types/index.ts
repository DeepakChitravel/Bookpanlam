export interface LinkProps {
  children: React.ReactNode;
  href: string;
  target?: string;
  className?: string;
}

export interface SelectOption {
  label: string;
  value: string;
  selected?: boolean;
}

export interface InputField {
  type:
    | "text"
    | "url"
    | "number"
    | "email"
    | "password"
    | "select"
    | "textarea"
    | "phone"
    | "checkbox"
    | "time"
    | "calendar"
    | "file"
    | "switch";
  value: string | number | boolean;
  placeholder?: string;
  options?: { label: string; value: string; selected?: boolean }[];
  label?: string | React.ReactNode;
  labelDescription?: string | React.ReactNode;
  setValue?: (value: any) => void;
  required?: boolean;
  containerClassName?: string;
  rows?: number;
  inputFieldBottomArea?: React.ReactNode;
}


export interface BusinessContentProps {
  user: {
    userId: number;
    service_type_id: number;
  };
  site: string;
}


export type HomepageBookingProps = {
  userId: number;
  site: string;
};

export type DepartmentBookingProps = {
  userId: number;
  site: string;
};


export interface ServiceCard {
  name: string;
  slug: string;
  img: string;
  location: string;
  price: {
    price: number;
    mrp?: number | undefined;
  };
  currency: string;
}

export interface CategoryCard {
  name: string;
  img: string;
  itemsCount: number;
  color: string;
}

export interface TestimonialUserProps {
  name: string;
  title: string;
  img: string;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

export interface StarsProps {
  starSize?: number;
}

export interface NavbarProps {
  topbarInformations?: {
    icon: React.ReactNode;
    label?: string;
    href?: string;
  }[];
  phone?: string;
  logo?: string;
  siteName?: string;
  navLinks?: NavLink[];
}


export interface FooterProps {
  user: User;
    settings: any;   // ⭐ ADD THIS

  categories: Category[];
}

export interface WorkingHoursProps {
  workingHours: { day: string; time: string }[];
  phone: string;
}

export interface LogoProps {
  name: string;
  imgUrl: string;
}

export interface ServicesProps {
  data: {
    records: Service[];
    totalPages: number;
    totalRecords: number;
  };
  categories: Category[];
}

export interface ServicesSidebarProps {
  categories: Category[];
}

export interface PaginationProps {
  totalPages: number;
  totalRecords: number;
}

export interface ServicePageProps {
  data: Service;
  services: Service[];
}

export interface ServiceSidebarProps {
  service: Service;
}

export interface BookingPageProps {
  serviceData: Service;
}

export interface BookingHeaderProps {
  badge?: string;
  name: string;
  amount: string;
  previousAmount: string;
  taxType?: string;
}

export interface BookingStep1Props {
  serviceId: number;
  siteSettings: siteSettings | any;
  timeSlotInterval: string;
  intervalType: string;
  date: { value: Date | undefined; setValue?: (value: any) => void };
  time: { value: string; setValue?: (value: string) => void };
}

export interface BookingStep2Props {
  [key: string]: {
    value: string | number;
    setValue?: (value: any) => void;
  };
}

export interface BookingStep3Props {
  [key: string]: { [key: string]: string };
}

export interface BookingStep4Props {
  cashInHand: boolean;
  razorpay: {
    keyId: string;
  };
  phonepe: {
    saltKey: string;
    saltIndex: string;
    merchantId: string;
  };
  payu: {
    apiKey: string;
    salt: string;
  };
  paymentMethod: string;
  setPaymentMethod?: (value: any) => void;
}

export interface PaymentMethodProps {
  icon: string;
  heading: string;
  color: string;
  value: string;
  setPaymentMethod?: (value: any) => void;
}

export interface SideLink {
  href: string;
  children: React.ReactNode;
}

export interface FileInput {
  fileName: string;
  setFileName: (value: string) => void;
}

export type User = {
  id?: number;
  userId?: number;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  country?: string;
  image?: string;
  siteName?: string;
  siteSlug?: string;
  createdAt?: Date;
  siteSettings?: siteSettings[];
};

export type siteSettings = {
  id?: number;
  userId?: number;
  logo?: string;
  favicon?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  currency?: string;
  country?: string;
  state?: string;
  address?: string;
  metaTitle?: string;
  metaDescription?: string;
  sharingImagePreview?: string;
  gstNumber?: string;
  gstType?: string;

  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  pinterest?: string;

  cashInHand?: boolean;
  razorpayKeyId?: string;
  phonepeSaltKey?: string;
  phonepeSaltIndex?: string;
  phonepeMerchantId?: string;
  payuApiKey?: string;
  payuSalt?: string;

  sunday?: boolean;
  sundayStarts?: string;
  sundayEnds?: string;
  monday?: boolean;
  mondayStarts?: string;
  mondayEnds?: string;
  tuesday?: boolean;
  tuesdayStarts?: string;
  tuesdayEnds?: string;
  wednesday?: boolean;
  wednesdayStarts?: string;
  wednesdayEnds?: string;
  thursday?: boolean;
  thursdayStarts?: string;
  thursdayEnds?: string;
  friday?: boolean;
  fridayStarts?: string;
  fridayEnds?: string;
  saturday?: boolean;
  saturdayStarts?: string;
  saturdayEnds?: string;
};

export type servicesParams = {
  q?: string;
  limit: number;
  page?: number;
  category?: string;
};

export type categoriesParams = servicesParams;
export type availableAreasPrams = servicesParams;

export type Category = {
  id: number;
  categoryId: string;
  userId: number;
  name: string;
  slug: string;
  image: string;
  metaTitle: string;
  metaDescription: string;
  totalServices: number;
  createdAt: Date;
};

export type AdditionalImage = { id: number; image: string; createdAt: Date };

export type Service = {
  id: number;
  serviceId: string;
  userId: number;
  name: string;
  slug: string;
  amount: string;
  previousAmount: string;
  image: string;
  categoryId: number;
  timeSlotInterval: string;
  intervalType: string;
  description: string;
  gstPercentage: number;
  metaTitle: string;
  metaDescription: string;
  status: boolean;
  createdAt: Date;
  category: Category;
  additionalImages: AdditionalImage[];
  user: User;
};

export type AvailableArea = {
  id: number;
  areaId: string;
  area: string;
  charges: string;
  currency: string;
  createdAt: Date;
};

export type manualPaymentMethod = {
  id: number;
  userId: string;
  name: string;
  icon: string;
  instructions: string;
  image: string;
  createdAt: Date;
};

export type AppointmentData = {
  userId: number;
  customerId?: number;
  serviceId: number;
  employeeId?: number;
  name: string;
  phone: string;
  email?: string;
  date: Date;
  time: string;
  amount: string;
  charges: string;
  gstAmount: string | null;
  totalAmount: string;
  gstNumber?: string;
  gstType?: string;
  gstPercentage?: number;
  paymentMethod: string;
  paymentId?: string;
  employeeCommission?: string;
  area: string;
  postalCode: string;
  address: string;
  remark?: string;
  status: string;
  paymentStatus: string;
  paidAt?: Date;
};

export type RegisterData = {
  name: string;
  email?: string;
  phone: string;
  password: string;
  slug: string; // 🔥 REQUIRED
};


export type sendOtpData = {
  userId: number;
  phone: string;
  unique?: boolean;
  registered?: boolean;
};

export interface HeroSectionProps {
  user: User | null;
}


export type Customer = {
  id: number;
  customer_id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  photo: string;
  createdAt: Date;
};

export type customerLoginData = {
  phone: string;   // ✅ must match backend
  password: string;
};

export type UpdateCustomerData = {
  id: number;
  data: {
    name: string;
    email: string;
    phone: string;
    photo: string;
  };
};

export interface NavLink {
  label: string;
  link: string;
}
