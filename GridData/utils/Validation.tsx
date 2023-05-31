import moment from "moment";

export const validationHandler = (_: any, value: any, validationData: any, isDate?: boolean, allData?: any) => {
  console.log('validation data ===> ', validationData);

  const stringValue = value;
  // && value.toString();

  // Check if the value is null or empty
  if (validationData?.isMandatory) {
    if (stringValue == null || stringValue === "") {
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
      const valueDate = moment().format('YYYY-MM-DD');
      const columnName = _?.field.split('.')[1];
      
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
      const columnName = _?.field.split('.')[1];
      
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
  
  return Promise.resolve();
}
