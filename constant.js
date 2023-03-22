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
  'localImg'
])

module.exports = {
  Type,
  Commands,
}
