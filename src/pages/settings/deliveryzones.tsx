import AddDeliveryZoneModal from "@/components/deliveryzones/addZone";
import EditDeliveryZoneModal from "@/components/deliveryzones/editZone";
import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { IDeliveryZone } from "@/types/next";
import { Button, Form, Input, Modal, Table, TableProps, message } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const UsersPage = () => {
  const router = useRouter();

  const { userContent } = useData();
  const isAdd = [0, 1, 2];
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
  const [tableData, settableData] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [totalcnt, settotalcnt] = useState(0);
  const [searchForm] = Form.useForm();
  const searchValue = Form.useWatch("search", searchForm);
  const [selectedItem, setselectedItem] = useState<any>(null);
  const [editModal, seteditModal] = useState(false);
  const [insertModal, setinsertModal] = useState(false);

  const getData = async (data?: {
    sort?: any;
    search?: string;
    ofs?: number;
    lim?: number;
  }) => {
    if (!loading) {
      setloading(true);
      try {
        const result = await axiosInstance.post(
          "/deliveryzone/getjoloochzone",
          {
            offset: data?.ofs ?? offset,
            limit: data?.lim ?? limit,
            sort: data?.sort ?? sort,
            search: data?.search,
          }
        );
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
  const onChange: TableProps<IDeliveryZone>["onChange"] = (
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
          .get("/deliveryzone/delete?id=" + id)
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
      title: "Дүүрэг",
      dataIndex: "duureg",
      key: "duureg",
      sorter: true,
      width: "25%",
      editable: true,
    },
    {
      title: "Бүсийн нэр",
      dataIndex: "zone",
      key: "zone",
      sorter: true,
      width: "25%",
      editable: true,
    },
    {
      title: "Жолоочийн нэр",
      dataIndex: "username",
      width: "30%",
      sorter: true,
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div className="flex gap-5">
            <div
              className="cursor-pointer hover:font-bold flex gap-5"
              onClick={() => {
                //TODO joloochiin niit zahialgiin delgrengui jagsaaltiig harah tsonhruu usreh
                router.push("/users/" + item?.user?._id);
              }}
            >
              {item?.user?.username}
            </div>
            {item?.user?.location ? (
              <Link
                href={`https://www.google.com/maps/search/${
                  JSON.parse(item?.user?.location)?.latitude
                },+${JSON.parse(item?.user?.location)?.longitude}?entry=tts`}
                target="_blank"
              >
                <Image
                  src={"/assets/point.png"}
                  alt=""
                  width={15}
                  height={15}
                />
              </Link>
            ) : (
              <></>
            )}
          </div>
        );
      },
    },

    {
      title: "Утас",
      dataIndex: "phone",
      key: "phone",
      width: "25%",
      sorter: true,
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div
            className="cursor-pointer hover:font-bold"
            onClick={() => {
              router.push("/");
            }}
          >
            {item?.user?.phone}
            {item?.user?.phone2 ? `, ${item?.user?.phone2}` : ""}
          </div>
        );
      },
    },

    {
      title: "Машины марк",
      dataIndex: "car_mark",
      key: "car_mark",
      width: "10%",
    },
    {
      title: "Машины дугаар",
      dataIndex: "car_number",
      width: "10%",
      key: "car_number",
    },
    {
      title: "Машины нэмэлт",
      dataIndex: "car_desc",
      width: "10%",
      key: "car_desc",
    },
    {
      title: "",
      dataIndex: "",
      key: "key",
      width: "5%",
      editable: true,
      render: (rec: any, item: any) => {
        if (isdelete.includes(level))
          return (
            <div className="flex gap-2 w-[50px]">
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
              )}{" "}
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
        else return <></>;
      },
    },
  ];

  return (
    <div className="h-full ">
      {contextHolder}
      <div className="flex justify-between">
        <p className="mb-5 text-[12px] font-medium text-blue-950">
          Хүртгэлийн бүсийн бүртгэл / Бүс хариуцсан жолоочийн бүртгэл
        </p>
        <p className="mb-5">Нийт {totalcnt}</p>
      </div>
      <div className="flex justify-between">
        <Form className=" m-0" form={searchForm}>
          <Form.Item label={"Хайх: "} className="m-0 w-[250px]" name={"search"}>
            <Input />
          </Form.Item>
        </Form>
        <div className="flex gap-1">
          {isAdd.includes(level) ? (
            <Button
              className=""
              onClick={() => {
                setinsertModal(true);
              }}
            >
              + Хэрэглэгч нэмэх
            </Button>
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
        {isAdd.includes(level) ? (
          <AddDeliveryZoneModal
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
        {isEdit.includes(level) ? (
          <EditDeliveryZoneModal
            open={editModal}
            handleCancel={() => {
              setselectedItem(null);
              seteditModal(false);
            }}
            handleOk={() => {
              seteditModal(false);
              setselectedItem(null);
              getData();
            }}
            data={selectedItem}
          />
        ) : (
          <></>
        )}
      </div>
      <Table
        loading={loading}
        bordered
        key={"_id"}
        onChange={onChange}
        className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
        dataSource={tableData}
        onRow={(record: IDeliveryZone, rowIndex) => {
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
