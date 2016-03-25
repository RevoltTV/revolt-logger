import assign from 'lodash.assign';
import bunyan from 'bunyan';
import isNode from 'detect-node';

// Default configuration for the logger, will be tweaked if the module detects
// it is not in a node environment
let defaultConfiguration = {
    name: 'revolt-logger',
    level: 'info'
};

let loggerConfiguration = defaultConfiguration;
let configured = false;
let loggers = {};
let baseLogger;

function BrowserConsoleStream() {
    this.write = (rec) => {
        let level = bunyan.nameFromLevel[rec.level];
        let args = [
            '[%s] %s - %s :: %s',
            rec.time.toISOString(),
            bunyan.nameFromLevel[rec.level].toUpperCase(),
            rec.module,
            rec.msg,
            '\t\t\t\t',
            rec
        ];

        // Browser consoles do not have a `trace` method
        if (level === 'trace') {
            level = 'debug';
        }

        // Browser consoles do not have a `fatal` method
        if (level === 'fatal') {
            level = 'error';
        }

        /*eslint-disable no-console*/
        console[level].apply(console, args);
        if ((window.__DEBUG || window.__TRACE) && level === 'error' && rec.err) {
            console.error(rec.err.stack);
        }
        /*eslint-enable no-console*/
    };
}

// Not in a node environment, check the `window` object for global variables
// to update the configuration based on what's available
function configureForBrowser(config) {
    config.level = 'error';

    if (window.__DEBUG) {
        config.level = 'debug';
    }

    if (window.__TRACE) {
        config.level = 'trace';
    }

    config.streams = config.streams || [];
    config.streams.push({
        stream: new BrowserConsoleStream(),
        type: 'raw'
    });
}

function configure(config) {
    loggerConfiguration = assign({}, defaultConfiguration, config);

    if (!isNode) {
        configureForBrowser(loggerConfiguration);
    }

    configured = true;
    baseLogger = bunyan.createLogger(loggerConfiguration);
}

export default {
    configure,
    get: (name) => {
        if (!configured) {
            configure();
            baseLogger.warn('configure was not called before getting a logger');
        }

        if (!name) {
            return baseLogger;
        }

        if (!loggers[name]) {
            loggers[name] = baseLogger.child({
                module: name
            });
        }

        return loggers[name];
    }
};
