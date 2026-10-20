import { LoaderCircle } from "lucide-react";
export default function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle size={35} style={{ margin: "0 auto 20px" }} />
      <p>Making a little space…</p>
    </div>
  );
}
