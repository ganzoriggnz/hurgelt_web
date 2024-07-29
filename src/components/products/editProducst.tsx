import axiosInstance from "@/lib/axios";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Spin,
  Switch,
  message,
} from "antd";
import { useEffect, useState } from "react";

const EditProductModal = ({ handleCancel, handleOk, open, data }: any) => {
  const [editForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setloading] = useState(false);

  useEffect(() => {
    editForm.setFieldsValue({
      code: data?.code,
      name: data?.name,
      tailbar: data?.tailbar,
      image: data?.image,
      price: data?.price,

      delivery_price: data?.delivery_price,
      balance: data?.balance,
      category: data?.category,
      isActive: data?.isActive,
    });
    return () => {};
  }, [data]);

  const price = Form.useWatch("price", editForm) ?? 0;
  const dprice = Form.useWatch("delivery_price", editForm) ?? 0;

  const submitHanlde = async (values: any) => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/products/update", {
          body: {
            id: data?._id,
            code: values?.code,
            name: values?.name,
            tailbar: values?.tailbar,
            image: values?.image,
            price: values?.price,
            delivery_price: values?.delivery_price,
            balance: values?.balance,
            total_price: price + dprice,
            category: values?.category,
            isActive: values?.isActive,
          },
        })
        .then((response) => {
          if (response?.["status"] === 200) {
            editForm.resetFields();
            editForm.setFieldsValue({
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
        editForm.resetFields();
        editForm.setFieldsValue({
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
          Барааны мэдээлэл засах
        </p>
        <Form labelCol={{ span: 7 }} form={editForm} onFinish={submitHanlde}>
          <div className="flex flex-col ">
            <Form.Item
              name={"code"}
              label="Барааны код"
              rules={[{ required: true, message: "" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name={"name"}
              label="Барааны нэр"
              rules={[{ required: true, message: "" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Тайлбар" name={"tailbar"}>
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Үлдэгдэл тоо" name={"balance"}>
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Зарах үнэ"
              name={"price"}
              className="w-full"
              rules={[{ required: true, message: "" }]}
            >
              <InputNumber suffix={"₮"} />
            </Form.Item>

            <Form.Item
              label="Хүргэлтийн үнэ"
              name={"delivery_price"}
              rules={[{ required: true, message: "" }]}
            >
              <InputNumber suffix={"₮"} />
            </Form.Item>
            <Form.Item label="Нийт үнэ:">
              <p> {(price + dprice)?.toLocaleString()}₮</p>
            </Form.Item>
            <Form.Item name={"category"} label="Категор">
              <Input />
            </Form.Item>
            <Form.Item label="Идвэхгүй болгох" name={"isActive"}>
              <Switch className="bg-gray-400" />
            </Form.Item>
          </div>
          <Button
            className="w-1/2 px-1"
            onClick={() => {
              editForm.resetFields();
              handleCancel();
            }}
          >
            Болих
          </Button>
          <Button
            loading={loading}
            className="w-1/2 px-1 hover:text-green-900 hover:bg-white bg-green-900  text-white"
            onClick={editForm.submit}
            htmlType="submit"
          >
            Хадгалах
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
};
export default EditProductModal;
