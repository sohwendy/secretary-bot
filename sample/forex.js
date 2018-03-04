module.exports = {
  file: '../../secrets/google.json',
  scope: ['https://www.googleapis.com/auth/spreadsheets'],
  id: 'some_id',
  link: '<some_link>',
  code: {
    range: '<some_code_range>',
    fields: ['code', 'buyUnit', 'sellUnit', 'done' ]
  },
  rule: {
    range: '<some_rule_range>',
    fields: ['code', 'min', 'max', 'message', 'done']
  }
};
