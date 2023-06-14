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
  setIsDisabled?:any,
  savedColumn?:any
) => {
  const dynamicColumns: ColumnsType<any> = columnConfig.map(
    (column: any, num: any) => {
      const { id, guid , order, datatype, data, validationData, width } = column;
      const col = savedColumn?.find((item:any)=>item?.guid == guid);
      let colWidth = 0;
      let columnRender;
      let title :any = '';
      console.log("column:  response",column, response)
      console.log("savedColumn", savedColumn, col)
      // console.log("response",response, response?.[1]?.find((item:any)=>item.guid===guid));  
      if (datatype === String.name) {
        console.log("col", col, savedColumn?.find((item:any)=>item?.guid == guid)?.id);
        title = (
          <span key={order} className="flex-wrap"> {id}   
            <Checkbox  
              key={col + num}
              defaultChecked={!col?.iseditable}
              onChange={(e) => setIsDisabled( id, e.target.checked)}>
                Lock Data
            </Checkbox>
          </span>);
        colWidth = width  ? width : 70;
        columnRender = (item: any, record: any, index: number) => {
          return (
            <>
            <Form.Item
              key={col + num} // Add a unique key to force a re-render
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
              <Input
                placeholder={"Please insert string"}
                value={item || response[index]?.[id]}
              />
            </Form.Item>
            </>
          );
        };
      } else if (datatype === List.name) {
        colWidth = width   ? width : 70;
        columnRender = (item: any, record: any, index: number) => {
          const options: any = filteredOptions(
            data,
            id,
            validationInputs,
            validationData
          );
          const hideData = options && options?.some((data:any)=>data?.value == response[index]?.[col?.id]) ;
          return (
            <Form.Item
              key={index} // Add a unique key to force a re-render  
              name={[index, `${id}`]}
              initialValue={hideData ? response[index]?.[id]: null}
              rules={[
                { required: validationData?.isMandatory, message: messages?.requiredError },
              ]}
            >
              <Select
                placeholder={"Select a option"}
                options={options}
                value={item || response[index]?.[col?.id]} // new add
              />
            </Form.Item>
          );
        };
      } else if (datatype === Numeric.name) {
        colWidth = width   ? width : 40;
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
                defaultValue={ response[index]?.[col?.id]}
                value={item || response[index]?.[col?.id]}
              />
            </Form.Item>
          );
        };
      } else if (datatype === Date.name) {
        colWidth = width   ? width : 40;
        columnRender = (item: any, record: any, index: number) => {
          // Parse the default date string into a moment object

          const date: any = ``;
          const defaultDate: string = response[index]?.[id];
          // Parse the default date string into a Dayjs object
          const defaultDayjs: Dayjs = defaultDate ? dayjs(defaultDate) : dayjs(date);
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
              initialValue= { defaultDayjs.isValid() ? defaultDayjs : null}
            >
              <DatePicker
                placeholder={`Select a date`}
                format={"DD MMM, YYYY"}
                defaultValue={date}
                value={defaultDayjs.isValid() ? defaultDayjs : null}
              />
            </Form.Item>
          );
        };
      }

      return {
        title: datatype === String.name ? title : id,    
        width:colWidth,
        dataIndex: order,
        render: columnRender,
      };
    }
  );

  return dynamicColumns;
};
