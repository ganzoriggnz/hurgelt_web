import axiosInstance from "@/lib/axios";
import { IUser } from "@/types/next";
import {
  Button,
  Divider,
  Form,
  Input,
  InputRef,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  message,
} from "antd";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const EditUserModal = ({
  handleCancel,
  handleOk,
  open,
  data,
}: {
  handleCancel: Function;
  handleOk: Function;
  open: boolean;
  data: IUser;
}) => {
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
  const role = Form.useWatch("role", registerform);
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
      role: `${data?.role} ${data?.level}`,
      username: data?.username,
      name: data?.name,
      phone: data?.phone,
      phone2: data?.phone2,
      email: data?.email,
      isOperator: data?.isOperator,
      isActive: data?.isActive,

      zone: data?.zone,
      duureg: data?.duureg,
      car_mark: data?.car_mark,
      car_number: data?.car_number,
      car_desc: data?.car_desc,
    });
    return () => {};
  }, [data]);

  const submitHanlde = async (values: any) => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/users/update", {
          body: {
            id: data?._id,
            username: values?.username?.toLowerCase(),
            name: values?.name?.trim(),
            phone: values?.phone?.trim(),
            phone2: values?.phone2?.trim(),
            email: values?.email?.trim(),
            avatar: values?.avatar,
            isOperator: values?.isOperator,
            isActive: values?.isActive,
            password: values?.password?.trim(),
            role: values?.role?.split(" ")[0],
            level: values?.role?.split(" ")[1],
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
      <Spin spinning={loading}>
        <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
          Хэрэглэгчийн мэдээлэл засах
        </p>
        <Form
          labelCol={{ span: 7 }}
          form={registerform}
          title="Хэрэглэгчийн мэдээлэл засах"
          onFinish={submitHanlde}
        >
          <div className="flex flex-col ">
            <Form.Item
              name={"username"}
              label="Нэвтрэх нэр"
              rules={[{ required: true, message: "" }]}
            >
              <Input readOnly disabled />
            </Form.Item>
            <Form.Item
              label="Нууц үг"
              name={"password"}
              rules={[
                {
                  min: 5,
                  message: "Нууц үг хамгийн багадаа урт нь 5 байх ёстой.",
                },
              ]}
            >
              <Input />
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
      </Spin>
    </Modal>
  );
};
export default EditUserModal;
