import axiosInstance from "@/lib/axios";
import dayjs from "dayjs";
import Image from "next/image";

const PrintOrder = (props?: { invoice_id: string; invoice_data?: any }) => {
  console.log(props);
  return (
    <div className="max-w-[1024px] p-8 text-[14px]">
      <div className="flex justify-between border-b-2 mb-6 pb-4 ">
        <p className="">({props?.invoice_data?.type})</p>
        <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950  ">
          {props?.invoice_data?.type == "Орлого"
            ? "Орлогын падаан"
            : "Зарлагын падаан"}
        </p>
        <p>
          {dayjs(props?.invoice_data?.updated_at).format("YYYY/MM/DD HH:mm")}
        </p>
      </div>
      <div className="flex gap-2 justify-between mb-3">
        <p className="font-semibold">№ {props?.invoice_data?.invoice_number}</p>
        <p>
          Үүсгэсэн:
          <span className="font-semibold">
            {" "}
            {props?.invoice_data?.owner?.username}
          </span>
        </p>
      </div>
      <div className="flex gap-2 justify-between mb-3">
        <p className="">
          Баримтын тайлбар :{" "}
          <span className="font-semibold">{props?.invoice_data?.isPaid}</span>
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
          {/* Хэнд: <span className="font-semibold">{props?.invoice_data?.customer_name}</span> */}
        </div>
      </div>
      <div className="border w-full  flex flex-col justify-start">
        <div className="flex w-full justify-between font-semibold border-b pb-2 bg-slate-200 p-2">
          <p className="min-w-[90px] text-left">Код</p>
          <p className="min-w-[130px] text-center">Барааны нэр</p>
          <p className="min-w-[50px] text-right">Тоо</p>
          <p className="min-w-[85px] text-right">Зарах үнэ</p>
          <p className="min-w-[80px] text-right">Бүгд</p>
        </div>
        {props?.invoice_data?.invoice_products?.map(
          (item: any, index: number) => {
            return (
              <div className="flex justify-between py-2 p-2" key={index}>
                <p className="min-w-[90px] text-left"> {item?.product_code}</p>
                <p className="min-w-[130px] text-left"> {item?.product_name}</p>
                <p className="min-w-[50px] text-right"> {item?.too}ш</p>
                <p className="min-w-[85px] text-right">
                  {item?.sale_price?.toLocaleString()}₮
                </p>
                <p className="min-w-[80px] text-right">
                  {(item?.sale_price * item?.too).toLocaleString()}₮
                </p>
              </div>
            );
          }
        )}
        <div className="flex justify-between py-1 border-t font-bold bg-slate-200 p-2">
          <p className="min-w-[90px] text-left">Нийт</p>
          <p className="min-w-[130px] text-left"></p>
          <p className="min-w-[50px] text-right">{props?.invoice_data?.too}ш</p>
          <p className="min-w-[85px] text-right">
            {props?.invoice_data?.invoice_products
              ?.reduce((a: number, b: any) => a + b.sale_price, 0)
              .toLocaleString()}
            ₮
          </p>
          <p className="min-w-[80px] text-right">
            {props?.invoice_data?.invoice_products
              ?.reduce((a: number, b: any) => a + b.sale_price * b.too, 0)
              .toLocaleString()}
            ₮
          </p>
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <p>
          {dayjs(props?.invoice_data?.updated_at).format("YYYY/MM/DD HH:mm")}
        </p>
        <p> {props?.invoice_data?.isCompleted ? "Дууссан" : "Дуусаагүй"}</p>
      </div>
      <div className="flex gap-2 justify-between mb-3 border-b-[1px] border-blue-950 pb-[40px] ">
        <p>
          Хэнээс :{" "}
          <span className="font-semibold">
            {props?.invoice_data?.from_username}
          </span>
        </p>
        <p>
          Хэнд:{" "}
          <span className="font-semibold">
            {props?.invoice_data?.to_username}
          </span>
        </p>
      </div>
    </div>
  );
};

export async function getServerSideProps(context: any) {
  try {
    const invoice = context?.query?.invoice?.toString() ?? "";
    var invoice_data: any = {};
    const res = await axiosInstance.post(
      `${process.env.API_BASE_URL}/invoice/getinvoice`,
      {
        id: invoice,
      }
    );

    if (
      invoice &&
      res?.["status"] === 200 &&
      res?.data?.result &&
      res?.data?.data
    ) {
      invoice_data = res?.data?.data;
      return {
        props: {
          invoice_id: invoice,
          invoice_data: invoice_data,
        },
      };
    } else {
      return {
        redirect: {
          permanent: false,
          destination: "/warehouse",
        },
        props: {},
      };
    }
  } catch (e) {
    console.log(e);
    return {
      redirect: {
        permanent: false,
        destination: "/warehouse",
      },
      props: {},
    };
  }
}

PrintOrder.hideHeader = true;
export default PrintOrder;
