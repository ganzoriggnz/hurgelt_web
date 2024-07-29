import { Image } from "@nextui-org/image";
import { useState } from "react";

const ImgComponent = ({
  height,
  width,
  src,
  alt,
  className,
}: {
  height?: number;
  width?: number;
  src: string;
  alt: string;
  className?: string;
}) => {
  const [rsrc, setSrc] = useState(src);
  return (
    <Image
      radius="none"
      src={rsrc}
      onError={() => setSrc("/312883.jpg")}
      // fallbackSrc={"/312883.jpg"}
      loading="lazy"
      width={width ?? 20}
      height={height ?? 20}
      className={` ${className} group-hover:scale-110 transition-all duration-300`}
      alt={alt ?? "NextUI Image"}
    />
  );
};

export default ImgComponent;
