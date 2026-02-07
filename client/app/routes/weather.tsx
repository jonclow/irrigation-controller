import { Outlet } from "react-router";
import Weather from "~/components/Weather";
import { socket } from "~/socket";

export default function WeatherPage() {
  return (
    <>
      <Weather socket={socket} />
      <Outlet />
    </>
  );
}
