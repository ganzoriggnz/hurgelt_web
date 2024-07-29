import axiosInstance from "@/lib/axios";
import { Button, Form, Input, Modal, Spin, message } from "antd";
import { useEffect, useState } from "react";
const EditUldeglModal = ({ handleCancel, handleOk, open, data }: any) => {
  const [registerform] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setloading] = useState(false);

  console.log(data);

  useEffect(() => {
    registerform.setFieldsValue({
      product: data?.product_name,
      hurgegdsen: data?.hurgegdsen,
      duureg: data?.duureg,
      niitleg_bairshil: data?.niitleg_bairshil,
    });
    return () => {};
  }, [data]);

  const submitHanlde = async (values: any) => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/users/balanceupdate", {
          body: {
            id: data?._id,
            hurgegdsen: values?.hurgegdsen?.trim(),
            orlogodson: values?.orlogodson?.trim(),
            uldsen: values?.uldsen?.trim(),
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
      <Spin spinning={loading}>
        <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
          Барааны үлдэгдэл засах
        </p>
        <Form
          labelCol={{ span: 7 }}
          form={registerform}
          onFinish={submitHanlde}
        >
          <div className="flex flex-col ">
            <Form.Item label="Бараа" name={"product"}>
              <Input disabled type="text" maxLength={8} />
            </Form.Item>
            <Form.Item label="Хүргэсэн" name={"hurgegdsen"}>
              <Input type="number" />
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
export default EditUldeglModal;
