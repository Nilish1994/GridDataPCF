import React, { useEffect, useState } from "react";
import { Button, Form, Table, notification, Checkbox } from "antd";
import { generateColumns } from "../utils/GenerateColumns";
import ColumnsDetails from "../ColumnsDetails.json";
import { fetchRecordId, fetchRequest, saveRequest } from "../utils/xrmapi/api";
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
  const [isDisabled, setIsDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const xx: any = [
    {
      Col1: "abcda",
      Col2: "monday",
      Tier: "N",
      Col3: 2,
      Col4: "2023-05-01T04:32:15.071Z",
    },
    {
      Col1: "abcda222",
      Col2: "tuesday",
      Tier: "Y",
      Col3: 3,
      Col4: "2023-05-01T04:32:15.071Z",
    },
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
          "?$select=gyde_name,gyde_jsoncolumn,gyde_jsondata"
        )
          .then(async (records) => {
            const jsonParse = await JSON.parse(records.data.gyde_jsoncolumn);
            let tableData = await JSON.parse(records.data.gyde_jsondata);
            if (typeof tableData == "undefined") {
              tableData = [];
            }

            console.log("jsonParse ===>", jsonParse);
            console.log("jsonData ===>", tableData);

            const newData = tableData?.map((item: any, num: number) => {
              return {
                ...item,
                key: num,
              };
            });
            setLoading(false);
            setDynamicColumns(jsonParse || []);
            setDataSource(newData || []);
            setInputValues(newData || []);
            setColumnsData(jsonParse || [], newData || [], form,isDisabled);
            setCount(count + 1);
          })
          .catch((err) => {
            // setColumnsData(ColumnsDetails, xx,form);
            console.log("error when column fetching", err);
            setLoading(false);
            let notificationType = "ERROR";
            const msg = <span style={{color:ERROR_COLOUR_CODE}}>{commonError}</span>;
            window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(msg, notificationType);
            setTimeout(function () {
              window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
              }, 10000);
          });
        console.log("grid data....", getGridData);
      })
      .catch(() => {
        setLoading(false);
        let notificationType = "ERROR";
        const msg = <span style={{color: ERROR_COLOUR_CODE}}>{commonError}</span>;
        window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(msg, notificationType);
        setTimeout(function () {
          window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
        }, 10000);
      });
  };

  // useEffect(() => {
  //   allDataFetch();

  //   // CALL WEBRESOURCES
  //   loadResourceString();
  //   // form.setFieldsValue({xx});
  //   // fetchRecordId()
  //   //   .then((id) => {
  //   //     setQuestionId(id?.data);
  //   //     console.log("record id..", id);
  //   //     const getGridData = fetchRequest(
  //   //       GYDE_SURVEY_TEMPLATE,
  //   //       id?.data,
  //   //       "?$select=gyde_name,gyde_jsoncolumn,gyde_jsondata"
  //   //     )

  //   //       .then((records) => {
  //   //         console.log("records ===>", records.data);
  //   //         const jsonParse = JSON.parse(records.data.gyde_jsoncolumn);
  //   //         const tableData = JSON.parse(records.data.gyde_jsondata);
  //   //         console.log("jsonParse ===>", jsonParse);
  //   //         console.log("jsonData ===>", tableData);
  //   //         setDynamicColumns(jsonParse);
  //   //         setDataSource(tableData);
  //   //       })
  //   //       .catch((err) => {
  //   //         console.log("error when column fetching",err);
  //   //         notification.error({
  //   //           message: "Error",
  //   //           description:"Something went wrong.. Please try again",
  //   //         });
  //   //       });
  //   //     console.log("grid data....", getGridData);
  //   //   })
  //   //   .catch(() => {
  //   //     notification.error({
  //   //       message: "Error",
  //   //       description: "Something went wrong.. Please try again",
  //   //     });
  //   //   });
  // }, []);

  useEffect(() => {
    setColumnsData(dynamicColumns || [], dataSource || [], form);
  }, [inputValues]);

  useEffect(() => {
    setColumnsData(dynamicColumns || [], dataSource || [], form, isDisabled);   
  }, [isDisabled])

  useEffect(() => {
    setDynamicColumns(ColumnsDetails);
    setDataSource(xx);
    setInputValues(xx);
    setColumnsData(ColumnsDetails, xx, form);
  }, []);

  const setColumnsData = (
    dynamicColumns: any,
    dataSource: any,
    formData: any,
    disable?: boolean,
  ) => {
    const columns = generateColumns(
      dynamicColumns,
      dataSource,
      formData,
      initialValues,
      inputValues,
      {numberValueValidation,stringLengthValidation,requiredError,decimalValidation,duplicateError},
      disable,
      setIsDisabled
    );
    setColumns(columns || []);
  };

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
    const records = JSON.stringify(convertedArray);

    for (let index = 0; index < convertedArray.length; index++) {
      const obj : any = convertedArray[index];
      for (let key in obj ) {
        console.log(`${key}: ${typeof obj[key]}`);
        if(typeof obj[key] == "object" ){
          convertedArray[index][key] = moment(obj[key]?.$d.toDateString()).format("YYYY-MM-DD") 
        }
      }     
    }
    saveRequest(GYDE_SURVEY_TEMPLATE, questionId, records)
      .then((res) => {
        if (!res?.error) {
          let notificationType = "INFO";
          const msg = <span style={{color:SUCCESS_COLOUR_CODE}}>{saveDataNotify}</span>;
          allDataFetch();
          window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(msg, notificationType);
          setTimeout(function () {
          window.parent.Xrm.Page.ui.formContext.ui.clearFormNotification();
          }, 10000);
        }
      })
      .catch((err) => {
        let notificationType = "ERROR";
        const msg = <span style={{color:ERROR_COLOUR_CODE}}>{saveDataError}</span>;
        window.parent.Xrm.Page.ui.formContext.ui.setFormNotification(msg, notificationType);
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
            onClick={handleAdd}
            type="primary"
            className="btn-blue mr-10"
            disabled={isDisabled}
          >
            Add a row
          </Button>
          <Button
            onClick={() => handleDelete(selectedRowKeys)}
            type="primary"
            className="btn-red-outline"
            disabled={isDisabled}
          >
            Delete
          </Button>
        </div>
        <>
          {/* <Checkbox
            defaultChecked={false}
            onChange={() => setIsDisabled(!isDisabled)}
          >
            Lock Data
          </Checkbox> */}
        </>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowSelection={{ ...rowSelection }}
          pagination={false}
          scroll={{ x: 1500, y: 400 }}
          sticky
          loading={loading}
          onRow={(record) =>
            isDisabled
              ? {}
              : {
                  onClick: () => {
                    // Handle row click event if table is not disabled
                  },
                }
          }
          style={isDisabled ? { opacity: 0.5 } : {}}
        />
        <div className="float-right mb-20">
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="btn-blue mr-10"
              disabled={isDisabled}
            >
              Save
            </Button>

            <Button
              onClick={() => cancel()}
              type="primary"
              className="btn-red-outline"
              disabled={isDisabled}
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
