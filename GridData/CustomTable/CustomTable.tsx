import React, { useEffect, useState } from "react";
import { Button, Form, Table, notification } from "antd";
import type { FormInstance } from "antd/es/form";
import { generateColumns } from "../utils/GenerateColumns";
import ColumnsDetails from "../ColumnsDetails.json";
import { fetchRecordId, fetchRequest, saveRequest } from "../utils/xrmapi/api";
import { GYDE_SURVEY_TEMPLATE } from "../constants/Constants";

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

declare global {
  interface Window {
    Xrm: any;
  }
}

const CustomTable: React.FC = () => {
  const [dataSource, setDataSource] = useState<any>([]);
  const [form] = Form.useForm();
  const [count, setCount] = useState(0);
  const [questionId, setQuestionId] = useState("");
  const [editingKey, setEditingKey] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [dynamicColumns, setDynamicColumns] = useState<any>([]);
  const [columns, setColumns] = useState<any>([]);
  const initialValues = {};
  const [inputValues, setInputValues] = useState<any>([]);
  // const isEditing = (record: Item) => record.key === editingKey;
  const xx: any = [
    {
      "Col1": "abcda",
      "Col2": "monday",
      "Tier": "N",
      "Col3": 2,
      "Col4": "2023-05-01T04:32:15.071Z",
    },
    {
      "Col1": "abcda222",
      "Col2": "tuesday",
      "Tier": "Y",
      "Col3": 3,
      "Col4": "2023-05-01T04:32:15.071Z",
    }
  ];
  
  // SAMPLE FOR DYNAMIC MESSAGES USE
  const [copyNotAllowed, setCopyNotAllowed] = useState<string>("Copying questions is not allowed on this webpage");
  const [apiNotSupport, setApiNotSupport] = useState<string>("Permissions API not supported")
  const [grantPermission, setGrantPermission] = useState<string>("You need to grant permission to copy on this webpage")


  const loadResourceString = async () => {

    const url = await window.parent.Xrm.Utility.getGlobalContext().getClientUrl();
    const language = await window.parent.Xrm.Utility.getGlobalContext().userSettings.languageId
    const webResourceUrl = `${url}/WebResources/gyde_localizedstrings.${language}.resx`;

    try {
      const response = await fetch(`${webResourceUrl}`);
      const data = await response.text();
      // CREATE YOUR OWN KEYS
      const filterKeys = ['copyingnotallowed', 'permissionapinotsupport', 'grantpermission']; // Replace with the key you want to filter
      filterKeys.map((filterKey: string, index: number) => {
        const parser = new DOMParser();
        // Parse the XML string
        const xmlDoc = parser.parseFromString(data, "text/xml");
        // Find the specific data element with the given key
        const dataNode: any = xmlDoc.querySelector(`data[name="${filterKey}"]`);
        // Extract the value from the data element
        const value: any = dataNode?.querySelector("value").textContent;

        // SET MESSAGES ACCORDING TO YOUR ORDER
        if (index === 0) {
          setCopyNotAllowed(value)
        }
        if (index === 1) {
          setApiNotSupport(value)
        }
        if (index === 2) {
          setGrantPermission(value)
        }
        console.log('data ====> ',  index, value); 
      });
      // this.setState({ data });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  const allDataFetch = async() => {
    await fetchRecordId()
    .then(async (id) => {
      setQuestionId(id?.data);
      console.log("record id..", id);
      const getGridData = await fetchRequest(
        GYDE_SURVEY_TEMPLATE,
        id?.data,
        "?$select=gyde_name,gyde_jsoncolumn,gyde_jsondata"
      )
      
        .then(async(records) => {
          console.log("records ===>", records.data);
          const jsonParse = await JSON.parse(records.data.gyde_jsoncolumn);
          let tableData = await JSON.parse(records.data.gyde_jsondata);
          console.log("Table @#@",tableData, typeof tableData);
          if(typeof tableData == 'undefined'){
            tableData=[];
            console.log("table data ..", tableData)
          }
          
          console.log("jsonParse ===>", jsonParse);
          console.log("jsonData ===>", tableData);

          const newData = tableData?.map((item:any,num:number)=>{
            return{
              ...item,
              key:num
            }
          });
          setDynamicColumns(jsonParse || []);
          setDataSource(newData || []);
          setInputValues(newData || []);
          setColumnsData(jsonParse || [], newData || [], form);
          setCount(count + 1)
        })
        .catch((err) => {
          // setColumnsData(ColumnsDetails, xx,form);
          console.log("error when column fetching",err);
          notification.error({
            message: "Error",
            description:"Something went wrong.. Please try again",
          });
        });
      console.log("grid data....", getGridData);
    })
    .catch(() => {
      notification.error({
        message: "Error",
        description: "Something went wrong.. Please try again",
      });
    });
  }

  useEffect(() => {
    allDataFetch();

    // CALL WEBRESOURCES
    loadResourceString();
    // form.setFieldsValue({xx});
    // fetchRecordId()
    //   .then((id) => {
    //     setQuestionId(id?.data);
    //     console.log("record id..", id);
    //     const getGridData = fetchRequest(
    //       GYDE_SURVEY_TEMPLATE,
    //       id?.data,
    //       "?$select=gyde_name,gyde_jsoncolumn,gyde_jsondata"
    //     )
        
    //       .then((records) => {
    //         console.log("records ===>", records.data);
    //         const jsonParse = JSON.parse(records.data.gyde_jsoncolumn);
    //         const tableData = JSON.parse(records.data.gyde_jsondata);
    //         console.log("jsonParse ===>", jsonParse);
    //         console.log("jsonData ===>", tableData);
    //         setDynamicColumns(jsonParse);
    //         setDataSource(tableData);
    //       })
    //       .catch((err) => {
    //         console.log("error when column fetching",err);
    //         notification.error({
    //           message: "Error",
    //           description:"Something went wrong.. Please try again",
    //         });
    //       });
    //     console.log("grid data....", getGridData);
    //   })
    //   .catch(() => {
    //     notification.error({
    //       message: "Error",
    //       description: "Something went wrong.. Please try again",
    //     });
    //   });
  }, []);

  useEffect(() => {
    setColumnsData(dynamicColumns || [], dataSource || [], form);
  }, [inputValues]);

  // useEffect(() => {
  //   setDynamicColumns(ColumnsDetails);
  //   setDataSource(xx);
  //   setInputValues(xx);
  //   setColumnsData(ColumnsDetails, xx, form);
  // }, []);
  console.log('ppp ===.>> ', dynamicColumns, dataSource);
  console.log("form details", form.getFieldsValue());

  const setColumnsData = (dynamicColumns: any, dataSource: any, formData: any) => {
    const columns = generateColumns(
      // for crm builds uncomment this
      dynamicColumns,
      // for local uncomment this
      // ColumnsDetails,
      dataSource,
      formData,
      initialValues,
      // handleInputChange,
      inputValues, 
    );
    setColumns(columns || []);
  }
  console.log("inputValues",inputValues);
  console.log("data source...@@",dataSource);

  const arrayToObj = (arr: string[]) => {
    const obj: { [key: string]: any } = {};
    arr.forEach((item, index) => {
      obj[item] = "";
    }); 
    return obj;
  };

  const handleDelete = (key: []) => {
    const newData = dataSource.filter(
      (item: any) => !key.some((rowKey) => rowKey === item.key)
    );
    setDataSource(newData || []);
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  const cancel = () => {
    // setEditingKey("");
    form.resetFields();
  };

  const handleAdd = () => {
    console.log("count...",count)
    const column = columns?.map((item:any)=>item?.title);
    let modifiedObj = arrayToObj(column);
    modifiedObj.key = dataSource?.length +1;
    
    setDataSource([...dataSource, modifiedObj]);
    console.log("inside add row...",dataSource);
    setCount(count + 1);
  };

  const handleSave = (data: any) => {
      console.log("row...", data);
      const convertedArray = Object.values(data);
      console.log("convertedArray",convertedArray)
      const records = JSON.stringify(convertedArray);
      saveRequest(GYDE_SURVEY_TEMPLATE,questionId,records).then((res)=>{
        console.log("res..",res);
        if(!res?.error){
        notification.success({
          message: "Success",
          description:"Data saved Successfully.",
        }); 
        }    
      }).catch((err)=>{
        console.log("res..",err);
        notification.error({
          message: "Error",
          description: "Saving Error.. Please try again",
        });
      })
      console.log("records..",records)
  };

  interface DataType {
    key: React.Key;
    name: string;
    age: number;
    address: string;
  }

  const handleValueChange = (changedValues: any, allValues: any) => {
    console.log("inside value change;;",form.getFieldsValue())
    const data = form.getFieldsValue();
    const dataArray = Object.values(data);
    setInputValues(dataArray);

    console.log("dataArray;;",dataArray);
    console.log("changedValues//",changedValues);
  }
  
  console.log("data source...", dataSource);
  console.log("columns...", columns);
  return (
    <div className="pcf-wrapper">
      <Form form={form} 
      // initialValues={initialValues} 
      onFinish={handleSave} onValuesChange={handleValueChange}>
      <div className="float-right mb-20">
        <Button onClick={handleAdd} type="primary" className="btn-blue mr-10">
          Add a row
        </Button>
        <Button
          onClick={() => handleDelete(selectedRowKeys)}
          type="primary"
          className="btn-red-outline"
        >
          Delete
        </Button>
      </div>

      <Table
        // rowClassName={() => "editable-row"}
        columns={columns}
        dataSource={dataSource}
        rowSelection={{ ...rowSelection }}
        pagination={false}
      />

          <div className="float-right mb-20">
          <Form.Item >
            <Button  type="primary"  htmlType="submit" className="btn-blue mr-10">
              Save
            </Button>
          
            <Button
              onClick={() => cancel()}
              type="primary"
              className="btn-red-outline"
            >
              Cancel
            </Button>
            </Form.Item>
          </div>
      </Form>
    </div>
  );
};

export default CustomTable;
