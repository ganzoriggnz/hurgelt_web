import AddInvoiceModal from "@/components/invioces/addInvoince";
import AddInvoiceJoloochModal from "@/components/invioces/addInvoinceJolooch";
import InvoiceProdutsModal from "@/components/invioces/invoince_produts";
import axiosInstance from "@/lib/axios";
import { IUser } from "@/types/next";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Table,
  TableProps,
  message,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const WarehousePage = () => {
  const router = useRouter();

  const isAdd = [0, 1];
  const isdelete = [0, 1];
  const [level, setlevel] = useState(0);
  dayjs.extend(customParseFormat);
  const nowDate = new Date();
  const current = new Date(nowDate.setHours(0, 0, 0, 0));
  const [startDate, setStartDate] = useState<Date>(
    new Date(current.setDate(current.getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(nowDate.setHours(23, 59, 59, 99))
  );

  function disabledendDate(current: any) {
    return startDate > current;
    // return current > new Date().setHours(23, 59, 59, 99) || startDate > current;
  }
  function disabledstartDate(current: any) {
    return endDate < current;
  }
  const [page, setpage] = useState(1);
  const [offset, setoffset] = useState(0);
  const [limit, setlimit] = useState(30);
  const [sort, setsort] = useState<any>({ created_at: -1 });
  const [loading, setloading] = useState(false);
  const [tableData, settableData] = useState<IUser[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [totalcnt, settotalcnt] = useState(0);
  const [searchForm] = Form.useForm();
  const searchValue = Form.useWatch("search", searchForm);
  const searchValueCode = Form.useWatch("searchCode", searchForm);
  const type = Form.useWatch("type", searchForm);
  const [selectedItem, setselectedItem] = useState<any>(null);

  const [tooTotal, settooTotal] = useState(0);

  const [insertModal, setinsertModal] = useState(false);
  const [jolochinsertModal, setjolochinsertModal] = useState(false);
  const [editModal, seteditModal] = useState(false);

  const getData = async (data?: {
    sort?: any;
    search?: string;
    ofs?: number;
    lim?: number;
  }) => {
    if (!loading) {
      setloading(true);
      try {
        const result = await axiosInstance.post("/invoice", {
          offset: data?.ofs ?? offset,
          limit: data?.lim ?? limit,
          sort: data?.sort ?? sort,
          start: startDate,
          end: endDate,
          type: type,
          search: data?.search ?? searchValue ?? "",
          codeSearch: searchValueCode ?? "",
        });
        if (result?.status == 200) {
          settableData(
            result?.data?.data?.map((item: any, index: number) => {
              item.key = index;
              return item;
            })
          );
          settotalcnt(result?.data?.totalcnt);
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
          case "code":
            sort2 = { code: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "desc":
            sort2 = { desc: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "name":
            sort2 = { name: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "price":
            sort2 = { price: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "email":
            sort2 = { email: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "last_login":
            sort2 = { last_login: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "created_at":
            sort2 = { created_at: sortTemp.order == "descend" ? -1 : 1 };
            break;
          default:
            sort2 = { created_at: sortTemp.order == "descend" ? -1 : 1 };
            break;
        }
      }
      // getData({ sort: sort });
    }
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
          .get("/invoice/delete?id=" + id)
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

  // useEffect(() => {
  //   if (tableData.length > 0) {
  //     let temptoo = 0;
  //     for (let index = 0; index < tableData.length; index++) {
  //       const element: any = tableData[index];
  //       for (let ind = 0; ind < element?.invoice_products?.length; ind++) {
  //         const ddddd: any = element?.invoice_products[ind];
  //         temptoo += ddddd?.too;
  //       }
  //     }
  //     settooTotal(temptoo);
  //   }
  // }, [tableData]);

  useEffect(() => {
    getData();
  }, []);

  const columns = [
    {
      title: "Төрөл",
      dataIndex: "type",
      sorter: true,
      width: "10%",
      editable: true,
    },
    {
      title: "Падааны дугаар",
      dataIndex: "invoice_number",
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
      sorter: true,
      width: "15%",
      editable: true,
    },
    {
      title: "Хэнээс",
      dataIndex: "from_username",
      width: "15%",
      sorter: true,
      editable: true,
    },
    {
      title: "Хэнд",
      dataIndex: "to_username",
      width: "15%",
      sorter: true,
      editable: true,
    },
    {
      title: "Тоо",
      dataIndex: "too",
      width: "5%",
      sorter: true,
      editable: true,
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
      title: "",
      dataIndex: "",
      width: "15%",
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div className="flex gap-2 w-[80px]">
            {/* <Image
              src={"/icons/print-solid.svg"}
              className="cursor-pointer w-[15px]"
              alt="print"
              width={15}
              height={15}
            /> */}
            <Link
              className="cursor-pointer w-[20px] h-[20px]"
              href={`/warehouse/print/${rec?._id}`}
              target="_blank"
            >
              <Image
                src={"/icons/print-solid.svg"}
                alt="print"
                width={40}
                height={40}
              />
            </Link>{" "}
            |{" "}
            <Image
              src={"/icons/pen-to-square-regular.svg"}
              alt="edit"
              width={15}
              height={15}
              className={`cursor-pointer hover:text-green-600`}
              onClick={() => {
                setselectedItem(rec);
                seteditModal(true);
              }}
            />{" "}
            |
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
          Агуулахын орлого зарлагын бүртгэл
        </p>

        {/* <p>Барааны тоо: {tooTotal}</p> */}
        <p className="mb-5">Нийт: {totalcnt}</p>
      </div>
      <div className="flex flex-wrap  justify-between">
        <div className="flex gap-1 items-center">
          <DatePicker
            className="ml-0 md:ml-2 w-[130px]"
            defaultValue={dayjs(startDate)}
            value={dayjs(startDate)}
            onChange={(date, dateString) => {
              const d = new Date(dateString as string);
              setStartDate(new Date(d.setHours(0, 0, 0, 0)));
            }}
            disabledDate={disabledstartDate}
            allowClear={false}
            format="YYYY/MM/DD"
          />
          <span className={`mx-1`}>~</span>
          <DatePicker
            disabledDate={disabledendDate}
            className="ml-0 md:ml-2 w-[130px]"
            defaultValue={dayjs(endDate)}
            value={dayjs(endDate)}
            format="YYYY/MM/DD"
            onChange={(date, dateString) => {
              const d = new Date(dateString as string);
              setEndDate(new Date(d.setHours(23, 59, 59, 0)));
            }}
            allowClear={false}
          />
        </div>
        <Form
          className=" m-0"
          form={searchForm}
          rootClassName="flex flex-wrap gap-3 "
        >
          <Form.Item name={"type"} className="m-0 w-[250px]" label="Төрөл">
            <Select
              value={""}
              options={[
                { value: "", label: "Бүгд" },
                { value: "Зарлага", label: "Зарлага" },
                { value: "Орлого", label: "Орлого" },
                { value: "Хөдөлгөөн", label: "Хөдөлгөөн" },
              ]}
            />
          </Form.Item>
          <Form.Item label={"Хайх: "} className="m-0 w-[250px]" name={"search"}>
            <Input
              onKeyUp={(event) => {
                if (event?.key == "Enter") {
                  getData();
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label={"Барааны код: "}
            className="m-0 w-[250px]"
            name={"searchCode"}
          >
            <Input
              onKeyUp={(event) => {
                if (event?.key == "Enter") {
                  getData();
                }
              }}
            />
          </Form.Item>
          <button
            className="ml-2 bg-[#001529] h-[31px] font-bold text-white px-8 py-2 rounded-md whitespace-nowrap"
            onClick={() => getData()}
          >
            Хайх
          </button>
        </Form>

        <div className="flex gap-2">
          <Button
            className=""
            onClick={() => {
              setjolochinsertModal(true);
            }}
          >
            + Жолооч падаан
          </Button>
          <Button
            className=""
            onClick={() => {
              setinsertModal(true);
            }}
          >
            + Падаан үүсгэх нэмэх
          </Button>
          <Button
            className="flex items-center"
            loading={loading}
            onClick={() => {
              getData();
            }}
          >
            {!loading && (
              <Image
                src={"/icons/rotate-right-solid.svg"}
                alt="refresh"
                width={15}
                height={15}
              />
            )}
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
        <AddInvoiceModal
          open={insertModal}
          handleCancel={() => {
            setinsertModal(false);
          }}
          handleOk={() => {
            setinsertModal(false);
            getData();
          }}
        />
        <AddInvoiceJoloochModal
          open={jolochinsertModal}
          handleCancel={() => {
            setjolochinsertModal(false);
          }}
          handleOk={() => {
            setjolochinsertModal(false);
            getData();
          }}
        />
      </div>
      <InvoiceProdutsModal
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
        key={"key"}
        onChange={onChange}
        className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
        dataSource={tableData}
        onRow={(record: IUser, rowIndex) => {
          return {
            onClick: (event) => {
              // console.log("onclickROW:", record);
            }, // click row
            onDoubleClick: (event) => {
              setselectedItem(record);
              seteditModal(true);
              // router.push("/members/" + record.memberId);
            }, // double click row
            onContextMenu: (event) => {}, // right button click row
            // onMouseEnter: (event) => {
            //   console.log("onMouseEnter :", record.key);
            // }, // mouse enter row
            // onMouseLeave: (event) => {
            //   console.log("onMouseLeave :", record.key);
            // }, // mouse leave row
          };
        }}
        size="small"
        columns={columns}
        rowClassName={(record: any, index) =>
          dayjs(record?.created_at).format("YYYY/MM/DD") ==
          dayjs().format("YYYY/MM/DD")
            ? "today-row"
            : ""
        }
        pagination={{
          total: totalcnt,
          pageSize: limit,
          position: ["bottomCenter"],
          current: page,
        }}
        expandable={{
          expandedRowRender: (record: any) => (
            <div key={record?._id} className="flex max-w-[800px]">
              <div className="border w-full  flex flex-col justify-start">
                <div className="flex w-full justify-between font-semibold border-b pb-2 bg-slate-200 p-2">
                  <p className="max-w-[110px] w-[90px] text-left">Код</p>
                  <p className="min-w-[130px] text-center">Барааны нэр</p>
                  <p className="min-w-[50px] text-right">Тоо</p>
                  <p className="min-w-[85px] text-right">Зарах үнэ</p>
                  <p className="min-w-[80px] text-right">Бүгд</p>
                </div>
                {record?.invoice_products?.map((item: any, index: number) => {
                  return (
                    <div className="flex justify-between py-2 p-2" key={index}>
                      <p className="max-w-[110px] w-[80px] text-left">
                        {item?.product_code}
                      </p>
                      <p className="min-w-[130px] text-left">
                        {item?.product_name}
                      </p>
                      <p className="min-w-[50px] text-right"> {item?.too}ш</p>
                      <p className="min-w-[85px] text-right">
                        {item?.sale_price?.toLocaleString()}₮
                      </p>
                      <p className="min-w-[80px] text-right">
                        {(item?.sale_price * item?.too).toLocaleString()}₮
                      </p>
                    </div>
                  );
                })}
                <div className="flex justify-between py-1 border-t font-bold bg-slate-200 p-2">
                  <p className="min-w-[90px] text-left">Нийт</p>
                  <p className="min-w-[130px] text-left"></p>
                  <p className="min-w-[50px] text-right">{record?.too}ш</p>
                  <p className="min-w-[85px] text-right">
                    {record?.invoice_products
                      ?.reduce((a: number, b: any) => a + b.sale_price, 0)
                      .toLocaleString()}
                    ₮
                  </p>
                  <p className="min-w-[80px] text-right">
                    {record?.invoice_products
                      ?.reduce(
                        (a: number, b: any) => a + b.sale_price * b.too,
                        0
                      )
                      .toLocaleString()}
                    ₮
                  </p>
                </div>
              </div>
            </div>
          ),
          rowExpandable: (record) => record.name !== "Not Expandable",
        }}
      />
    </div>
  );
};
export async function getServerSideProps(context: any) {
  return {
    props: {},
  };
}

export default WarehousePage;
