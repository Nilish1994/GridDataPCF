import moment from "moment";

export const ValidateStringLength = (_: any, value: any, callback: any) => {
  const minLength = 1;
  const maxLength = 100;

  // Convert the value to string
  const stringValue = value && value.toString();

  // Remove decimal point and check length
  const integerValue = stringValue && stringValue.replace(".", "");
  const length = integerValue && integerValue.length;

  // Check if the value is within the specified length range
  if (length < minLength || length > maxLength) {
    callback(`Number must have a length between ${minLength} and ${maxLength}`);
    return;
  }

  callback(); // Validation passed
};

export const validateInputNumber = (_: any, value: any, callback: any) => {
  const minValue = 2;
  const maxValue = 3;

  if (value < minValue || value > maxValue) {
    callback(`Number must be between ${minValue} and ${maxValue}`);
    return;
  }

  const decimalPoints = (value.toString().split(".")[1] || "").length;

  if (decimalPoints > 2) {
    callback(`Number can have a maximum of 2 decimal places`);
    return;
  }

  callback(); // Validation passed
};

export const validationHandler = (_: any, value: any, validationData: any, isDate?: boolean, allData?: any) => {
  console.log('validation data ===> ', validationData);

  const stringValue = value;
  // && value.toString();

  console.log("validationData 555", validationData, stringValue);
  // Check if the value is null or empty
  if (validationData?.isMandatory) {
    if (stringValue == null || stringValue === "") {
      console.log("isMandatory =========>", validationData?.isMandatory);
      console.log("value ====>", stringValue);
      return Promise.reject('Required');
    }
  }

   // Check if the value is within the specified length range
  if (!(validationData.minLength == 0 && validationData.maxLength == 0)) {
    if (
      stringValue?.length < validationData?.minLength ||
      stringValue?.length > validationData?.maxLength + 1
    ) {
      return Promise.reject(`Number must have a length between ${validationData?.minLength} and ${validationData?.maxLength}`);
    }
  }

  console.log("value 111", value);
  console.log("validationData 222", validationData);

  if (!(validationData.minValue == 0)) {
    if (value < validationData?.minValue || value > validationData?.maxValue) {
      return Promise.reject(`Number must be between ${validationData?.minValue} and ${validationData?.maxValue}`)
    }
   }

  if ((value?.toString()?.split(".")[1] || "")?.length) {
    const decimalPoints = (value.toString().split(".")[1] || "").length;

    if (decimalPoints > validationData?.numberOfDecimalPlaces) {
      return Promise.reject(`Number can have a maximum of ${validationData?.numberOfDecimalPlaces} decimal places`)
    }
  }

  if (validationData?.allowDuplicates) {
    if (isDate) {
      console.log('is date=====> ');
      const valueDate = moment().format('YYYY-MM-DD');
      const columnName = _?.field.split('.')[1];
      console.log('uuuuuu=====> ', columnName);
      
      let count = 0;
      if (allData && allData.length > 0) {
        allData.map((dataValue: any) => {
          if ( moment(dataValue[columnName]).format('YYYY-MM-DD') == moment(value).format('YYYY-MM-DD')) {
            count++;
          }
        });
        if (count > 1) {
          return Promise.reject("Duplicates not allowed")
        }
      }
      
    } else {
      console.log('is not date');
      console.log('kkkkkk ========> ', allData, _.field);
      const columnName = _?.field.split('.')[1];
      console.log('uuuuuu=====> ', columnName);
      
      let count = 0;
      if (allData && allData.length > 0) {
        allData.map((dataValue: any) => {
          if (dataValue[columnName] == value) {
            count++;
          }
        });
        if (count > 1) {
          return Promise.reject("Duplicates not allowed")
        }
      }
      
    }
  }
  
  
  // if (value && value.length > 10) {
  //   return Promise.reject('Maximum length exceeded');
  // }
  return Promise.resolve();
}
// export const ValidateDuplicate = (_: any, value: any, callback: any) => {
//   console.log("value", value);
// };
