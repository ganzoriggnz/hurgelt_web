import axiosInstance from "@/lib/axios";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";

const SelectJoloochWidget = (props?: any) => {
  const [joloochList, setjoloochList] = useState<any[]>([]);
  const [joloochList2, setjoloochList2] = useState<any[]>([]);
  const [searchjolooch, setsearchjolooch] = useState<string>();

  const getjoloochList = async () => {
    axiosInstance
      .post("/users/getjolooch", {
        limit: 100,
        sort: { username: -1 },
        search: searchjolooch ?? "",
      })
      .then((val) => {
        if (val?.["status"] === 200) {
          const list = val?.data?.data;
          var temp: any[] = [];
          for (let index = 0; index < list.length; index++) {
            const e = list[index];
            if (e?.isActive) {
              temp.push({
                value: JSON.stringify(e),
                label:
                  e?.zone.toString() +
                  "-(" +
                  e?.phone.toString() +
                  ") " +
                  e?.username.toString() +
                  "-" +
                  e?.name?.toString(),
              });
            }
          }

          if (temp.length > 0) setjoloochList(temp);
          else setjoloochList(joloochList2);
          if (joloochList2.length == 0) {
            setjoloochList2(temp);
          }
        }
      })
      .catch((e) => {
        console.log("getbanklist::::::", e);
      });
  };

  useEffect(() => {
    getjoloochList();
    return () => {};
  }, [searchjolooch]);

  return (
    <Form.Item {...props}>
      <Select
        disabled={props?.disabled}
        className="mr-2"
        placeholder={"Жолооч сонгох"}
        style={{ width: 300, height: 38 }}
        options={joloochList}
        showSearch
        filterOption={(input: string, option: any) => {
          setsearchjolooch(input?.toLowerCase());
          return option?.label;
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

export default SelectJoloochWidget;
