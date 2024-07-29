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
  Switch,
  message,
} from "antd";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const AddUserModal = ({ handleCancel, handleOk, open, data }: any) => {
  const [registerform] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setloading] = useState(false);

  const [isJolooch, setisJolooch] = useState(true);

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
  useEffect(() => {
    registerform.setFieldsValue({
      role: "жолооч 3",
      isActive: true,
    });
    return () => {};
  }, []);

  const role = Form.useWatch("role", registerform);

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
        .post("/users/register", {
          body: {
            username: values?.username?.toLowerCase()?.trim(),
            name:
              values?.name?.trim() ?? values?.username?.toLowerCase()?.trim(),
            phone: values?.phone?.trim(),
            phone2: values?.phone2?.trim(),
            email: values?.email?.trim(),
            avatar: values?.avatar,
            isOperator: values?.isOperator,
            isActive: values?.isActive,
            password: values?.password?.trim(),
            role: values?.role?.split(" ")[0],
            level: values?.role?.split(" ")[1],
          },
          jolooch: isJolooch && {
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

  useEffect(() => {
    if (role && role == "жолооч 3") {
      setisJolooch(true);
    } else {
      setisJolooch(false);
    }
  }, [role]);

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
        Хэрэглэгч бүртгэх
      </p>
      <Form labelCol={{ span: 7 }} form={registerform} onFinish={submitHanlde}>
        <div className="flex flex-col ">
          <Form.Item
            name={"username"}
            label="Нэвтрэх нэр"
            rules={[{ required: true, message: "" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Нууц үг"
            name={"password"}
            rules={[
              { required: true, message: "" },
              {
                min: 5,
                message: "Нууц үг хамгийн багадаа урт нь 5 байх ёстой.",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Нууц үг давтах"
            name={"password2"}
            rules={[
              { required: true, message: "" },
              {
                min: 5,
                message: "Нууц үг хамгийн багадаа урт нь 5 байх ёстой.",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Утас"
            name={"phone"}
            rules={[
              { required: true, message: "" },
              {
                min: 8,
                message: "Утасны дугаар хамгийн багадаа урт нь 8 байх ёстой.",
              },
              {
                max: 8,
                message: "Утасны дугаар хамгийн багадаа урт нь 8 байх ёстой.",
              },
            ]}
          >
            <Input
              type="number"
              maxLength={8}
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
            label="Утас 2"
            name={"phone2"}
            rules={[
              {
                min: 8,
                message: "Утасны дугаар хамгийн багадаа урт нь 8 байх ёстой.",
              },
              {
                max: 8,
                message: "Утасны дугаар хамгийн багадаа урт нь 8 байх ёстой.",
              },
            ]}
          >
            <Input
              type="number"
              maxLength={8}
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
            label="Эрх"
            name={"role"}
            rules={[{ required: true, message: "" }]}
          >
            <Select
              options={[
                { label: "Жолооч", value: "жолооч 3" },
                { label: "Оператор", value: "оператор 2" },
                { label: "Нярав", value: "нярав 4" },
                { label: "Админ", value: "админ 1" },
              ]}
            />
          </Form.Item>
          <Form.Item name={"name"} label="Хэрэглэгчийн нэр">
            <Input />
          </Form.Item>

          <Form.Item label="Майл" name={"email"}>
            <Input />
          </Form.Item>
          <Form.Item label="оператор эрх" name={"isOperator"}>
            <Switch />
          </Form.Item>
          <Form.Item label="Нэвтрэх эрх" name={"isActive"}>
            <Switch className="bg-gray-400" />
          </Form.Item>
        </div>
        {isJolooch && (
          <div className="flex flex-col w-full">
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
                        disabled={
                          name == null || name == undefined || name == ""
                        }
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
        )}

        <Button
          className="w-1/2 px-1"
          onClick={() => {
            registerform.resetFields();
            registerform.setFieldsValue({
              role: "жолооч 3",
            });
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
export default AddUserModal;
