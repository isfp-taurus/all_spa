window.getDynamicContentForR01_P031 = function (japanDateTime, param) {
  let messages = [];
  let startDateTime;
  let endDateTime;

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1112", messageType: "5", displayOrder: 1});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1113", messageType: "6", displayOrder: 1});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1114", messageType: "6", displayOrder: 2});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1156", messageType: "3", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1299", messageType: "1", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0521", messageType: "3", displayOrder: 40});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0001()) {
      messages.push({messageId: "MSG1654", messageType: "4", displayOrder: 40});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0030", messageType: "1", displayOrder: 40});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0002() && judgeCondition0003() && judgeCondition0004()) {
      messages.push({messageId: "MSG1155", messageType: "3", displayOrder: 60});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1153", messageType: "2", displayOrder: 60});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0005() && judgeCondition0006() && judgeCondition0007()) {
      messages.push({messageId: "MSG0090", messageType: "1", displayOrder: 100});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1629", messageType: "1", displayOrder: 120});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1563", messageType: "1", displayOrder: 160});
  }

  startDateTime = new Date('2025-06-26T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T23:59:59+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1725", messageType: "1", displayOrder: 200});
  }

  return messages;

  // ================== 条件判定関数 ==================
  function judgeCondition0001() {
    return param?.dynamicContainedHandicappedFare == true;
  }
  function judgeCondition0002() {
    return !!param?.dynamicGetSearchAttributeReply;
  }
  function judgeCondition0003() {
    return !!param?.dynamicGetSearchAttributeReply?.data;
  }
  function judgeCondition0004() {
    return (param?.dynamicGetSearchAttributeReply?.data?.airBound?.airBoundGroups ?? []).some(
      (list1) => list1?.boundDetails?.numberOfConnection > 0
    );
  }
  function judgeCondition0005() {
    return !!param?.dynamicDepartureDate;
  }
  function judgeCondition0006() {
    return !!param?.dynamicDepartureSystemDate;
  }
  function judgeCondition0007() {
    return param?.dynamicDepartureDate == param?.dynamicDepartureSystemDate;
  }
};
