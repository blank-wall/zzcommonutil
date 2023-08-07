const Type = Object.freeze({ Util: 1, Template: 2 })

const Commands = Object.freeze([
  'commonUtil',
  'commonModule',
  'commonBase64',
  'phoneView',
  'connectADB',
  'openRecord',
  'closeRecord',
  'stopRecord',
  'localImg',
  'uidump'
])

module.exports = {
  Type,
  Commands,
}
