window.getDynamicContentForR01_P034 = function (japanDateTime, param) {
  let messages = [];
  let startDateTime;
  let endDateTime;

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1638", messageType: "4", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1035", messageType: "6", displayOrder: 20});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0001()) {
      messages.push({messageId: "MSG1155", messageType: "3", displayOrder: 20});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1299", messageType: "1", displayOrder: 20});
  }

  startDateTime = new Date('2025-07-10T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T23:59:59+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG2001", messageType: "3", displayOrder: 30});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG0030", messageType: "1", displayOrder: 40});
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    if(judgeCondition0002()) {
      messages.push({messageId: "MSG1585", messageType: "1", displayOrder: 60});
    }
  }

  startDateTime = new Date('1900-01-01T00:00:00+09:00');
  endDateTime = new Date('9999-12-31T00:00:00+09:00');
  if (startDateTime.getTime() <= japanDateTime.getTime() && endDateTime.getTime() >= japanDateTime.getTime()) {
    messages.push({messageId: "MSG1629", messageType: "1", displayOrder: 80});
  }

  return messages;

  // ================== 条件判定関数 ==================
  function judgeCondition0001() {
    return (param?.findMoreFlightsReply?.data?.fareFamilies ?? []).some(
      (list1) => (list1?.airOffers ?? []).some(
        (list2) => (list2?.bounds ?? []).some(
          (list3) => !!list3?.flights && list3?.flights?.length > 1
        )
      )
    );
  }
  function judgeCondition0002() {
    return param?.pageContext?.isDomesticTrip == true;
  }
};
