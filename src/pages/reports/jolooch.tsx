import axiosInstance from "@/lib/axios";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Table,
  TableProps,
  Typography,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
const { Text } = Typography;
const OrdersPage = () => {
  const router = useRouter();

  const [sort, setsort] = useState<any>({ created_at: -1 });
  const [loading, setloading] = useState(false);
  const [tableData, settableData] = useState<any[]>([]);
  const [tableData2, settableData2] = useState<any[]>([]);
  const [searchForm] = Form.useForm();
  const searchValue = Form.useWatch("search", searchForm);

  const [isShowAll, setisShowAll] = useState(true);
  const [isComplete, setisComplete] = useState(1);

  const [sumTotalList, setSumTotalList] = useState<
    {
      status: string;
      too: number;
      count: number;
      total_price: number;
      delivery_price: number;
    }[]
  >([]);

  dayjs.extend(customParseFormat);
  const nowDate = new Date();
  const current = new Date(nowDate.setHours(0, 0, 0, 0));
  const [startDate, setStartDate] = useState<Date>(
    new Date(current.setDate(current.getDate()))
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

  const getData = async (data?: { sort?: any; search?: string }) => {
    if (!loading) {
      setloading(true);
      try {
        const result = await axiosInstance.post("/orders/joloochtsalin", {
          search: data?.search ?? "",
          start: startDate,
          end: endDate,
          sort: data?.sort ?? sort,
        });
        if (result?.status == 200) {
          settableData(
            result?.data?.totalData?.map((item: any, index: number) => {
              item.key = index * 100;
              return item;
            })
          );
          settableData2(
            result?.data?.totalDataUnComplete?.map(
              (item: any, index: number) => {
                item.key = item._id.id + index * 1000;
                return item;
              }
            )
          );

          // console.log(result?.data?.totalData);
          // console.log(
          //   "totalDataUnComplete:",
          //   result?.data?.totalDataUnComplete
          // );
        }
      } catch (e: any) {
        const toastId = Math.floor(new Date().getTime() / 5000);
        toast.error(`${e?.toString()}`, { toastId });
      }
      setloading(false);
    }
  };
  const onChange: TableProps<any>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    let sort2: any;
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
          case "too":
            sort2 = { too: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "total_price":
            sort2 = { total_price: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "delivery_total_price":
            sort2 = {
              delivery_total_price: sortTemp.order == "descend" ? -1 : 1,
            };
            break;
          default:
            sort2 = { _id: sortTemp.order == "descend" ? -1 : 1 };
            break;
        }
        // console.log("sortTemp:::", sortTemp);
      }
    }
    setsort(sort2);
    getData({
      sort: sort2,
    });
  };

  useEffect(() => {
    if (tableData2.length > 0) {
      let temp: {
        status: string;
        too: number;
        count: number;
        total_price: number;
        delivery_price: number;
      }[] = [];
      for (let index = 0; index < tableData2.length; index++) {
        const element = tableData2[index];

        for (let index = 0; index < element.status.length; index++) {
          const item = element.status[index];
          // console.log(item);
          if (temp.findIndex((e) => e.status == item?._id?.status) > -1) {
            temp[temp.findIndex((e) => e.status == item?._id?.status)].too +=
              item?.too ?? 0;
            temp[temp.findIndex((e) => e.status == item?._id?.status)].count +=
              item?.orderCount ?? 0;
            temp[
              temp.findIndex((e) => e.status == item?._id?.status)
            ].total_price += item?.total_price ?? 0;
            temp[
              temp.findIndex((e) => e.status == item?._id?.status)
            ].delivery_price += item?.delivery_total_price ?? 0;
          } else {
            temp.push({
              status: item?._id?.status,
              too: item?.too ?? 0,
              count: item?.orderCount ?? 0,
              total_price: item?.total_price ?? 0,
              delivery_price: item?.delivery_total_price ?? 0,
            });
          }
        }
      }
      // console.log(temp);
      setSumTotalList(temp);
    }
  }, [tableData2]);

  useEffect(() => {
    getData({ search: searchValue });
  }, [searchValue, isShowAll, isComplete]);

  const columns: any[] = [
    {
      title: "Жолооч",
      dataIndex: "_id",
      sorter: true,
      align: "center",
      render: (rec: any, item: any) => {
        return (
          <Link href={"/users/" + item?.orders[0]?.jolooch} target="_blank">
            {rec}
          </Link>
        );
      },
    },
    {
      title: "Нийт хүргэлтийн тоо",
      dataIndex: "too",
      align: "center",
      render: (rec: any, item: any) => {
        return <div>{item?.orders?.length}</div>;
      },
    },
    {
      title: "Барааны тоо",
      dataIndex: "too",

      sorter: true,
      align: "center",
    },
    {
      title: "Борлуулалтын нийт дүн",
      dataIndex: "total_price",

      align: "center",
      sorter: true,
      render: (val: number) => {
        return <>{val?.toLocaleString()}</>;
      },
    },
    {
      title: "Хүргэлтийн нийт дүн (Цалин)",
      dataIndex: "delivery_total_price",
      sorter: true,

      align: "center",
      render: (val: number) => {
        return <>{val?.toLocaleString()}</>;
      },
    },
    {
      title: "Тушаах дүн",
      dataIndex: "",
      align: "center",
      sorter: true,
      render: (rec: any, item: any) => {
        return (
          <div>
            {(item?.total_price - item?.delivery_total_price)?.toLocaleString()}
          </div>
        );
      },
    },
  ];
  const columns2: any[] = [
    {
      title: "Жолооч",
      dataIndex: "",
      sorter: true,
      align: "center",
      render: (rec: any, item: any) => {
        return (
          <Link href={"/users/" + rec?._id?.id} target="_blank">
            {rec?._id?.jolooch_username}
          </Link>
        );
      },
    },
    {
      title: "Нийт хүргэлтийн тоо",
      dataIndex: "",
      align: "center",
      render: (rec: any, item: any) => {
        let sum = 0;
        return (
          <div key={rec} className="flex justify-between mx-4">
            <div className="flex flex-col">
              {item?.status?.map((iii: any, ind: number) => {
                sum += iii?.orderCount;
                return (
                  <div key={ind + iii._id} className="flex gap-2">
                    <p className="w-[50px] flex">{iii?._id?.status}</p>:
                    <p>{iii?.orderCount?.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
            <p>Нийт: {sum?.toLocaleString()}</p>
          </div>
        );
      },
    },
    {
      title: "Барааны тоо",
      dataIndex: "",
      align: "center",
      render: (rec: any, item: any) => {
        let sum = 0;
        return (
          <div key={rec} className="flex justify-between mx-4">
            <div className="flex flex-col">
              {item?.status?.map((iii: any, ind: number) => {
                sum += iii?.too;
                return (
                  <div key={ind + iii._id} className="flex gap-2">
                    <p className="w-[50px] flex">{iii?._id?.status}</p>:
                    <p>{iii?.too?.toLocaleString()}ш</p>
                  </div>
                );
              })}
            </div>
            <p>Нийт: {sum?.toLocaleString()}ш</p>
          </div>
        );
      },
    },
    {
      title: "Хүргэлтийн нийт дүн (Цалин)",
      dataIndex: "",
      align: "center",
      render: (rec: any, item: any) => {
        let sum = 0;
        return (
          <div key={rec} className="flex justify-between mx-4">
            <div className="flex flex-col">
              {item?.status?.map((iii: any, ind: number) => {
                sum += iii?.delivery_total_price;
                return (
                  <div
                    key={ind + iii._id}
                    className={`flex gap-2 items-center ${
                      iii?._id?.status == "Хүргэгдсэн" ? "font-bold" : ""
                    }`}
                  >
                    <p className="w-[50px] flex">{iii?._id?.status}</p>:
                    <p
                      className={`flex gap-2 ${
                        iii?._id?.status == "Хүргэгдсэн" ? "text-[11px]" : ""
                      }`}
                    >
                      {iii?.delivery_total_price?.toLocaleString()}₮
                    </p>
                  </div>
                );
              })}
            </div>
            <p>Нийт: {sum?.toLocaleString()}₮</p>
          </div>
        );
      },
    },
    {
      title: "Борлуулалтын нийт дүн",
      dataIndex: "",
      align: "center",
      sorter: true,
      render: (rec: any, item: any) => {
        let sum = 0;
        return (
          <div key={rec} className="flex justify-between mx-4">
            <div className="flex flex-col">
              {item?.status?.map((iii: any, ind: number) => {
                sum += iii?.total_price;
                return (
                  <div
                    key={ind + iii._id}
                    className={`flex gap-2 items-center ${
                      iii?._id?.status == "Хүргэгдсэн" ? "font-bold" : ""
                    }`}
                  >
                    <p className="w-[50px] flex">{iii?._id?.status}</p>:
                    <p>{iii?.total_price?.toLocaleString()}₮</p>
                  </div>
                );
              })}
            </div>
            <p>Нийт: {sum?.toLocaleString()}₮</p>
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full ">
      <p className="mb-5">Жолооч нарын цалин болоод борлуулалтын тайлан</p>
      <div className="flex flex-col w-full mb-[10px] border-t">
        <div className="flex w-full border-x justify-between bg-slate-100 text-[11px] font-bold h-[38px] ">
          <div className="border-r px-2 py-2 flex items-center justify-center w-[40%]">
            Нийт :
          </div>
          <div className="border-r px-2 py-2 w-full flex items-center justify-center ">
            Захиалгын нийт тоо
          </div>
          <div className="border-r px-2 py-2 w-full flex items-center justify-center ">
            Барааны нийт тоо
          </div>
          <div className="border-r px-2 py-2 w-full flex items-center justify-center ">
            Хүргэлтийн нийт дүн
          </div>
          <div className=" w-full flex items-center justify-center ">
            Борлуулалтын нийт дүн
          </div>
        </div>
        <div className="flex w-full border justify-between bg-white text-[10px] font-bold">
          <div className="border-r px-2 py-2 flex items-center justify-center w-[40%]">
            {tableData2.length}
          </div>
          <div className="border-r px-2 py-2 w-full flex items-center justify-center ">
            {
              <div className="flex justify-between mx-4 w-full">
                <div className="flex flex-col">
                  {sumTotalList?.map((iii: any, ind: number) => {
                    return (
                      <div key={ind + iii.status} className="flex gap-4">
                        <p className="w-[50px] flex">{iii?.status}</p>:
                        <p>{iii?.count?.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
                <div>
                  Нийт :
                  {sumTotalList?.reduce((a: number, b: any) => a + b.count, 0)}
                </div>
              </div>
            }
          </div>
          <div className="border-r px-2 py-2 w-full flex items-center justify-center ">
            {
              <div className="flex justify-between mx-4 w-full">
                <div className="flex flex-col">
                  {sumTotalList?.map((iii: any, ind: number) => {
                    return (
                      <div key={ind + iii.status} className="flex gap-4">
                        <p className="w-[50px] flex">{iii?.status}</p>:
                        <p>{iii?.too?.toLocaleString()}ш</p>
                      </div>
                    );
                  })}
                </div>
                <div>
                  Нийт :
                  {sumTotalList?.reduce((a: number, b: any) => a + b.too, 0)}ш
                </div>
              </div>
            }
          </div>
          <div className="border-r px-2 py-2 w-full flex items-center justify-center ">
            {
              <div className="flex justify-between mx-4 w-full">
                <div className="flex flex-col">
                  {sumTotalList?.map((iii: any, ind: number) => {
                    return (
                      <div key={ind + iii.status} className="flex gap-4">
                        <p className="w-[50px] flex">{iii?.status}</p>:
                        <p>{iii?.delivery_price?.toLocaleString()}₮</p>
                      </div>
                    );
                  })}
                </div>
                <div>
                  Нийт :
                  {sumTotalList
                    ?.reduce((a: number, b: any) => a + b.delivery_price, 0)
                    ?.toLocaleString()}
                  ₮
                </div>
              </div>
            }
          </div>
          <div className=" w-full flex items-center justify-center ">
            {
              <div className="flex justify-between mx-4 w-full">
                <div className="flex flex-col">
                  {sumTotalList?.map((iii: any, ind: number) => {
                    return (
                      <div key={ind + iii.status} className="flex gap-4">
                        <p className="w-[50px] flex">{iii?.status}</p>:
                        <p>{iii?.total_price?.toLocaleString()}₮</p>
                      </div>
                    );
                  })}
                </div>
                <div>
                  Нийт :
                  {sumTotalList
                    ?.reduce((a: number, b: any) => a + b.total_price, 0)
                    ?.toLocaleString()}
                  ₮
                </div>
              </div>
            }
          </div>
        </div>
      </div>
      <div className="flex justify-between ">
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
              renderExtraFooter={() => "Хамгийн их дээ 7 хоног боломжтой!"}
            />
            <span className={`mx-1`}>~</span>
            <DatePicker
              disabledDate={disabledendDate}
              className="ml-0 md:ml-2 w-[130px]"
              defaultValue={dayjs(endDate)}
              value={dayjs(endDate)}
              format="YYYY/MM/DD"
              renderExtraFooter={() => "Хамгийн их дээ 7 хоног боломжтой!"}
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
          </div>
        </div>
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
      </div>
      <Table
        loading={loading}
        bordered
        key={"key"}
        onChange={onChange}
        className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
        dataSource={tableData}
        size="small"
        columns={columns}
        pagination={false}
        expandable={{
          expandedRowRender: (record, index) => (
            <div key={record?._id + index}>
              <div className=" flex w-full items-center h-[20px] justify-around px-6 border bg-slate-200">
                <p>№</p>
                <p>Захиалгын дугаар</p>
                <p>Захиалагчын утас</p>
                <p>Барааны тоо</p>
                <p>Хүргэлтийн дүн</p>
                <p>Борлуулалтын дүн</p>
              </div>
              {record?.orders?.map((item: any, i: number) => {
                return (
                  <div
                    key={i + item?.order_number}
                    className=" flex w-full items-center h-[20px] justify-around px-6 border-b"
                  >
                    <p>{i + 1}</p>
                    <p>{item?.order_number}</p>
                    <p>{item?.customer_phone}</p>
                    <p>{item?.too?.toLocaleString()}</p>
                    <p>{item?.delivery_total_price?.toLocaleString()}</p>
                    <p>{item?.total_price?.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          ),
          rowExpandable: (record) => record.name !== "Not Expandable",
        }}
        summary={(data: readonly any[]) => {
          let p_orderLength = 0;
          let dtoo = 0;
          let d_price = 0;
          let b_total = 0;

          data.forEach(({ too, delivery_total_price, total_price, orders }) => {
            p_orderLength += orders?.length ?? 0;
            d_price += delivery_total_price ?? 0;
            dtoo += too ?? 0;
            b_total += total_price;
          });
          return (
            <Table.Summary.Row className="bg-gray-100">
              <Table.Summary.Cell index={0} colSpan={2}>
                Хөл дүн:
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text>{p_orderLength}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <Text>{dtoo}ш</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <Text>{b_total?.toLocaleString()}₮</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <Text>{d_price?.toLocaleString()}₮</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}>
                <Text>{(b_total - d_price)?.toLocaleString()}₮</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
      <p className="text-[12px] text-red-700 flex items-center px-16 italic  ">
        Зөвхөн захиалга нь амжилттай дууссан бөгөөд төлбөр нь төлөгдсөн
        захиалгуудыг цалинд бодож байгаа!
      </p>
      <Table
        loading={loading}
        bordered
        key={"key"}
        // onChange={onChange}
        className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
        dataSource={tableData2}
        size="small"
        columns={columns2}
        pagination={false}
      />

      <div className="h-[50px]"></div>
    </div>
  );
};

export default OrdersPage;
