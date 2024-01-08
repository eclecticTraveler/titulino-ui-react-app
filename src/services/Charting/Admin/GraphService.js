import chartingDummyData from '../../../assets/data/chartingDummy.data.json';

const loadDummyData = async() => {
  const rawData = chartingDummyData;
  return rawData;
}

const loadDummyDataForDashboard = async() => {  
  return await loadDummyData();
}

export const getDashboardData = async() => {
  return await loadDummyDataForDashboard();
}


const GraphService = {
  getDashboardData
};

export default GraphService;
