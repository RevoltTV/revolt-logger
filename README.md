# REVOLT Logging Utility

This logging utility wraps [`node-bunyan`](https://github.com/trentm/node-bunyan#levels)
and primarily provides a nicer console output stream for browser environments

# Usage

```
import logger from 'revolt-logger';

logger.configure({
    // Passes the object straight to bunyan, so check there for configuration values
    // The only required parameter is `name`, which defaults to "revolt-logger" if
    // not specified
});

let log = logger.get('module');
log.info('Nice');
```

This will be standard output for a `node` environment. On the browser, some formatting
is applied, and will look like this:

```
[2016-03-25T19:21:20.189Z] INFO - Application :: Nice 				 Object {...}
```

The format is `[LOG_TIME] LEVEL - MODULE :: MESSAGE     RAW_LOG_OBJECT`
