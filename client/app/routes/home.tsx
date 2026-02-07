import Home from "~/components/Home";
import { socket } from "~/socket";

export default function HomePage() {
  return <Home socket={socket} />;
}
