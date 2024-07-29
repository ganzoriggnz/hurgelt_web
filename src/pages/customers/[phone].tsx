import AddOrderModal from "@/components/orders/addorder";
import EditOrderModal from "@/components/orders/editorder";
import OrdersProdutsModal from "@/components/orders/order_produts";
import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { IUser } from "@/types/next";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Table,
  TableProps,
  message,
} from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const OrdersPage = (props?: { phone: string }) => {
  const router = useRouter();
  const { userContent } = useData();
  const isdelete = [0, 1];
  const [level, setlevel] = useState(0);
  useEffect(() => {
    if (userContent) {
      setlevel(userContent.level);
    }
  }, [userContent]);

  const [page, setpage] = useState(1);
  const [offset, setoffset] = useState(0);
  const [limit, setlimit] = useState(30);
  const [sort, setsort] = useState<any>({ created_at: -1 });

  const [loading, setloading] = useState(false);
  const [tableData, settableData] = useState<IUser[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [totalcnt, settotalcnt] = useState(0);
  const [totalsum, settotalsum] = useState(0);
  const [searchForm] = Form.useForm();
  const searchValue = Form.useWatch("search", searchForm);
  const [selectedItem, setselectedItem] = useState<any>(null);

  const [insertModal, setinsertModal] = useState(false);
  const [editModal, seteditModal] = useState(false);
  const [viewModal, setviewModal] = useState(false);

  const [isShowAll, setisShowAll] = useState(true);
  const [isComplete, setisComplete] = useState(0);

  const getData = async (data?: {
    sort?: any;
    search?: string;
    ofs?: number;
    lim?: number;
  }) => {
    if (!loading) {
      setloading(true);
      try {
        const result = await axiosInstance.post("/orders/customerorders", {
          offset: data?.ofs ?? offset,
          limit: data?.lim ?? limit,
          sort: data?.sort ?? sort,
          search: data?.search,
          phone: props?.phone,
          isCompleted: isComplete == 0 ? null : isComplete == 1 ? false : true,
        });
        if (result?.status == 200) {
          settableData(result?.data?.data);
          settotalcnt(result?.data?.totalcnt);
          settotalsum(result?.data?.totalcum);
        }
      } catch (e: any) {
        const toastId = Math.floor(new Date().getTime() / 5000);
        toast.error(`${e?.toString()}`, { toastId });
      }
      setloading(false);
    }
  };
  const onChange: TableProps<IUser>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    let sort2: any;
    let off: number = offset;
    let limt: number = limit;
    if (sorter) {
      const sortTemp: any = sorter;
      if (
        sortTemp &&
        sortTemp?.field &&
        sortTemp?.field != "" &&
        sortTemp?.order
      ) {
        const fieldname = sortTemp.field ?? "";
        switch (fieldname) {
          case "status":
            sort2 = { status: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "isPaid":
            sort2 = { isPaid: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "order_number":
            sort2 = { order_number: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "total_price":
            sort2 = { total_price: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "too":
            sort2 = { too: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "completedDate":
            sort2 = { completedDate: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "created_at":
            sort2 = { created_at: sortTemp.order == "descend" ? -1 : 1 };
            break;
          default:
            sort2 = { created_at: sortTemp.order == "descend" ? -1 : 1 };
            break;
        }
        console.log("sortTemp:::", sortTemp);
      }
      // getData({ sort: sort });
    }
    console.log("params", pagination, filters, sorter, extra);
    if (pagination && pagination?.current && pagination?.pageSize) {
      off = (pagination?.current - 1) * limit;
      limt = pagination?.pageSize;
      setpage(pagination?.current);
    }
    setsort(sort2);
    setoffset(off);
    setlimit(limt);
    getData({
      sort: sort2,
      ofs: off,
      lim: limt,
    });
  };

  const [deleteModal, setdeleteModal] = useState(false);

  const deleteUser = async (id: string) => {
    if (!loading && deleteModal) {
      setloading(true);
      try {
        axiosInstance
          .get("/orders/delete?id=" + id)
          .then((res: any) => {
            if (res?.status == 200) {
              messageApi.open({
                type: "success",
                content: "Амжилттай устгалаа!",
              });
            }
          })
          .finally(() => {
            setloading(false);
            setselectedItem(null);
            getData();
          });
      } catch (e: any) {
        setloading(false);
        setselectedItem(null);
        messageApi.open({
          type: "error",
          content: "Алдаа! " + e?.toString(),
        });
      }
    }
  };
  useEffect(() => {
    getData({ search: searchValue });
  }, [searchValue, isShowAll, isComplete]);

  const columns = [
    {
      title: "",
      dataIndex: "isCompleted",
      width: 20,
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div>
            {rec?.isCompleted && rec?.completedDate ? (
              <Image
                src={"/icons/circle-check-regular.svg"}
                alt="pause"
                width={15}
                height={15}
                className={` ${
                  rec?.isPaid ? "text-green-400" : "text-red-400"
                } `}
              />
            ) : (
              <Image
                src={"/icons/circle-pause-regular.svg"}
                alt="pause"
                width={15}
                height={15}
                className="text-blue-950"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Статус",
      dataIndex: "status",
      sorter: true,
      width: "3%",
      editable: true,
    },
    {
      title: "Төлбөр",
      dataIndex: "isPaid",
      sorter: true,
      width: "10%",
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div>
            {rec?.isPaid ? "Төлөгдсөн" : "Төлбөр хийгдээгүй"}{" "}
            {rec?.payment_type}
          </div>
        );
      },
    },
    {
      title: "Захиалгын дугаар",
      dataIndex: "order_number",
      width: "15%",
      sorter: true,
      editable: true,
      render: (val: any) => {
        return (
          <div
            // className="cursor-pointer hover:font-bold"
            onClick={() => {
              // router.push("/");
            }}
          >
            {val}
          </div>
        );
      },
    },
    {
      title: "Үүсгэсэн",
      dataIndex: "owner_name",
      width: "15%",
    },
    {
      title: "Захиалсан бараа",
      dataIndex: "",
      width: "15%",
      sorter: true,
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div className="flex flex-col">
            {rec?.order_products?.map((baraa: any, index: number) => {
              return (
                <div key={index}>
                  {baraa?.product_name} ({baraa?.too})
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      title: "Хүргэгч Жолооч",
      dataIndex: "",
      width: "15%",
      render: (rec: any, item: any) => {
        return (
          <>
            {rec?.jolooch?.name} ({rec?.jolooch?.phone})
          </>
        );
      },
    },
    {
      title: "Тоо",
      dataIndex: "too",
      width: "5%",
      sorter: true,
      editable: true,
    },
    {
      title: "Хүргэлтийн дүн",
      dataIndex: "delivery_total_price",
      width: "15%",
      render: (val: number) => {
        return <>{val?.toLocaleString()}</>;
      },
    },
    {
      title: "Нийт дүн",
      dataIndex: "total_price",
      width: "15%",
      sorter: true,
      editable: true,
      render: (val: number) => {
        return <>{val?.toLocaleString()}</>;
      },
    },
    {
      title: "Бүртгэгдсэн огноо",
      dataIndex: "created_at",
      width: "10%",
      sorter: true,
      editable: true,
      render: (value: any) => {
        return <>{dayjs(value).format("YYYY/MM/DD HH:mm:ss")}</>;
      },
    },
    {
      title: "Хаагдсан огноо",
      dataIndex: "completedDate",
      width: "10%",
      sorter: true,
      editable: true,
      render: (value: any) => {
        return <>{value ? dayjs(value).format("YYYY/MM/DD HH:mm:ss") : ""}</>;
      },
    },
    {
      title: "",
      dataIndex: "",
      width: "5%",
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div className="flex gap-2">
            {isdelete.includes(level) ? (
              <Image
                src={"/icons/trash-can-regular.svg"}
                alt="delete"
                width={15}
                height={15}
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  setselectedItem(rec);
                  setdeleteModal(true);
                }}
              />
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full ">
      {contextHolder}
      <div className="flex justify-between">
        <p className="mb-5 text-[12px] font-medium text-blue-950">
          {props?.phone} - дугаартай харилцагчын захиалгын жагсаалтын түүх
        </p>
        <p className="mb-5">Нийт захиалгын тоо:{totalcnt}</p>
        <p className="mb-5">Нийт мөнгөн дүн: {totalsum?.toLocaleString()}₮</p>
      </div>
      <div className="flex justify-between ">
        <div className="flex gap-5 items-center">
          <Form className=" m-0" form={searchForm}>
            <Form.Item
              label={"Хайх: "}
              className="m-0 w-[250px]"
              name={"search"}
            >
              <Input />
            </Form.Item>
          </Form>
          <Select
            className="w-[150px] bg-white"
            defaultValue={isComplete}
            onChange={(val) => {
              setisComplete(val);
            }}
            options={[
              { label: "Бүгд", value: 0 },
              { label: "Хаагдаагүй", value: 1 },
              { label: "Хаагдсан", value: 2 },
            ]}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Button
            className="flex items-center"
            loading={loading}
            onClick={() => {
              getData();
            }}
          >
            <Image
              src={"/icons/rotate-right-solid.svg"}
              alt="refresh"
              width={15}
              height={15}
            />
          </Button>
        </div>
        <Modal
          title="Устгахдаа итгэлтэй байна уу"
          open={deleteModal}
          onOk={() => {
            setdeleteModal(false);
            if (selectedItem) deleteUser(selectedItem._id);
          }}
          onCancel={() => {
            setdeleteModal(false);
            setselectedItem(null);
          }}
          className="!text-black"
          okText="Тийм"
          cancelText="Болих"
        ></Modal>
        <AddOrderModal
          open={insertModal}
          handleCancel={() => {
            setinsertModal(false);
          }}
          handleOk={() => {
            setinsertModal(false);
            getData();
          }}
        />
      </div>
      <OrdersProdutsModal
        open={viewModal}
        handleCancel={() => {
          setviewModal(false);
          setselectedItem(null);
        }}
        data={selectedItem}
      />
      <EditOrderModal
        open={editModal}
        handleCancel={() => {
          seteditModal(false);
          setselectedItem(null);
        }}
        handleOk={() => {
          seteditModal(false);
          setselectedItem(null);
          getData();
        }}
        data={selectedItem}
      />
      <Table
        loading={loading}
        bordered
        key={"_id"}
        onChange={onChange}
        rowClassName={(record: any, index) =>
          dayjs(record?.created_at).format("YYYY/MM/DD") ==
          dayjs().format("YYYY/MM/DD")
            ? "today-row"
            : ""
        }
        className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
        dataSource={tableData}
        onRow={(record: IUser, rowIndex) => {
          return {
            onDoubleClick: (event) => {
              setselectedItem(record);
              setviewModal(true);
            },
          };
        }}
        size="small"
        columns={columns}
        pagination={{
          total: totalcnt,
          pageSize: limit,
          position: ["bottomCenter"],
          current: page,
        }}
      />
    </div>
  );
};
export async function getServerSideProps(context: any) {
  const phone = context?.query?.phone?.toString() ?? "";

  return {
    props: {
      phone,
    },
  };
}
export default OrdersPage;
