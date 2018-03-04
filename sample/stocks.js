module.exports = {
  file: '../../secrets/google.json',
  scope: ['https://www.googleapis.com/auth/spreadsheets'],
  id: '<some_id>',
  link: '<some_link>',
  code: {
    range: '<some_code_range>',
    fields: ['code', 'name', 'suffix']
  },
  rule: {
    range: '<some_rule_range>',
    fields: ['name', 'code', 'min', 'max', 'message', 'done']
  }
};
