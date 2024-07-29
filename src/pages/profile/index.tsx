import ImgComponent from "@/components/image";
import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { Button, Form, GetProp, Input, Upload } from "antd";
import type { UploadProps } from "antd/es/upload";
import { getCookie, setCookie } from "cookies-next";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const ProfilePage = () => {
  const [file, setFile] = useState<any>();
  const { userContent, changeUserContent } = useData();

  // const onSubmit = async (val: any) => {
  //   console.log(val);
  //   if (!file) return;
  //   try {
  //     const data = new FormData();
  //     data.set("file", file);
  //     const res = await fetch("/upload/", {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //       },
  //       body: data,
  //     });
  //     if (res.status == 200) {
  //       const kkk = await res.json();
  //       console.log("res::::::::::::::::::::::::::::::", kkk?.data[0]);
  //     }
  //   } catch (e: any) {
  //     // Handle errors here
  //     console.error(e);
  //   }
  // };

  const { data: session, status } = useSession();

  const [userData, setuserData] = useState<any>();
  useEffect(() => {
    const token: any = getCookie("accessToken");
    const clientData: any = jwt.decode(token);
    setuserData(clientData?.user);
    return () => {};
  }, []);

  useEffect(() => {
    changepass.setFieldsValue({
      name: userData?.name,
      email: userData?.email,
      phone: userData?.phone,
      phone2: userData?.phone2,
      role: userData?.role,
    });
    return () => {};
  }, [userData]);

  const [changepass] = Form.useForm();
  const [loading, setloading] = useState(false);

  const submitHanlde = async (values: any) => {
    if (!loading) {
      setloading(true);
      const accessToken = getCookie("accessToken");
      try {
        const data = new FormData();
        if (file) data.set("file", file);
        data.append("id", userData?._id);
        data.append("username", userData?.username);
        data.append("name", values?.name);
        data.append("phone2", values?.phone2);
        data.append("oldAvatar", userData?.avatar);
        data.append("email", values?.email);
        data.append("phone", values?.phone);
        if (values?.newpassword) data.append("password", values?.newpassword);
        const res: any = await fetch("/api/updateuser", {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: data,
        }).catch((e) => {
          setloading(false);
        });
        if (res.status == 200) {
          const kkk = await res.json();
          getUser();
          setImageUrl(undefined);
          setFile(undefined);
          if (kkk?.token) setCookie("accessToken", kkk?.token);
          toast.success(kkk?.message ?? "Амжилттай.");
        }
      } catch (e: any) {
        console.error(e);
        setloading(false);
      }
      setloading(false);
    }
  };

  const [imageUrl, setImageUrl] = useState<string>();

  const handleChange: UploadProps["onChange"] = (info) => {
    // console.log(info);
    setFile(info.file.originFileObj);
    if (info.file.status === "uploading") {
      setloading(true);
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as FileType, (url) => {
        setloading(false);
        setImageUrl(url);
      });
    }
  };
  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {loading ? (
        <Image
          src={"/icons/rotate-right-solid.svg"}
          alt="add"
          width={15}
          height={15}
        />
      ) : (
        <Image
          src={"/icons/square-plus-regular.svg"}
          alt="add"
          width={15}
          height={15}
        />
      )}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const getUser = async () => {
    const res: any = await axiosInstance.post(
      "/users/" + userContent?.username,
      {
        method: "GET",
      }
    );
    if (res.status == 200) {
      // console.log(res);
      setuserData(res?.data?.data);
      changeUserContent(res?.data?.data);
    }
  };

  return (
    <div className="h-full w-full p-5">
      <p className="mb-5">Хэрэглэгчийн жагсаалт</p>
      <div className="max-w-[500px] flex flex-col gap-5">
        <Form
          className="gap-3 flex flex-col items-end"
          form={changepass}
          onFinish={submitHanlde}
        >
          <div className="flex w-full justify-center gap-4  items-center">
            <div>
              <Upload
                name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                onChange={handleChange}
              >
                {imageUrl ? (
                  <div className="flex items-center justify-center overflow-hidden rounded-full w-[100px] h-[100px]">
                    <Image
                      src={imageUrl}
                      width={100}
                      height={100}
                      alt="avatar"
                    />
                  </div>
                ) : userContent && userContent?.avatar ? (
                  <div className="flex items-center justify-center overflow-hidden rounded-full w-[100px] h-[100px]">
                    <ImgComponent
                      src={userContent.avatar}
                      width={100}
                      height={100}
                      className=""
                      alt="avatar"
                    />
                  </div>
                ) : (
                  uploadButton
                )}
              </Upload>
            </div>
          </div>
          <div className="flex w-full justify-between gap-4  items-center">
            <p className="w-1/2 font-bold text-right">Нэвтрэх нэр</p>
            <p className="w-1/2">{userData?.username}</p>
          </div>
          <div className="flex w-full justify-between gap-4  items-center">
            <p className="w-1/2 font-bold text-right">Хэрэглэгчийн нэр</p>
            <Form.Item className="m-0 w-1/2" name={"name"}>
              <Input />
            </Form.Item>
          </div>
          <div className="flex w-full justify-between gap-4 items-center">
            <p className="w-1/2 font-bold text-right">Утас</p>
            <Form.Item
              className=" w-1/2 m-0"
              name={"phone"}
              rules={[
                {
                  required: true,
                  message: "Заавал утасны дугаартай байх ёстой!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </div>
          <div className="flex w-full justify-between gap-4 items-center">
            <p className="w-1/2 font-bold text-right">Утас2</p>
            <Form.Item className=" w-1/2 m-0" name={"phone2"}>
              <Input />
            </Form.Item>
          </div>
          <div className="flex w-full justify-between gap-4  items-center">
            <p className="w-1/2 font-bold text-right">Емайл</p>
            <Form.Item className="w-1/2 m-0" name={"email"}>
              <Input />
            </Form.Item>
          </div>
          <div className="flex w-full justify-between gap-4  items-center">
            <p className="w-1/2 font-bold text-right">Эрхийн төрөл</p>
            <p className="w-1/2">{userData?.role}</p>
          </div>
          <div className="flex w-full justify-between gap-4  items-center">
            <p className="w-1/2 font-bold text-right">Бүртгүүлсэн огноо</p>
            <p className="w-1/2">
              {userData
                ? dayjs(userData?.created_at).format("YYYY/MM/DD HH:mm:ss")
                : ""}
            </p>
          </div>
          <div className="flex w-full justify-between gap-4  items-center">
            <p className="w-1/2 font-bold text-right">Сүүлд нэвтэрсэн огноо</p>
            <p className="w-1/2">
              {userData
                ? dayjs(userData?.last_login).format("YYYY/MM/DD HH:mm:ss")
                : ""}
            </p>
          </div>
          <div className="flex w-full justify-between gap-4  items-center">
            <p className="w-1/2 font-bold text-right">Шинэ нууц үг</p>
            <Form.Item className="w-1/2 m-0" name={"newpassword"}>
              <Input.Password />
            </Form.Item>
          </div>
          <Button
            className="w-[150px]"
            onClick={() => {
              changepass.submit();
            }}
          >
            Save
          </Button>
        </Form>
      </div>
    </div>
  );
};
export default ProfilePage;
