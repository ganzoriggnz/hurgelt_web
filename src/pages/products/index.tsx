import AddProductModal from "@/components/products/addProducts";
import EditProductModal from "@/components/products/editProducst";
import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { IProduct } from "@/types/next";
import { Button, Form, Input, Modal, Table, TableProps, message } from "antd";
import { Excel } from "antd-table-saveas-excel";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ProductsPage = () => {
  const router = useRouter();
  const { userContent } = useData();
  const isAdd = [0, 1];
  const isEdit = [0, 1];
  const isdelete = [0, 1];
  const [level, setlevel] = useState(0);

  const [page, setpage] = useState(1);
  const [offset, setoffset] = useState(0);
  const [limit, setlimit] = useState(20);
  const [sort, setsort] = useState<any>({ created_at: -1 });
  const [loading, setloading] = useState(false);
  const [tableData, settableData] = useState<IProduct[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [totalcnt, settotalcnt] = useState(0);
  const [searchForm] = Form.useForm();
  const searchValue = Form.useWatch("search", searchForm);
  const [selectedItem, setselectedItem] = useState<any>(null);

  const [insertModal, setinsertModal] = useState(false);
  const [editModal, seteditModal] = useState(false);

  useEffect(() => {
    if (userContent) {
      setlevel(userContent.level);
    }
  }, [userContent]);

  const getData = async (data?: {
    sort?: any;
    search?: string;
    ofs?: number;
    lim?: number;
  }) => {
    if (!loading) {
      setloading(true);
      try {
        const result = await axiosInstance.post("/products/getproducts", {
          offset: data?.ofs ?? offset,
          limit: data?.lim ?? limit,
          sort: data?.sort ?? sort,
          search: data?.search,
          isActive: true,
        });
        if (result?.status == 200) {
          const temp: any[] = result?.data?.data.map((item: any) => {
            item.key = item._id;
            return item;
          });
          settableData(temp);
          settotalcnt(result?.data?.totalcnt);
        }
      } catch (e: any) {
        messageApi.open({
          type: "error",
          content: e?.toString(),
        });
      }
      setloading(false);
    }
  };

  const onChange: TableProps<IProduct>["onChange"] = (
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
          case "tailbar":
            sort2 = { tailbar: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "name":
            sort2 = { name: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "price":
            sort2 = { price: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "delivery_price":
            sort2 = { delivery_price: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "email":
            sort2 = { email: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "balance":
            sort2 = { balance: sortTemp.order == "descend" ? -1 : 1 };
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
          .get("/products/delete?id=" + id)
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
  }, [searchValue]);

  const columns = [
    {
      title: "Категор",
      dataIndex: "category",
      key: "category",
      width: "8%",
      sorter: true,
      editable: true,
    },
    {
      title: "Код",
      key: "code",
      dataIndex: "code",
      width: "10%",
      sorter: true,
      editable: true,
      render: (val: any) => {
        return (
          <div
            className="cursor-pointer hover:font-bold"
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
      title: "Нэр",
      dataIndex: "",
      key: "name",
      sorter: true,
      width: "15%",
      render: (rec: any, item: any) => {
        return (
          <div className={` ${!rec?.isActive && "line-through"} `}>
            {rec?.name} {rec?.isActive == true}
          </div>
        );
      },
    },

    {
      title: "Тайлбар",
      dataIndex: "tailbar",
      key: "tailbar",
      width: "10%",
      sorter: true,
      editable: true,
    },
    {
      title: "Үлдэгдэл",
      dataIndex: "balance",
      key: "balance",
      sorter: true,
      width: "5%",
      editable: true,
      render: (val: number) => {
        return <>{val?.toLocaleString()}</>;
      },
    },
    {
      title: "Зарах үнэ",
      dataIndex: "price",
      key: "price",
      sorter: true,
      width: "10%",
      hidden: level == 2,
      editable: true,
      render: (val: number) => {
        return <>{val?.toLocaleString()}</>;
      },
    },
    {
      title: "Хүргэлтийн үнэ",
      dataIndex: "delivery_price",
      key: "delivery_price",
      sorter: true,
      hidden: level == 2,

      width: "10%",
      editable: true,
      render: (val: number) => {
        return <>{val?.toLocaleString()}</>;
      },
    },
    {
      title: "Нийт үнэ",
      dataIndex: "",
      key: "id",
      width: "10%",
      editable: true,
      render: (rec: any, item: any) => {
        return <>{(rec?.price + rec?.delivery_price).toLocaleString()}</>;
      },
    },
    {
      title: "Бүртгэгдсэн огноо",
      dataIndex: "created_at",
      key: "created_at",
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
      key: "key",
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div className="flex gap-2">
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
    <div className="h-full ">
      {contextHolder}
      <div className="flex justify-between">
        <p className="mb-5 text-[12px] font-medium text-blue-950">
          Барааны жагсаалт
        </p>
        <p className="mb-5">Нийт {totalcnt}</p>
      </div>
      <div className="flex justify-between">
        <Form className=" m-0" form={searchForm}>
          <Form.Item label={"Хайх: "} className="m-0 w-[250px]" name={"search"}>
            <Input />
          </Form.Item>
        </Form>
        <div className="flex gap-5 items-center">
          {isAdd.includes(level) ? (
            <Button
              className=""
              onClick={() => {
                setinsertModal(true);
              }}
            >
              + Бараа нэмэх
            </Button>
          ) : (
            <></>
          )}
          {isdelete.includes(level) ? (
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
          ) : (
            <></>
          )}
          {isAdd.includes(level) ? (
            <AddProductModal
              open={insertModal}
              handleCancel={() => {
                setinsertModal(false);
              }}
              handleOk={() => {
                setinsertModal(false);
                getData();
              }}
            />
          ) : (
            <></>
          )}
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
          <div className="cursor-pointer">
            <Image
              width={24}
              height={24}
              src="/excel.svg"
              onClick={() => {
                if (tableData?.length > 0) {
                  const excel = new Excel();
                  excel
                    .addSheet(`Sheet1`)
                    .addColumns(columnsExcel)
                    .addDataSource(tableData, { str2Percent: true })
                    .saveAs(`products${new Date().getTime()}.xlsx`);
                } else {
                  messageApi.open({
                    type: "warning",
                    content: "데이터가 없습니다!",
                  });
                }
              }}
              alt=""
            />
          </div>
        </div>
      </div>
      <EditProductModal
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
        onChange={onChange}
        className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
        dataSource={tableData}
        onRow={(record: IProduct, rowIndex) => {
          return {
            onClick: (event) => {
              // console.log("onclickROW:", record);
            }, // click row
            onDoubleClick: (event) => {
              if (isEdit.includes(level)) {
                setselectedItem(record);
                seteditModal(true);
              }
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
        rowClassName="editable-row"
        pagination={{
          total: totalcnt,
          pageSize: limit,
          current: page,
          position: ["bottomCenter"],
        }}
      />
    </div>
  );
};

export default ProductsPage;

const columnsExcel = [
  {
    title: "Категор",
    dataIndex: "category",
    key: "category",
    width: 86,
    sorter: true,
    editable: true,
  },
  {
    title: "Код",
    key: "code",
    dataIndex: "code",
    width: 86,
    sorter: true,
    editable: true,
    render: (val: any) => {
      return <div className="cursor-pointer hover:font-bold">{val}</div>;
    },
  },
  {
    title: "Нэр",
    dataIndex: "name",
    key: "name",
    sorter: true,
    width: 150,
    editable: true,
  },

  {
    title: "Тайлбар",
    dataIndex: "tailbar",
    key: "tailbar",
    width: 150,
    sorter: true,
    editable: true,
  },
  {
    title: "Үлдэгдэл",
    dataIndex: "balance",
    key: "balance",
    sorter: true,
    width: 100,
    editable: true,
    render: (val: number) => {
      return <>{val?.toLocaleString()}</>;
    },
  },
  {
    title: "Зарах үнэ",
    dataIndex: "price",
    key: "price",
    sorter: true,
    width: 100,
    editable: true,
    render: (val: number) => {
      return <>{val?.toLocaleString()}</>;
    },
  },
  {
    title: "Хүргэлтийн үнэ",
    dataIndex: "delivery_price",
    key: "delivery_price",
    sorter: true,
    width: 100,
    editable: true,
    render: (val: number) => {
      return <>{val?.toLocaleString()}</>;
    },
  },
  {
    title: "Нийт үнэ",
    dataIndex: "",
    key: "id",
    sorter: true,
    width: 100,
    editable: true,
    render: (rec: any, item: any) => {
      return <>{(rec?.price + rec?.delivery_price).toLocaleString()}</>;
    },
  },
  {
    title: "Бүртгэгдсэн огноо",
    dataIndex: "created_at",
    key: "created_at",
    width: 150,
    sorter: true,
    editable: true,
    render: (value: any) => {
      return <>{dayjs(value).format("YYYY/MM/DD HH:mm:ss")}</>;
    },
  },
];
