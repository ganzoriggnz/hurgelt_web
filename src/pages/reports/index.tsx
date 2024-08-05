import axiosInstance from "@/lib/axios";
import { IProduct } from "@/types/next";
import { Button, DatePicker, Form, Input, Table, message } from "antd";
import { Excel } from "antd-table-saveas-excel";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const BorluulaltPage = () => {
  const router = useRouter();

  const [loading, setloading] = useState(false);
  const [tableData, settableData] = useState<IProduct[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [totalcnt, settotalcnt] = useState(0);
  const [searchForm] = Form.useForm();
  const searchValue = Form.useWatch("search", searchForm) ?? "";

  dayjs.extend(customParseFormat);
  const nowDate = new Date();
  const current = new Date(nowDate.setHours(0, 0, 0, 0));
  const [startDate, setStartDate] = useState<Date>(
    new Date(current.setDate(current.getDate()-7))
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

  useEffect(() => {
    getData();
  }, []);

  const getData = async (data?: { sort?: any; search?: string }) => {
    if (!loading) {
      setloading(true);
      try {
        const result = await axiosInstance.post("/reports/uldegdel", {
          start: startDate,
          end: endDate,
          search: searchValue,
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
        messageApi.open({
          type: "error",
          content: e?.toString(),
        });
      }
      setloading(false);
    }
  };

  const columns: any[] = [
    {
      title: "Категор",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Код",
      key: "code",
      dataIndex: "code",
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
      dataIndex: "name",
      key: "name",
      editable: true,
    },

    {
      title: "Тайлбар",
      dataIndex: "tailbar",
      key: "tailbar",
      editable: true,
    },
    // {
    //   title: "Үлдэгдэл",
    //   dataIndex: "balance",
    //   key: "balance",
    //   align: "center",
    //   editable: true,
    //   render: (val: number) => {
    //     return <>{val?.toLocaleString()}</>;
    //   },
    // },
    {
      title: "Нийт орлогодсон",
      dataIndex: "orlogodson",
      key: "orlogodson",
      align: "center",
      editable: true,
      render: (val: number) => {
        return <>{val?.toLocaleString()}</>;
      },
    },
    {
      title: "Нийт зарлагадсан",
      dataIndex: "zarlagadsan",
      key: "zarlagadsan",

      align: "center",
      editable: true,
      render: (val: number) => {
        return (
          <div className="flex gap-2 w-full justify-center">
            {val?.toLocaleString()}
          </div>
        );
      },
    },
    {
      title: "Нийт хөдөлгөөн",
      dataIndex: "hudulguun",
      key: "hudulguun",

      align: "center",
      editable: true,
      render: (val: number) => {
        return (
          <div className="flex gap-2 w-full justify-center">
            {val?.toLocaleString()}
          </div>
        );
      },
    },
    {
      title: "Агуулхад үлдсэн",
      dataIndex: "aguulahUldegdel",
      key: "aguulahUldegdel",
      align: "center",

      editable: true,
      render: (val: number) => {
        return (
          <div className="flex gap-2 w-full justify-center">
            {val?.toLocaleString()}
          </div>
        );
      },
    },
    {
      title: "Борлуулагдсан",
      dataIndex: "hurgegdsen",
      key: "hurgegdsen",
      align: "center",

      editable: true,
      render: (val: number) => {
        return (
          <div className="flex gap-2 w-full justify-center">
            {val?.toLocaleString()}
          </div>
        );
      },
    },
    {
      title: "Жолооч нарт үлдсэн",
      dataIndex: "borluultiinUldegdel",
      key: "borluultiinUldegdel",

      editable: true,
      align: "center",
      render: (val: number) => {
        return (
          <div className="flex gap-2 w-full justify-center">
            {val?.toLocaleString()}
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
          Барааны борлуулалтын дараах үлдэгдлийн тайлан
        </p>
        <p className="mb-5">Нийт {totalcnt}</p>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-4">
          <Form
            className="text-[12px] m-0"
            form={searchForm}
            onFinish={() => {
              getData();
            }}
          >
            <Form.Item
              className="m-0 !text-[10px] w-[250px]"
              label={"Хайх: "}
              name={"search"}
            >
              <Input
                placeholder="Кодоор хайх"
                onSubmit={() => {
                  getData();
                }}
              />
            </Form.Item>
          </Form>
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
        </div>
        <div className="flex gap-5 items-center">
          <p className="font-bold ">
            {Math?.round(
              (endDate?.getTime() - startDate?.getTime()) / (1000 * 3600 * 24)
            )}{" "}
            өдөр
          </p>
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
                    .addColumns(columns)
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
      <Table
        loading={loading}
        bordered
        className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
        dataSource={tableData}
        onRow={(record: IProduct, rowIndex) => {
          return {
            onClick: (event) => {
              // console.log("onclickROW:", record);
            }, // click row
            onDoubleClick: (event) => {
              // router.push("/members/" + record.memberId);
            }, // double click row
            onContextMenu: (event) => {},
          };
        }}
        size="small"
        columns={columns}
        rowClassName="editable-row"
        pagination={false}
      />
    </div>
  );
};

export default BorluulaltPage;
