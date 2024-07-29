import axiosInstance from "@/lib/axios";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";

const SelectPadaanUserWidget2 = (props?: {
  className?: string;
  name?: string;
  label?: string;
  level?: number[];
  firstLevel?: number;
  setFirstValue?: Function;
  disabled?: boolean;
  rules?: any;
}) => {
  const [joloochList, setjoloochList] = useState<any[]>([]);
  const [joloochList2, setjoloochList2] = useState<any[]>([]);
  const [searchjolooch, setsearchjolooch] = useState<string>();

  const getUserList = async () => {
    const templist = sessionStorage.getItem(`userListpadaan${props?.level}`);
    if (templist) {
      setjoloochList(JSON.parse(templist));
    } else {
      axiosInstance
        .post("/users/getpadaanuser", {
          limit: 150,
          sort: { username: 1 },
          search: searchjolooch ?? "",
          level: props?.level ?? [3, 4],
        })
        .then((val: any) => {
          if (val?.["status"] === 200) {
            const list = val?.data?.data;
            var temp: any[] = [];
            list.map((e: any) => {
              temp.push({
                value: JSON.stringify(e),
                label:
                  e?.username.toString() +
                  " - (" +
                  e?.phone.toString() +
                  ") " +
                  e?.name.toString(),
              });
            });
            if (temp.length > 0) {
              setjoloochList(temp);
              sessionStorage.setItem(
                `userListpadaan${props?.level}`,
                JSON.stringify(temp)
              );
            } else setjoloochList(joloochList2);
            if (joloochList2.length == 0) {
              setjoloochList2(temp);
            }
          }
        })
        .catch((e) => {
          console.log("getbanklist::::::", e);
        });
    }
  };

  useEffect(() => {
    getUserList();
    return () => {};
  }, [searchjolooch, props]);

  useEffect(() => {
    if (props?.firstLevel && joloochList.length && props?.setFirstValue) {
      const temp = joloochList.filter((a: any) =>
        a?.value?.includes('"role":"нярав"')
      );
      if (temp && temp.length > 0) {
        props?.setFirstValue(temp[0]?.value);
      }
    }
  }, [joloochList, props?.firstLevel]);

  return (
    <Form.Item
      name={props?.name}
      label={props?.label}
      className={props?.className}
      rules={props?.rules}
    >
      <Select
        disabled={props?.disabled}
        className="mr-2"
        placeholder={"Хэрэглэгч сонгох"}
        style={{ width: 230, height: 38 }}
        options={joloochList}
        showSearch
        filterOption={(input: string, option: any) => {
          return (option?.label ?? "").toLowerCase()?.includes(input);
          // setsearchjolooch(input?.toLowerCase());
          // return option?.label;
        }}
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? "")
            .toLowerCase()
            .localeCompare((optionB?.label ?? "").toLowerCase())
        }
      />
    </Form.Item>
  );
};

export default SelectPadaanUserWidget2;
