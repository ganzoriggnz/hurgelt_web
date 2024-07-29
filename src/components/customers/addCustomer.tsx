import axiosInstance from "@/lib/axios";
import { Button, Form, Input, Modal, Select, message } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
let index = 0;
const AddCustomerModal = ({ handleCancel, handleOk, open, data }: any) => {
  const [registerform] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setloading] = useState(false);
  const [isCheck, setisCheck] = useState(true);
  const phone = Form.useWatch("phone", registerform);

  const getCustomer = async () => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post(`/customers/customerinfo`, {
          phone: phone?.trim(),
        })
        .then((response) => {
          if (response?.["status"] === 200 && response?.data?.user) {
            setisCheck(true);
            messageApi.open({
              type: "warning",
              content: "Бүртгэлтэй хэрэглэгч байна!",
            });
          } else {
            setisCheck(false);
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
    if (phone && phone?.length == 8) getCustomer();
    else {
      setisCheck(true);
    }
    return () => {};
  }, [phone]);

  const submitHanlde = async (values: any) => {
    if (values?.password != values?.password2) {
      return messageApi.open({
        type: "error",
        content: "Нууц үг хоорондоо ижил биш байна!",
      });
    }
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/customers/register", {
          body: {
            phone: values?.phone?.trim(),
            address: values?.address,
            duureg: values?.duureg,
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
        handleCancel();
      }}
      centered
      open={open}
      footer={[]}
    >
      {contextHolder}
      <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
        Харилцагч бүртгэх
      </p>
      <Form labelCol={{ span: 7 }} form={registerform} onFinish={submitHanlde}>
        <div className="flex flex-col ">
          <Form.Item
            label="Утас"
            name={"phone"}
            rules={[
              { required: true, message: "" },
              {
                min: 8,
                max: 8,
                message: "Утасны дугаар хамгийн багадаа урт нь 8 байх ёстой.",
              },
            ]}
          >
            <Input
              type="number"
              maxLength={8}
              minLength={8}
              suffix={
                <Image
                  src={`/icons/phone-solid.svg`}
                  alt=""
                  width={14}
                  height={14}
                />
              }
            />
          </Form.Item>

          <Form.Item
            label="Дүүрэг"
            name={"duureg"}
            rules={[{ required: true, message: "" }]}
          >
            <Select
              disabled={isCheck}
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
                { label: "Орон нутаг", value: "Орон нутаг" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Дэлгэрэнгүй" name={"address"}>
            <Input.TextArea disabled={isCheck} />
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
          disabled={isCheck}
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
export default AddCustomerModal;
