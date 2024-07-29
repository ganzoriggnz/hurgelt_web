import axiosInstance from "@/lib/axios";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import SelectJoloochWidget from "../select_jolooch";
let index = 0;

const AddOrlogoTushaaltModal = ({
  handleCancel,
  handleOk,
  open,
  data,
}: any) => {
  const [registerform] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setloading] = useState(false);
  const dateFormat = "YYYY/MM/DD";
  const [startDate, setStartDate] = useState<Date>(new Date());

  const submitHanlde = async (values: any) => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/orlogo/add", {
          body: {
            jolooch: values?.jolooch ? JSON.parse(values?.jolooch)?._id : null,
            jolooch_username: values?.jolooch
              ? JSON.parse(values?.jolooch)?.username
              : null,
            note: values?.note,
            mungu: values?.mungu,
            tushaasan_date: values?.tushaasan_date,
          },
        })
        .then((response) => {
          if (response?.["status"] === 200) {
            registerform.resetFields();
            registerform.setFieldsValue({
              tushaasan_date: dayjs(startDate),
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

  useEffect(() => {
    registerform.setFieldsValue({
      tushaasan_date: dayjs(startDate),
    });
    return () => {};
  }, []);

  function disabledendDate(current: any) {
    return current > new Date().setHours(23, 59, 59, 99);
  }

  return (
    <Modal
      width={420}
      key={"register"}
      confirmLoading={loading}
      destroyOnClose
      style={{ maxWidth: "100vw !important" }}
      className="items-center  !m-0 text-blue-950"
      onCancel={() => {
        registerform.resetFields();
        registerform.setFieldsValue({
          tushaasan_date: dayjs(startDate),
        });
        handleCancel();
      }}
      centered
      open={open}
      footer={[]}
    >
      {contextHolder}
      <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
        Орлого бүртгэх
      </p>
      <Form
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 16 }}
        form={registerform}
        onFinish={submitHanlde}
      >
        <div className="flex flex-col w-full">
          <SelectJoloochWidget
            name={"jolooch"}
            label="Жолооч"
            wrapperCol={{ span: 16 }}
            rules={[{ required: true, message: "" }]}
          />
          <Form.Item
            label="Мөнгөн дүн"
            name={"mungu"}
            className="w-full"
            rules={[{ required: true, message: "" }]}
            wrapperCol={{ span: 16 }}
          >
            <InputNumber suffix={"₮"} style={{ width: 230 }} />
          </Form.Item>
          <Form.Item name={"tushaasan_date"} label="Тушаасан өдөр">
            <DatePicker
              format={dateFormat}
              defaultValue={dayjs(startDate)}
              style={{ width: 230 }}
              disabledDate={disabledendDate}
            />
          </Form.Item>
          <Form.Item label="Тэмдэглэл" name={"note"}>
            <Input.TextArea rows={5} style={{ width: 230 }} />
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
export default AddOrlogoTushaaltModal;
