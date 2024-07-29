import axiosInstance from "@/lib/axios";
import { Button, Form, Input, Modal, Select, Spin, message } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
const EditCustomerModal = ({ handleCancel, handleOk, open, data }: any) => {
  const [registerform] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setloading] = useState(false);

  useEffect(() => {
    registerform.setFieldsValue({
      phone: data?.phone,
      address: data?.address,
      duureg: data?.duureg,
      niitleg_bairshil: data?.niitleg_bairshil,
    });
    return () => {};
  }, [data]);

  const submitHanlde = async (values: any) => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/customers/update", {
          body: {
            id: data?._id,
            phone: values?.phone?.trim(),
            address: values?.address,
            duureg: values?.duureg,
          },
        })
        .then((response) => {
          if (response?.["status"] === 200) {
            registerform.resetFields();
            registerform.setFieldsValue({
              role: "жолооч 3",
            });
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
      <Spin spinning={loading}>
        <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
          Харилцагчийн мэдээлэл засах
        </p>
        <Form
          labelCol={{ span: 7 }}
          form={registerform}
          onFinish={submitHanlde}
        >
          <div className="flex flex-col ">
            <Form.Item label="Утас" name={"phone"}>
              <Input
                disabled
                type="number"
                suffix={
                  <Image
                    src={`/icons/phone-solid.svg`}
                    alt=""
                    width={14}
                    height={14}
                  />
                }
                maxLength={8}
              />
            </Form.Item>
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
                  { label: "Орон нутаг", value: "Орон нутаг" },
                ]}
              />
            </Form.Item>
            <Form.Item label="Дэлгэрэнгүй" name={"address"}>
              <Input.TextArea />
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
      </Spin>
    </Modal>
  );
};
export default EditCustomerModal;
