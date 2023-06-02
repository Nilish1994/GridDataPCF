import React, { useContext, useEffect, useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { DatePicker, InputNumber, Input, Select, Form, Tooltip, Checkbox } from "antd";
import { Date, List, Numeric, String } from "../constants/Constants";
import { validationHandler } from "./Validation";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

const filteredOptions = (
  data: any,
  column: any,
  validationInputs: any,
  validation: any
) => {
  if (validationInputs?.length > 0 && validation?.allowDuplicates) {
    const filteredCol = validationInputs?.map((item: any) => item[column]);
    const filtered = filteredCol?.filter(
      (item: any) => item != undefined && item != null
    );
    return data?.filter(
      (item: any) => !filtered.some((data: any) => data == item?.value)
    );
  } else {
    return data;
  }
};

export const generateColumns = (
  columnConfig?: any,
  response?: any,
  form?: any,
  initialValues?: any,
  validationInputs?: any,
  messages?:any,
  isDisabled?: any,
  setIsDisabled?:any
) => {
  const dynamicColumns: ColumnsType<any> = columnConfig.map(
    (column: any, num: number) => {
      const { id, order, datatype, data, validationData, width } = column;

      console.log("isDisabled", isDisabled);
      let colWidth = 0;
      let columnRender;
      const title :any = <span className="flex-wrap"><span>{id}</span><Checkbox  defaultChecked={false} onChange={() => setIsDisabled(!isDisabled)}>Lock Data</Checkbox></span>;
      if (datatype === String.name) {
        colWidth = width != undefined && width !=null ? width : 70;
        columnRender = (item: any, record: any, index: number) => {
          return (
            <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              initialValue={response[index]?.[id]}
              rules={[
                {
                  validator: (_: any, value: any) => {
                    return validationHandler(
                      _,
                      value,
                      validationData,
                      false,
                      validationInputs,
                      messages
                    );
                  },
                },
              ]}
            >
              <Tooltip
                title={form.getFieldError([index, `${id}`])?.join(" ")}
              ></Tooltip>
              <Input
                placeholder={"Please insert string"}
                // defaultValue={response[index]?.[id]}
                value={item || response[index]?.[id]}
                disabled={isDisabled}
              />
            </Form.Item>
          );
        };
      } else if (datatype === List.name) {
        colWidth = width != undefined && width !=null ? width : 70;
        columnRender = (item: any, record: any, index: number) => {
          const options: any = filteredOptions(
            data,
            id,
            validationInputs,
            validationData
          );
          return (
            <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              initialValue={response[index]?.[id]}
              rules={[
                { required: validationData?.isMandatory, message: messages?.requiredError },
              ]}
            >
              <Select
                placeholder={"Select a option"}
                options={options}
                value={item || response[index]?.[id]} // new add
                disabled={isDisabled}
              />
            </Form.Item>
          );
        };
      } else if (datatype === Numeric.name) {
        colWidth = width != undefined && width !=null ? width : 40;
        columnRender = (item: any, record: any, index: number) => {
          return (
            <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              initialValue={response[index]?.[id]}
              // validateTrigger={["onChange", "onBlur"]} // Add validateTrigger to trigger validation on input change and blur
              rules={[
                {
                  validator: (_: any, value: any) => {
                    return validationHandler(
                      _,
                      value,
                      validationData,
                      false,
                      validationInputs,
                      messages
                    );
                  },
                },
              ]}
            >
              <InputNumber
                placeholder={"Insert a number"}
                defaultValue={response[index]?.[id]}
                value={item || response[index]?.[id]}
                disabled={isDisabled}
              />
            </Form.Item>
          );
        };
      } else if (datatype === Date.name) {
        colWidth = width != undefined && width !=null ? width : 40;
        columnRender = (item: any, record: any, index: number) => {
          // Parse the default date string into a moment object
          const date: any = moment();
          const defaultDate: string = response[index]?.[id] || date;
          // Parse the default date string into a Dayjs object
          const defaultDayjs: Dayjs = dayjs(defaultDate);
          return (
            <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              rules={[
                {
                  validator: (_: any, value: any) => {
                    return validationHandler(
                      _,
                      moment(value?.$d.toDateString()).format("YYYY-MM-DD"),
                      validationData,
                      true,
                      validationInputs,
                      messages
                    );
                  },
                },
              ]}
              initialValue={defaultDayjs}
            >
              <DatePicker
                placeholder={`Select a date`}
                format={"DD MMM, YYYY"}
                value={item || defaultDayjs}
                disabled={isDisabled}
              />
            </Form.Item>
          );
        };
      }

      return {
        title: datatype === String.name ? title :  id,
        width:colWidth,
        dataIndex: order,
        render: columnRender,
      };
    }
  );

  return dynamicColumns;
};
