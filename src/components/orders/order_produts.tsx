import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { IOrder } from "@/types/next";
import { Button, Modal } from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

const OrdersProdutsModal = ({
  handleCancel,
  open,
  data,
}: {
  handleCancel: () => void;
  open: boolean;
  data: IOrder;
}) => {
  const [loading, setloading] = useState(false);
  const { userContent } = useData();

  const restoreOrder = () => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/orders/orderrestore", {
          id: data?._id,
        })
        .then((response) => {
          if (response?.["status"] === 200) {
            handleCancel();
          } else {
            toast.warning(response?.data?.message);
          }
        })
        .catch((e: any) => {
          console.log(e);
          const toastId = Math.floor(new Date().getTime() / 5000);
          toast.error(`${e?.toString()}`, { toastId });
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  return (
    <Modal
      width={590}
      key={"register"}
      destroyOnClose
      style={{ maxWidth: "100vw !important" }}
      className="items-center  !m-0 text-blue-950"
      onCancel={() => {
        handleCancel();
      }}
      centered
      open={open}
      footer={[]}
    >
      <div
        id="printSection"
        className="flex justify-between border-b-2 mb-6 pb-4"
      >
        <p className="">{data?.type}</p>
        <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950  ">
          Захиалгын дэлгэрэнгүй
        </p>
        <p></p>
      </div>
      <div className="flex gap-2 justify-between mb-3">
        <p className="font-semibold">№ {data?.order_number}</p>
        <p>{dayjs(data?.created_at).format("YYYY/MM/DD HH:mm")}</p>
        <p>
          Үүсгэсэн:
          <span className="font-semibold"> {data?.owner?.username}</span>
        </p>
      </div>
      <div className="flex gap-2 justify-between mb-3">
        <p>
          Захиалагчын утас :{" "}
          <span className="font-semibold">{data?.customer_phone}</span>
        </p>
        <div
          className="cursor-pointer"
          onClick={() => {
            window.print();
          }}
        >
          <Image
            src={"/icons/print-solid.svg"}
            alt="edit"
            width={25}
            height={25}
          />
        </div>
      </div>
      <div className="flex mb-3 items-center justify-between">
        <p>
          Хаяг : {data?.duureg},{data?.address}
        </p>
        {[0, 1].includes(userContent?.level) &&
        data?.isCompleted &&
        data?.status == "Цуцлагдсан" ? (
          <Button
            className="w-[70px] px-1 max-w-[70px]  hover:text-green-600 hover:bg-white bg-green-800  text-white"
            onClick={() => {
              restoreOrder();
            }}
          >
            Сэргээх
          </Button>
        ) : (
          <></>
        )}
      </div>
      <div className="flex gap-2 justify-between mb-3">
        <p className="">
          Төлбөрийн төлөв :{" "}
          <span className="font-semibold">
            {data?.isPaid ? "Төлбөр хийгдсэн" : "Хийгдээгүй"}
          </span>
        </p>
        <p className="">
          Төлбөрийн хэлбэр :{" "}
          <span className="font-semibold">{data?.payment_type}</span>
        </p>
      </div>
      <div className="flex gap-2 justify-between mb-3">
        <p className="">
          Хүлээж авах өдөр : {dayjs(data?.huleejawahudur).format("YYYY/MM/DD")}
        </p>
        {data?.huleejawahtsag ? (
          <p className="">
            Хүлээж авах цаг :{" "}
            <span className="font-semibold">{data?.huleejawahtsag}</span>
          </p>
        ) : (
          <></>
        )}
      </div>
      <div className="border w-full  flex flex-col justify-start">
        <div className="flex w-full justify-between font-semibold border-b pb-2 bg-slate-200 p-2">
          <p className="min-w-[90px] text-left">Код</p>
          <p className="min-w-[130px] text-center">Барааны нэр</p>
          <p className="min-w-[50px] text-right">Тоо</p>
          <p className="min-w-[85px] text-right">Үндсэн үнэ</p>
          <p className="min-w-[85px] text-right">Хүргэлт үнэ</p>
          <p className="min-w-[80px] text-right">Бүгд</p>
        </div>
        {data?.order_product?.map((item: any, index: number) => {
          return (
            <div className="flex justify-between py-2 p-2" key={index}>
              <p className="min-w-[90px] text-left"> {item?.product_code}</p>
              <p className="min-w-[130px] text-left"> {item?.product_name}</p>
              <p className="min-w-[50px] text-right"> {item?.too}ш</p>
              <p className="min-w-[85px] text-right">
                {(item?.sale_price + item?.delivery_price)?.toLocaleString()}₮
              </p>
              <p className="min-w-[85px] text-right">
                {(item?.delivery_price * item?.too)?.toLocaleString()}₮
              </p>
              <p className="min-w-[80px] text-right">
                {(
                  (item?.sale_price + item?.delivery_price) *
                  item?.too
                ).toLocaleString()}
                ₮
              </p>
            </div>
          );
        })}
        <div className="flex justify-between py-1 border-t font-bold bg-slate-200 p-2">
          <p className="min-w-[90px] text-left">Нийт</p>
          <p className="min-w-[130px] text-left"></p>
          <p className="min-w-[50px] text-right">{data?.too}ш</p>
          <p className="min-w-[85px] text-right">
            {data?.order_product
              ?.reduce((a: number, b: any) => a + b?.sale_price, 0)
              .toLocaleString()}
            ₮
          </p>
          <p className="min-w-[85px] text-right">
            {data?.order_product
              ?.reduce((a: number, b: any) => a + b?.delivery_price * b.too, 0)
              .toLocaleString()}
            ₮
          </p>
          <p className="min-w-[80px] text-right">
            {data?.order_product
              ?.reduce(
                (a: number, b: any) =>
                  a + (b?.sale_price + b?.delivery_price) * b?.too,
                0
              )
              .toLocaleString()}
            ₮
          </p>
        </div>
      </div>
      <div className="flex gap-2 justify-between p-5 border">
        <p className="font-medium">
          Хүргэлтийн нэмэлт дэлгэрэнгүй мэдээлэл : <br />
          <span className="font-normal">{data?.nemelt} </span>
        </p>
      </div>
      <div className="flex gap-2 justify-between">
        {data?.from_username ? (
          <p>
            Хэнээс :{" "}
            <span className="font-semibold">{data?.from_username} </span>
          </p>
        ) : (
          <p></p>
        )}
        <p>
          Хүргэлтийн жолооч:{" "}
          <span className="font-semibold">
            {data?.jolooch?.name} (Утас:{data?.jolooch?.phone}
            {data?.jolooch?.phone2 ? ", " + data?.jolooch?.phone2 : ""} )
          </span>
        </p>
      </div>
      <div className="flex gap-2 justify-between mb-3">
        {data?.from_username ? (
          <p>
            <span className="font-semibold">
              {dayjs(data?.from_date).format("YYYY/MM/DD HH:mm")}
            </span>
          </p>
        ) : (
          <p></p>
        )}
        <p>
          Хүргэлтийн бүс:{" "}
          <span className="font-semibold">
            {data?.duureg}-{data?.zone}
          </span>
        </p>
      </div>
      <div className="flex justify-between pt-4">
        <p>Төлөв: {data?.status}</p>
        <p> {data?.isCompleted ? "Дууссан" : "Дуусаагүй"}</p>
      </div>
      <div className="flex justify-between pt-4">
        <p>
          Хаасан огноо: {dayjs(data?.completedDate).format("YYYY/MM/DD HH:mm")}
        </p>
        <p> {data?.completeTailbar}</p>
      </div>
    </Modal>
  );
};
export default OrdersProdutsModal;
