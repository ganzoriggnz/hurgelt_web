import ImgComponent from "@/components/image";
import { useData } from "@/helper/context";
import axiosInstance, { setAxiosBearerToken } from "@/lib/axios";
import { IUser } from "@/types/next";
import { googleLogout } from "@react-oauth/google";
import {
  Avatar,
  Button,
  ConfigProvider,
  Layout,
  Menu,
  MenuProps,
  message,
} from "antd";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
// import { ItemType, MenuItemType } from "antd/es/menu/hooks/useItems";
import { deleteCookie, getCookie } from "cookies-next";
import jwt from "jsonwebtoken";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
// import { IUserModel } from "@/models/users";

const { Header, Content, Sider } = Layout;

type Props = {
  children: ReactNode;
  hideHeader?: boolean;
};
interface menuPathTypes {
  label: string;
  icon?: any;
  path?: string;
  level: number[];
  subnav: menuPathTypes[];
}

export default function AdminLayout({ children, hideHeader }: Props) {
  const { data: session, status } = useSession();
  const [levelUser, setlevelUser] = useState(-1);
  const [userData, setuserData] = useState<IUser>();
  const { changeUserContent, changeLevel, level, userContent } = useData();

  useEffect(() => {
    (async () => {
      if (status == "authenticated" && session) {
        // console.log("============>status>>", status);
      }
      const token: any = getCookie("accessToken");
      const userdata: any = await jwt.decode(token);
      if (userdata) {
        console.log("userdata", userdata);
        changeUserContent(userdata?.user);
        setuserData(userdata?.user);
        setlevelUser(userdata?.user?.level);
        changeLevel(userdata?.user?.level);
      }
    })();

    return () => {};
  }, [session, status]);

  useEffect(() => {
    const collapsed = localStorage.getItem("collapsed");
    if (collapsed) setCollapsed(collapsed == "true");

    let temp = [];
    for (let index = 0; index < menulist.length; index++) {
      const element = menulist[index];
      if (element.level.includes(levelUser)) {
        element.subnav = element.subnav?.filter((e) =>
          e.level.includes(levelUser)
        );
        temp.push(element);
      }
    }
    return () => {};
  }, [levelUser]);

  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const logout = async () => {
    try {
      const res = await axiosInstance.post("/auth/logout", {});
      if (res.status === 200) {
        localStorage.clear();
        deleteCookie("accessToken");
        sessionStorage.clear();
        setAxiosBearerToken("");
        console.log("[DELETE COOKIE][0] logout [accessToken]");
        googleLogout();
        router.push("/login");
      }
    } catch (e: any) {
      console.log(e);
      messageApi.open({
        type: "error",
        content: e?.toString(),
      });
      router.push("/login");
    }
  };

  const onClickMenu: MenuProps["onClick"] = (e: any) => {
    const keyPath = e?.key?.split("|");
    let path = "/";
    if (keyPath && keyPath.length == 1) {
      console.log(Number.parseInt(keyPath[0]));
      path = menulist[Number.parseInt(keyPath[0])]?.path ?? "/";
    } else if (keyPath && keyPath.length == 2) {
      if (
        menulist[Number.parseInt(keyPath[0])] != null &&
        menulist[Number.parseInt(keyPath[0])] != undefined &&
        menulist[Number.parseInt(keyPath[0])].subnav.length > 0
      )
        path =
          menulist[Number.parseInt(keyPath[0])]?.subnav[
            Number.parseInt(keyPath[1])
          ]?.path ?? "/";
    }
    if (path == "/logout") {
      logout();
    } else router.push(path);
  };
  const menulist: menuPathTypes[] = [
    {
      label: "Захиалга",
      icon: "cart-arrow-down-solid.svg",
      path: "/",
      level: [0, 1, 2],
      subnav: [],
    },
    {
      label: "Хүргэлтийн жолооч",
      icon: "truck-fast-solid.svg",
      path: "/settings/deliveryzones",
      level: [0, 1, 2, 3],
      subnav: [],
    },
    {
      label: "Барааны жагсаалт",
      path: "/products",
      icon: "barcode-solid.svg",
      level: [0, 1, 2, 4],
      subnav: [],
    },

    {
      label: "Тайлан",
      icon: "chart-column-solid.svg",
      level: [0, 1],
      subnav: [
        {
          label: "Борлуулалтын тайлан",
          path: "/reports/duntailan",
          level: [0, 1],
          subnav: [],
        },
        {
          label: "Орлого / зарлага",
          path: "/warehouse",
          level: [0, 1, 4],
          subnav: [],
        },
        {
          label: "Борлуулалт үлдэгдэл",
          path: "/reports",
          level: [0, 1],
          subnav: [],
        },
        {
          label: "Агуулахын үлдэгдэл",
          path: "/reports/uldegdel",
          level: [0, 1, 4],
          subnav: [],
        },
        {
          label: "Жолоочийн цалин",
          path: "/reports/jolooch",
          level: [0, 1],
          subnav: [],
        },
      ],
    },
    {
      label: "Тохиргоо",
      icon: "gear-solid.svg",
      level: [0, 1, 2, 3, 4],
      subnav: [
        {
          label: "Хэрэглэгчийн тохиргоо",
          path: "/users",
          level: [0, 1, 2, 3, 4],
          subnav: [],
        },
        {
          label: userContent?.username + " profile",
          path: "/profile",
          level: [0, 1, 2, 3, 4],
          subnav: [],
        },
      ],
    },
    {
      label: "Мэдэгдэл илгээх",
      icon: "bell-regular.svg",
      path: "/notifsent",
      level: [0, 1],
      subnav: [],
    },
    {
      label: "Гарах",
      icon: "right-from-bracket-solid.svg",
      path: "/logout",
      level: [0, 1, 2, 3, 4],
      subnav: [],
    },
  ];
  return (
    <>
      {contextHolder}
      {hideHeader ? (
        <>{children}</>
      ) : (
        <Layout className="h-full">
          <Header className="h-[50px] text-white flex justify-between items-center text-[12px]">
            <div className="flex items-center">
              <Image
                src={"/assets/guru_logo/startlogo.png"}
                alt="logo"
                width={30}
                height={30}
              />
              <p className="px-5 text-[16px]">Star online shop</p>
            </div>
            <div className="flex gap-2 items-center">
              <div
                className="flex gap-2 items-center cursor-pointer"
                onClick={() => {
                  router.push("/profile");
                }}
              >
                {userContent && userContent?.avatar ? (
                  <div className="flex items-center justify-center overflow-hidden rounded-full w-[40px] h-[40px]">
                    <ImgComponent
                      className=""
                      src={userContent.avatar}
                      width={40}
                      height={40}
                      alt="avatar"
                    />
                  </div>
                ) : (
                  <Avatar
                    size={40}
                    icon={
                      <Image
                        src={`/icons/user-regular.svg`}
                        alt=""
                        width={25}
                        height={25}
                      />
                    }
                  />
                )}

                <p className="mr-5">{userData?.name ?? userData?.username}</p>
              </div>
              <Button
                onClick={logout}
                type="primary"
                className="!bg-white text-[#1b1542] "
              >
                Гарах
              </Button>
            </div>
          </Header>
          <Layout className="dood h-full">
            <Sider
              collapsible
              collapsed={collapsed}
              collapsedWidth={50}
              onCollapse={(value) => {
                localStorage.setItem("collapsed", value?.toString());
                setCollapsed(value);
              }}
              width={170}
              className="bg-white overflow-auto"
              style={{ height: "100%" }}
            >
              <Menu
                mode="inline"
                defaultSelectedKeys={["0"]}
                defaultOpenKeys={["0"]}
                onClick={onClickMenu}
                style={{ height: "100%", borderRight: 0, fontSize: 10 }}
                items={
                  menulist.map((item: menuPathTypes, index: number) => {
                    if (item.level.includes(levelUser)) {
                      return {
                        key: index,
                        icon: (
                          <Image
                            src={`/icons/${item?.icon}`}
                            alt=""
                            width={15}
                            height={15}
                          />
                        ),
                        // icon: React.createElement(item?.icon),
                        label: item?.label,
                        path: item?.path,
                        children:
                          item?.subnav.length > 0
                            ? item?.subnav?.map((nav: any, j: number) => {
                                if (nav.level.includes(levelUser))
                                  return {
                                    key: index + "|" + j,
                                    label: nav?.label,
                                    path: nav?.path,
                                    icon: nav?.icon ? (
                                      <Image
                                        src={`/icons/${nav?.icon}`}
                                        alt=""
                                        width={15}
                                        height={15}
                                      />
                                    ) : null,
                                  };
                              })
                            : null,
                      };
                    }
                  }) as ItemType<MenuItemType>[]
                }
              />
            </Sider>
            <Layout>
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: "#001529",
                    colorText: "#000000",
                    colorTextHeading: "#000000",
                  },
                  components: {
                    Button: {
                      colorPrimary: "#001529",
                    },
                    Table: {
                      headerBg: "#E7ECF0",
                      fontSize: 10,
                      rowSelectedHoverBg: "#EAEAEA",
                      colorTextBase: "#697090",
                    },
                    // Switch: {
                    //   trackHeight: 34,
                    //   handleSize: 30,
                    //   trackMinWidth: 70,
                    //   innerMaxMargin: 35,
                    // },
                    // DatePicker: {
                    //   controlHeight: 40,
                    //   colorBorder: "#DEDEDE",
                    //   fontFamily: "Inter",
                    // },
                    Select: {
                      selectorBg: "transparent",
                      colorBorder: "#DEDEDE",
                      colorText: "#001529",
                      optionSelectedBg: "#DEDEDE",
                      // fontFamily: "Inter",
                      controlHeight: 32,
                    },
                  },
                }}
              >
                <Content
                  className="min-h-full h-full overflow-auto"
                  style={{
                    padding: 24,
                    margin: 0,
                  }}
                >
                  {children}
                </Content>
              </ConfigProvider>
            </Layout>
          </Layout>
        </Layout>
      )}
    </>
  );
}
