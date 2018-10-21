var express = require('express');
var router = express.Router();
const fetch = require('node-fetch')
require('dotenv').config()

/* ==========================================================================
  Set the token
  ========================================================================== */
const accessToken = process.env.ACCESS_TOKEN
const refreshToken = process.env.REFRESH_TOKEN
/* URL FOR MESURE */
const URL = 'https://wbsapi.withings.net/measure?'

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query)
  res.render('index')
});

// router.get('/refresh', function(req, res, next) {
//   res.send(toketnRefresh())
// });


router.post('/notify', function(req, res, next) {
  const data = req.headers
  console.log('USER TOKEN ACCESS:' + JSON.stringify(data))
  res.status(200).json(data)
})


/* ==========================================================================
  Get full data without any filter
  ========================================================================== */
router.get('/user/', function(req, res, next) {
  fetch(`${URL}action=getmeas&access_token=${accessToken}`)
  .then(res => res.json())
  .then(data =>  {
    res.status(200).json(data)
  })
})

const types = {
  1:	'Weight (kg)',
  4:	'Height (meter)',
  5:	'Fat Free Mass (kg)',
  6:	'Fat Ratio (%)',
  8:	'Fat Mass Weight (kg)',
  9:	'Diastolic Blood Pressure (mmHg)',
  10:	'Systolic Blood Pressure (mmHg)',
  11:	'Heart Pulse (bpm) - only for BPM devices',
  12:	'Temperature',
  54:	'SP02 (%)',
  71:	'Body Temperature',
  73:	'Skin Temperature',
  76:	'Muscle Mass',
  77:	'Hydration',
  88:	'Bone Mass',
  91:	'Pulse Wave Velocity',
}

const typesToIncludeInLastWeight = [1];

const searchValue  = (typesToInclude) => {
  return fetch(`${URL}action=getmeas&access_token=${accessToken}`)
    .then(response => response.json())
    .then(data => data.body.measuregrps.find(measureGrp =>
    measureGrp.measures.find(measure =>
      typesToInclude.includes(measure.type)
    )))
    .then(data => data.measures.filter(measure => typesToInclude.includes(measure.type)))
    .then(data => data.reduce((accum, current) => {
      return ({
        ...accum,
        ...{
          [types[current.type]]: typesToInclude == 1 ? current.value / 1000 : current.value
        }
      })
    }, {}))
}

/* ==========================================================================
  Last weight data
  ========================================================================== */
router.get('/user/lastweight', function(req, res, next) {
  searchValue([1])
  .then(data =>  {
      res.status(200).json(data)
  })
  .catch(console.log)
})

/* ==========================================================================
  Last pulse data
  ========================================================================== */
router.get('/user/lastpulse', function(req, res, next) {
  searchValue([11])
  .then(data =>  {
    res.status(200).json(data)
  })
  .catch(console.log)
})

/* ==========================================================================
  Last health data
  ========================================================================== */
router.get('/user/lasthealth', function(req, res, next) {
  (async () => {
    try{
      const lastWeight = await searchValue([1])
      const lastWeightResult = await lastWeight

      const lastPulse = await searchValue([11])
      const lastPulseResult = await lastPulse

      const obj = {}
      const mix = Object.assign(obj, lastWeightResult, lastPulseResult)
      return res.send(mix)
    }catch(err) {
      console.log(err)
    }
  })()
})

// /* ==========================================================================
//   Get full data without any filter
//   ========================================================================== */
//   router.get('/user/pulse', function(req, res, next) {
//     fetch(`${URL}action=getmeas&access_token=${accessToken}`)
//       .then(response => response.json())
//       .then(data => {

//         return data.body.measuregrps.reduce((accum, current) => {
//           return element.measures.filter(ele => {
//             console.log('ele.type == 9: ', ele.type == 9);
//             return ele.type == 9
//           })
//         },{})
//         // console.log('result: ', result);
//         // return result
//       })
//       .then(data => res.send(data))
//       // .then(data => data.body.measuregrps.find(measureGrp =>
//       // measureGrp.measures.find(measure =>
//       //   typesToIncludeInLastWeight.includes(measure.type)
//       // )))
//       // .then(data => data.measures.filter(measure => typesToIncludeInLastWeight.includes(measure.type)))
//       // .then(data => data.reduce((accum, current) => {
//       //   return ({
//       //     ...accum,
//       //     ...{
//       //       [types[current.type]]: current.value
//       //     }
//       //   })
//       // }, {}))
//       // .then(data =>  {
//       //   res.status(200).json(data)
//       // })
//       // .catch(console.log)
//   })

/* ==========================================================================
  Get filtered content by weight, pulse
  ========================================================================== */
// router.get('/user/:filter', function(req, res, next) {
//   let filterBy = req.params.filter.toLowerCase()

//   const types = {
//     weight: 1,
//     fat_free_mass: 5,
//     fat_ratio: 6,
//     fat_mass_weight: 8,
//     pulse: 11,
//     muscle_mass: 76,
//     hydration: 77,
//     bone_mass: 88
//   }

//   /* Filter content based on parms */
//   function filterContent(q) {
//     if(q[filterBy] != undefined) {
//       return q[filterBy]
//     }else{
//       return 1
//     }
//   }

//   /* Fetch the API and return filtered data */
//   fetch(`${URL}action=getmeas&access_token=${accessToken}`)
//   .then(res => res.json())
//   .then(data =>  {
//     const metrics = data.body.measuregrps
//     return data = metrics.filter(ele => ele.measures[0].type === filterContent(types))
//   })
//   .then(cleared => {
//     res.status(200).json(cleared)
//   })
// })

module.exports = router
