import Image from "next/image";
import { uploadsUrl } from "@/config";

type Doctor = {
  id: number;
  name: string;
  slug: string;
  amount: string;
  image: string;
  specialization?: string;
  qualification?: string;
};

const DoctorSchedules = ({ doctors }: { doctors: Doctor[] }) => {
  if (!doctors.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">
          Available Doctors
        </h2>

        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="border rounded-xl p-4 text-center hover:shadow-lg transition"
            >
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={`${uploadsUrl}/${doc.image}`}
                  alt={doc.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              <h3 className="text-lg font-semibold">{doc.name}</h3>
              <p className="text-sm text-gray-500">
                {doc.specialization}
              </p>

              <p className="mt-2 font-bold">₹{doc.amount}</p>

              <a
                href={`/booking/${doc.slug}`}
                className="inline-block mt-4 px-5 py-2 rounded-full bg-primary text-white"
              >
                Book Appointment
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorSchedules;
