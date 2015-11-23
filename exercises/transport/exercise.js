var through2 = require('through2')
var hyperquest = require('hyperquest')
var exercise = require('workshopper-exercise')()
var filecheck = require('workshopper-exercise/filecheck')
var execute = require('workshopper-exercise/execute')
var comparestdout = require('workshopper-exercise/comparestdout')

// checks that the submission file actually exists
exercise = filecheck(exercise)

// execute the solution and submission in parallel with spawn()
exercise = execute(exercise)

function rndport () {
  return 1024 + Math.floor(Math.random() * 64511)
}

/**
 * The seneca log is set to "quiet" to have a clean comparation of stdouts.
 * We use a random port to avoid collision with possible hhanged porcess on
 * ports.
 */
exercise.addSetup(function (mode, callback) {
  this.submissionPort = rndport()
  this.solutionPort = this.submissionPort + 1

  this.submissionArgs = [this.submissionPort]
  this.solutionArgs = [this.solutionPort]

  this.solutionArgs.push('--seneca.log.quiet')
  this.submissionArgs.push('--seneca.log.quiet')
  process.nextTick(callback)
})

// add a processor for both run and verify calls, added *before*
// the comparestdout processor so we can mess with the stdouts
exercise.addProcessor(function (mode, callback) {
  this.submissionStdout.pipe(process.stdout)

  // replace stdout with our own streams
  this.submissionStdout = through2()
  if (mode === 'verify') {
    this.solutionStdout = through2()
  }
  setTimeout(query.bind(this, mode), 500)

  process.nextTick(function () {
    callback(null, true)
  })
})

// compare stdout of solution and submission
exercise = comparestdout(exercise)

// cleanup for both run and verify
exercise.addCleanup(function (mode, passed, callback) {/* Do nothing */})

// delayed for 500ms to wait for servers to start so we can start
// playing with them
function query (mode) {
  var exercise = this

  // Should we pass the port?
  function connect (port, stream) {
    var input = through2()
    var url = 'http://localhost:' + port + '/act?role=math&cmd=sum&left=1&right=2'
    input.pipe(hyperquest.post(url)
      .on('error', function (err) {
        exercise.emit(
            'fail'
          , exercise.__('fail.connection', {address: url, message: err.message})
        )
      }
    ))
    .pipe(stream)
    input.end()
  }

  connect(this.submissionPort, this.submissionStdout)
  if (mode === 'verify') {
    connect(this.solutionPort, this.solutionStdout)
  }
}

module.exports = exercise
