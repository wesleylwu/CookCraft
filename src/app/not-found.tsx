import Image from "next/image";
import maintenanceRobot from "@/public/404page/maintenanceRobot.webp";

const NotFound = () => {
  return (
    <div className="bg-cookcraft-white text-cookcraft-red flex h-screen flex-col items-center text-6xl font-bold">
      <Image
        src={maintenanceRobot}
        alt="Maintenence Robot Image"
        className="mt-28 mb-5 w-1/3"
      />
      404 Page Not Found
    </div>
  );
};

export default NotFound;
