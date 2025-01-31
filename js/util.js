"use strict";

const dir2Char = {
  NONE: `⇼`,
  TripleUp: `⤊`,
  DoubleUp: `⇈`,
  SingleUp: `↑`,
  FortyFiveUp: `↗`,
  Flat: `→`,
  FortyFiveDown: `↘`,
  SingleDown: `↓`,
  DoubleDown: `⇊`,
  TripleDown: `⤋`,
  "NOT COMPUTABLE": `-`,
  "RATE OUT OF RANGE": `⇕`
};

const customAssign = (targetObject, patchObject) => {

  if (patchObject === null) {
    patchObject = ``;
  }

  for (const key of Object.keys(patchObject)) {
    if (key in targetObject) {
      if (typeof patchObject[key] != `object`) {
        if (targetObject[key].type === `checkbox`) {
          targetObject[key].checked = patchObject[key];
        } else {
          targetObject[key].value = patchObject[key];
        }
      } else {
        customAssign(targetObject[key], patchObject[key]);
      }
    }
  }
  return targetObject;
};

const mgdlToMMOL = (mgdl) => {
  const MMOL_TO_MGDL = 18;
  return (Math.round((mgdl / MMOL_TO_MGDL) * 10) / 10).toFixed(1);
};

const charToEntity = (char) => {
  if (char === undefined) {
    return ``;
  }

  return char && char.length && `&#` + char.charCodeAt(0) + `;`;
};

const directionToChar = (direction) => {
  return dir2Char[direction] || `-`;
};

const calcTrend = (data) => {

  const MIN_DATA_LENGTH = 6;

  if (!Array.isArray(data) ||
      data.length < MIN_DATA_LENGTH ||
      !data.every(isFinite)) {
    return `NOT COMPUTABLE`;
  }

  const thresholds = {
    Double: {MIN: 4, HALF: 90},
    Single: {MIN: 2, HALF: 60},
    FortyFive: {MIN: 1, HALF: 30},
  };

  const changes = [];
  for (let i = 0; i < 5; i++) {
    changes.push(data[i] - data[i + 1]);
  }

  const lastMinuteChange = changes[0] / 5;
  const totalChangePerHalf = changes.reduce((sum, change) => sum + change, 0);

  for (const trend in thresholds) {
    if (
      lastMinuteChange > thresholds[trend].MIN ||
      totalChangePerHalf > thresholds[trend].HALF
    ) {
      return `${trend}Up`;
    } else if (
      lastMinuteChange < -thresholds[trend].MIN ||
      totalChangePerHalf < -thresholds[trend].HALF
    ) {
      return `${trend}Down`;
    }
  }

  return `Flat`;
};

const prepareData = (dataObj, paramsObj) => {
  const result = {};

  result.last = dataObj.result[0].sgv;
  result.prev = dataObj.result[1].sgv;

  const currentTime = new Date();
  result.age = Math.floor((currentTime.getTime() - dataObj.result[0].srvCreated) / 1000 / 60);

  let delta = Math.round((result.last - result.prev) * 100) / 100;

  if (paramsObj.units_in_mmol) {
    delta = mgdlToMMOL(delta);
  }

  if (delta > 0) {
    result.delta = `+${delta}`;
  } else if (delta == 0) {
    result.delta = `+${paramsObj.units_in_mmol ? `0.0` : `0`}`;
  } else {
    result.delta = delta.toString();
  }

  if (paramsObj.units_in_mmol) {
    result.last = mgdlToMMOL(result.last);
  }

  if (paramsObj.calc_trend) {
    result.direction = charToEntity(directionToChar(calcTrend(dataObj.result.map(obj => obj.sgv))));
  } else {
    result.direction = charToEntity(directionToChar(dataObj.result[0].direction));
  }

  return result;
};

const alert = (type, title, msg, sync = false) => {
  const dialog = window.electronAPI.dialog;

  const data = {
    type: type,
    title: title,
    message: msg.toString(),
    buttons: [`OK`],
    defaultId: 0,
  };

  if (sync) {
    return dialog.showMessageBoxSync(data);
  } else {
    return dialog.showMessageBox(data);
  }
};

export {
  dir2Char,
  mgdlToMMOL,
  charToEntity,
  directionToChar,
  prepareData,
  customAssign,
  alert,
  calcTrend
};
