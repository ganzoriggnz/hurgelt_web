import { Form, Select } from "antd";

const SelectProductWidget2 = (props?: {
  className?: string;
  name?: any;
  label?: string;
  level?: number[];
  firstvalue?: string;
  optionList?: any[];
  setFirstValue?: Function;
  disabled?: boolean;
}) => {
  return (
    <Form.Item
      name={props?.name}
      label={props?.label}
      className={props?.className}
    >
      <Select
        disabled={props?.disabled}
        placeholder={"Бараа сонгох"}
        style={{ height: 32 }}
        options={props?.optionList}
        value={props?.firstvalue}
        showSearch
        filterOption={(input: string, option: any) => {
          return (option?.label ?? "").toLowerCase()?.includes(input);
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

export default SelectProductWidget2;
