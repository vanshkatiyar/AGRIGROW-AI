/*  Source: FAO-GIEWS 2025, DAC&FW, ICAR  *
 *  Sowing & Harvesting periods (India)  */

const REAL_CROP_DATA = {
  Wheat:      { sowing: 'Nov-Jan', harvest: 'Mar-May',  daysToHarvest: 150 },
  Rice:       { sowing: 'Jun-Jul & Nov-Dec', harvest: 'Sep-Oct & Mar-Apr', daysToHarvest: 135 },
  Maize:      { sowing: 'Jun-Jul & Oct-Nov', harvest: 'Sep-Oct & Jan-Feb', daysToHarvest: 115 },
  Cotton:     { sowing: 'Apr-May', harvest: 'Nov-Dec', daysToHarvest: 180 },
  Sugarcane:  { sowing: 'Feb-Mar & Jul-Aug', harvest: 'Nov-Feb', daysToHarvest: 300 },
  Barley:     { sowing: 'Oct-Nov', harvest: 'Feb-Mar', daysToHarvest: 125 },
  Groundnut:  { sowing: 'Jun-Jul & Oct-Nov', harvest: 'Sep-Oct & Jan-Feb', daysToHarvest: 105 },
  Mustard:    { sowing: 'Sep-Oct', harvest: 'Feb-Mar', daysToHarvest: 140 },
  Soybean:    { sowing: 'Jun-Jul', harvest: 'Sep-Oct', daysToHarvest: 105 },
  Sunflower:  { sowing: 'Jan-Feb & Jul-Aug', harvest: 'May-Jun & Nov-Dec', daysToHarvest: 100 },
  Tomato:     { sowing: 'Throughout year', harvest: 'Throughout year', daysToHarvest: 85 },
  Onion:      { sowing: 'May-Jun & Oct-Nov', harvest: 'Dec-Jan & Apr-May', daysToHarvest: 115 },
  Potato:     { sowing: 'Oct-Nov & Jan-Feb', harvest: 'Dec-Jan & Mar-Apr', daysToHarvest: 100 },
  Gram:       { sowing: 'Oct-Nov', harvest: 'Feb-Mar', daysToHarvest: 110 },
  Pulses:     { sowing: 'Jun-Jul & Oct-Nov', harvest: 'Sep-Oct & Jan-Feb', daysToHarvest: 95 },
};

module.exports = { REAL_CROP_DATA };