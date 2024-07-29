import axiosInstance from "@/lib/axios";
import {
  Button,
  Divider,
  Form,
  Input,
  InputRef,
  Modal,
  Select,
  Space,
  message,
} from "antd";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SelectJoloochWidget from "../select_jolooch";

const AddDeliveryZoneModal = ({ handleCancel, handleOk, open }: any) => {
  const [registerform] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setloading] = useState(false);

  const duureg = Form.useWatch("duureg", registerform);
  const submitHanlde = async (values: any) => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/deliveryzone/add", {
          body: {
            user: values?.user ? JSON.parse(values?.user)?._id : null,
            zone: values?.zone,
            duureg: values?.duureg,
            car_mark: values?.car_mark,
            car_number: values?.car_number,
            car_desc: values?.car_desc,
          },
        })
        .then((response) => {
          if (response?.["status"] === 200) {
            registerform.resetFields();
            handleOk();
          } else {
            messageApi.open({
              type: "warning",
              content: response?.data?.message,
            });
          }
        })
        .catch((e: any) => {
          console.log(e);
          messageApi.open({
            type: "error",
            content:
              "Алдаа! " +
              JSON.stringify(e?.response?.data?.message) +
              e?.response?.data?.message?.message,
          });
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  const [items, setItems] = useState<string[]>([]);
  const [name, setName] = useState("");
  const inputRef = useRef<InputRef>(null);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    setItems([...items, name]);
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const getZones = async () => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .get(`/deliveryzone${duureg ? "?id=" + duureg : ""}`, {})
        .then((response) => {
          if (response?.["status"] === 200) {
            setItems(response?.data?.data ?? []);
          } else {
            messageApi.open({
              type: "warning",
              content: "Алдаа!",
            });
          }
        })
        .catch((e: any) => {
          console.log(e);
          messageApi.open({
            type: "error",
            content:
              "Алдаа! " +
              JSON.stringify(e?.response?.data?.message) +
              e?.response?.data?.message?.message,
          });
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  useEffect(() => {
    getZones();
    return () => {};
  }, [duureg]);

  return (
    <Modal
      width={500}
      key={"register"}
      confirmLoading={loading}
      destroyOnClose
      style={{ maxWidth: "100vw !important" }}
      className="items-center  !m-0 text-blue-950"
      onCancel={() => {
        registerform.resetFields();
        registerform.setFieldsValue({
          role: "жолооч 3",
        });
        handleCancel();
      }}
      centered
      open={open}
      footer={[]}
    >
      {contextHolder}
      <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
        Хүргэлтийн жолооч бүсэд бүртгэх
      </p>
      <Form labelCol={{ span: 7 }} form={registerform} onFinish={submitHanlde}>
        <div className="flex flex-col ">
          <SelectJoloochWidget
            name={"user"}
            label="Жолооч"
            rules={[{ required: true, message: "" }]}
          />

          <Form.Item
            label="Дүүрэг"
            name={"duureg"}
            rules={[{ required: true, message: "" }]}
          >
            <Select
              style={{ width: 300 }}
              placeholder="Дүүрэг сонгох"
              options={[
                { label: "Баянзүрх", value: "Баянзүрх" },
                { label: "Сүхбаатар", value: "Сүхбаатар" },
                { label: "Чингэлтэй", value: "Чингэлтэй" },
                { label: "Хан-Уул", value: "Хан-Уул" },
                { label: "Сонгинохайрхан", value: "Сонгинохайрхан" },
                { label: "Баянгол", value: "Баянгол" },
                { label: "Налайх", value: "Налайх" },
                { label: "Багахангай", value: "Багахангай" },
                { label: "Багануур", value: "Багануур" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Хүргэлтийн бүс"
            name={"zone"}
            rules={[{ required: true, message: "" }]}
          >
            <Select
              style={{ width: 300 }}
              placeholder="Бүсийг сонгох"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Space style={{ padding: "0 8px 4px" }}>
                    <Input
                      placeholder="Шинэ бүсийг оруулах"
                      ref={inputRef}
                      value={name}
                      onChange={onNameChange}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Button
                      type="text"
                      icon={
                        <Image
                          src={"/icons/square-plus-regular.svg"}
                          alt="add"
                          width={15}
                          height={15}
                        />
                      }
                      onClick={addItem}
                      disabled={name == null || name == undefined || name == ""}
                    >
                      Нэмэх
                    </Button>
                  </Space>
                </>
              )}
              options={items.map((item) => ({ label: item, value: item }))}
            />
          </Form.Item>
          <Form.Item name="car_mark" label="Машины марк">
            <Input />
          </Form.Item>
          <Form.Item name="car_number" label="Машины дугаар">
            <Input />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            name="car_desc"
            label="Машины нэмэлт мэдээлэл"
          >
            <Input.TextArea rows={5} />
          </Form.Item>
        </div>

        <Button
          className="w-1/2 px-1"
          onClick={() => {
            registerform.resetFields();
            handleCancel();
          }}
        >
          Болих
        </Button>
        <Button
          loading={loading}
          className="w-1/2 px-1 hover:text-green-900 hover:bg-white bg-green-900  text-white"
          onClick={registerform.submit}
          htmlType="submit"
        >
          Хадгалах
        </Button>
      </Form>
    </Modal>
  );
};
export default AddDeliveryZoneModal;
