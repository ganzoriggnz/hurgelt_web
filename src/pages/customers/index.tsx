import AddCustomerModal from "@/components/customers/addCustomer";
import EditCustomerModal from "@/components/customers/editCustomer";
import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { IUser } from "@/types/next";
import { Button, Form, Input, Modal, Table, TableProps, message } from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const UsersPage = () => {
  const router = useRouter();

  const { userContent } = useData();
  const isAdd = [0, 1];
  const isEdit = [0, 1];
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
  const [searchForm] = Form.useForm();
  const searchValue = Form.useWatch("search", searchForm);
  const [selectedItem, setselectedItem] = useState<any>(null);

  const [insertModal, setinsertModal] = useState(false);
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
        const result = await axiosInstance.post("/customers/getcustomers", {
          offset: data?.ofs ?? offset,
          limit: data?.lim ?? limit,
          sort: data?.sort ?? sort,
          search: data?.search,
        });
        if (result?.status == 200) {
          settableData(result?.data?.data);
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
          .get("/customers/delete?id=" + id)
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
    // {
    //   title: "Нэвтрэх нэр",
    //   dataIndex: "username",
    //   width: "15%",
    //   sorter: true,
    //   editable: true,
    //   render: (val: any) => {
    //     return (
    //       <div
    //         className="cursor-pointer hover:font-bold"
    //         onClick={() => {
    //           // router.push("/");
    //         }}
    //       >
    //         {val}
    //       </div>
    //     );
    //   },
    // },
    {
      title: "Утас",
      dataIndex: "phone",
      width: "20%",
      sorter: true,
      editable: true,
      render: (val: any) => {
        return (
          <div
            className="cursor-pointer hover:font-bold"
            onClick={() => {
              router.push(`/customers/${val}`);
            }}
          >
            {val}
          </div>
        );
      },
    },
    {
      title: "Дүүрэг",
      dataIndex: "duureg",
      key: "duureg",
      sorter: true,
      width: "15%",
    },
    {
      title: "Дэлгэрэнгүй",
      dataIndex: "address",
      sorter: true,
      width: "15%",
      editable: true,
    },
    {
      title: "Бүртгэгдсэн огноо",
      dataIndex: "created_at",
      width: "10%",
      sorter: true,
      editable: true,
      render: (value: any) => {
        return <>{dayjs(value).format("YYYY/MM/DD")}</>;
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
          Харилцагчын жагсаалт
        </p>
        <p className="mb-5">Нийт {totalcnt}</p>
      </div>
      <div className="flex justify-between">
        <Form className=" m-0" form={searchForm}>
          <Form.Item label={"Хайх: "} className="m-0 w-[250px]" name={"search"}>
            <Input />
          </Form.Item>
        </Form>
        {isAdd.includes(level) ? (
          <Button
            className=""
            onClick={() => {
              setinsertModal(true);
            }}
          >
            + Харилцагч нэмэх
          </Button>
        ) : (
          <></>
        )}
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
        <AddCustomerModal
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
      <EditCustomerModal
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
        onRow={(record: IUser, rowIndex) => {
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
          current: page,
          pageSize: limit,
          position: ["bottomCenter"],
        }}
      />
    </div>
  );
};
// export async function getServerSideProps(context: any) {}

export default UsersPage;
