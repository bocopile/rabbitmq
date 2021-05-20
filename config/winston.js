/*
  log를 처리하기 위한 스크립트
  용량이 많아지면 자동으로 zip 형태로 저장됨.
  7zip을 이용하여 압축해제
*/

const winston = require('winston');
require('winston-daily-rotate-file');
require('date-utils');

const path = require('path')
const PROJECT_ROOT = path.join(__dirname, '..')

const logger = winston.createLogger({
    level: 'debug', // 최소 레벨
    // 파일저장
    transports: [
        new winston.transports.DailyRotateFile({
            filename : 'logs/server/server.log', // log 폴더에 system.log 이름으로 저장
            zippedArchive: true, // 압축여부
            format: winston.format.printf(
                info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
        }),
        // 콘솔 출력
        new winston.transports.Console({
            format: winston.format.printf(
                info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
        })
    ],
    exceptionHandlers: [
        new winston.transports.DailyRotateFile({
            filename : 'logs/exception/exception',
            zippedArchive: true, // 압축여부
            format: winston.format.printf(
                info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
        }),
        // 콘솔 출력
        new winston.transports.Console({
            format: winston.format.printf(
                info => `${new Date().toFormat('YYYY-MM-DD HH24:MI:SS')} [${info.level.toUpperCase()}] - ${info.message}`)
        })
    ]
});

//module.exports = logger;


///////////////////////// 로그에 모듈 이름과 로그 기록 라인 표시를 위한 오픈 소스 코드 추가////////////////////

// this allows winston to handle output from express' morgan middleware
logger.stream = {
    write: function (message) {
        logger.info(message)
    }
}

// A custom logger interface that wraps winston, making it easy to instrument
// code and still possible to replace winston in the future.

module.exports.debug = module.exports.log = function () {
    logger.debug.apply(logger, formatLogArguments(arguments))
}

module.exports.info = function () {
    logger.info.apply(logger, formatLogArguments(arguments))
}

module.exports.warn = function () {
    logger.warn.apply(logger, formatLogArguments(arguments))
}

module.exports.error = function () {
    logger.error.apply(logger, formatLogArguments(arguments))
}

module.exports.stream = logger.stream

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments (args) {
    args = Array.prototype.slice.call(args)

    const stackInfo = getStackInfo(1)

    if (stackInfo) {
        // get file path relative to project root
        const calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')'

        if (typeof (args[0]) === 'string') {
            args[0] = calleeStr + ' ' + args[0]
        } else {
            args.unshift(calleeStr)
        }
    }

    return args
}

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo (stackIndex) {
    // get call stack, and analyze it
    // get all file, method, and line numbers
    const stacklist = (new Error()).stack.split('\n').slice(3)

    // stack trace format:
    // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
    const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
    const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

    const s = stacklist[stackIndex] || stacklist[0];
    const sp = stackReg.exec(s) || stackReg2.exec(s);

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: path.relative(PROJECT_ROOT, sp[2]),
            line: sp[3],
            pos: sp[4],
            file: path.basename(sp[2]),
            stack: stacklist.join('\n')
        }
    }
}