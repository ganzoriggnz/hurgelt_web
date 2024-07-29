import axiosInstance from "@/lib/axios";
import { Button, Form, Input, Select } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";

const NotifSentPage = () => {
  const [changepass] = Form.useForm();
  const [loading, setloading] = useState(false);

  const submitHanlde = async (values: any) => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/orders/notifsent", {
          title: values?.title,
          body: values?.body,
          level: values?.level,
        })
        .then((response) => {
          if (response?.["status"] === 200) {
            toast.success("Амжилттай.");
          } else {
            toast.warning(response?.data?.message);
          }
        })
        .catch((e: any) => {
          console.log(e);
          toast.error(
            "Алдаа! " +
              JSON.stringify(e?.response?.data?.message) +
              e?.response?.data?.message?.message
          );
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  return (
    <div className="h-full w-full p-5">
      <p className="mb-5">Мэдэгдэл илгээх</p>
      <div className="max-w-[600px] flex flex-col gap-5">
        <Form
          className="gap-3 flex flex-col items-end"
          form={changepass}
          onFinish={submitHanlde}
        >
          <Form.Item
            label="Эрх"
            name={"level"}
            className="m-0 w-1/2"
            rules={[{ required: true, message: "" }]}
          >
            <Select
              options={[
                { label: "Жолооч", value: 3 },
                { label: "Оператор", value: 2 },
                { label: "Нярав", value: 4 },
                { label: "Админ", value: 1 },
              ]}
            />
          </Form.Item>
          <div className="flex w-full justify-between gap-4  items-center">
            <p className="w-1/2 font-bold text-right">Гарчиг</p>
            <Form.Item className="m-0 w-1/2" name={"title"}>
              <Input />
            </Form.Item>
          </div>
          <div className="flex w-full justify-between gap-4 items-center">
            <p className="w-1/2 font-bold text-right">Агуулга</p>
            <Form.Item className=" w-1/2 m-0" name={"body"}>
              <Input.TextArea rows={5} />
            </Form.Item>
          </div>
          <Button
            className="w-[150px]"
            onClick={() => {
              changepass.submit();
            }}
          >
            Send
          </Button>
        </Form>
      </div>
    </div>
  );
};
export default NotifSentPage;
