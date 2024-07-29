import { useData } from "@/helper/context";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Switch,
} from "antd";
import { useEffect, useState } from "react";

import axiosInstance from "@/lib/axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import SelectProductWidget2 from "../select_product2";
import SelectPadaanUserWidget from "../select_userpadaan";
import SelectPadaanUserWidget2 from "../select_userpadaan2";
let index = 0;

const AddInvoiceJoloochModal = ({
  handleCancel,
  handleOk,
  open,
  data,
}: any) => {
  const router = useRouter();
  const [registerform] = Form.useForm();
  const { userContent } = useData();
  const [totalCnt, settotalCnt] = useState(0);
  const [loading, setloading] = useState(false);
  const invoice_products = Form.useWatch("invoice_products", registerform);
  const type = Form.useWatch("type", registerform);
  const toUser = Form.useWatch("to_user", registerform);
  const [ordersProductList, setordersProductList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);

  const getProductList = async () => {
    const templist = sessionStorage.getItem("productLists");
    if (templist) {
      setProductsList(JSON.parse(templist));
    } else {
      axiosInstance
        .post("/products/getproducts", {
          limit: 200,
          sort: { name: 1 },
          search: "",
        })
        .then((val) => {
          if (val?.["status"] === 200) {
            const list = val?.data?.data;
            var temp: any[] = [];
            list.map((e: any) => {
              temp.push({
                value: JSON.stringify(e),
                label:
                  e?.name.toString() +
                  " - (" +
                  e?.code.toString() +
                  ") " +
                  (e?.price + e?.delivery_price).toLocaleString(),
              });
            });
            if (temp.length > 0) setProductsList(temp);
            sessionStorage.setItem("productLists", JSON.stringify(temp));
          }
        })
        .catch((e) => {
          console.log("getProductList::::::", e);
        });
    }
  };

  useEffect(() => {
    if (productsList.length == 0) {
      getProductList();
    }
  }, []);

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
    return startDate > current;
  }
  function disabledstartDate(current: any) {
    return endDate < current;
  }

  const submitHanlde = async (values: any, isPrint: boolean = false) => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/invoice/add", {
          body: {
            owner: userContent?._id,
            owner_name: userContent?.username,
            type: values?.type,
            invoice_products: invoice_products,
            invoice_product: invoice_products?.map((e: any) => {
              const item = JSON.parse(e?.product);
              return {
                product: item?._id,
                product_code: item?.code,
                product_name: item?.name,
                price: item?.price,
                sale_price: item?.delivery_price + item?.price,
                too: e?.too,
              };
            }),
            total_price: invoice_products?.reduce((a: number, b: any) => {
              const item = JSON.parse(b?.product);
              return (
                a +
                (Number.parseInt(item?.price ?? "0") +
                  Number.parseInt(item?.delivery_price ?? "0")) *
                  Number.parseInt(b?.too ?? "0")
              );
            }, 0),
            too: invoice_products?.reduce((a: number, b: any) => {
              return a + Number.parseInt(b?.too ?? "0");
            }, 0),
            from_user:
              type == "Орлого"
                ? null
                : values?.from_user
                ? JSON.parse(values?.from_user)?._id
                : null,
            from_username:
              type == "Орлого"
                ? null
                : values?.from_user
                ? JSON.parse(values?.from_user)?.username
                : null,
            to_user: values?.to_user ? JSON.parse(values?.to_user)?._id : null,
            to_username: values?.to_user
              ? JSON.parse(values?.to_user)?.username
              : null,
            isPaid: values?.isPaid,
            isCompleted: values?.isCompleted,
          },
        })
        .then((response: any) => {
          if (response?.["status"] === 200) {
            registerform.resetFields();
            registerform.setFieldsValue({
              type: "Зарлага",
              invoice_products: [{}],
            });
            if (isPrint) {
              window.open(
                `/warehouse/print/${response?.data?.newId2}`,
                "_blank"
              );
            }
            handleOk();
          } else {
            toast.warning(response?.data?.message);
          }
        })
        .catch((e: any) => {
          console.log(e);
          const toastId = Math.floor(new Date().getTime() / 5000);
          toast.error(`${e?.toString()}`, { toastId });
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  const fetchJoloochTodayOrders = async (value: any) => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/orders/joloochtodayproducts", {
          id: JSON.parse(value)?._id,
          start: startDate,
          end: endDate,
        })
        .then((response: any) => {
          if (response?.["status"] === 200) {
            console.log(response?.data);
            setordersProductList(response?.data?.data);
            settotalCnt(response?.data?.totalcnt);
            registerform.setFieldsValue({
              invoice_products: response?.data?.data?.map((e: any) => {
                const producd = productsList.filter((a: any) =>
                  a.value?.includes(e?.product?._id)
                );
                return {
                  product:
                    producd && producd.length > 0
                      ? producd[0].value
                      : e?.product?._id,
                  too: e?.too ?? 1,
                  uldegdel: e?.uldegel,
                };
              }) ?? [{ too: 1 }],
            });
          } else {
            // toast.warning(response?.data?.message);
          }
        })
        .catch((e: any) => {
          console.log(e);
          const toastId = Math.floor(new Date().getTime() / 5000);
          toast.error(`${e?.toString()}`, { toastId });
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  useEffect(() => {
    if (toUser && toUser?.length > 0) {
      fetchJoloochTodayOrders(toUser);
    }
  }, [toUser]);

  useEffect(() => {
    registerform.setFieldsValue({
      type: "Зарлага",
      invoice_products: [{ too: 1, uldegdel: 0 }],
    });
    return () => {};
  }, []);

  return (
    <Modal
      width={800}
      key={"register"}
      confirmLoading={loading}
      destroyOnClose
      style={{ maxWidth: "100vw !important" }}
      className="items-center  !m-0 text-blue-950"
      onCancel={() => {
        registerform.resetFields();
        registerform.setFieldsValue({
          type: "Зарлага",
          invoice_products: [{}],
        });
        handleCancel();
      }}
      centered
      open={open}
      footer={[]}
    >
      <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
        Жолоочид өдрийн хүргэлтийн барааг (падаан) зарлага бүртгэх
      </p>
      <div className="flex items-center mb-3">
        <p>Хүргэлтэнд өгөх өдөр</p>
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
          onClick={() => {
            if (toUser) fetchJoloochTodayOrders(toUser);
          }}
        >
          Хайх
        </button>
      </div>
      <Spin spinning={loading}>
        <Form
          labelCol={{ span: 4 }}
          form={registerform}
          onFinish={submitHanlde}
        >
          <div className="flex flex-col ">
            <Form.Item
              label="Төрөл"
              name={"type"}
              rules={[{ required: true, message: "" }]}
            >
              <Select
                style={{ width: 300 }}
                placeholder="Төрлөө сонгох"
                disabled
                options={[
                  { label: "Зарлага", value: "Зарлага" },
                  { label: "Орлого", value: "Орлого" },
                  { label: "Хөдөлгөөн", value: "Хөдөлгөөн" },
                ]}
              />
            </Form.Item>
            <SelectPadaanUserWidget2
              name={"from_user"}
              label="Хэнээс"
              level={type == "Зарлага" ? [4] : [3, 4]}
              firstLevel={4}
              // disabled
              setFirstValue={(val: any) => {
                registerform.setFieldsValue({
                  from_user: val,
                });
              }}
              className={` ${type == "Орлого" ? "hidden" : ""}`}
            />
            <SelectPadaanUserWidget
              name={"to_user"}
              label="Хэнд"
              level={type == "Орлого" ? [4] : type == "Зарлага" ? [3] : [3, 4]}
              rules={[{ required: true, message: "" }]}
            />
            <Form.Item label="Тайлбар" name={"isPaid"}>
              <Input />
            </Form.Item>
            <Form.Item label="Дууссан" name={"isCompleted"}>
              <Switch className="bg-[#c4c4c4]" />
            </Form.Item>
            <div className="w-full flex justify-between items-center">
              <p>Барааны жагсаалт</p>
            </div>
            <div className="flex flex-col w-full mb-5 border p-5">
              <Form.List name="invoice_products">
                {(fields, { add, remove }) => (
                  <>
                    <div className="flex w-full justify-between">
                      <p>Нийт {totalCnt} хүргэлт</p>
                      <Button
                        onClick={() => {
                          add();
                        }}
                        className="h-[34px] w-[55px] text-[25px] pb-2 p-0 ml-6 flex items-center justify-center text-[#030D45]"
                      >
                        +
                      </Button>
                    </div>
                    {fields.map(({ key, name, ...restField }, ind: number) => {
                      return (
                        <div
                          key={key}
                          className="flex justify-between w-full item-center mt-2"
                        >
                          <SelectProductWidget2
                            {...restField}
                            optionList={productsList}
                            name={[name, "product"]}
                            firstvalue={""}
                            className="w-full m-0"
                          />
                          <Form.Item
                            {...restField}
                            name={[name, "uldegdel"]}
                            className="m-0 mx-3"
                          >
                            <Input
                              type="number"
                              placeholder="Үлдэгдэл"
                              disabled
                              min={0}
                              className="text-center w-[60px] text-black disabled:text-black"
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "too"]}
                            className="m-0"
                            rules={[{ required: true, message: "" }]}
                          >
                            <Input
                              type="number"
                              placeholder="Ширхэг"
                              min={0}
                              className="text-center w-[60px]"
                            />
                          </Form.Item>
                          <Button
                            onClick={() => remove(ind)}
                            className="h-[32px] w-[55px] p-0 flex  ml-6 items-center justify-center"
                          >
                            <Image
                              src={"/icons/circle-minus-solid.svg"}
                              alt="remove"
                              width={20}
                              height={20}
                              className="flex h-[18px] w-[18px] items-center justify-center text-[#030D45]"
                            />
                          </Button>
                        </div>
                      );
                    })}
                  </>
                )}
              </Form.List>
            </div>
          </div>

          <Button
            className="w-1/3 px-1"
            onClick={() => {
              registerform.resetFields();
              registerform.setFieldsValue({
                type: "Зарлага",
                invoice_products: [{}],
              });
              handleCancel();
            }}
          >
            Болих
          </Button>
          <Button
            loading={loading}
            className="w-1/3 px-1 hover:text-green-900 hover:bg-white bg-green-900  text-white"
            onClick={registerform.submit}
            htmlType="submit"
          >
            Хадгалах
          </Button>
          <Button
            loading={loading}
            className="w-1/3 px-1 hover:text-green-900 hover:bg-white bg-blue-900  text-white"
            onClick={() => submitHanlde(registerform.getFieldsValue(), true)}
            htmlType="submit"
          >
            Хадгалах & Хэвлэх
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
};
export default AddInvoiceJoloochModal;
