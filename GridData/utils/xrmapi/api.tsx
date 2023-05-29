
declare global {
  interface Window {
    Xrm: any;
  }
}

export const fetchRecordId = async (

): Promise<any> => {
  try {
    const result = await window.parent.Xrm.Page.ui.formContext.data.entity.getId();
    // const str = '{AC3FE85C-90E5-ED11-A7C7-000D3A338DD2}';
    console.log("result in fetch record id",result);
    const removedBrackets = result.replace(/[{}]/g, '');

    console.log("removedBrackets",removedBrackets);
    return { error: false, data: removedBrackets, loading: false };
  } catch (error: any) {
    // handle error conditions
    console.log("error",error);
    return { error: true, data: [], loading: false };
  }
};

export const fetchRequest = async (
  entityLogicalName: any,
  id: string,
  columnsNames:string
): Promise<any> => {
  try {
    const result = await window.parent.Xrm.WebApi.retrieveRecord(entityLogicalName,id,columnsNames);
    console.log("result in fetch request json parse..",result);
    console.log("gyde_name..",result.gyde_name);
    console.log("gyde_jsoncolumn..",result.gyde_jsoncolumn);
    return { error: false, data: result, loading: false };
  } catch (error: any) {
    // handle error conditions
    console.log("error",error);
    return { error: true, data: [], loading: false };
  }
};

export const saveRequest = async (
  entityLogicalName: any,
  id: string,
  data:any
): Promise<any> => {
  try {
    const result = await window.parent.Xrm.WebApi.updateRecord(entityLogicalName,id,{"gyde_jsondata":data});
    return { error: false, data: result, loading: false };
  } catch (error: any) {
    // handle error conditions
    console.log("error",error);
    return { error: true, data: [], loading: false };
  }
};