import Control from "~/components/Control";
import { socket } from "~/socket";

export default function ControlPage() {
  return <Control socket={socket} />;
}
