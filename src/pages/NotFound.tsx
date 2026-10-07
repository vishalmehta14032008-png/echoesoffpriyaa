import { Link } from "react-router-dom";
import Butterfly from "../components/Butterfly";

export default function NotFound() {
  return (
    <main className="notfound">
      <Butterfly size={56} tone="lilac" />
      <h1 className="display">This butterfly got a little lost.</h1>
      <Link className="btn btn-primary" to="/">
        Take me back ✨
      </Link>
    </main>
  );
}
