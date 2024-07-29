import AddOrderModal from "@/components/orders/addorder";
import EditOrderModal from "@/components/orders/editorder";
import OrdersProdutsModal from "@/components/orders/order_produts";
import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { IUser } from "@/types/next";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Switch,
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

const OrdersPage = () => {
  const router = useRouter();
  const { userContent } = useData();
  const isAdd = [0, 1, 2];
  const isEdit = [0, 1, 2];
  const isdelete = [0, 1];
  const [level, setlevel] = useState(0);
  useEffect(() => {
    if (userContent) {
      setlevel(userContent.level);
    }
  }, [userContent]);
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
  const operator = Form.useWatch("operator", searchForm);
  const [selectedItem, setselectedItem] = useState<any>(null);

  const [insertModal, setinsertModal] = useState(false);
  const [editModal, seteditModal] = useState(false);
  const [viewModal, setviewModal] = useState(false);

  const [isShowAll, setisShowAll] = useState(false);
  const [isComplete, setisComplete] = useState(1);
  const [status, setstatus] = useState<string>("");

  const [ownerList, setownerList] = useState<any[]>([]);
  const [joloochList, setjoloochList] = useState<any[]>([]);

  const [joloochSearch, setjoloochSearch] = useState<string[]>([]);
  const [productSearch, setproductSearch] = useState<string[]>([]);
  const [ownerSearch, setownerSearch] = useState<string[]>([]);
  const [statusSearch, setstatusSearch] = useState<string[]>([]);

  const [productList, setproductList] = useState<any[]>([]);

  const getProductList = async () => {
    setloading(true);
    axiosInstance
      .post("/products/getproducts", {
        limit: 300,
        sort: { name: 1 },
        search: "",
      })
      .then((val) => {
        if (val?.["status"] === 200) {
          const list = val?.data?.data;
          var temp: any[] = [];
          list.map((e: any) => {
            temp.push({
              value: e?._id,
              text:
                e?.name.toString() +
                " - (" +
                e?.code.toString() +
                ") " +
                (e?.price + e?.delivery_price).toLocaleString(),
            });
          });
          if (temp.length > 0) {
            setproductList(temp);
          }
        }
      })
      .catch((e) => {
        console.log("getProductList::::::", e);
      })
      .finally(() => {
        setloading(false);
      });
  };
  useEffect(() => {
    getUserList();
    getProductList();
    searchForm.setFieldsValue({
      operator: "",
    });
  }, []);

  const getUserList = async () => {
    axiosInstance
      .post("/users/getusers", {
        limit: 200,
        sort: { username: 1 },
        search: "",
      })
      .then((val: any) => {
        if (val?.["status"] === 200) {
          const list = val?.data?.data;
          var temp: any[] = [];
          var temp2: any[] = [];
          list.map((e: any) => {
            if (e?.level == 2)
              temp.push({
                value: e?._id,
                text:
                  e?.username.toString() +
                  " - (" +
                  e?.phone.toString() +
                  ") " +
                  e?.name.toString(),
              });
            else if (e?.level == 3) {
              temp2.push({
                value: e?._id,
                text:
                  e?.username.toString() +
                  " - (" +
                  e?.phone.toString() +
                  ") " +
                  e?.name.toString(),
              });
            }
          });
          setownerList(temp);
          setjoloochList(temp2);
        }
      })
      .catch((e: any) => {
        console.log("getbanklist::::::", e);
      });
  };

  const getData = async (data?: {
    sort?: any;
    search?: string;
    ofs?: number;
    lim?: number;
    joloch?: string[] | null;
    prod?: string[] | null;
    own?: string[] | null;
    sts?: string[];
  }) => {
    if (!loading) {
      setloading(true);
      try {
        const result = await axiosInstance.post("/orders/", {
          offset: data?.ofs ?? offset,
          limit: data?.lim ?? limit,
          sort: data?.sort ?? sort,
          search: data?.search ?? searchValue,
          start: startDate,
          // owner: operator,
          jolooch: data?.joloch ?? joloochSearch,
          product: data?.prod ?? productSearch,
          owner: data?.own ?? ownerSearch,
          end: endDate,
          user: isShowAll ? userContent?.username : null,
          status: data?.sts ?? statusSearch,
          isCompleted: isComplete == 0 ? null : isComplete == 1 ? false : true,
        });
        if (result?.status == 200) {
          settableData(result?.data?.data);
          settotalcnt(result?.data?.totalcnt);
          // toast.success("Success!!!");
        }
      } catch (e: any) {}
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
    let jold: string[] = joloochSearch;
    let prod: string[] = productSearch;
    let ownd: string[] = ownerSearch;
    let stas: string[] = statusSearch;
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
          case "too":
            sort2 = { too: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "jolooch_username":
            sort2 = { jolooch_username: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "owner_name":
            sort2 = { owner_name: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "total_price":
            sort2 = { total_price: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "created_at":
            sort2 = { created_at: sortTemp.order == "descend" ? -1 : 1 };
            break;
          default:
            sort2 = { created_at: sortTemp.order == "descend" ? -1 : 1 };
            break;
        }
        // console.log("sortTemp:::", sortTemp);
      }
      // getData({ sort: sort });
    }

    if (filters) {
      const filterd: any = filters;
      console.log("filters ::::: ", filters);
      jold = filterd?.jolooch_username;
      prod = filterd?.product_list;
      ownd = filterd?.owner_name;
      stas = filterd?.status;
    }

    // console.log("params", pagination, filters, sorter, extra);
    if (pagination && pagination?.current && pagination?.pageSize) {
      off = (pagination?.current - 1) * limit;
      limt = pagination?.pageSize;
      setpage(pagination?.current);
    }
    setproductSearch(prod);
    setjoloochSearch(jold);
    setownerSearch(ownd);
    setstatusSearch(stas);
    setownerList;
    setsort(sort2);
    setoffset(off);
    setlimit(limt);

    getData({
      sort: sort2,
      ofs: off,
      lim: limt,
      joloch: jold,
      prod: prod,
      own: ownd,
      sts: stas,
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
    const tempIsCom = localStorage.getItem("isComplete");
    setisComplete(Number(tempIsCom ?? 1));
  }, []);

  useEffect(() => {
    getData({ search: searchValue });
  }, [
    // searchValue,
    isShowAll,
    // isComplete,
    userContent,
    status,
    // startDate,
    // endDate,
    operator,
  ]);

  const columns = [
    {
      title: "",
      dataIndex: "isCompleted",
      width: 20,
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div>
            {item?.isCompleted ? (
              <Image
                src={"/icons/circle-check-regular.svg"}
                alt="pause"
                width={15}
                height={15}
                className={` ${
                  item?.isPaid ? "text-green-400" : "text-red-400"
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
      // filterMultiple: false,
      filters: [
        { text: "Ноорог", value: "Ноорог" },
        { text: "Бүртгэсэн", value: "Бүртгэсэн" },
        { text: "Цуцлагдсан", value: "Цуцлагдсан" },
        { value: "Хүргэлтэнд", text: "Хүргэлтэнд" },
        { value: "Буцаасан", text: "Буцаасан" },
        { text: "Хүргэгдсэн", value: "Хүргэгдсэн" },
      ],
    },
    {
      title: "Тайлбар",
      dataIndex: "completeTailbar",
      width: "3%",
    },
    // {
    //   title: "Төлбөр",
    //   dataIndex: "isPaid",
    //   sorter: true,
    //   width: "10%",
    //   editable: true,
    //   render: (rec: any, item: any) => {
    //     return (
    //       <div>
    //         {item?.isPaid ? "Төлөгдсөн" : "Төлбөр хийгдээгүй"}
    //         <br />
    //         {item?.payment_type ? `(${item?.payment_type})` : ""}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "Захиалгын дугаар",
    //   dataIndex: "order_number",
    //   width: "8%",
    //   render: (rec: any, item: any) => {
    //     return (
    //       <div>
    //         {item?.order_number}
    //         <br />
    //         {item?.nemelt}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Бүртгэсэн",
      dataIndex: "owner_name",
      sorter: true,
      width: "10%",
      editable: true,
      filter: true,
      filters: ownerList,
      // filterMultiple: false,
    },
    {
      title: "Захиалагчийн утас",
      dataIndex: "customer_phone",
      width: "20%",
      render: (rec: any, item: any) => {
        return (
          <div className="cursor-pointer hover:font-bold flex flex-col">
            <Link href={`/customers/${rec}`} target="_blank">
              {rec}
            </Link>
            <div className="truncate max-w-[180px]">{item?.address}</div>
          </div>
        );
      },
    },
    {
      title: "Захиалсан бараа",
      dataIndex: "product_list",
      width: "15%",
      filter: true,
      filters: productList,
      render: (rec: any, item: any) => {
        return (
          <div className="flex flex-col">
            {item?.order_product?.map((baraa: any, index: number) => {
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
      dataIndex: "jolooch_username",
      width: "15%",
      sorter: true,
      editable: true,
      filter: true,
      filters: joloochList,
      render: (rec: any, item: any) => {
        return (
          <div className="cursor-pointer hover:font-bold flex gap-5">
            <Link href={`/users/` + item?.jolooch?._id} target="_blank">
              {item?.jolooch?.name} ({item?.jolooch?.phone})
            </Link>
          </div>
        );
      },
    },
    // {
    //   title: "Тоо",
    //   dataIndex: "too",
    //   width: "5%",
    //   sorter: true,
    //   editable: true,
    // },
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
      title: "Хүлээж авах огноо",
      dataIndex: "huleejawahudur",
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
      width: "5%",
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div className="flex gap-2 w-[40px]">
            {isEdit.includes(level) ? (
              <Image
                src={"/icons/pen-to-square-regular.svg"}
                alt="edit"
                width={15}
                height={15}
                className="cursor-pointer"
                onClick={() => {
                  setselectedItem(rec);
                  seteditModal(true);
                }}
              />
            ) : (
              <></>
            )}
            |
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
    <div className="h-full text-[12px]">
      {contextHolder}
      <div className="flex justify-between">
        <p className="mb-5 text-[12px] font-medium text-blue-950">
          Захиалгын жагсаалт
        </p>
        <p className="mb-5">Нийт {totalcnt}</p>
      </div>
      <div className="flex flex-wrap justify-between items-center gap-y-2 text-[12px]">
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
          <div>
            <Form
              className="text-[12px]  items-center m-0 flex gap-2"
              form={searchForm}
            >
              <Form.Item
                className="m-0 !text-[10px] w-[200px]"
                label={"Хайх: "}
                name={"search"}
              >
                <Input
                  type="text"
                  placeholder="Утас, Жолоочийн нэр,Дүүрэг,Захиалгын дугаар хайх"
                  onKeyUp={(event) => {
                    if (event?.key == "Enter") {
                      getData();
                    }
                  }}
                />
              </Form.Item>
            </Form>
          </div>
          <Select
            className="w-[150px] bg-white text-[12px]"
            defaultValue={isComplete}
            onChange={(val) => {
              setisComplete(val);
              localStorage.setItem("isComplete", val?.toString());
            }}
            value={isComplete}
            options={[
              { label: "Бүгд", value: 0 },
              { label: "Хаагдаагүй", value: 1 },
              { label: "Хаагдсан", value: 2 },
            ]}
          />
          <button
            className="ml-2 bg-[#001529] font-bold text-white px-8 py-2 rounded-md whitespace-nowrap"
            onClick={() => getData()}
          >
            Хайх
          </button>
          {/* <Select
            className="w-[150px] bg-white text-[12px]"
            defaultValue={status}
            onChange={(val) => {
              setstatus(val);
            }}
            options={[
              { label: "Бүгд", value: "" },
              { label: "Ноорог", value: "Ноорог" },
              { label: "Бүртгэсэн", value: "Бүртгэсэн" },
              { label: "Цуцлагдсан", value: "Цуцлагдсан" },
              { value: "Хүргэлтэнд", label: "Хүргэлтэнд" },
              { value: "Буцаасан", label: "Буцаасан" },
              { label: "Хүргэгдсэн", value: "Хүргэгдсэн" },
            ]}
          /> */}
        </div>
        <div className="flex gap-2 items-center text-[12px]">
          <div className="flex gap-2">
            Зөвхөн миний оруулсан
            <Switch
              className="bg-slate-400"
              value={isShowAll}
              onChange={(val: boolean) => {
                setisShowAll(val);
              }}
            />
          </div>
          <Button
            className="text-[12px]"
            onClick={() => {
              setinsertModal(true);
            }}
          >
            + Захиалга бүртгэх
          </Button>
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
          getDataReset={() => {
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
        className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
        dataSource={tableData}
        onRow={(record: any, rowIndex) => {
          return {
            onClick: (event) => {}, // click row
            onDoubleClick: (event) => {
              if (record?.isCompleted) {
                setselectedItem(record);
                setviewModal(true);
              } else {
                setselectedItem(record);
                seteditModal(true);
              }
            }, // double click row
            onContextMenu: (event) => {},
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
      />
    </div>
  );
};
export default OrdersPage;
