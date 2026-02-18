window.getDynamicContentForR01_M060 = function (japanDateTime, param) {
  let messages = [];
  let startDateTime;
  let endDateTime;

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1202", messageType: "3", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0423", messageType: "5", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0042", messageType: "1", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1664", messageType: "2", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1197", messageType: "3", displayOrder: 40});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1678", messageType: "6", displayOrder: 60});
  }

  startDateTime = new Date('1899-12-31T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1013", messageType: "1", displayOrder: 60});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0001() && judgeCondition0002()) {
      messages.push({messageId: "MSG1192", messageType: "1", displayOrder: 80});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1199", messageType: "2", displayOrder: 100});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1046", messageType: "5", displayOrder: 100});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0003()) {
      messages.push({messageId: "MSG1180", messageType: "1", displayOrder: 100});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0004() && judgeCondition0003()) {
      messages.push({messageId: "MSG1181", messageType: "3", displayOrder: 100});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0005() && judgeCondition0003()) {
      messages.push({messageId: "MSG1182", messageType: "3", displayOrder: 120});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0003()) {
      messages.push({messageId: "MSG1184", messageType: "1", displayOrder: 120});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1612", messageType: "2", displayOrder: 120});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0003()) {
      messages.push({messageId: "MSG1186", messageType: "1", displayOrder: 140});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0003()) {
      messages.push({messageId: "MSG1183", messageType: "3", displayOrder: 140});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0006() && judgeCondition0007() && judgeCondition0003()) {
      messages.push({messageId: "MSG1185", messageType: "3", displayOrder: 160});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0008() || judgeCondition0009() || judgeCondition0010()) {
      messages.push({messageId: "MSG1191", messageType: "1", displayOrder: 200});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1487", messageType: "6", displayOrder: 1000});
  }

  return messages;

  // ================== 条件判定関数 ==================
  function judgeCondition0001() {
    return param.aswContext.anaBizLoginStatus !="LOGIN";
  }
  function judgeCondition0002() {
    return param?.getCartReply?.data?.plan?.airOffer?.tripType == "domestic";
  }
  function judgeCondition0003() {
    return (param?.getCartReply?.data?.plan?.airOffer?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => list2?.fareInfos?.fareType == "disabilityDiscount"
      )
    );
  }
  function judgeCondition0004() {
    return param?.getCartReply?.data?.plan?.travelersSummary?.numberOfTraveler?.totalWithoutINF >= 2;
  }
  function judgeCondition0005() {
    return param?.getCartReply?.data?.plan?.travelersSummary?.numberOfTraveler?.totalWithoutINF == 1;
  }
  function judgeCondition0006() {
    return (param?.getMemberInformationReply?.model?.data?.document ?? []).some(
      (list1) => list1?.documentType == "U"
    );
  }
  function judgeCondition0007() {
    return param?.airportLocalDateYMDHypen > param?.getMemberInformationReplyMediValdYmd;
  }
  function judgeCondition0008() {
    return (param?.getCartReply?.data?.plan?.airOffer?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => list2?.statusType == "waitlisted"
      )
    );
  }
  function judgeCondition0009() {
    return (param?.getCartReply?.data?.plan?.airOffer?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => /^(......S.)$/.test(list2?.fareInfos?.fareClass)
      )
    );
  }
  function judgeCondition0010() {
    return (param?.getCartReply?.data?.plan?.airOffer?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => /^(......Q.)$/.test(list2?.fareInfos?.fareClass)
      )
    );
  }
};
