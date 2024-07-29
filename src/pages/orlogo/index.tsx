import AddOrlogoTushaaltModal from "@/components/orlogo/addOrlogo";
import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { IOrlogo } from "@/types/next";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Table,
  TableProps,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
const { Text } = Typography;

const OrlogoTushaaltPage = () => {
  const router = useRouter();

  const { userContent } = useData();
  const isAdd = [0, 1, 2];
  const isdelete = [0, 1];
  const [level, setlevel] = useState(0);
  useEffect(() => {
    if (userContent) {
      setlevel(userContent.level);
    }
  }, [userContent]);
  const [page, setpage] = useState(1);
  const [offset, setoffset] = useState(0);
  const [limit, setlimit] = useState(50);
  const [sort, setsort] = useState<any>({ created_at: -1 });

  const [loading, setloading] = useState(false);
  const [tableData, settableData] = useState<IOrlogo[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [totalcnt, settotalcnt] = useState(0);
  const [searchForm] = Form.useForm();
  const searchValue = Form.useWatch("search", searchForm);
  const [selectedItem, setselectedItem] = useState<any>(null);
  const [insertModal, setinsertModal] = useState(false);
  const [totalSum, settotalSum] = useState<any>({});

  dayjs.extend(customParseFormat);
  const nowDate = new Date();
  const [totalcount, settotalcount] = useState<number>(0);

  const current = new Date(nowDate.setHours(0, 0, 0, 0));
  const [startDate, setStartDate] = useState<Date>(
    new Date(current.setDate(current.getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(nowDate.setHours(23, 59, 59, 99))
  );

  function disabledendDate(current: any) {
    return current > new Date().setHours(23, 59, 59, 99) || startDate > current;
  }
  function disabledstartDate(current: any) {
    return endDate < current;
  }

  const getData = async (data?: {
    sort?: any;
    search?: string;
    ofs?: number;
    lim?: number;
  }) => {
    if (!loading) {
      setloading(true);
      try {
        const result = await axiosInstance.post("/orlogo/getorlogos", {
          offset: data?.ofs ?? offset,
          limit: data?.lim ?? limit,
          sort: data?.sort ?? sort,
          search: data?.search,
          start: startDate,
          end: endDate,
        });
        if (result?.status == 200) {
          settableData(result?.data?.data);
          settotalcnt(result?.data?.totalcnt);
          settotalSum(result?.data?.totalcum);
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
  const onChange: TableProps<IOrlogo>["onChange"] = (
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
          case "note":
            sort2 = { note: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "username":
            sort2 = { jolooch_username: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "mungu":
            sort2 = { mungu: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "tushaasan_date":
            sort2 = { tushaasan_date: sortTemp.order == "descend" ? -1 : 1 };
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
          .get("/orlogo/delete?id=" + id)
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
      title: "Тушаасан өдөр",
      dataIndex: "tushaasan_date",
      key: "tushaasan_date",
      sorter: true,
      width: 150,
      editable: true,
      render: (rec: any, item: IOrlogo) => {
        return (
          <>
            {dayjs(item?.tushaasan_date ?? item?.created_at).format(
              "YYYY/MM/DD"
            )}
          </>
        );
      },
    },
    {
      title: "Дүн",
      dataIndex: "mungu",
      key: "mungu",
      sorter: true,
      width: 150,
      editable: true,
      render: (val: number) => {
        return <>{val?.toLocaleString()}₮</>;
      },
    },
    {
      title: "Жолоочийн нэр",
      dataIndex: "username",
      width: 200,
      sorter: true,
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div className="flex gap-5">
            <div
            // className="cursor-pointer hover:font-bold flex gap-5"
            // onClick={() => {
            //   //TODO joloochiin niit zahialgiin delgrengui jagsaaltiig harah tsonhruu usreh
            //   router.push("/users/" + item?.jolooch?._id);
            // }}
            >
              {item?.jolooch?.username}
            </div>
          </div>
        );
      },
    },

    {
      title: "Утас",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      render: (rec: any, item: IOrlogo) => {
        return (
          <div
          // className="cursor-pointer hover:font-bold"
          // onClick={() => {
          // router.push("/");
          // }}
          >
            {item?.jolooch?.phone}
            {item?.jolooch?.phone2 ? `, ${item?.jolooch?.phone2}` : ""}
          </div>
        );
      },
    },
    {
      title: "Тэмдэглэл",
      dataIndex: "note",
      key: "note",
      width: 200,
      sorter: true,
      editable: true,
    },
    {
      title: "",
      dataIndex: "",
      key: "key",
      width: 30,
      editable: true,
      render: (rec: any, item: any) => {
        if (isdelete.includes(level))
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
        else return <></>;
      },
    },
  ];

  return (
    <div className="h-full ">
      {contextHolder}
      <div className="flex justify-between">
        <p className="mb-5 text-[12px] font-medium text-blue-950">
          Орлого тушаалтын жагсаалт
        </p>
        <p className="mb-5">Нийт {totalcnt}</p>
        {/* <p className="mb-5">Нийт дүн {totalSum?.totalSaleAmount}</p> */}
      </div>
      <div className="flex justify-between">
        <div className="flex gap-4">
          <div className="flex items-center mt-2 md:mt-0">
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
            <button
              className="ml-2 bg-[#001529] font-bold text-white px-8 py-2 rounded-md whitespace-nowrap"
              onClick={() => getData()}
            >
              Хайх
            </button>
          </div>
          <Form className=" m-0" form={searchForm}>
            <Form.Item
              label={"Хайх: "}
              className="m-0 w-[250px]"
              name={"search"}
            >
              <Input />
            </Form.Item>
          </Form>
        </div>
        <div className="flex gap-1">
          {isAdd.includes(level) ? (
            <Button
              className=""
              onClick={() => {
                setinsertModal(true);
              }}
            >
              + Орлого тушаалт бүртгэх
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
          <AddOrlogoTushaaltModal
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
      </div>
      <Table
        loading={loading}
        bordered
        key={"_id"}
        onChange={onChange}
        className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
        dataSource={tableData}
        onRow={(record: IOrlogo, rowIndex) => {
          return {
            onClick: (event) => {}, // click row
            onDoubleClick: (event) => {}, // double click row
            onContextMenu: (event) => {},
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
        summary={(data: readonly any[]) => {
          let dtoo = 0;
          data.forEach(({ mungu }) => {
            dtoo += mungu;
          });
          return (
            <Table.Summary.Row className="bg-gray-100 font-bold text-[12px]">
              <Table.Summary.Cell index={1} colSpan={1}>
                Хөл дүн:
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text>{dtoo?.toLocaleString()}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} colSpan={4}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </div>
  );
};
// export async function getServerSideProps(context: any) {}

export default OrlogoTushaaltPage;
