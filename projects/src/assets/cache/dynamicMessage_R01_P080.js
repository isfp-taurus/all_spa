window.getDynamicContentForR01_P080 = function (japanDateTime, param) {
  let messages = [];
  let startDateTime;
  let endDateTime;

  startDateTime = new Date('2025-05-16T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1698", messageType: "11", displayOrder: 1});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0001()) {
      messages.push({messageId: "MSG1545", messageType: "11", displayOrder: 15});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0002()) {
      messages.push({messageId: "MSG0655", messageType: "3", displayOrder: 20});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0152", messageType: "2", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0113", messageType: "1", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0003()) {
      messages.push({messageId: "MSG1048", messageType: "4", displayOrder: 20});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1203", messageType: "2", displayOrder: 40});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(!(judgeCondition0002())) {
      messages.push({messageId: "MSG0656", messageType: "3", displayOrder: 40});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0004()) {
      messages.push({messageId: "MSG0160", messageType: "3", displayOrder: 60});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0485", messageType: "1", displayOrder: 60});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0687", messageType: "5", displayOrder: 60});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0005() && judgeCondition0006()) {
      messages.push({messageId: "MSG1206", messageType: "2", displayOrder: 80});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1601", messageType: "3", displayOrder: 80});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0007() && judgeCondition0001()) {
      messages.push({messageId: "MSG1577", messageType: "11", displayOrder: 100});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(!(judgeCondition0008()) && judgeCondition0009()) {
      messages.push({messageId: "MSG1204", messageType: "2", displayOrder: 100});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0010() && judgeCondition0011()) {
      messages.push({messageId: "MSG0159", messageType: "3", displayOrder: 100});
    }
  }

  startDateTime = new Date('2025-05-29T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1716", messageType: "1", displayOrder: 120});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0012()) {
      messages.push({messageId: "MSG1079", messageType: "11", displayOrder: 120});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0001()) {
      messages.push({messageId: "MSG1207", messageType: "3", displayOrder: 120});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0013()) {
      messages.push({messageId: "MSG1055", messageType: "11", displayOrder: 140});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0388", messageType: "5", displayOrder: 140});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0013()) {
      messages.push({messageId: "MSG1057", messageType: "11", displayOrder: 160});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1488", messageType: "5", displayOrder: 160});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0005() && judgeCondition0014()) {
      messages.push({messageId: "MSG1208", messageType: "3", displayOrder: 180});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1702", messageType: "11", displayOrder: 200});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0013()) {
      messages.push({messageId: "MSG1056", messageType: "11", displayOrder: 220});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0006() || judgeCondition0015() || judgeCondition0016()) {
      messages.push({messageId: "MSG0155", messageType: "3", displayOrder: 220});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1710", messageType: "11", displayOrder: 260});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0017()) {
      messages.push({messageId: "MSG1632", messageType: "11", displayOrder: 280});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0008()) {
      messages.push({messageId: "MSG1633", messageType: "11", displayOrder: 300});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0018()) {
      messages.push({messageId: "MSG1054", messageType: "11", displayOrder: 400});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0019()) {
      messages.push({messageId: "MSG1063", messageType: "11", displayOrder: 580});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0020()) {
      messages.push({messageId: "MSG1066", messageType: "11", displayOrder: 640});
    }
  }

  return messages;

  // ================== 条件判定関数 ==================
  function judgeCondition0001() {
    return param?.getOrderReply?.data?.air?.tripType == "domestic";
  }
  function judgeCondition0002() {
    return (param?.getOrderReply?.data?.air?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => list2?.isDepartedWithin24Hours == true && list2?.isJapanDomesticFlight == true
      )
    );
  }
  function judgeCondition0003() {
    return param?.getOrderReply?.data?.seats?.isContainedFreeSeatRequestInNhGroupFlight == true;
  }
  function judgeCondition0004() {
    return param?.aswContext?.lang == "ja";
  }
  function judgeCondition0005() {
    return param.aswContext.anaBizLoginStatus !="LOGIN";
  }
  function judgeCondition0006() {
    return param?.pageContext?.availablePaymentMethods.includes("CV");
  }
  function judgeCondition0007() {
    return param?.getOrderReply?.data?.air?.isAfterDcsMigrationTrip == true;
  }
  function judgeCondition0008() {
    return (param?.getOrderReply?.data?.air?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => list2?.statusType == "waitlisted"
      )
    );
  }
  function judgeCondition0009() {
    return (param?.getOrderReply?.data?.air?.bounds ?? []).some(
      (list1) => (list1?.flights ?? []).some(
        (list2) => /^(......N.)$/.test(list2?.fareInfos?.fareClass)
      )
    );
  }
  function judgeCondition0010() {
    return param?.getOrderReply?.data?.travelersSummary?.travelerNumbers?.totalWithoutINF > 1;
  }
  function judgeCondition0011() {
    return ["CD"].includes(param?.pageContext?.currentPaymentMethod);
  }
  function judgeCondition0012() {
    return param?.getOrderReply?.data?.orderType?.isPrebooking == true;
  }
  function judgeCondition0013() {
    return param?.pageContext?.isKeepMyFare == false;
  }
  function judgeCondition0014() {
    return param?.aswContext?.posCountryCode == "JP";
  }
  function judgeCondition0015() {
    return param?.pageContext?.availablePaymentMethods.includes("IB");
  }
  function judgeCondition0016() {
    return param?.pageContext?.availablePaymentMethods.includes("PE");
  }
  function judgeCondition0017() {
    return param?.pageContext?.currentPaymentMethod == "RE";
  }
  function judgeCondition0018() {
    return !!param?.getOrderReply?.data?.air?.bounds && param?.getOrderReply?.data?.air?.bounds?.length >= 3;
  }
  function judgeCondition0019() {
    return param?.pageContext?.currentPaymentMethod == "CD";
  }
  function judgeCondition0020() {
    return ["CV", "PE"].includes(param?.pageContext?.currentPaymentMethod);
  }
};
