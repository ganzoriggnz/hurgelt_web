import Link from "next/link";

const PageNotFound = () => (
  <Link href="/">
    <div className="text-[45px] text-blue-950 w-full h-screen flex items-center justify-center flex-col ">
      <p className="text-[85px] ">404</p>
      <p>Энэ хуудас байхгүй байна!!! *</p>
    </div>
  </Link>
);
PageNotFound.hideHeader = true;

export default PageNotFound;
