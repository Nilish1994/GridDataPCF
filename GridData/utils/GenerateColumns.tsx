import React, { useContext, useEffect, useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  DatePicker,
  InputNumber,
  Input,
  Table,
  Select,
  Typography,
  Form,
} from "antd";
import { Date, List, Numeric, String } from "../constants/Constants";
import { ValidateStringLength, validateInputNumber, validationHandler } from "./Validation";
import dayjs, { Dayjs } from 'dayjs';
import moment from "moment";

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

const filteredOptions = (data:any,column:any,validationInputs:any,validation:any) => {
  // console.log("filteredCol", data, column, validationInputs)
  if(validationInputs?.length>0 && validation?.allowDuplicates){
      const filteredCol = validationInputs?.map((item:any)=>item[column]);
      const filtered = filteredCol?.filter((item:any)=>item !=undefined && item !=null);
      console.log("filteredCol",filtered, data, column, validationInputs)
      console.log(data?.filter((item:any)=> !filtered.some((data:any)=>data==item?.value)))
      return data?.filter((item:any)=> !filtered.some((data:any)=>data==item?.value));
  }else{
    return data ;
  }

}

export const generateColumns = (
  columnConfig?: any,
  response?: any,
  form?: any,
  initialValues?: any,
  validationInputs?:any,
) => {

  const dynamicColumns: ColumnsType<any> = columnConfig.map((column: any,num:number) => {

    const { id, order, datatype, data, validationData } = column;

    console.log('come ======z. ', id, data, form?.getFieldsValue(`${id}`));
    
    
    let columnRender;
    if (datatype === String.name) {
      columnRender = (item:any, record: any, index:number) => {
        console.log('item ======> ', item || response[index]?.[id], [index, `${id}`]);
        // const nameField = `${index}${id}`; // [index, `${id}`]  `${index}${id}`
        // // form.setFieldsValue({
        // //   [nameField] : response[index]?.[id]
        // // });

        // // initialValues = {
        // //   [nameField] : response[index]?.[id]
        // // }
        
        return (
          <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              initialValue={response[index]?.[id]}
              rules={[
                // { required: true, message: "Required" },
                { validator: (_: any, value: any) =>  {
                  console.log('value ))))) =====> ', value, _);
                  console.log("loololoollo =======> ", validationInputs, response);
                  return validationHandler(_, value, validationData, false, validationInputs)
                }},
              ]}
            >
              <Input
                placeholder={"Please insert string"}
                // defaultValue={response[index]?.[id]}
                value={item || response[index]?.[id]}
                // onChange={e => 
                //   handleInputChange(e, response.key, index)
                // }
              />
            </Form.Item>
        )
      }

    } else if (datatype === List.name) {
      columnRender = (item: any, record: any,index:number) =>  {
        // const nameField = `${index}${id}`;
        // // form.setFieldsValue({
        // //   [nameField] : response[index]?.[id]
        // // });
        // // initialValues = {
        // //   [nameField] : response[index]?.[id]
        // // }
        const options:any = filteredOptions(data,id,validationInputs,validationData);
        return (
          <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              initialValue={response[index]?.[id]}
              rules={[
                { required: validationData?.isMandatory, message: "Required" },                
              ]}
            >
          <Select
            placeholder={"Select a option"}
            options={options}
            value={item || response[index]?.[id]} // new add
          />
          </Form.Item>
        )
      }
    } else if (datatype === Numeric.name) {
      columnRender = (item: any, record: any,index:number) => {
        // const nameField = `${index}${id}`;
        // // form.setFieldsValue({
        // //   [nameField] : response[index]?.[id]
        // // });
        // // initialValues = {
        // //   [nameField] : response[index]?.[id]
        // // }
        return (
          <Form.Item
            key={index} // Add a unique key to force a re-render
            name={[index, `${id}`]}
            initialValue={response[index]?.[id]}
            // rules={[
            //   { validator: validateInputNumber },
            // ]}
            rules={[
              // { required: true, message: "Required" },
              { validator: (_: any, value: any) =>  {
                return validationHandler(_, value, validationData, false, validationInputs)
              }},
            ]}
          >
            <InputNumber
              placeholder={"Insert a number"}
              // min={0}
              // max={5}
              defaultValue={response[index]?.[id]}
              value={item || response[index]?.[id]}
            />
          </Form.Item>
      )};
    } else if (datatype === Date.name) {
      columnRender = (item: any, record: any,index:number) => {
        // const defaultDate: string = response[index]?.[id];

        // Parse the default date string into a moment object
        // const defaultMoment: Moment = moment(defaultDate);
        const date:any = moment();
        const defaultDate: string = response[index]?.[id] || date;
        console.log("date @@@@",date);
        // Parse the default date string into a Dayjs object
        const defaultDayjs: Dayjs = dayjs(defaultDate);
        // const nameField = `${index}${id}`;
        // // form.setFieldsValue({
        // //   [nameField] : defaultDayjs
        // // });
        // // initialValues = {
        // //   [nameField] : defaultDayjs
        // // }
        return (
          <Form.Item
              key={index} // Add a unique key to force a re-render
              name={[index, `${id}`]}
              rules={[
                // { required: true, message: "Required" },
                { validator: (_: any, value: any) =>  {
                  return validationHandler(_, value, validationData, true, validationInputs)
                }},
              ]}
              initialValue={defaultDayjs}
            >
          <DatePicker
            placeholder={`Select a date`}
            format={"DD MMM, YYYY"}
            // defaultPickerValue={response[index]?.[id]}
            // defaultValue={defaultDayjs}
            value={item || defaultDayjs}
            // defaultValue={response[index]?.[id]}
          />

          </Form.Item>
        )
    } 
  }

    return {
      title: id,
      dataIndex: order,
      render: columnRender,
    };
  });

  return dynamicColumns;
};
