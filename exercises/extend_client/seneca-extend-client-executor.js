var seneca = require('seneca')()
seneca.use(process.argv[2])

seneca.act({role: 'math', cmd: 'sum', left: 1, right: 2}, function (err, result) {
  if (err) return console.error(err)
  console.log(result)
})
seneca.act({role: 'math', cmd: 'sum', integer: true, left: 14.5, right: 23.5}, function (err, result) {
  if (err) return console.error(err)
  console.log(result)
})
