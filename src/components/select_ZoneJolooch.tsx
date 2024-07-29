import axiosInstance from "@/lib/axios";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";

const SelectZoneJoloochWidget = (props?: any) => {
  const [joloochList, setjoloochList] = useState<any[]>([]);
  const [joloochList2, setjoloochList2] = useState<any[]>([]);
  const [searchjolooch, setsearchjolooch] = useState<string>();
  const [loading, setloading] = useState(false);

  const getjoloochList = async () => {
    const templist = sessionStorage.getItem("deliveryzoneJoloochList");
    if (templist) {
      setjoloochList(JSON.parse(templist));
    } else {
      if (!loading) {
        setloading(true);
        axiosInstance
          .post("/deliveryzone/getzones", {
            limit: 120,
            level: 3,
            sort: { duureg: -1 },
            search:
              searchjolooch && searchjolooch?.length > 1
                ? searchjolooch
                : props?.duureg ?? "",
          })
          .then((val) => {
            if (val?.["status"] === 200) {
              const list = val?.data?.data;
              var temp: any[] = [];
              for (let index = 0; index < list.length; index++) {
                const e = list[index];
                if (e?.user?.isActive) {
                  temp.push({
                    value: JSON.stringify(e),
                    label:
                      e?.duureg.substring(0, 3) +
                      "-(" +
                      e?.zone.toString() +
                      ")" +
                      ` ${e?.user?.name} (${e?.user?.phone})`,
                  });
                }
              }
              if (temp.length > 0) {
                setjoloochList(temp);
                sessionStorage.setItem(
                  "deliveryzoneJoloochList",
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
          })
          .finally(() => {
            setloading(false);
          });
      }
    }
  };

  useEffect(() => {
    getjoloochList();
    return () => {};
  }, [searchjolooch]);

  useEffect(() => {
    setsearchjolooch(props?.duureg ?? "");
  }, [props?.duureg]);

  return (
    <Form.Item {...props}>
      <Select
        disabled={props?.disabled}
        className="mr-2"
        placeholder={"Жолооч сонгох"}
        style={{ maxWidth: 450, height: 38 }}
        options={joloochList}
        showSearch
        filterOption={(input: string, option: any) => {
          // setsearchjolooch(input);
          return (option?.value ?? "")
            ?.toLowerCase()
            ?.includes(input.toLowerCase());
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

export default SelectZoneJoloochWidget;
