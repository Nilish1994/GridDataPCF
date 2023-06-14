import moment from "moment";
import {stringReplace} from "../utils/StringReplace"

export const validationHandler = (_: any, value: any, validationData: any, isDate?: boolean, allData?: any,messages?:any) => {
  console.log('validation data ===> ', validationData);

  const stringValue = value;
  // && value.toString();
  console.log("validation value",value)

  // Check if the value is null or empty
  if (validationData?.isMandatory) {
    if (stringValue == null || stringValue === "") {
      return Promise.reject(messages?.requiredError);
    }
  }

   // Check if the value is within the specified length range
  if (!(validationData.minLength == 0 && validationData.maxLength == 0)) {
    if (
      stringValue?.length < validationData?.minLength ||
      stringValue?.length > validationData?.maxLength
    ) {
      const msg = stringReplace(messages?.stringLengthValidation ,validationData?.minLength,validationData?.maxLength );
      return Promise.reject(msg);
    }
  }

  if (!(validationData.minValue == 0)) {
    if (value < validationData?.minValue || value > validationData?.maxValue) {
      const msg = stringReplace(messages?.numberValueValidation ,validationData?.minValue,validationData?.maxValue);
      return Promise.reject(msg);
    }
   }

  if ((value?.toString()?.split(".")[1] || "")?.length) {
    const decimalPoints = (value.toString().split(".")[1] || "").length;

    if (decimalPoints > validationData?.numberOfDecimalPlaces) {
      const msg = stringReplace(messages?.decimalValidation ,validationData?.numberOfDecimalPlaces);
      return Promise.reject(msg)
    }
  }

  if (validationData?.allowDuplicates) {
    if (isDate) {
      const valueDate = moment().format('YYYY-MM-DD');
      const columnName = _?.field.split('.')[1];
      
      let count = 0;
      if (allData && allData.length > 0) {
        allData.map((dataValue: any) => {
          if(typeof dataValue[columnName] === "object"){
            dataValue[columnName] = moment(dataValue[columnName]?.$d.toDateString()).format("YYYY-MM-DD");
          }
          if ( moment(dataValue[columnName]).format('YYYY-MM-DD') == moment(value).format('YYYY-MM-DD')) {
            count++;
          }
        });
        if (count > 1) {
          return Promise.reject(messages?.duplicateError)
        }
      }
      
    } else {
      const columnName = _?.field.split('.')[1];
      
      let count = 0;
      if (allData && allData.length > 0) {
        allData.map((dataValue: any) => {
          if (dataValue[columnName] == value) {
            count++;
          }
        });
        if (count > 1) {
          return Promise.reject(messages?.duplicateError)
        }
      } 
    }
  }
  
  return Promise.resolve();
}
