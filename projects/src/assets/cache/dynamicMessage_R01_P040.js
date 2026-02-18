window.getDynamicContentForR01_P040 = function (japanDateTime, param) {
  let messages = [];
  let startDateTime;
  let endDateTime;

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0113", messageType: "1", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0128", messageType: "2", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1636", messageType: "6", displayOrder: 20});
  }

  startDateTime = new Date('1899-12-31T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1008", messageType: "1", displayOrder: 40});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1038", messageType: "5", displayOrder: 40});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1484", messageType: "5", displayOrder: 60});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0099", messageType: "2", displayOrder: 80});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0001() && judgeCondition0002()) {
      messages.push({messageId: "MSG1162", messageType: "1", displayOrder: 100});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1006", messageType: "5", displayOrder: 120});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0001() && judgeCondition0003()) {
      messages.push({messageId: "MSG1163", messageType: "1", displayOrder: 120});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0004() && judgeCondition0005()) {
      messages.push({messageId: "MSG1172", messageType: "3", displayOrder: 120});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1039", messageType: "5", displayOrder: 140});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0006()) {
      messages.push({messageId: "MSG1166", messageType: "1", displayOrder: 160});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0007()) {
      messages.push({messageId: "MSG1654", messageType: "4", displayOrder: 180});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0452", messageType: "1", displayOrder: 200});
  }

  return messages;

  // ================== 条件判定関数 ==================
  function judgeCondition0001() {
    return param?.aswContext?.anaBizLoginStatus != "LOGIN";
  }
  function judgeCondition0002() {
    return (param?.getCartReply?.data?.plan?.airOffer?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => /^(......S.)$/.test(list2?.fareInfos?.fareClass)
      )
    );
  }
  function judgeCondition0003() {
    return (param?.getCartReply?.data?.plan?.airOffer?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => /^(......Q.)$/.test(list2?.fareInfos?.fareClass)
      )
    );
  }
  function judgeCondition0004() {
    return /^(.......DD)$/.test(param?.aswContext?.pointOfSaleId);
  }
  function judgeCondition0005() {
    return (param?.getCartReply?.data?.plan?.airOffer?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => list2?.statusType == "waitlisted"
      )
    );
  }
  function judgeCondition0006() {
    return (param?.getCartReply?.data?.plan?.airOffer?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => /^(......N.)$/.test(list2?.fareInfos?.fareClass)
      )
    );
  }
  function judgeCondition0007() {
    return param?.getCartReply?.data?.searchCriteria?.searchAirOffer?.fare?.fareOptionType == "10";
  }
};
