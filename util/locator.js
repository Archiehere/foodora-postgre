const nodeGeocoder = require('node-geocoder');
const { distanceTo, isInsidePolygon, isInsideCircle } = require('geofencer');
const options = {
    provider: 'openstreetmap'
  };
  const geoCoder = nodeGeocoder(options);
 function getlocation(address){
 
 geoCoder.geocode(address)
  .then((res)=> {
    if(res.length==0)console.log("location not found");
    console.log(res);
  })
  .catch((err)=> {
    console.log(err);
  });}

  function getaddress(lat,lon){
  geoCoder.reverse({lat, lon})
  .then((res)=> {
    console.log(res[0]);
  })
  .catch((err)=> {
    console.log(err);
  });}

  // getlocation("201309");
  getaddress(28.478120939999997,77.49307123);
// const userlat=0;
// const restlat=0;
// const userlong=0;
// const restlong=0;
// const circle = {
//     center: [userlat, userlong], // red pyramid in Giza, Egypt
//     radius: 10000 // 10km
// }
// const point = [restlat, restlong] // Alexandria... >5km away from Giza
// const inside = isInsideCircle(circle.center, point, circle.radius);
// const distance = distanceTo([userlat, userlong], [userlat, userlong]);
// console.log(inside,distance/1000);
