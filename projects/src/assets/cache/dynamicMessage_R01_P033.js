window.getDynamicContentForR01_P033 = function (japanDateTime, param) {
  let messages = [];
  let startDateTime;
  let endDateTime;

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1299", messageType: "1", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0001() && judgeCondition0002()) {
      messages.push({messageId: "MSG0111", messageType: "3", displayOrder: 40});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0030", messageType: "1", displayOrder: 40});
  }

  startDateTime = new Date('2025-07-10T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T23:59:59+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG2000", messageType: "3", displayOrder: 50});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0003()) {
      messages.push({messageId: "MSG1654", messageType: "4", displayOrder: 60});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1003", messageType: "5", displayOrder: 70});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1637", messageType: "4", displayOrder: 80});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0001()) {
      messages.push({messageId: "MSG1585", messageType: "1", displayOrder: 160});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1695", messageType: "1", displayOrder: 200});
  }

  startDateTime = new Date('2025-06-26T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T23:59:59+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1726", messageType: "1", displayOrder: 220});
  }

  return messages;

  // ================== 条件判定関数 ==================
  function judgeCondition0001() {
    return param?.pageContext?.isDomesticTrip == true;
  }
  function judgeCondition0002() {
    return !!param?.complexTripReply?.data?.fareFamilies && param?.complexTripReply?.data?.fareFamilies?.length > 1;
  }
  function judgeCondition0003() {
    return (param?.complexTripReply?.data?.fareFamilies ?? []).some(
      (list1) => (list1?.airOffers ?? []).some(
        (list2) => (list2?.bounds ?? []).some(
          (list3) => (list3?.flights ?? []).some(
            (list4) => list4?.fareInfos?.fareType == "disabilityDiscount"
          )
        )
      )
    );
  }
};
