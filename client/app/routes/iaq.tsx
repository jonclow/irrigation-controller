import IAQ from "~/components/IAQ";
import { socket } from "~/socket";

export default function IAQPage() {
  return <IAQ socket={socket} />;
}
