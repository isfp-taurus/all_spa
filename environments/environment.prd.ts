export const environment = {
  production: true,
  envName: 'prd',
  spa: {
    baseUrl: '/webapps',
    app: {
      cache: '/cache',
      res: '/reservation',
      srv: '/servicing',
      exc: '/exchange',
      cki: '/checkin',
    },
  },
  api: {
    baseUrl: 'https://space.ana.co.jp',
    clientId: '107ee10947b246d29f476d410293d412',
    clientSecret: '70a8dc3cDc6A449B9e0204325B972C2d',
    app: {
      sysdate: '/all-ado-sysdate/api/v1',
      authorization: '/all-ado-authorization/api/v1',
      initialization: '/all-ado-initialization/api/v1',
      user: '/all-ado-user/api/v1',
      amcmember: '',
      search: '/all-ado-search/api/v1',
      reservation: '/all-ado-reservation/api/v1',
      servicing: '/all-ado-servicing/api/v1',
      exchange: '/all-ado-exchange/api/v1',
      checkin: '/all-ado-checkin/api/v1',
      member: '/all-ado-member/api/v1',
      credit: '/all-ado-credit/api/v1',
    },
  },
  datadog: {
    disable: false,
    env: 'prd',
    clientToken: 'pub71ef99b3ce6dfa6584aae68f6452919e',
    versionFileRelativeUrl: '',
  },
  tealium: {
    disable: true,
    url: '',
  },
  dynatrace: {
    res: {
      disable: false,
      url: 'https://js-cdn.dynatrace.com/jstag/161f5a57e21/bf90419wvr/7f6d643d4ec8213d_complete.js',
    },
    srv: {
      disable: false,
      url: 'https://js-cdn.dynatrace.com/jstag/161f5a57e21/bf90419wvr/5c36baa613a7361_complete.js',
    },
    exc: {
      disable: false,
      url: 'https://js-cdn.dynatrace.com/jstag/161f5a57e21/bf90419wvr/9840ffd086481588_complete.js',
    },
    cki: {
      disable: false,
      url: 'https://js-cdn.dynatrace.com/jstag/161f5a57e21/bf90419wvr/2cbb9b18f84d8886_complete.js',
    },
  },
};
