import { Image } from "@nextui-org/image";
import { useState } from "react";

const ImgComponent = ({
  height,
  width,
  src,
  alt,
  className,
}: {
  height: any;
  width: any;
  src: string;
  alt: string;
  className: string;
}) => {
  const [rsrc, setSrc] = useState<string>(
    src?.replace("/uploads", "https://images.tulga-shop.com")
  );
  return (
    <Image
      radius="none"
      src={rsrc}
      onError={() => setSrc("/undraw_completed_03xt.svg")}
      // fallbackSrc={"/312883.jpg"}
      loading="lazy"
      width={width}
      height={height}
      className={`${className} group-hover:scale-110 transition-all duration-300`}
      alt={alt ?? "NextUI Image"}
    />
  );
};

export default ImgComponent;
