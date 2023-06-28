import React, { useEffect, useState } from "react";
import { Button, Form, Table, } from "antd";
import { generateColumns } from "../utils/GenerateColumns";
import ColumnsDetails from "../ColumnsDetails.json";
import { fetchRecordId, fetchRequest, saveColumnData, saveRequest } from "../utils/xrmapi/api";
import { ERROR_COLOUR_CODE, GYDE_SURVEY_TEMPLATE, SUCCESS_COLOUR_CODE } from "../constants/Constants";
import moment from "moment";

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [dynamicColumns, setDynamicColumns] = useState<any>([]);
  const [columns, setColumns] = useState<any>([]);
  const initialValues = {};
  const [inputValues, setInputValues] = useState<any>([]);
  const [lockData, setLockData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [savedColumns, setSavedColumns] = useState<any>([]);
  const [isDisable, setIsDisable] = useState(false);
  const [filteredCol, setFilteredCol] = useState();
  const xx: any = [
    [
      {
        "Col1": "asfasfa",
        "Col2": "monday",
        "Tier": "N",
        "Col3": 2,
        "Col4": "2023-05-01"
    },
    {
        "Col1": "afasf",
        "Col2": "tuesday",
        "Tier": "Y",
        "Col3": 3,
        "Col4": "2023-05-14"
    }
  ],
  [
      {
          "id": "Col1",
          "order": "name",
          "datatype": "String",
          "guid": "acAqwy54352Abvd",
          "validationData": {
              "allowDuplicates": true,
              "isMandatory": true,
              "maxLength": 10,
              "maxValue": 0,
              "minLength": 4,
              "minValue": 0,
              "numberOfDecimalPlaces": 0
          },
          "width": 200,
          "iseditable": true
      },
      {
          "id": "Col2",
          "order": "age",
          "datatype": "List",
          "guid": "acwewy54352Abvd",
          "data": [
              {
                  "value": "monday",
                  "label": "Monday"
              },
              {
                  "value": "tuesday",
                  "label": "Tuesday"
              },
              {
                  "value": "wednesday",
                  "label": "Wednesday"
              },
              {
                  "value": "thursday",
                  "label": "Thursday"
              },
              {
                  "value": "friday",
                  "label": "Friday"
              }
          ],
          "validationData": {
              "allowDuplicates": false,
              "isMandatory": true,
              "maxLength": 0,
              "maxValue": 0,
              "minLength": 0,
              "minValue": 0,
              "numberOfDecimalPlaces": 0
          },
          "width": 150
      },
      {
          "id": "Tier",
          "order": "address",
          "datatype": "List",
          "guid": "acyywy54352Abvd",
          "data": [
              {
                  "value": "Y",
                  "label": "Yes"
              },
              {
                  "value": "N",
                  "label": "No"
              }
          ],
          "validationData": {
              "allowDuplicates": true,
              "isMandatory": true,
              "maxLength": 0,
              "maxValue": 0,
              "minLength": 0,
              "minValue": 0,
              "numberOfDecimalPlaces": 0
          },
          "width": 150
      },
      {
          "id": "Col3",
          "order": "name2",
          "datatype": "Numeric",
          "guid": "acAqwy5435opbvd",
          "validationData": {
              "allowDuplicates": false,
              "isMandatory": true,
              "maxLength": 0,
              "maxValue": 5,
              "minLength": 0,
              "minValue": 1,
              "numberOfDecimalPlaces": 0
          },
          "width": 50
      },
      {
          "id": "Col4",
          "order": "name3",
          "datatype": "Date",
          "guid": "acAqwy543cxAbvd",
          "validationData": {
              "allowDuplicates": true,
              "isMandatory": true,
              "maxLength": 0,
              "maxValue": 0,
              "minLength": 0,
              "minValue": 0,
              "numberOfDecimalPlaces": 0
          }
      }
  ]
  ];

  // SAMPLE FOR DYNAMIC MESSAGES USE
  const [numberValueValidation, setNumberValueValidation] = useState<string>("Number must have a value between $ and $$");
  const [stringLengthValidation, setStringLengthValidation] = useState<string>("Input must have a length between $ and $$");
  const [requiredError, setRequiredError] = useState<string>("Required Field");
  const [decimalValidation, setDecimalValidation] = useState<string>("Number can have a maximum of $ decimal places");
  const [duplicateError, setDuplicateError] = useState<string>("Duplicates not allowed");
  const [saveDataNotify, setSaveDataNotify] = useState<string>("Data saved Successfully");
  const [saveDataError, setSaveDataError] = useState<string>("Saving Error. Please try again");
  const [commonError, setCommonError] = useState<string>("Something went wrong. Please try again");


  const loadResourceString = async () => {
    const url =
      await window.parent.Xrm.Utility.getGlobalContext().getClientUrl();
    const language = await window.parent.Xrm.Utility.getGlobalContext()
      .userSettings.languageId;
    const webResourceUrl = `${url}/WebResources/gyde_localizedstrings.${language}.resx`;

    try {
      const response = await fetch(`${webResourceUrl}`);
      const data = await response.text();
      // CREATE YOUR OWN KEYS
      const filterKeys = ['numberValueValidation', 'stringLengthValidation', 'requiredError','decimalValidation','duplicateError','saveDataNotify','saveDataError','commonError'];
       // Replace with the key you want to filter
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
          setNumberValueValidation(value)
        }
        if (index === 1) {
          setStringLengthValidation(value)
        }
        if (index === 2) {
          setRequiredError(value)
        }
        if (index === 3) {
          setDecimalValidation(value)
        }
        if (index === 4) {
          setDuplicateError(value)
        }
        if (index === 5) {
          setSaveDataNotify(value)
        }
        if (index === 6) {
          setSaveDataError(value)
        }if (index === 7) {
          setCommonError(value)
        }
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const allDataFetch = async () => {
    setLoading(true);
    await fetchRecordId()
      .then(async (id) => {
        setQuestionId(id?.data);
        const getGridData = await fetchRequest(
          GYDE_SURVEY_TEMPLATE,
          id?.data,
          "?$select=gyde_name,gyde_jsoncolumn,gyde_jsondata,statuscode"
        )
          .then(async (records) => {
            const jsonParse = await JSON.parse(records.data.gyde_jsoncolumn);
            let tableData = await JSON.parse(records.data.gyde_jsondata);
            if (typeof tableData == "undefined") {
              tableData = [];
            }

            console.log("jsonParse ===>", jsonParse);
            console.log("jsonData ===>", tableData);

            if (records.data.statuscode == 2 || records.data.statuscode == 528670001) {
              setIsDisable(true)
            } else {
              setIsDisable(false);
            }
            const newData = tableData?.[0]?.map((item: any, num: number) => {
              return {
                ...item,
                key: num,
              };
            });
            
            setSavedColumns( tableData?.[1])
            setDynamicColumns(jsonParse || []);
            setLockData(jsonParse);
            setDataSource(newData || []);
            setInputValues(newData || []);
            setColumnsData(jsonParse || [], newData || [], form, isDisable,tableData?.[1]);
            setCount(count + 1);
            setLoading(false);
          })
          .catch((err) => {
            console.log("error when column fetching", err);
            setLoading(false);
            let notificationType = "ERROR";
            // const msg = <span style={{color:ERROR_COLOUR_CODE}}>{commonError}</span>;
            window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(commonError, notificationType);
            setTimeout(function () {
              window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
              }, 10000);
          });
        console.log("grid data....", getGridData);
      })
      .catch(() => {
        setLoading(false);
        let notificationType = "ERROR";
        // const msg = <span style={{color: ERROR_COLOUR_CODE}}>{commonError}</span>;
        window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(commonError, notificationType);
        setTimeout(function () {
          window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
        }, 10000);
      });
  };

  useEffect(() => {
    allDataFetch();

    // CALL WEBRESOURCES
    loadResourceString();

  }, []);

  useEffect(()=>{
    form.resetFields(); 
  },[filteredCol])

  useEffect(() => {
    setColumnsData(dynamicColumns || [], dataSource || [], form,isDisable,savedColumns);
  }, [inputValues]);

  useEffect(() => {
    setColumnsData(dynamicColumns || [], dataSource || [], form, isDisable,savedColumns);   
  }, [lockData])

  // useEffect(() => {
  //   setDynamicColumns(ColumnsDetails);
  //   setDataSource(xx[0]);
  //   setInputValues(xx[0]);
  //   setColumnsData(ColumnsDetails, xx[0], form, savedColumns,xx[1]);
  // }, []);

  const handleLockData = (columnName: string, value: boolean) => {
    setLockData(() => {
      const newData = [...dynamicColumns];  
      const foundIndex = newData.findIndex((item) =>item.id === columnName);
      if (foundIndex !== -1) {
          // Update existing item if value is checked
          newData[foundIndex] = { ...newData[foundIndex], "iseditable": !value };
      }
      return newData;
    });
  }

  const setColumnsData = (
    dynamicColumns: any,
    dataSource: any,
    formData: any,
    disable?: boolean,
    savedColumns?:any
  ) => {
    const columns = generateColumns(
      dynamicColumns,
      dataSource,
      formData,
      initialValues,
      inputValues,
      {numberValueValidation,stringLengthValidation,requiredError,decimalValidation,duplicateError},
      disable,
      handleLockData,
      savedColumns,
      filteredColumn,
    );
    setColumns(columns || []);
  };

  const filteredColumn = (val:any) => {
    setFilteredCol(val);
  }

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
    getCheckboxProps: (record:any) => ({
      disabled:isDisable
    }),
    columnWidth:15
  };

  const cancel = () => {
    // setEditingKey("");
    form.resetFields();
  };

  const handleAdd = () => {
    const column = columns?.map((item: any) => item?.title);
    let modifiedObj = arrayToObj(column);
    modifiedObj.key = dataSource?.length + 1;

    setDataSource([...dataSource, modifiedObj]);
    setCount(count + 1);
  };

  const handleSave = (data: any) => {
    const convertedArray:any = Object.values(data);
    // const records = JSON.stringify(convertedArray);
    const columnData = JSON.stringify(lockData);
    for (let index = 0; index < convertedArray.length; index++) {
      const obj : any = convertedArray[index];
      for (let key in obj ) {
        console.log(`${key}: ${typeof obj[key]}`);
        if(typeof obj[key] == "object" ){
          convertedArray[index][key] = moment(obj[key]?.$d.toDateString()).format("YYYY-MM-DD") 
        }
      }     
    }
    console.log("columnData,,,,,",columnData);
    console.log("lockData ||| ",lockData);
    const final = [convertedArray, lockData];
    const records = JSON.stringify(final);
    console.log("final save data array: ",final);
    saveRequest(GYDE_SURVEY_TEMPLATE, questionId, records)
      .then((res) => {
        if (!res?.error) {
          saveColumnData(GYDE_SURVEY_TEMPLATE,questionId,columnData).then((res)=>{
            if(!res?.error){
              let notificationType = "INFO";
              allDataFetch();
              window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(saveDataNotify, notificationType);
              setTimeout(function () {
              window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
              }, 10000);
            }
          })     
        }
      })
      .catch((err) => {
        let notificationType = "ERROR";
        window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(saveDataError, notificationType);
        setTimeout(function () {
          window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
          }, 10000);
      });
  };

  interface DataType {
    key: React.Key;
    name: string;
    age: number;
    address: string;
  }

  const handleValueChange = (changedValues: any, allValues: any) => {
    const data = form.getFieldsValue();
    const dataArray = Object.values(data);
    setInputValues(dataArray);
  };

  return (
    <div className="pcf-wrapper">
      <Form
        form={form}
        // initialValues={initialValues}
        onFinish={handleSave}
        onValuesChange={handleValueChange}
      >
        <div className="float-right mb-20">
        <Button
            onClick={() => handleDelete(selectedRowKeys)}
            type="primary"
            className="btn-red-outline mr-10"
            disabled={isDisable}
          >
            Delete Row
          </Button>

          <Button
            onClick={handleAdd}
            type="primary"            
            className="btn-blue"
            disabled={isDisable}
          >
            Add Row
          </Button>
          
        </div>
          <Table
            className={dataSource?.length < 1 ? "overflow-wrapper" : ""}
            columns={columns}
            dataSource={dataSource}
            rowSelection={{ ...rowSelection }}
            pagination={false}
            scroll={{ x: 'max-content', y: 'calc(100vh - 450px)' }}
            sticky
            loading={loading}
          />
        <div className="float-right mb-20">
          <Form.Item>
          <Button
              onClick={() => cancel()}
              type="primary"
              className="btn-red-outline mr-10"
              disabled={isDisable}
            >
              Reset
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              className="btn-blue"
              disabled={isDisable}
            >
              Save
            </Button>

            
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default CustomTable;
