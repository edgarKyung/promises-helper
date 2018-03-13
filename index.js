/**
 * Created by nhyun.kyung on 2017-03-23.
 */

var Q = require('q');

module.exports = function () {
    var runFlag = false;
    var promiseList = [];
    var timer = null;

    /**
     * Clear promise helper's setting value
     *
     * @function clearPromise
     * @memberof promiseHelper
     * @returns {Undefined}
     * @public
     */
    var clearPromise = function () {
        runFlag = false;
        promiseList = [];
        if(timer) {
            clearTimeout(timer);
            timer = null;
        }
    };


    /**
     * Add async function and argument
     *
     * @function addPromise
     * @memberof promiseHelper
     * @param promiseFunc {Function}
     * @param argv {Array}
     * @returns {Undefined}
     * @public
     */
    var addPromise = function (promiseFunc, argv) {
        if (runFlag === false) {
            promiseList.push({
                func: promiseFunc,
                argv: argv
            });

        } else {
            console.warn("runPromise is already running. addPromise is ignored.");
        }
    };


    /**
     * Run added async function
     * Resolve if all async function succeeds
     *
     * @function runPromise
     * @memberof promiseHelper
     * @param timeout {Number} max watting time
     * @returns {Promise}
     * @public
     */
    var runPromise = function (timeout) {
        var deferred = Q.defer();

        runFlag = true;
        timeout = timeout || 30000;

        var requestCount = promiseList.length;

        if (requestCount === 0) {
            deferred.resolve();

        } else {
            for (var i = 0; i < promiseList.length; i++) {
                promiseList[i].func.apply(null, promiseList[i].argv).then(function (result) {
                    if (requestCount === 1) {
                        clearPromise();
                        deferred.resolve(result);

                    } else {
                        requestCount -= 1;
                    }

                }).catch(function (err) {
                    clearPromise();

                    var newError = new Error("Callback: runPromise in promiseHelper");
                    newError.origin = err;
                    deferred.reject(newError);
                });
            }

            timer = setTimeout(function () {
                clearPromise();
                deferred.reject(new Error("Timeout: runPromise in promiseHelper"));
            }, timeout);
        }

        return deferred.promise;
    };


    return {
        clearPromise: clearPromise,
        addPromise: addPromise,
        runPromise: runPromise
    };
};