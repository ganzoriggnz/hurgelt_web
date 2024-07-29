import axiosInstance from "@/lib/axios";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";

const SelectCustomerWidget = (props?: any) => {
  const [customer, setlist] = useState<any[]>([]);
  const [list2, setlist2] = useState<any[]>([]);
  const [search, setSearch] = useState<string>();
  const [loading, setloading] = useState(false);
  const [show, setshow] = useState(false);
  const getData = async () => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/customers/getcustomers", {
          limit: 10,
          sort: { username: -1 },
          search: search ?? "",
        })
        .then((val) => {
          if (val?.["status"] === 200) {
            const list = val?.data?.data;
            var temp: any[] = [];
            list.map((e: any) => {
              temp.push({
                value: JSON.stringify(e),
                label: e?.phone.toString() + " - " + e?.duureg.toString(),
              });
            });
            if (temp.length > 0) setlist(temp);
            else setlist(list2);
            if (list2.length == 0) {
              setlist2(temp);
            }
          }
        })
        .catch((e) => {
          console.log("getcustomerslist::::::", e);
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  useEffect(() => {
    getData();
    return () => {};
  }, [search]);

  const unfocus = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };
  return (
    <Form.Item {...props}>
      <Select
        id="selectItemInput"
        mode="tags"
        maxCount={1}
        maxLength={8}
        maxTagCount={1}
        maxTagTextLength={8}
        disabled={props?.disabled}
        className="mr-2"
        placeholder={"Утас"}
        style={{ maxWidth: 300, height: 38 }}
        options={customer}
        onSelect={(value: any) => {
          unfocus();
        }}
        showSearch
        filterOption={(input: string, option: any) => {
          setSearch(input);
          return (option?.label ?? "").includes(input);
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

export default SelectCustomerWidget;
